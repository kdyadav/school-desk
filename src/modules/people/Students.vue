<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">Students</h2>
                <p class="text-sm text-gray-500">{{ store.students.length }} student(s) on record.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate">+ New Student</BaseButton>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100">
                <div class="w-full sm:w-72">
                    <BaseInput size="sm" type="search" placeholder="Search by name or admission no."
                        :modelValue="search" @update:modelValue="(v) => search = v" />
                </div>
            </div>
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Adm No.</th>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-left px-4 py-2 font-medium">Gender</th>
                        <th class="text-left px-4 py-2 font-medium">Section</th>
                        <th class="text-left px-4 py-2 font-medium">Guardian</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="s in paged" :key="s.id">
                        <td class="px-4 py-2 font-mono text-gray-600">{{ s.admissionNo }}</td>
                        <td class="px-4 py-2 font-medium text-gray-900">{{ s.firstName }} {{ s.lastName }}</td>
                        <td class="px-4 py-2 text-gray-600 capitalize">{{ s.gender }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ sectionLabel(s.currentSectionId) }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ guardianLabel(s.guardianId) }}</td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(s)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(s)">Delete
                            </BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!paged.length">
                        <td colspan="6" class="px-4 py-8 text-center text-gray-400">No students found.</td>
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

        <BaseDrawer v-model="drawerOpen" :title="editing?.id ? 'Edit Student' : 'New Student'" width="lg">
            <form @submit.prevent="onSubmit" class="space-y-5">
                <!-- Student info -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BaseInput label="First name" :modelValue="sf.firstName"
                        @update:modelValue="(v) => ss('firstName', v)" @blur="() => sv('firstName')"
                        :error="se.firstName" />
                    <BaseInput label="Last name" :modelValue="sf.lastName" @update:modelValue="(v) => ss('lastName', v)"
                        @blur="() => sv('lastName')" :error="se.lastName" />
                </div>
                <BaseInput label="Admission No." :modelValue="sf.admissionNo"
                    @update:modelValue="(v) => ss('admissionNo', v)" @blur="() => sv('admissionNo')"
                    :error="se.admissionNo" placeholder="ADM0001" />
                <BaseInput label="Date of birth" type="date" :modelValue="sf.dob"
                    @update:modelValue="(v) => ss('dob', v)" @blur="() => sv('dob')" :error="se.dob" />
                <BaseSelect label="Gender" :modelValue="sf.gender" @update:modelValue="(v) => ss('gender', v)"
                    :options="[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }]"
                    :error="se.gender" required />
                <BaseSelect label="Current section" :modelValue="sf.currentSectionId"
                    @update:modelValue="(v) => ss('currentSectionId', v ? Number(v) : null)" :options="sectionOptions"
                    placeholder="— none —" />

                <!-- Guardian picker -->
                <div class="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-gray-700">Guardian</p>
                        <BaseButton type="button" variant="link" size="sm" :full-width="false"
                            @click="newGuardian = !newGuardian">
                            {{ newGuardian ? '← Pick existing' : '+ Create new' }}
                        </BaseButton>
                    </div>
                    <div v-if="!newGuardian">
                        <BaseSelect placeholder="— select guardian —" :modelValue="sf.guardianId"
                            @update:modelValue="(v) => ss('guardianId', v ? Number(v) : null)"
                            :options="guardianOptions" />
                    </div>
                    <template v-else>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <BaseInput label="First name" :modelValue="gf.firstName"
                                @update:modelValue="(v) => gs('firstName', v)" :error="ge.firstName" />
                            <BaseInput label="Last name" :modelValue="gf.lastName"
                                @update:modelValue="(v) => gs('lastName', v)" :error="ge.lastName" />
                        </div>
                        <BaseSelect label="Relation" :modelValue="gf.relation"
                            @update:modelValue="(v) => gs('relation', v)"
                            :options="[{ label: 'Father', value: 'father' }, { label: 'Mother', value: 'mother' }, { label: 'Guardian', value: 'guardian' }]" />
                        <BaseInput label="Phone" :modelValue="gf.phone" @update:modelValue="(v) => gs('phone', v)"
                            :error="ge.phone" />
                    </template>
                </div>

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
import { usePeopleStore } from '../../stores/people'
import { useAcademicStore } from '../../stores/academic'
import { useTableState } from '../../composables/useTableState'
import { useForm } from '../../ui-lib/useForm'
import { required } from '../../ui-lib/validators'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseDrawer from '../../ui-lib/BaseDrawer.vue'

const store = usePeopleStore()
const academic = useAcademicStore()
store.loadAll()
academic.loadAll()

const { search, page, paged, totalPages, next, prev } = useTableState(
    () => store.students,
    {
        matcher: (s, q) =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
            s.admissionNo.toLowerCase().includes(q),
    }
)

const drawerOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')
const newGuardian = ref(false)

// Student form
const { values: sf, errors: se, setField: ss, validateField: sv, validateAll: sva, reset: sr } = useForm(
    { firstName: '', lastName: '', admissionNo: '', dob: '', gender: 'male', currentSectionId: null, guardianId: null },
    { firstName: [required], lastName: [required], admissionNo: [required], dob: [required], gender: [required] }
)

// Guardian sub-form
const { values: gf, errors: ge, setField: gs, validateAll: gva, reset: gr } = useForm(
    { firstName: '', lastName: '', relation: 'father', phone: '' },
    { firstName: [required], lastName: [required], phone: [required] }
)

const sectionOptions = computed(() =>
    academic.sections.map((s) => ({
        value: s.id,
        label: `${academic.classById(s.classId)?.name || '?'} — ${s.name}`,
    }))
)

const guardianOptions = computed(() =>
    store.guardians.map((g) => ({ value: g.id, label: `${g.firstName} ${g.lastName} (${g.phone})` }))
)

const sectionLabel = (id) => {
    if (!id) return '—'
    const s = academic.sections.find((s) => s.id === id)
    if (!s) return '—'
    return `${academic.classById(s.classId)?.name || '?'}-${s.name}`
}

const guardianLabel = (id) => {
    const g = store.guardianById(id)
    return g ? `${g.firstName} ${g.lastName}` : '—'
}

function openCreate() {
    editing.value = null; formError.value = ''; sr(); gr()
    newGuardian.value = false; drawerOpen.value = true
}

function openEdit(s) {
    editing.value = s; formError.value = ''; sr(); gr(); newGuardian.value = false
    ss('firstName', s.firstName); ss('lastName', s.lastName)
    ss('admissionNo', s.admissionNo); ss('dob', s.dob)
    ss('gender', s.gender); ss('currentSectionId', s.currentSectionId || null)
    ss('guardianId', s.guardianId || null)
    drawerOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!sva()) return
    if (newGuardian.value && !gva()) return
    saving.value = true
    try {
        const studentData = { ...sf }
        if (editing.value?.id) {
            await store.saveItem('students', { id: editing.value.id, ...studentData })
        } else {
            const guardianData = newGuardian.value ? { ...gf } : null
            await store.createStudentWithGuardian(studentData, guardianData)
        }
        drawerOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally {
        saving.value = false
    }
}

async function onDelete(s) {
    if (!window.confirm(`Delete student ${s.firstName} ${s.lastName}?`)) return
    await store.deleteItem('students', s.id)
}
</script>
