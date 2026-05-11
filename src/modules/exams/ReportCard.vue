<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-semibold text-gray-900">Report Card</h2>
                <p class="text-sm text-gray-500">Select a student to view / print their report card.</p>
            </div>
            <BaseButton v-if="report.length" :full-width="false" variant="secondary" @click="printCard">🖨 Print
            </BaseButton>
        </div>

        <!-- Selectors (hidden for student/parent — auto-selected) -->
        <div v-if="canPickStudent"
            class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-48">
                <BaseSelect label="Academic Year" size="sm" :modelValue="selYearId"
                    @update:modelValue="(v) => { selYearId = Number(v); onLoad() }" :options="yearOptions"
                    placeholder="Select year" />
            </div>
            <div class="flex-1 min-w-48">
                <BaseSelect label="Student" size="sm" :modelValue="selStudentId"
                    @update:modelValue="(v) => { selStudentId = Number(v); onLoad() }" :options="studentSelectOptions"
                    placeholder="Select student" />
            </div>
        </div>

        <!-- Report Card (printable) -->
        <div v-if="report.length" id="report-card"
            class="bg-white rounded-xl border border-gray-200 p-6 space-y-6 print:shadow-none print:border-0">
            <div class="text-center border-b pb-4">
                <h3 class="text-xl font-bold text-gray-900">skoolDesk — Report Card</h3>
                <p class="text-sm text-gray-600">{{ selectedStudent?.firstName }} {{ selectedStudent?.lastName }} — {{
                    selectedStudent?.admissionNo }}</p>
                <p class="text-xs text-gray-500">{{ academic.yearById(selYearId)?.name }}</p>
            </div>

            <div v-for="exam in report" :key="exam.exam.id" class="space-y-2">
                <h4 class="text-sm font-semibold text-indigo-700">{{ exam.exam.name }}</h4>
                <table class="min-w-full text-sm border border-gray-200 rounded">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="text-left px-3 py-1.5 font-medium text-gray-600">Subject</th>
                            <th class="text-center px-3 py-1.5 font-medium text-gray-600">Max</th>
                            <th class="text-center px-3 py-1.5 font-medium text-gray-600">Marks</th>
                            <th class="text-center px-3 py-1.5 font-medium text-gray-600">Grade</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="sub in exam.subjects" :key="sub.subject?.id">
                            <td class="px-3 py-1.5 text-gray-800">{{ sub.subject?.name || '?' }}</td>
                            <td class="px-3 py-1.5 text-center text-gray-500">{{ sub.maxMarks }}</td>
                            <td class="px-3 py-1.5 text-center font-medium">{{ sub.marks ?? '—' }}</td>
                            <td class="px-3 py-1.5 text-center font-semibold" :class="gradeColor(sub.grade)">{{
                                sub.grade }}</td>
                        </tr>
                    </tbody>
                    <tfoot class="bg-gray-50">
                        <tr>
                            <td class="px-3 py-1.5 font-semibold text-gray-800">Total</td>
                            <td class="px-3 py-1.5 text-center font-medium text-gray-500">{{ exam.maxTotal }}</td>
                            <td class="px-3 py-1.5 text-center font-bold text-gray-900">{{ exam.total }}</td>
                            <td class="px-3 py-1.5 text-center font-bold" :class="gradeColor(overallGrade(exam))">{{
                                overallGrade(exam) }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <div v-else-if="selStudentId && selYearId"
            class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            No exam results found for this student.
        </div>
        <div v-else class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            Select an academic year and student above.
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useExamsStore, calcGrade } from '../../stores/exams'
import { useAcademicStore } from '../../stores/academic'
import { usePeopleStore } from '../../stores/people'
import { useRoleContext } from '../../composables/useRoleContext'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'

const store = useExamsStore()
const academic = useAcademicStore()
const people = usePeopleStore()
const rc = useRoleContext()
store.loadExams()
academic.loadAll()
people.loadAll()

const canPickStudent = computed(() => rc.isAdmin.value || rc.isTeacher.value)

const selYearId = ref('')
const selStudentId = ref('')
const report = ref([])

// Filter student list: teacher sees own sections' students, admin sees all
const studentOptions = computed(() => {
    if (rc.isAdmin.value) return people.students
    if (rc.isTeacher.value) {
        return people.students.filter((s) => rc.mySectionIds.value.includes(s.currentSectionId))
    }
    return []
})

const yearOptions = computed(() =>
    academic.years.map((y) => ({ value: y.id, label: y.name }))
)
const studentSelectOptions = computed(() =>
    studentOptions.value.map((s) => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName} (${s.admissionNo})`,
    }))
)

const selectedStudent = computed(() => people.students.find((s) => s.id === selStudentId.value) || null)

// Auto-select for student/parent
watch(() => rc.ready, (ready) => {
    if (!ready) return
    if (rc.isStudent.value && rc.myStudentId.value) {
        selStudentId.value = rc.myStudentId.value
        if (academic.activeYear) { selYearId.value = academic.activeYear.id; onLoad() }
    }
    if (rc.isParent.value && rc.myStudentId.value) {
        selStudentId.value = rc.myStudentId.value
        if (academic.activeYear) { selYearId.value = academic.activeYear.id; onLoad() }
    }
}, { immediate: true })

async function onLoad() {
    if (!selStudentId.value || !selYearId.value) { report.value = []; return }
    report.value = await store.reportCardData(selStudentId.value, selYearId.value)
}

function overallGrade(exam) {
    if (!exam.maxTotal) return '—'
    return calcGrade(exam.total, exam.maxTotal)
}

function gradeColor(g) {
    if (!g || g === '—') return 'text-gray-400'
    if (g === 'A+' || g === 'A') return 'text-green-600'
    if (g === 'B+' || g === 'B') return 'text-blue-600'
    if (g === 'F') return 'text-red-600'
    return 'text-amber-600'
}

function printCard() {
    window.print()
}
</script>

<style>
@media print {
    body * {
        visibility: hidden;
    }

    #report-card,
    #report-card * {
        visibility: visible;
    }

    #report-card {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }
}
</style>
