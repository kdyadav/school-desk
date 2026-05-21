import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { timetableRepo, sectionRepo, studentRepo } from '../repositories'

/**
 * Resolves the current user's role context for data filtering.
 *
 * Owner  → isOwner=true, isAdmin=true, everything unrestricted
 * Admin  → isAdmin=true, everything unrestricted
 * Teacher→ myTeacherId, mySectionIds (sections they teach OR are classTeacher of)
 * Student→ myStudentId, mySectionId (their current section)
 * Parent → myGuardianId, myStudentIds (children), myStudentId (first child)
 */
export function useRoleContext() {
  const auth = useAuthStore()
  const ready = ref(false)

  const isOwner = computed(() => auth.role === 'owner')
  // Owner has the same access as admin, so isAdmin is true for both.
  const isAdmin = computed(() => auth.role === 'admin' || auth.role === 'owner')
  const isTeacher = computed(() => auth.role === 'teacher')
  const isStudent = computed(() => auth.role === 'student')
  const isParent = computed(() => auth.role === 'parent')

  // Teacher context
  const myTeacherId = ref(null)
  const mySectionIds = ref([])

  // Student context
  const myStudentId = ref(null)
  const mySectionId = ref(null)

  // Parent context
  const myGuardianId = ref(null)
  const myStudentIds = ref([])

  async function resolve() {
    const linkedId = auth.user?.linkedId
    if (!linkedId) { ready.value = true; return }

    if (isTeacher.value) {
      myTeacherId.value = linkedId
      // Sections where this teacher teaches (from timetable)
      const ttEntries = await timetableRepo.where('teacherId', linkedId)
      const ttSections = [...new Set(ttEntries.map((e) => e.sectionId))]
      // Sections where they are classTeacher
      const allSections = await sectionRepo.list()
      const ctSections = allSections
        .filter((s) => s.classTeacherId === linkedId)
        .map((s) => s.id)
      mySectionIds.value = [...new Set([...ttSections, ...ctSections])]
    }

    if (isStudent.value) {
      myStudentId.value = linkedId
      const student = await studentRepo.get(linkedId)
      mySectionId.value = student?.currentSectionId ?? null
    }

    if (isParent.value) {
      myGuardianId.value = linkedId
      const allStudents = await studentRepo.list()
      const children = allStudents.filter((s) => s.guardianId === linkedId)
      myStudentIds.value = children.map((s) => s.id)
      myStudentId.value = children[0]?.id ?? null
      mySectionId.value = children[0]?.currentSectionId ?? null
    }

    ready.value = true
  }

  // Auto-resolve on first call
  resolve()

  /** Check if a sectionId is "mine" (teacher) or always true for admin */
  function canAccessSection(sectionId) {
    if (isAdmin.value) return true
    if (isTeacher.value) return mySectionIds.value.includes(sectionId)
    if (isStudent.value) return sectionId === mySectionId.value
    if (isParent.value) return false // parents access by student, not section
    return false
  }

  /** Filter a list of sections to only those the user can access */
  function filterSections(sections) {
    if (isAdmin.value) return sections
    if (isTeacher.value) return sections.filter((s) => mySectionIds.value.includes(s.id))
    if (isStudent.value) return sections.filter((s) => s.id === mySectionId.value)
    return []
  }

  /**
   * Check whether the current user is allowed to view data for `studentId`.
   * Admin/owner: always. Student: only themselves. Parent: any of their
   * children. Teacher: any student currently enrolled in a section they teach
   * (resolved via the student's currentSectionId).
   */
  async function canAccessStudent(studentId) {
    if (studentId == null) return false
    if (isAdmin.value) return true
    if (isStudent.value) return studentId === myStudentId.value
    if (isParent.value) return myStudentIds.value.includes(studentId)
    if (isTeacher.value) {
      const s = await studentRepo.get(studentId)
      return !!s && mySectionIds.value.includes(s.currentSectionId)
    }
    return false
  }

  /** Synchronous variant for caches already loaded via the people store. */
  function canAccessStudentSync(studentId, lookupSectionId) {
    if (studentId == null) return false
    if (isAdmin.value) return true
    if (isStudent.value) return studentId === myStudentId.value
    if (isParent.value) return myStudentIds.value.includes(studentId)
    if (isTeacher.value && lookupSectionId != null) {
      return mySectionIds.value.includes(lookupSectionId)
    }
    return false
  }

  return {
    ready,
    isOwner,
    isAdmin,
    isTeacher,
    isStudent,
    isParent,
    myTeacherId,
    mySectionIds,
    myStudentId,
    mySectionId,
    myGuardianId,
    myStudentIds,
    canAccessSection,
    canAccessStudent,
    canAccessStudentSync,
    filterSections,
    resolve,
  }
}

export default useRoleContext
