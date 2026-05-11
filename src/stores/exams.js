import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  examRepo,
  examMarkRepo,
  enrollmentRepo,
  studentRepo,
  subjectRepo,
} from '../repositories'

/** Default grade scale — admin can override later */
const DEFAULT_GRADE_SCALE = [
  { min: 90, grade: 'A+' },
  { min: 80, grade: 'A' },
  { min: 70, grade: 'B+' },
  { min: 60, grade: 'B' },
  { min: 50, grade: 'C' },
  { min: 40, grade: 'D' },
  { min: 0, grade: 'F' },
]

export function calcGrade(marks, maxMarks, scale = DEFAULT_GRADE_SCALE) {
  const pct = (marks / maxMarks) * 100
  for (const { min, grade } of scale) {
    if (pct >= min) return grade
  }
  return 'F'
}

export const useExamsStore = defineStore('exams', () => {
  const exams = ref([])
  const marks = ref([])       // marks for the current exam
  const loading = ref(false)
  const error = ref(null)
  const gradeScale = ref([...DEFAULT_GRADE_SCALE])

  async function loadExams() {
    exams.value = await examRepo.list()
  }

  async function saveExam(payload) {
    if (payload.id) {
      const { id, ...patch } = payload
      await examRepo.update(id, patch)
    } else {
      await examRepo.create(payload)
    }
    await loadExams()
  }

  async function deleteExam(id) {
    await examRepo.remove(id)
    await loadExams()
  }

  /** Load all marks for an exam */
  async function loadMarks(examId) {
    loading.value = true
    try {
      marks.value = await examMarkRepo.where('examId', examId)
    } finally {
      loading.value = false
    }
  }

  /** Save (create or update) a single mark row */
  async function saveMark({ examId, studentId, subjectId, marks: marksVal, maxMarks }) {
    const grade = calcGrade(marksVal, maxMarks, gradeScale.value)
    const existing = marks.value.find(
      (m) => m.examId === examId && m.studentId === studentId && m.subjectId === subjectId
    )
    if (existing) {
      await examMarkRepo.update(existing.id, { marks: marksVal, grade })
    } else {
      await examMarkRepo.create({ examId, studentId, subjectId, marks: marksVal, grade })
    }
    await loadMarks(examId)
  }

  /** Build report card data for one student across all exams in a year */
  async function reportCardData(studentId, academicYearId) {
    const allExams = await examRepo.list()
    const yearExams = allExams.filter((e) => e.academicYearId === academicYearId)
    const allSubjects = await subjectRepo.list()

    const result = []
    for (const exam of yearExams) {
      const examMarks = await examMarkRepo.where('examId', exam.id)
      const studentMarks = examMarks.filter((m) => m.studentId === studentId)
      result.push({
        exam,
        subjects: exam.subjects.map((es) => {
          const sub = allSubjects.find((s) => s.id === es.subjectId)
          const mark = studentMarks.find((m) => m.subjectId === es.subjectId)
          return {
            subject: sub,
            maxMarks: es.maxMarks,
            marks: mark?.marks ?? null,
            grade: mark?.grade ?? '—',
          }
        }),
        total: studentMarks.reduce((s, m) => s + m.marks, 0),
        maxTotal: exam.subjects.reduce((s, es) => s + es.maxMarks, 0),
      })
    }
    return result
  }

  /** Get enrolled students for a section (helper for marks entry) */
  async function enrolledStudents(sectionId) {
    const enrollments = await enrollmentRepo.where('sectionId', sectionId)
    const allStudents = await studentRepo.list()
    return allStudents
      .filter((s) => enrollments.some((e) => e.studentId === s.id))
      .sort((a, b) => a.firstName.localeCompare(b.firstName))
  }

  return {
    exams,
    marks,
    loading,
    error,
    gradeScale,
    loadExams,
    saveExam,
    deleteExam,
    loadMarks,
    saveMark,
    reportCardData,
    enrolledStudents,
    calcGrade,
  }
})
