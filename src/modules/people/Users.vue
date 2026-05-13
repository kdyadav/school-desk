<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">User Accounts</h2>
                <p class="text-sm text-gray-500">{{ store.users.length }} user(s) on record.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate">+ New User</BaseButton>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100">
                <div class="w-full sm:w-72">
                    <BaseInput size="sm" type="search" placeholder="Search by name, email or role" :modelValue="search"
                        @update:modelValue="(v) => search = v" />
                </div>
            </div>
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-left px-4 py-2 font-medium">Email</th>
                        <th class="text-left px-4 py-2 font-medium">Role</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="u in paged" :key="u.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ u.name || '—' }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ u.email }}</td>
                        <td class="px-4 py-2">
                            <span :class="roleBadge(u.role)"
                                class="inline-block px-2.5 py-0.5 text-xs rounded-full font-medium capitalize">
                                {{ u.role }}
                            </span>
                        </td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton v-if="canEdit(u)" variant="link" :full-width="false" @click="openEdit(u)">Edit
                            </BaseButton>
                            <BaseButton v-if="canDelete(u)" variant="link-danger" :full-width="false"
                                @click="onDelete(u)">Delete
                            </BaseButton>
                            <span v-if="!canEdit(u) && !canDelete(u)" class="text-xs text-gray-400">—</span>
                        </td>
                    </tr>
                    <tr v-if="!paged.length">
                        <td colspan="4" class="px-4 py-8 text-center text-gray-400">No users found.</td>
                    </tr>
                </tbody>
            </table>
            </div>
            <div v-if="totalPages > 1"
                class="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 flex-wrap gap-2">
                <span>Page {{ page }} of {{ totalPages }}</span>
                <div class="flex gap-2">
                    <BaseButton variant="secondary" size="sm" :full-width="false" :disabled="page === 1" @click="prev">
                        Prev</BaseButton>
                    <BaseButton variant="secondary" size="sm" :full-width="false" :disabled="page === totalPages"
                        @click="next">Next</BaseButton>
                </div>
            </div>
        </div>

        <BaseDrawer v-model="drawerOpen" :title="editing?.id ? 'Edit User' : 'New User'" width="md">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseInput label="Full Name" :modelValue="form.name" @update:modelValue="(v) => setField('name', v)"
                    @blur="() => validateField('name')" :error="errors.name" />
                <BaseInput label="Email" type="email" :modelValue="form.email"
                    @update:modelValue="(v) => setField('email', v)" @blur="() => validateField('email')"
                    :error="errors.email" :disabled="!!editing?.id" />
                <BaseSelect label="Role" :modelValue="form.role" @update:modelValue="(v) => setField('role', v)"
                    :options="roleOptions" />
                <BaseInput :label="editing?.id ? 'New Password (leave blank to keep current)' : 'Password'"
                    type="password" :modelValue="form.password" @update:modelValue="(v) => setField('password', v)"
                    @blur="() => validateField('password')" :error="errors.password" placeholder="Min. 8 characters" />
                <BaseSelect label="Linked Record (optional)" :modelValue="form.linkedId"
                    @update:modelValue="(v) => setField('linkedId', v ? Number(v) : null)" :options="linkedOptions"
                    placeholder="None" />
                <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
            </form>
            <template #footer>
                <BaseButton variant="secondary" :full-width="false" @click="drawerOpen = false">Cancel</BaseButton>
                <BaseButton :full-width="false" :loading="saving" @click="onSubmit">Save</BaseButton>
            </template>
        </BaseDrawer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUsersStore } from '../../stores/users'
import { usePeopleStore } from '../../stores/people'
import { useAuthStore } from '../../stores/auth'
import { useTableState } from '../../composables/useTableState'
import { useForm } from '../../ui-lib/useForm'
import { required, email as emailValidator, minLength } from '../../ui-lib/validators'
import { ROLES } from '../../schemas/user'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseDrawer from '../../ui-lib/BaseDrawer.vue'

const store = useUsersStore()
const people = usePeopleStore()
const auth = useAuthStore()
store.loadAll()
people.loadAll()

const isOwner = computed(() => auth.role === 'owner')

const { search, page, paged, totalPages, next, prev } = useTableState(
    () => store.users,
    {
        matcher: (u, q) =>
            (u.name || '').toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q),
    }
)

const drawerOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')

const { values: form, errors, setField, validateField, validateAll, reset } = useForm(
    { name: '', email: '', role: 'teacher', password: '', linkedId: null },
    {
        name: [required],
        email: [required, emailValidator],
        password: [(v) => {
            // On edit, password is optional (blank = keep current)
            if (editing.value?.id && !v) return null
            if (!v) return 'This field is required.'
            if (v.length < 8) return 'Minimum 8 characters required.'
            return null
        }],
    }
)

// Owner role is exclusive to the bootstrap account and never assignable here.
// Admins additionally cannot assign the admin role.
const roleOptions = computed(() => ROLES
    .filter((r) => r !== 'owner' && (isOwner.value || r !== 'admin'))
    .map((r) => ({ label: r.charAt(0).toUpperCase() + r.slice(1), value: r })))

const linkedOptions = computed(() => {
    const opts = [{ label: 'None', value: '' }]
    people.teachers.forEach((t) => opts.push({ label: `Teacher: ${t.firstName} ${t.lastName}`, value: t.id }))
    people.students.forEach((s) => opts.push({ label: `Student: ${s.firstName} ${s.lastName}`, value: s.id }))
    people.guardians.forEach((g) => opts.push({ label: `Guardian: ${g.firstName} ${g.lastName}`, value: g.id }))
    return opts
})

const roleBadge = (role) => ({
    owner: 'bg-rose-100 text-rose-700',
    admin: 'bg-purple-100 text-purple-700',
    teacher: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
    parent: 'bg-amber-100 text-amber-700',
}[role] || 'bg-gray-100 text-gray-700')

function canEdit(u) {
    if (u.role === 'owner') return false
    if (u.role === 'admin' && !isOwner.value) return false
    return true
}

function canDelete(u) {
    if (u.role === 'owner') return false
    if (u.role === 'admin' && !isOwner.value) return false
    return true
}

function openCreate() {
    editing.value = null; formError.value = ''; reset()
    drawerOpen.value = true
}

function openEdit(u) {
    editing.value = u; formError.value = ''; reset()
    setField('name', u.name || ''); setField('email', u.email)
    setField('role', u.role); setField('linkedId', u.linkedId || null)
    setField('password', '')
    drawerOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    saving.value = true
    try {
        if (editing.value?.id) {
            await store.updateUser(editing.value.id, {
                name: form.name,
                role: form.role,
                linkedId: form.linkedId,
                password: form.password || undefined,
            })
        } else {
            await store.createUser({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                linkedId: form.linkedId,
            })
        }
        drawerOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally {
        saving.value = false
    }
}

async function onDelete(u) {
    if (!window.confirm(`Delete user ${u.name || u.email}?`)) return
    await store.deleteUser(u.id)
}
</script>
