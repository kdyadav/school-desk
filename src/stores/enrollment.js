import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enrollmentRepo, studentRepo } from '../repositories'

const pad = (n, w = 3) => String(n).padStart(w, '0')

export const useEnrollmentStore = defineStore('enrollment', () => {
  // All enrollments for the selected section + academic year
  const enrollments = ref([])
  // All students (for unassigned calculation)
  const allStudents = ref([])

  const loading = ref(false)
  const error = ref(null)

  // Context set by the page
  const selectedYearId = ref(null)
  const selectedSectionId = ref(null)

  /** Students enrolled in this section+year */
  const enrolledStudentIds = computed(() =>
    new Set(enrollments.value.map((e) => e.studentId))
  )

  /** Students NOT yet enrolled in any section for this year */
  const unenrolledStudents = computed(() => {
    if (!selectedYearId.value) return []
    const enrolledInYear = new Set(
      enrollments.value
        .filter((e) => e.academicYearId === selectedYearId.value)
        .map((e) => e.studentId)
    )
    // Globally unenrolled = no enrollment in this year regardless of section
    // We reload all enrollments for the year, so use a broader query below
    return allStudents.value.filter((s) => !enrolledInYear.has(s.id))
  })

  /** Enrolled students with their enrollment row merged */
  const enrolledStudents = computed(() =>
    enrollments.value.map((e) => ({
      ...e,
      student: allStudents.value.find((s) => s.id === e.studentId) || null,
    })).sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }))
  )

  const strength = computed(() => enrollments.value.length)

  /** Load enrollments for year + section, and all students */
  async function load(yearId, sectionId) {
    selectedYearId.value = yearId
    selectedSectionId.value = sectionId
    loading.value = true
    error.value = null
    try {
      const [allE, allS] = await Promise.all([
        // All enrollments in this year (for unassigned calc)
        enrollmentRepo.where('academicYearId', yearId),
        studentRepo.list(),
      ])
      // Filter to just this section for the enrollment panel
      enrollments.value = allE.filter((e) => e.sectionId === sectionId)
      allStudents.value = allS
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  /** Assign an array of studentIds to the current section, auto-numbering roll nos */
  async function assignStudents(studentIds) {
    const yearId = selectedYearId.value
    const sectionId = selectedSectionId.value
    if (!yearId || !sectionId) throw new Error('Select a year and section first')

    // Find max existing roll number
    let maxRoll = enrollments.value.reduce((max, e) => {
      const n = parseInt(e.rollNo, 10)
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)

    for (const studentId of studentIds) {
      if (enrolledStudentIds.value.has(studentId)) continue
      maxRoll++
      await enrollmentRepo.create({
        studentId,
        sectionId,
        academicYearId: yearId,
        rollNo: pad(maxRoll),
      })
    }
    // Reload the section's enrollments
    await load(yearId, sectionId)
  }

  /** Remove a student from this section */
  async function unenroll(enrollmentId) {
    await enrollmentRepo.remove(enrollmentId)
    enrollments.value = enrollments.value.filter((e) => e.id !== enrollmentId)
  }

  return {
    enrollments,
    allStudents,
    loading,
    error,
    selectedYearId,
    selectedSectionId,
    unenrolledStudents,
    enrolledStudents,
    enrolledStudentIds,
    strength,
    load,
    assignStudents,
    unenroll,
  }
})
