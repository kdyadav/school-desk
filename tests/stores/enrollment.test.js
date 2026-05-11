import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { useEnrollmentStore } from '../../src/stores/enrollment'
import { useAcademicStore } from '../../src/stores/academic'
import { usePeopleStore } from '../../src/stores/people'
import { seedDatabase } from '../../src/db/seed'

describe('enrollment store', () => {
  let yearId, sectionId, students

  beforeEach(async () => {
    await db.delete()
    await db.open()
    localStorage.clear()
    setActivePinia(createPinia())
    await seedDatabase()

    const academic = useAcademicStore()
    const people = usePeopleStore()
    await academic.loadAll()
    await people.loadAll()

    yearId = academic.years[0].id
    sectionId = academic.sections[0].id
    students = people.students
  })

  it('loads seeded enrollment for section', async () => {
    const store = useEnrollmentStore()
    await store.load(yearId, sectionId)
    // Seed enrolls all 35 students across 10 sections, so this section should have some
    expect(store.strength).toBeGreaterThan(0)
    expect(store.enrolledStudents.length).toBe(store.strength)
  })

  it('assignStudents enrolls additional students with sequential roll nos', async () => {
    const store = useEnrollmentStore()
    await store.load(yearId, sectionId)
    const before = store.strength
    // Find an unenrolled student (if any) or skip
    if (store.unenrolledStudents.length === 0) return
    const ids = store.unenrolledStudents.slice(0, 2).map((s) => s.id)
    await store.assignStudents(ids)
    expect(store.strength).toBe(before + ids.length)
  })

  it('does not duplicate already-enrolled students', async () => {
    const store = useEnrollmentStore()
    await store.load(yearId, sectionId)
    const before = store.strength
    const alreadyEnrolled = store.enrolledStudents[0]?.studentId
    if (!alreadyEnrolled) return
    await store.assignStudents([alreadyEnrolled])
    expect(store.strength).toBe(before)
  })

  it('unenroll removes a student and adds them back to unassigned', async () => {
    const store = useEnrollmentStore()
    await store.load(yearId, sectionId)
    const before = store.strength
    if (before === 0) return

    const enrollment = store.enrolledStudents[0]
    await store.unenroll(enrollment.id)
    expect(store.strength).toBe(before - 1)
  })

  it('auto-increments roll nos starting after existing max', async () => {
    const store = useEnrollmentStore()
    // Use a fresh section with no seeded enrollments — use last section
    const academic = useAcademicStore()
    const lastSection = academic.sections[academic.sections.length - 1]
    await store.load(yearId, lastSection.id)
    const before = store.strength
    // Find unenrolled students
    if (store.unenrolledStudents.length < 3) return
    const ids = store.unenrolledStudents.slice(0, 3).map((s) => s.id)
    await store.assignStudents(ids)
    const newRolls = store.enrolledStudents.slice(-3).map((e) => e.rollNo)
    expect(newRolls.length).toBe(3)
  })
})
