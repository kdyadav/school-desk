<template>
    <div class="space-y-5">
        <!-- Header -->
        <div>
            <h2 class="text-xl font-semibold text-gray-900">Enrollment</h2>
            <p class="text-sm text-gray-500">Assign students to a section for an academic year.</p>
        </div>

        <!-- Context selectors -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-40">
                <BaseSelect label="Academic Year" size="sm" :modelValue="selYearId"
                    @update:modelValue="(v) => { selYearId = Number(v); onContextChange() }" :options="yearOptions"
                    placeholder="Select year" />
            </div>
            <div class="flex-1 min-w-40">
                <BaseSelect label="Class" size="sm" :modelValue="selClassId"
                    @update:modelValue="(v) => { selClassId = Number(v); selSectionId = '' }" :options="classOptions"
                    placeholder="Select class" />
            </div>
            <div class="flex-1 min-w-40">
                <BaseSelect label="Section" size="sm" :modelValue="selSectionId"
                    @update:modelValue="(v) => { selSectionId = Number(v); onContextChange() }"
                    :options="sectionOptions" placeholder="Select section" />
            </div>
        </div>

        <!-- Stats bar -->
        <div v-if="ready" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Enrolled</p>
                <p class="text-2xl font-bold text-indigo-600">{{ store.strength }}</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Unassigned</p>
                <p class="text-2xl font-bold text-amber-600">{{ store.unenrolledStudents.length }}</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 p-4">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Selected</p>
                <p class="text-2xl font-bold text-green-600">{{ selected.size }}</p>
            </div>
        </div>

        <!-- Two-panel layout -->
        <div v-if="ready" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- Unassigned students -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-700">Unassigned Students</p>
                    <div class="flex gap-3">
                        <BaseButton variant="link" size="sm" :full-width="false" @click="selectAll">All</BaseButton>
                        <BaseButton variant="link-muted" size="sm" :full-width="false" @click="selected.clear()">None
                        </BaseButton>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto max-h-80">
                    <div v-if="!filteredUnassigned.length" class="px-4 py-8 text-sm text-center text-gray-400">
                        {{ store.unenrolledStudents.length ? 'No matches' : 'All students are already enrolled.' }}
                    </div>
                    <div v-for="s in filteredUnassigned" :key="s.id"
                        class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <BaseCheckbox :modelValue="selected.has(s.id)" @update:modelValue="() => toggleSelect(s.id)" />
                        <div class="min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">{{ s.firstName }} {{ s.lastName }}</p>
                            <p class="text-xs text-gray-500">{{ s.admissionNo }}</p>
                        </div>
                    </div>
                </div>
                <div class="px-4 py-3 border-t border-gray-100">
                    <BaseInput size="sm" type="search" placeholder="Filter unassigned..." :modelValue="unassignedSearch"
                        @update:modelValue="(v) => unassignedSearch = v" />
                </div>
                <div class="px-4 pb-3">
                    <BaseButton :full-width="true" :disabled="!selected.size" :loading="assigning" @click="onAssign">
                        Assign {{ selected.size || '' }} Student{{ selected.size !== 1 ? 's' : '' }} →
                    </BaseButton>
                </div>
            </div>

            <!-- Enrolled students -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="px-4 py-3 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-700">Enrolled in this Section</p>
                </div>
                <div class="overflow-y-auto max-h-96">
                    <table class="min-w-full text-sm">
                        <thead class="bg-gray-50 text-gray-600">
                            <tr>
                                <th class="text-left px-4 py-2 font-medium">Roll</th>
                                <th class="text-left px-4 py-2 font-medium">Name</th>
                                <th class="text-left px-4 py-2 font-medium">Adm No.</th>
                                <th class="text-right px-4 py-2 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="e in store.enrolledStudents" :key="e.id">
                                <td class="px-4 py-2 font-mono text-gray-600">{{ e.rollNo }}</td>
                                <td class="px-4 py-2 font-medium text-gray-900">
                                    {{ e.student?.firstName }} {{ e.student?.lastName }}
                                </td>
                                <td class="px-4 py-2 text-gray-500">{{ e.student?.admissionNo }}</td>
                                <td class="px-4 py-2 text-right">
                                    <BaseButton variant="link-danger" size="sm" :full-width="false"
                                        @click="onUnenroll(e)">Remove</BaseButton>
                                </td>
                            </tr>
                            <tr v-if="!store.enrolledStudents.length">
                                <td colspan="4" class="px-4 py-8 text-center text-gray-400">No students enrolled yet.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="!ready"
            class="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center text-gray-400 text-sm">
            Select an academic year, class, and section above to manage enrollment.
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAcademicStore } from '../../stores/academic'
import { useEnrollmentStore } from '../../stores/enrollment'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseCheckbox from '../../ui-lib/BaseCheckbox.vue'

const academic = useAcademicStore()
const store = useEnrollmentStore()
academic.loadAll()

const selYearId = ref(academic.activeYear?.id || '')
const selClassId = ref('')
const selSectionId = ref('')
const assigning = ref(false)
const selected = reactive(new Set())
const unassignedSearch = ref('')

const ready = computed(() => !!(selYearId.value && selSectionId.value))

const classesForYear = computed(() =>
    selYearId.value ? academic.classesByYear(selYearId.value) : []
)
const sectionsForClass = computed(() =>
    selClassId.value ? academic.sectionsByClass(selClassId.value) : []
)

const yearOptions = computed(() =>
    academic.years.map((y) => ({ value: y.id, label: y.name }))
)
const classOptions = computed(() =>
    classesForYear.value.map((c) => ({ value: c.id, label: c.name }))
)
const sectionOptions = computed(() =>
    sectionsForClass.value.map((s) => ({ value: s.id, label: s.name }))
)

const filteredUnassigned = computed(() => {
    const q = unassignedSearch.value.trim().toLowerCase()
    if (!q) return store.unenrolledStudents
    return store.unenrolledStudents.filter((s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q)
    )
})

function onContextChange() {
    selected.clear()
    if (selYearId.value && selSectionId.value) {
        store.load(selYearId.value, selSectionId.value)
    }
}

function toggleSelect(id) {
    if (selected.has(id)) selected.delete(id)
    else selected.add(id)
}
function selectAll() {
    filteredUnassigned.value.forEach((s) => selected.add(s.id))
}

async function onAssign() {
    if (!selected.size) return
    assigning.value = true
    try {
        await store.assignStudents([...selected])
        selected.clear()
    } finally {
        assigning.value = false
    }
}

async function onUnenroll(enrollment) {
    const name = `${enrollment.student?.firstName || ''} ${enrollment.student?.lastName || ''}`.trim()
    if (!window.confirm(`Remove ${name} from this section?`)) return
    await store.unenroll(enrollment.id)
}
</script>
