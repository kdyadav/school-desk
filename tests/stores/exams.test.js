import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { useExamsStore, calcGrade } from '../../src/stores/exams'
import { useAcademicStore } from '../../src/stores/academic'
import { useEnrollmentStore } from '../../src/stores/enrollment'
import { usePeopleStore } from '../../src/stores/people'
import { seedDatabase } from '../../src/db/seed'

let yearId, classId, sectionId, subjectIds, studentIds

describe('exams store', () => {
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
    classId = academic.classes[0].id
    sectionId = academic.sections[0].id
    subjectIds = academic.subjects.slice(0, 2).map((s) => s.id)

    // Enroll 3 students
    const enrollment = useEnrollmentStore()
    await enrollment.load(yearId, sectionId)
    studentIds = people.students.slice(0, 3).map((s) => s.id)
    await enrollment.assignStudents(studentIds)
  })

  it('calcGrade returns correct grades', () => {
    expect(calcGrade(95, 100)).toBe('A+')
    expect(calcGrade(85, 100)).toBe('A')
    expect(calcGrade(72, 100)).toBe('B+')
    expect(calcGrade(65, 100)).toBe('B')
    expect(calcGrade(55, 100)).toBe('C')
    expect(calcGrade(45, 100)).toBe('D')
    expect(calcGrade(30, 100)).toBe('F')
  })

  it('creates and lists an exam', async () => {
    const store = useExamsStore()
    await store.loadExams()
    const before = store.exams.length
    await store.saveExam({
      name: 'New Test Exam', academicYearId: yearId, classId,
      subjects: [{ subjectId: subjectIds[0], maxMarks: 100 }, { subjectId: subjectIds[1], maxMarks: 50 }],
    })
    await store.loadExams()
    expect(store.exams).toHaveLength(before + 1)
    const created = store.exams.find((e) => e.name === 'New Test Exam')
    expect(created.subjects).toHaveLength(2)
  })

  it('saveMark persists marks with auto-computed grade', async () => {
    const store = useExamsStore()
    await store.saveExam({
      name: 'Final', academicYearId: yearId, classId,
      subjects: [{ subjectId: subjectIds[0], maxMarks: 100 }],
    })
    const examId = store.exams[0].id
    await store.loadMarks(examId)

    await store.saveMark({ examId, studentId: studentIds[0], subjectId: subjectIds[0], marks: 92, maxMarks: 100 })
    const mark = store.marks.find((m) => m.studentId === studentIds[0])
    expect(mark.marks).toBe(92)
    expect(mark.grade).toBe('A+')
  })

  it('saveMark updates existing marks', async () => {
    const store = useExamsStore()
    await store.saveExam({
      name: 'Test', academicYearId: yearId, classId,
      subjects: [{ subjectId: subjectIds[0], maxMarks: 100 }],
    })
    const examId = store.exams[0].id
    await store.loadMarks(examId)

    await store.saveMark({ examId, studentId: studentIds[0], subjectId: subjectIds[0], marks: 50, maxMarks: 100 })
    await store.saveMark({ examId, studentId: studentIds[0], subjectId: subjectIds[0], marks: 85, maxMarks: 100 })

    const forStudent = store.marks.filter((m) => m.studentId === studentIds[0] && m.subjectId === subjectIds[0])
    expect(forStudent).toHaveLength(1)
    expect(forStudent[0].marks).toBe(85)
    expect(forStudent[0].grade).toBe('A')
  })

  it('reportCardData returns structured data per exam', async () => {
    const store = useExamsStore()
    // Seed already has exams for classId. Just check the report has data.
    const report = await store.reportCardData(studentIds[0], yearId)
    expect(report.length).toBeGreaterThan(0)
    expect(report[0].subjects.length).toBeGreaterThan(0)
    expect(report[0].maxTotal).toBeGreaterThan(0)
  })

  it('enrolledStudents returns students for a section', async () => {
    const store = useExamsStore()
    const students = await store.enrolledStudents(sectionId)
    expect(students.length).toBeGreaterThan(0)
  })
})
