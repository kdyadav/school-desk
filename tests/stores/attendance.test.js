import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { useAttendanceStore } from '../../src/stores/attendance'
import { useEnrollmentStore } from '../../src/stores/enrollment'
import { useAcademicStore } from '../../src/stores/academic'
import { usePeopleStore } from '../../src/stores/people'
import { seedDatabase } from '../../src/db/seed'

let yearId, sectionId

describe('attendance store', () => {
  let rosterSize

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
    // Seed already enrolls students, so just count them
    rosterSize = people.students.filter((s) => s.currentSectionId === sectionId).length
  })

  it('loads roster matching enrolled students', async () => {
    const store = useAttendanceStore()
    await store.load(sectionId, '2025-09-01') // use a date with no seeded attendance
    expect(store.roster).toHaveLength(rosterSize)
    store.roster.forEach((s) => {
      expect(store.statusMap[s.id]).toBe('present') // default
    })
  })

  it('setStatus changes in-memory status', async () => {
    const store = useAttendanceStore()
    await store.load(sectionId, '2025-09-01')
    const sid = store.roster[0].id
    store.setStatus(sid, 'absent')
    expect(store.statusMap[sid]).toBe('absent')
  })

  it('saveBulk persists all statuses and re-loads', async () => {
    const store = useAttendanceStore()
    await store.load(sectionId, '2025-09-01')
    store.setStatus(store.roster[0].id, 'absent')
    store.setStatus(store.roster[1].id, 'late')
    await store.saveBulk(null)

    await store.load(sectionId, '2025-09-01')
    expect(store.statusMap[store.roster[0].id]).toBe('absent')
    expect(store.statusMap[store.roster[1].id]).toBe('late')
    expect(store.statusMap[store.roster[2].id]).toBe('present')
  })

  it('saveBulk updates existing records on second save', async () => {
    const store = useAttendanceStore()
    await store.load(sectionId, '2025-09-01')
    store.setStatus(store.roster[0].id, 'absent')
    await store.saveBulk(null)

    await store.load(sectionId, '2025-09-01')
    store.setStatus(store.roster[0].id, 'present')
    await store.saveBulk(null)

    await store.load(sectionId, '2025-09-01')
    expect(store.statusMap[store.roster[0].id]).toBe('present')
    expect(store.records.length).toBe(rosterSize)
  })

  it('monthlySummary returns correct counts', async () => {
    const store = useAttendanceStore()

    // Mark attendance for 3 days in September (no seeded data there)
    for (const day of ['2025-09-01', '2025-09-02', '2025-09-03']) {
      await store.load(sectionId, day)
      store.setStatus(store.roster[0].id, day === '2025-09-02' ? 'absent' : 'present')
      store.setStatus(store.roster[1].id, 'late')
      await store.saveBulk(null)
    }

    const summary = await store.monthlySummary(sectionId, '2025-09')
    expect(summary).toHaveLength(rosterSize)

    const s0 = summary.find((r) => r.student.id === store.roster[0].id)
    expect(s0.present).toBe(2)
    expect(s0.absent).toBe(1)
    expect(s0.total).toBe(3)

    const s1 = summary.find((r) => r.student.id === store.roster[1].id)
    expect(s1.late).toBe(3)
  })
})
