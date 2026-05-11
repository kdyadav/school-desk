import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { attendanceRepo, enrollmentRepo, studentRepo } from '../repositories'
import { ATTENDANCE_STATUS } from '../schemas/attendance'

export { ATTENDANCE_STATUS }

export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref([])        // attendance rows for current section+date
  const roster = ref([])         // enrolled students for the section
  const loading = ref(false)
  const error = ref(null)

  const selectedSectionId = ref(null)
  const selectedDate = ref('')   // YYYY-MM-DD

  /**
   * Build a map studentId → status (defaulting to 'present')
   */
  const statusMap = computed(() => {
    const m = {}
    for (const s of roster.value) m[s.id] = 'present'
    for (const r of records.value) m[r.studentId] = r.status
    return m
  })

  /** Load enrolled students + any existing attendance rows for section+date */
  async function load(sectionId, date) {
    selectedSectionId.value = sectionId
    selectedDate.value = date
    loading.value = true
    error.value = null
    try {
      const enrollments = await enrollmentRepo.where('sectionId', sectionId)
      const studentIds = enrollments.map((e) => e.studentId)
      const allStudents = await studentRepo.list()
      roster.value = allStudents
        .filter((s) => studentIds.includes(s.id))
        .sort((a, b) => a.firstName.localeCompare(b.firstName))

      const allForSection = await attendanceRepo.where('sectionId', sectionId)
      records.value = allForSection.filter((r) => r.date === date)
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  /** Set status for one student (in-memory only until saveBulk) */
  function setStatus(studentId, status) {
    const existing = records.value.find((r) => r.studentId === studentId)
    if (existing) {
      existing.status = status
    } else {
      records.value.push({ studentId, status, _new: true })
    }
  }

  /** Persist all current statuses to the DB */
  async function saveBulk(markedBy) {
    const sectionId = selectedSectionId.value
    const date = selectedDate.value
    if (!sectionId || !date) throw new Error('Select section and date first')

    for (const student of roster.value) {
      const status = statusMap.value[student.id] || 'present'
      const existing = records.value.find(
        (r) => r.studentId === student.id && !r._new
      )
      if (existing) {
        await attendanceRepo.update(existing.id, { status })
      } else {
        await attendanceRepo.create({
          sectionId, date, studentId: student.id, status,
          markedBy: markedBy ?? null,
        })
      }
    }
    await load(sectionId, date)
  }

  /**
   * Monthly summary for a section: returns array of { student, present, absent, late, total }
   */
  async function monthlySummary(sectionId, yearMonth) {
    const enrollments = await enrollmentRepo.where('sectionId', sectionId)
    const studentIds = new Set(enrollments.map((e) => e.studentId))
    const allStudents = await studentRepo.list()
    const students = allStudents.filter((s) => studentIds.has(s.id))

    const allForSection = await attendanceRepo.where('sectionId', sectionId)
    const monthRows = allForSection.filter((r) => r.date.startsWith(yearMonth))

    return students.map((s) => {
      const rows = monthRows.filter((r) => r.studentId === s.id)
      return {
        student: s,
        present: rows.filter((r) => r.status === 'present').length,
        absent: rows.filter((r) => r.status === 'absent').length,
        late: rows.filter((r) => r.status === 'late').length,
        total: rows.length,
      }
    }).sort((a, b) => a.student.firstName.localeCompare(b.student.firstName))
  }

  return {
    records,
    roster,
    loading,
    error,
    selectedSectionId,
    selectedDate,
    statusMap,
    load,
    setStatus,
    saveBulk,
    monthlySummary,
    ATTENDANCE_STATUS,
  }
})
