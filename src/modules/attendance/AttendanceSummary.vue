<template>
    <div class="space-y-4">
        <div>
            <h2 class="text-xl font-semibold text-gray-900">Attendance Summary</h2>
            <p class="text-sm text-gray-500">Monthly attendance counts per student.</p>
        </div>

        <!-- Filters (hidden for student/parent — auto-selected) -->
        <div v-if="!isOwnView" class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-40">
                <BaseSelect label="Class" size="sm" :modelValue="selClassId"
                    @update:modelValue="(v) => { selClassId = Number(v); selSectionId = '' }" :options="classOptions"
                    placeholder="Select class" />
            </div>
            <div class="flex-1 min-w-40">
                <BaseSelect label="Section" size="sm" :modelValue="selSectionId"
                    @update:modelValue="(v) => { selSectionId = Number(v); onLoad() }" :options="sectionOptions"
                    placeholder="Select section" />
            </div>
            <div class="flex-1 min-w-40">
                <BaseInput label="Month" type="month" size="sm" :modelValue="selMonth"
                    @update:modelValue="(v) => { selMonth = v; onLoad() }" />
            </div>
        </div>

        <!-- Summary table -->
        <div v-if="filteredRows.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <!-- Totals bar -->
            <div class="px-4 py-3 border-b border-gray-100 flex gap-6 text-sm">
                <span class="text-gray-500">Students: <strong class="text-gray-900">{{ filteredRows.length
                        }}</strong></span>
                <span class="text-green-600">Present: <strong>{{ totals.present }}</strong></span>
                <span class="text-red-600">Absent: <strong>{{ totals.absent }}</strong></span>
                <span class="text-amber-600">Late: <strong>{{ totals.late }}</strong></span>
            </div>
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-left px-4 py-2 font-medium">Adm No.</th>
                        <th class="text-center px-4 py-2 font-medium text-green-600">P</th>
                        <th class="text-center px-4 py-2 font-medium text-red-600">A</th>
                        <th class="text-center px-4 py-2 font-medium text-amber-600">L</th>
                        <th class="text-center px-4 py-2 font-medium">Total</th>
                        <th class="text-center px-4 py-2 font-medium">%</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="r in filteredRows" :key="r.student.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ r.student.firstName }} {{ r.student.lastName
                            }}</td>
                        <td class="px-4 py-2 text-gray-500 font-mono">{{ r.student.admissionNo }}</td>
                        <td class="px-4 py-2 text-center text-green-700">{{ r.present }}</td>
                        <td class="px-4 py-2 text-center text-red-700">{{ r.absent }}</td>
                        <td class="px-4 py-2 text-center text-amber-700">{{ r.late }}</td>
                        <td class="px-4 py-2 text-center text-gray-700">{{ r.total }}</td>
                        <td class="px-4 py-2 text-center font-medium" :class="pctClass(r)">
                            {{ r.total ? Math.round(((r.present + r.late) / r.total) * 100) : 0 }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else-if="selSectionId && selMonth"
            class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            No attendance data for this period.
        </div>
        <div v-else class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            Select class, section, and month to view summary.
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAcademicStore } from '../../stores/academic'
import { useAttendanceStore } from '../../stores/attendance'
import { useRoleContext } from '../../composables/useRoleContext'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'

const academic = useAcademicStore()
const store = useAttendanceStore()
const rc = useRoleContext()
academic.loadAll()

const selClassId = ref('')
const selSectionId = ref('')
const now = new Date()
const selMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
const rows = ref([])

// For student/parent: filter summary to only their student
const isOwnView = computed(() => rc.isStudent.value || rc.isParent.value)

const sectionsForClass = computed(() => {
    const all = selClassId.value ? academic.sectionsByClass(selClassId.value) : []
    return rc.filterSections(all)
})

const classOptions = computed(() =>
    academic.classes.map((c) => ({ value: c.id, label: c.name }))
)
const sectionOptions = computed(() =>
    sectionsForClass.value.map((s) => ({ value: s.id, label: s.name }))
)

const totals = computed(() => {
    let present = 0, absent = 0, late = 0
    for (const r of filteredRows.value) { present += r.present; absent += r.absent; late += r.late }
    return { present, absent, late }
})

// Student/parent only see their own rows
const filteredRows = computed(() => {
    if (!isOwnView.value) return rows.value
    const ids = rc.isParent.value ? rc.myStudentIds.value : [rc.myStudentId.value]
    return rows.value.filter((r) => ids.includes(r.student.id))
})

async function onLoad() {
    if (!selSectionId.value || !selMonth.value) { rows.value = []; return }
    rows.value = await store.monthlySummary(selSectionId.value, selMonth.value)
}

// Auto-load for student/parent
watch(() => rc.ready, (ready) => {
    if (!ready) return
    if ((rc.isStudent.value || rc.isParent.value) && rc.mySectionId.value) {
        selSectionId.value = rc.mySectionId.value
        onLoad()
    }
}, { immediate: true })

function pctClass(r) {
    if (!r.total) return 'text-gray-400'
    const pct = ((r.present + r.late) / r.total) * 100
    if (pct >= 90) return 'text-green-700'
    if (pct >= 75) return 'text-amber-700'
    return 'text-red-700'
}
</script>
