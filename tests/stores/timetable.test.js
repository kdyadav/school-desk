import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { useTimetableStore } from '../../src/stores/timetable'
import { seedDatabase } from '../../src/db/seed'
import { sectionRepo, teacherRepo, subjectRepo } from '../../src/repositories'

let sectionA, sectionB, teacher, subject

describe('timetable store', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    localStorage.clear()
    setActivePinia(createPinia())
    await seedDatabase()

    const sections = await sectionRepo.list()
    sectionA = sections[0]
    sectionB = sections[1]
    teacher = (await teacherRepo.list())[0]
    subject = (await subjectRepo.list())[0]
  })

  it('period CRUD: create, list sorted by startTime, delete', async () => {
    const store = useTimetableStore()
    await store.loadPeriods()
    const before = store.periods.length
    await store.savePeriod({ name: 'ZZ Late', startTime: '17:00', endTime: '17:45' })
    expect(store.periods).toHaveLength(before + 1)
    // The new period should be last (sorted by startTime)
    expect(store.periods[store.periods.length - 1].name).toBe('ZZ Late')

    await store.deletePeriod(store.periods[store.periods.length - 1].id)
    expect(store.periods).toHaveLength(before)
  })

  it('saveSlot creates a timetable entry and getSlot retrieves it', async () => {
    const store = useTimetableStore()
    await store.savePeriod({ name: 'P1', startTime: '08:00', endTime: '08:45' })
    const periodId = store.periods[0].id

    await store.loadGrid(sectionA.id)
    const res = await store.saveSlot({
      dayOfWeek: 'Mon', periodId,
      subjectId: subject.id, teacherId: teacher.id,
    })
    expect(res.ok).toBe(true)
    const slot = store.getSlot('Mon', periodId)
    expect(slot).toBeTruthy()
    expect(slot.subjectId).toBe(subject.id)
  })

  it('saveSlot updates an existing slot', async () => {
    const store = useTimetableStore()
    await store.savePeriod({ name: 'P1', startTime: '08:00', endTime: '08:45' })
    const periodId = store.periods[0].id
    const subjects = await subjectRepo.list()

    await store.loadGrid(sectionA.id)
    await store.saveSlot({ dayOfWeek: 'Mon', periodId, subjectId: subjects[0].id, teacherId: teacher.id })
    await store.saveSlot({ dayOfWeek: 'Mon', periodId, subjectId: subjects[1].id, teacherId: teacher.id })

    const slot = store.getSlot('Mon', periodId)
    expect(slot.subjectId).toBe(subjects[1].id)
    // Still only 1 entry (updated, not duplicated)
    expect(store.entries.filter((e) => e.dayOfWeek === 'Mon' && e.periodId === periodId)).toHaveLength(1)
  })

  it('detects teacher conflict across sections', async () => {
    const store = useTimetableStore()
    await store.savePeriod({ name: 'P1', startTime: '08:00', endTime: '08:45' })
    const periodId = store.periods[0].id

    // Book teacher in section A
    await store.loadGrid(sectionA.id)
    await store.saveSlot({ dayOfWeek: 'Tue', periodId, subjectId: subject.id, teacherId: teacher.id })

    // Try same teacher in section B, same day+period
    await store.loadGrid(sectionB.id)
    const res = await store.saveSlot({ dayOfWeek: 'Tue', periodId, subjectId: subject.id, teacherId: teacher.id })
    expect(res.ok).toBe(false)
    expect(res.conflict).toBeTruthy()
    expect(res.conflict.sectionId).toBe(sectionA.id)
  })

  it('clearSlot removes the entry', async () => {
    const store = useTimetableStore()
    await store.savePeriod({ name: 'P1', startTime: '08:00', endTime: '08:45' })
    const periodId = store.periods[0].id

    await store.loadGrid(sectionA.id)
    await store.saveSlot({ dayOfWeek: 'Wed', periodId, subjectId: subject.id, teacherId: teacher.id })
    expect(store.getSlot('Wed', periodId)).toBeTruthy()

    await store.clearSlot('Wed', periodId)
    expect(store.getSlot('Wed', periodId)).toBeNull()
  })

  it('teacherSchedule returns entries for a given teacher', async () => {
    const store = useTimetableStore()
    // Seed already has timetable entries for teachers
    await store.loadGrid(sectionA.id)
    const schedule = store.teacherSchedule(teacher.id)
    expect(schedule.length).toBeGreaterThan(0)
    expect(schedule.every((e) => e.teacherId === teacher.id)).toBe(true)
  })
})
