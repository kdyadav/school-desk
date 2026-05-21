<template>
    <div class="max-w-2xl mx-auto space-y-6">
        <!-- Avatar & header -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
            <div
                class="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl shrink-0">
                {{ initials }}
            </div>
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900 truncate">{{ auth.user?.name }}</h2>
                <p class="text-sm text-gray-500 truncate">{{ auth.user?.email }}</p>
                <span :class="roleBadgeClass" class="inline-block mt-1 px-2.5 py-0.5 text-xs rounded-full font-medium">
                    {{ auth.role }}
                </span>
            </div>
        </div>

        <!-- Profile form -->
        <form @submit.prevent="handleSave" class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h3 class="text-lg font-semibold text-gray-900">Edit Profile</h3>

            <BaseInput id="profile-name" label="Full Name" v-model="form.name" :error="errors.name"
                placeholder="Your full name" />

            <BaseInput id="profile-email" label="Email" v-model="form.email" type="email" :error="errors.email"
                placeholder="you@example.com" disabled />

            <BaseInput id="profile-role" label="Role" :modelValue="auth.role" disabled />

            <hr class="border-gray-200" />

            <h3 class="text-lg font-semibold text-gray-900">Change Password</h3>

            <BaseInput id="profile-current-pw" label="Current Password" v-model="form.currentPassword" type="password"
                :error="errors.currentPassword" placeholder="••••••••" autocomplete="current-password" />

            <BaseInput id="profile-new-pw" label="New Password" v-model="form.newPassword" type="password"
                :error="errors.newPassword" placeholder="••••••••" autocomplete="new-password" />

            <BaseInput id="profile-confirm-pw" label="Confirm New Password" v-model="form.confirmPassword"
                type="password" :error="errors.confirmPassword" placeholder="••••••••" autocomplete="new-password" />

            <div class="flex items-center gap-3 pt-2">
                <BaseButton type="submit" :loading="saving" loadingText="Saving..." :fullWidth="false">
                    Save Changes
                </BaseButton>
                <p v-if="successMsg" class="text-sm text-green-600">{{ successMsg }}</p>
                <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { userRepo } from '../repositories'
import { supabase } from '../supabase'

const auth = useAuthStore()

const form = ref({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
})

const errors = ref({})
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

onMounted(() => {
    form.value.name = auth.user?.name || ''
    form.value.email = auth.user?.email || ''
})

const initials = computed(() => {
    const n = auth.user?.name || auth.user?.email || '?'
    return n.split(/[\s.@]/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('')
})

const roleBadgeClass = computed(() => ({
    admin: 'bg-purple-100 text-purple-700',
    teacher: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
    parent: 'bg-amber-100 text-amber-700',
}[auth.role] || 'bg-gray-100 text-gray-700'))

const validate = () => {
    const e = {}
    if (!form.value.name.trim()) e.name = 'Name is required'

    const changingPassword = form.value.newPassword || form.value.confirmPassword || form.value.currentPassword
    if (changingPassword) {
        if (!form.value.currentPassword) e.currentPassword = 'Current password is required'
        if (form.value.newPassword.length < 6) e.newPassword = 'Must be at least 6 characters'
        if (form.value.newPassword !== form.value.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }

    errors.value = e
    return Object.keys(e).length === 0
}

const handleSave = async () => {
    successMsg.value = ''
    errorMsg.value = ''
    if (!validate()) return

    saving.value = true
    try {
        const users = await userRepo.where('email', auth.user.email)
        const dbUser = users[0]
        if (!dbUser) { errorMsg.value = 'User not found'; return }

        await userRepo.update(dbUser.id, { name: form.value.name.trim() })

        // Supabase Auth owns the password. We re-authenticate with the
        // current password (catching the bad-credentials case) and then call
        // updateUser to set the new one — no bcrypt round-trip needed.
        if (form.value.newPassword) {
            const { error: reauthErr } = await supabase.auth.signInWithPassword({
                email: auth.user.email,
                password: form.value.currentPassword,
            })
            if (reauthErr) { errors.value = { currentPassword: 'Incorrect password' }; return }
            const { error: pwErr } = await supabase.auth.updateUser({ password: form.value.newPassword })
            if (pwErr) { errorMsg.value = pwErr.message; return }
        }

        // Refresh the in-memory user so the avatar/header pick up the new name.
        if (auth.user) auth.user.name = form.value.name.trim()

        form.value.currentPassword = ''
        form.value.newPassword = ''
        form.value.confirmPassword = ''
        successMsg.value = 'Profile updated successfully'
    } catch (err) {
        errorMsg.value = 'Failed to save changes'
        console.error(err)
    } finally {
        saving.value = false
    }
}
</script>
