<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">Announcements</h2>
                <p class="text-sm text-gray-500">Post notices targeted by audience.</p>
            </div>
            <BaseButton v-if="canCreate" :full-width="false" @click="openCreate">+ New</BaseButton>
        </div>

        <!-- Audience filter -->
        <div class="flex gap-2 flex-wrap">
            <BaseButton v-for="opt in filterOpts" :key="opt" size="sm" :full-width="false"
                :variant="filterAud === opt ? 'primary' : 'secondary'" class="capitalize" @click="filterAud = opt">{{
                    opt }}</BaseButton>
        </div>

        <!-- Feed -->
        <div v-if="filtered.length" class="space-y-3">
            <div v-for="a in filtered" :key="a.id" class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-2">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                    <div class="min-w-0">
                        <h3 class="text-base font-semibold text-gray-900">{{ a.title }}</h3>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[10px] px-2 py-0.5 rounded-full capitalize font-medium"
                                :class="audBadge(a.audience)">{{ a.audience }}</span>
                            <span class="text-xs text-gray-400">{{ formatDate(a.createdAt) }}</span>
                        </div>
                    </div>
                    <BaseButton v-if="canCreate" variant="link-danger" size="sm" :full-width="false"
                        class="flex-shrink-0" @click="onDelete(a)">Delete</BaseButton>
                </div>
                <p class="text-sm text-gray-700 whitespace-pre-line">{{ a.body }}</p>
            </div>
        </div>
        <div v-else class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            No announcements.
        </div>

        <!-- Create modal -->
        <BaseModal v-model="modalOpen" title="New Announcement" size="lg">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseInput label="Title" :modelValue="form.title" @update:modelValue="(v) => setField('title', v)"
                    @blur="() => validateField('title')" :error="errors.title" placeholder="Exam schedule published" />
                <BaseTextarea label="Body" :modelValue="form.body" @update:modelValue="(v) => setField('body', v)"
                    @blur="() => validateField('body')" :error="errors.body" placeholder="Details here..." rows="4" />
                <BaseSelect label="Audience" :modelValue="form.audience"
                    @update:modelValue="(v) => setField('audience', v)" :options="audienceOpts" required />
                <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
            </form>
            <template #footer>
                <BaseButton variant="secondary" :full-width="false" @click="modalOpen = false">Cancel</BaseButton>
                <BaseButton :full-width="false" :loading="saving" @click="onSubmit">Post</BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnnouncementsStore, AUDIENCE_OPTIONS, audiencesForRole } from '../../stores/announcements'
import { useAuthStore } from '../../stores/auth'
import { useForm } from '../../ui-lib/useForm'
import { required } from '../../ui-lib/validators'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseTextarea from '../../ui-lib/BaseTextarea.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseModal from '../../ui-lib/BaseModal.vue'

const store = useAnnouncementsStore()
const auth = useAuthStore()
store.loadAll()

const canCreate = computed(() => ['owner', 'admin', 'teacher'].includes(auth.role))
const filterAud = ref('all')
// Only offer audience chips a user can actually see — owners/admins see every
// audience, anyone else only their own role's audience plus 'all'.
const filterOpts = computed(() => {
    if (['owner', 'admin'].includes(auth.role)) {
        return ['all', ...AUDIENCE_OPTIONS.filter((o) => o !== 'all')]
    }
    return ['all', auth.role].filter(Boolean)
})

const filtered = computed(() => {
    // Always start from the role-visible set so a non-privileged user can't
    // peek into a higher-audience feed by selecting it in the filter.
    const visible = store.forRole(auth.role)
    if (filterAud.value === 'all') return visible
    return visible.filter((a) => a.audience === filterAud.value)
})

const audBadge = (aud) => ({
    all: 'bg-gray-100 text-gray-600',
    admin: 'bg-purple-100 text-purple-700',
    teacher: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700',
    parent: 'bg-amber-100 text-amber-700',
}[aud] || 'bg-gray-100 text-gray-600')

// Audience options are restricted to the creator's own role and lower-privileged roles.
const audienceOpts = computed(() => audiencesForRole(auth.role)
    .map((a) => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) })))

const modalOpen = ref(false)
const saving = ref(false)
const formError = ref('')

const { values: form, errors, setField, validateField, validateAll, reset } = useForm(
    { title: '', body: '', audience: 'all' },
    { title: [required], body: [required] }
)

function openCreate() {
    formError.value = ''
    reset()
    // Make sure the default audience is one the current user is allowed to pick.
    const allowed = audienceOpts.value.map((o) => o.value)
    if (!allowed.includes(form.audience)) setField('audience', allowed[0] || 'all')
    modalOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    saving.value = true
    try {
        await store.create({ ...form, createdBy: auth.user?.id ?? null })
        modalOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally { saving.value = false }
}

async function onDelete(a) {
    if (!window.confirm(`Delete "${a.title}"?`)) return
    await store.remove(a.id)
}

function formatDate(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
