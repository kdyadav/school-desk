<template>
    <div class="space-y-4">
        <div>
            <h2 class="text-xl font-semibold text-gray-900">Enter Marks</h2>
            <p class="text-sm text-gray-500">Select exam and section, then enter marks per student.</p>
        </div>

        <!-- Context -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-48">
                <BaseSelect label="Exam" size="sm" :modelValue="selExamId"
                    @update:modelValue="(v) => { selExamId = Number(v); onExamChange() }" :options="examOptions"
                    placeholder="Select exam" />
            </div>
            <div class="flex-1 min-w-40">
                <BaseSelect label="Section" size="sm" :modelValue="selSectionId"
                    @update:modelValue="(v) => { selSectionId = Number(v); onLoad() }" :options="sectionOptions"
                    placeholder="Select section" />
            </div>
        </div>

        <!-- Marks grid -->
        <div v-if="ready" class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-3 py-2 font-medium sticky left-0 bg-gray-50 z-10">Student</th>
                        <th v-for="es in currentExam.subjects" :key="es.subjectId"
                            class="text-center px-3 py-2 font-medium min-w-[100px]">
                            {{ subjectCode(es.subjectId) }}
                            <span class="block text-[10px] text-gray-400 font-normal">/ {{ es.maxMarks }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="s in students" :key="s.id">
                        <td class="px-3 py-2 sticky left-0 bg-white z-10 border-r border-gray-100">
                            <p class="font-medium text-gray-800 text-xs">{{ s.firstName }} {{ s.lastName }}</p>
                        </td>
                        <td v-for="es in currentExam.subjects" :key="es.subjectId" class="px-1 py-1 text-center">
                            <input type="number" min="0" :max="es.maxMarks" :value="getMark(s.id, es.subjectId)"
                                @change="onMarkChange(s.id, es.subjectId, es.maxMarks, $event)"
                                class="w-16 text-center text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <span class="block text-[10px] mt-0.5" :class="gradeColor(getGrade(s.id, es.subjectId))">
                                {{ getGrade(s.id, es.subjectId) || '' }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="!students.length">
                        <td :colspan="(currentExam?.subjects?.length || 0) + 1"
                            class="px-4 py-8 text-center text-gray-400">No enrolled students.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            Select an exam and section to enter marks.
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useExamsStore, calcGrade } from '../../stores/exams'
import { useAcademicStore } from '../../stores/academic'
import { useRoleContext } from '../../composables/useRoleContext'
import BaseSelect from '../../ui-lib/BaseSelect.vue'

const store = useExamsStore()
const academic = useAcademicStore()
const rc = useRoleContext()
store.loadExams()
academic.loadAll()

const selExamId = ref('')
const selSectionId = ref('')
const students = ref([])

const currentExam = computed(() => store.exams.find((e) => e.id === selExamId.value) || null)
const sectionsForExam = computed(() => {
    if (!currentExam.value) return []
    const all = academic.sectionsByClass(currentExam.value.classId)
    return rc.filterSections(all)
})

const examOptions = computed(() =>
    store.exams.map((e) => ({
        value: e.id,
        label: `${e.name} — ${academic.classById(e.classId)?.name || ''}`,
    }))
)
const sectionOptions = computed(() =>
    sectionsForExam.value.map((s) => ({ value: s.id, label: s.name }))
)
const ready = computed(() => !!(currentExam.value && selSectionId.value && students.value.length >= 0 && selSectionId.value))

function onExamChange() { selSectionId.value = ''; students.value = [] }

async function onLoad() {
    if (!selSectionId.value || !selExamId.value) return
    students.value = await store.enrolledStudents(selSectionId.value)
    await store.loadMarks(selExamId.value)
}

function subjectCode(id) { return academic.subjects.find((s) => s.id === id)?.code || '?' }

function getMark(studentId, subjectId) {
    const m = store.marks.find((r) => r.studentId === studentId && r.subjectId === subjectId)
    return m?.marks ?? ''
}

function getGrade(studentId, subjectId) {
    const m = store.marks.find((r) => r.studentId === studentId && r.subjectId === subjectId)
    return m?.grade || ''
}

function gradeColor(g) {
    if (!g) return 'text-gray-300'
    if (g === 'A+' || g === 'A') return 'text-green-600'
    if (g === 'B+' || g === 'B') return 'text-blue-600'
    if (g === 'F') return 'text-red-600'
    return 'text-amber-600'
}

async function onMarkChange(studentId, subjectId, maxMarks, event) {
    const val = Number(event.target.value)
    if (isNaN(val) || val < 0) return
    const clamped = Math.min(val, maxMarks)
    event.target.value = clamped
    await store.saveMark({ examId: selExamId.value, studentId, subjectId, marks: clamped, maxMarks })
}
</script>
