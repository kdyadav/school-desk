import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { useAcademicStore } from '../../src/stores/academic'

describe('academic store', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    setActivePinia(createPinia())
  })

  it('creates, lists, updates, and deletes an academic year', async () => {
    const store = useAcademicStore()
    await store.loadAll()
    expect(store.years).toHaveLength(0)

    await store.saveItem('years', {
      name: '2025-2026', startDate: '2025-06-01', endDate: '2026-04-30', isActive: false,
    })
    expect(store.years).toHaveLength(1)
    const created = store.years[0]

    await store.saveItem('years', { id: created.id, name: '2025-26', startDate: created.startDate, endDate: created.endDate, isActive: false })
    expect(store.years[0].name).toBe('2025-26')

    await store.deleteItem('years', created.id)
    expect(store.years).toHaveLength(0)
  })

  it('setActiveYear flips isActive flag and only one year is active at a time', async () => {
    const store = useAcademicStore()
    await store.loadAll()
    await store.saveItem('years', { name: 'Y1', startDate: '2024-06-01', endDate: '2025-04-30', isActive: true })
    await store.saveItem('years', { name: 'Y2', startDate: '2025-06-01', endDate: '2026-04-30', isActive: false })
    const y2 = store.years.find((y) => y.name === 'Y2')

    await store.setActiveYear(y2.id)
    const active = store.years.filter((y) => y.isActive)
    expect(active).toHaveLength(1)
    expect(active[0].name).toBe('Y2')
  })

  it('classesByYear and sectionsByClass filter correctly', async () => {
    const store = useAcademicStore()
    await store.loadAll()
    await store.saveItem('years', { name: 'Y1', startDate: '2024-06-01', endDate: '2025-04-30', isActive: true })
    const y = store.years[0]
    await store.saveItem('classes', { name: 'Grade 1', academicYearId: y.id })
    await store.saveItem('classes', { name: 'Grade 2', academicYearId: y.id })
    expect(store.classesByYear(y.id)).toHaveLength(2)

    const c = store.classes[0]
    await store.saveItem('sections', { name: 'A', classId: c.id, classTeacherId: null })
    await store.saveItem('sections', { name: 'B', classId: c.id, classTeacherId: null })
    expect(store.sectionsByClass(c.id)).toHaveLength(2)
  })

  it('subject CRUD enforces unique code via repo', async () => {
    const store = useAcademicStore()
    await store.loadAll()
    await store.saveItem('subjects', { name: 'Mathematics', code: 'MATH' })
    await expect(
      store.saveItem('subjects', { name: 'Other', code: 'MATH' })
    ).rejects.toBeTruthy()
  })
})
