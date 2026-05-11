import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { usePeopleStore } from '../../src/stores/people'
import { seedDatabase } from '../../src/db/seed'

describe('people store', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    localStorage.clear()
    setActivePinia(createPinia())
    await seedDatabase()
  })

  it('loadAll populates students, guardians and teachers from seed', async () => {
    const store = usePeopleStore()
    await store.loadAll()
    expect(store.students.length).toBe(35)
    expect(store.guardians.length).toBe(35)
    expect(store.teachers.length).toBe(8)
  })

  it('saveItem creates a teacher and lists it', async () => {
    const store = usePeopleStore()
    await store.loadAll()
    await store.saveItem('teachers', {
      employeeNo: 'T099', firstName: 'New', lastName: 'Teacher',
      email: 'new.teacher@school.local', phone: '9111111111',
    })
    expect(store.teachers.find((t) => t.employeeNo === 'T099')).toBeDefined()
  })

  it('saveItem updates an existing guardian', async () => {
    const store = usePeopleStore()
    await store.loadAll()
    const g = store.guardians[0]
    await store.saveItem('guardians', { id: g.id, firstName: 'Updated', lastName: g.lastName, relation: g.relation, phone: g.phone })
    expect(store.guardians.find((x) => x.id === g.id)?.firstName).toBe('Updated')
  })

  it('deleteItem removes a teacher', async () => {
    const store = usePeopleStore()
    await store.loadAll()
    const t = store.teachers[0]
    await store.deleteItem('teachers', t.id)
    expect(store.teachers.find((x) => x.id === t.id)).toBeUndefined()
  })

  it('createStudentWithGuardian creates both records atomically', async () => {
    const store = usePeopleStore()
    await store.loadAll()
    const before = store.guardians.length
    await store.createStudentWithGuardian(
      { admissionNo: 'ADM9999', firstName: 'Test', lastName: 'Kid', dob: '2017-01-01', gender: 'male' },
      { firstName: 'Test', lastName: 'Parent', phone: '9222222222', relation: 'father' }
    )
    expect(store.guardians.length).toBe(before + 1)
    expect(store.students.find((s) => s.admissionNo === 'ADM9999')).toBeDefined()
    const newStudent = store.students.find((s) => s.admissionNo === 'ADM9999')
    expect(newStudent.guardianId).toBeGreaterThan(0)
  })

  it('guardianById / teacherById helpers work', async () => {
    const store = usePeopleStore()
    await store.loadAll()
    const g = store.guardians[0]
    expect(store.guardianById(g.id)).toEqual(g)
    expect(store.guardianById(999999)).toBeNull()
    const t = store.teachers[0]
    expect(store.teacherById(t.id)).toEqual(t)
  })
})
