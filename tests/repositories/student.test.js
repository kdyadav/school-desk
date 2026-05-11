import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../../src/db/dexie'
import { studentRepo, guardianRepo } from '../../src/repositories'

describe('studentRepo (dexie adapter)', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('creates a student with auto uuid + timestamps', async () => {
    const guardian = await guardianRepo.create({
      firstName: 'Test', lastName: 'Parent', phone: '9999999999', relation: 'father',
    })
    const created = await studentRepo.create({
      admissionNo: 'ADM0001',
      firstName: 'Aarav',
      lastName: 'Sharma',
      dob: '2016-05-15',
      gender: 'male',
      guardianId: guardian.id,
    })
    expect(created.id).toBeDefined()
    expect(created.uuid).toMatch(/^[0-9a-f-]{36}$/)
    expect(created.createdAt).toBeDefined()
    expect(created.updatedAt).toBeDefined()
  })

  it('rejects invalid student via zod', async () => {
    await expect(
      studentRepo.create({ admissionNo: '', firstName: '', lastName: '', dob: 'bad', gender: 'x' })
    ).rejects.toMatchObject({ message: /Validation failed/ })
  })

  it('lists, gets, updates, removes', async () => {
    const guardian = await guardianRepo.create({
      firstName: 'P', lastName: 'Q', phone: '9999999998', relation: 'mother',
    })
    const s = await studentRepo.create({
      admissionNo: 'ADM0002',
      firstName: 'Diya', lastName: 'Patel',
      dob: '2016-07-15', gender: 'female', guardianId: guardian.id,
    })

    const list = await studentRepo.list()
    expect(list).toHaveLength(1)

    const fetched = await studentRepo.get(s.id)
    expect(fetched.firstName).toBe('Diya')

    const updated = await studentRepo.update(s.id, { firstName: 'Diya R.' })
    expect(updated.firstName).toBe('Diya R.')
    expect(updated.updatedAt >= s.updatedAt).toBe(true)

    await studentRepo.remove(s.id)
    expect(await studentRepo.get(s.id)).toBeUndefined()
  })
})
