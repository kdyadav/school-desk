import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import {
  studentRepo,
  guardianRepo,
  teacherRepo,
  userRepo,
  auditRepo,
} from '../../src/repositories'
import {
  recordAudit,
  changedFields,
  setAuditActorProvider,
  setAuditEnabled,
  withAuditDisabled,
} from '../../src/audit'
import { useAuthStore } from '../../src/stores/auth'

const listAudit = () => db.table('auditLogs').toArray()

describe('audit logger', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    localStorage.clear()
    setActivePinia(createPinia())
    setAuditEnabled(true)
    setAuditActorProvider(() => null) // default: system actor
  })

  afterEach(() => {
    setAuditEnabled(true)
    setAuditActorProvider(() => null)
  })

  describe('changedFields', () => {
    it('detects added, removed and changed top-level keys', () => {
      const diff = changedFields(
        { a: 1, b: 'x', c: true },
        { a: 1, b: 'y', d: 'new' },
      )
      expect(diff).toEqual({
        b: { before: 'x', after: 'y' },
        c: { before: true, after: undefined },
        d: { before: undefined, after: 'new' },
      })
    })

    it('ignores updatedAt and consumer-supplied ignore list', () => {
      const diff = changedFields(
        { name: 'A', updatedAt: 't1', counter: 1 },
        { name: 'A', updatedAt: 't2', counter: 2 },
        { ignore: ['counter'] },
      )
      expect(diff).toEqual({})
    })

    it('redacts secret fields in the diff', () => {
      const diff = changedFields(
        { passwordHash: 'old', name: 'A' },
        { passwordHash: 'new', name: 'B' },
      )
      expect(diff.passwordHash).toEqual({ before: '[redacted]', after: '[redacted]' })
      expect(diff.name).toEqual({ before: 'A', after: 'B' })
    })
  })

  describe('repository instrumentation', () => {
    it('writes a entity.created log when create() succeeds', async () => {
      const g = await guardianRepo.create({
        firstName: 'Audit', lastName: 'Test', phone: '9000000000', relation: 'father',
      })
      const logs = await listAudit()
      expect(logs).toHaveLength(1)
      expect(logs[0]).toMatchObject({
        entity: 'guardians',
        action: 'entity.created',
        entityId: g.id,
        entityUuid: g.uuid,
        actorRole: 'system',
      })
      expect(logs[0].after.firstName).toBe('Audit')
    })

    it('writes a entity.updated log with only changed fields', async () => {
      const g = await guardianRepo.create({
        firstName: 'A', lastName: 'B', phone: '9000000001', relation: 'father',
      })
      await guardianRepo.update(g.id, { firstName: 'Renamed' })

      const logs = await db.table('auditLogs')
        .where('entity').equals('guardians').toArray()
      const upd = logs.find((l) => l.action === 'entity.updated')
      expect(upd).toBeDefined()
      expect(Object.keys(upd.changes)).toEqual(['firstName'])
      expect(upd.changes.firstName).toEqual({ before: 'A', after: 'Renamed' })
    })

    it('writes a entity.deleted log capturing the prior state', async () => {
      const g = await guardianRepo.create({
        firstName: 'X', lastName: 'Y', phone: '9000000002', relation: 'mother',
      })
      await guardianRepo.remove(g.id)
      const logs = await listAudit()
      const del = logs.find((l) => l.action === 'entity.deleted')
      expect(del).toBeDefined()
      expect(del.entityId).toBe(g.id)
      expect(del.before.firstName).toBe('X')
    })

    it('redacts passwordHash on user creation', async () => {
      const bcrypt = (await import('bcryptjs')).default
      const hash = bcrypt.hashSync('sup3rs3cret', 4)
      const u = await userRepo.create({
        email: 'redact@test.local', passwordHash: hash, role: 'admin', name: 'R',
      })
      const logs = await listAudit()
      const created = logs.find((l) => l.entity === 'users' && l.action === 'entity.created')
      expect(created.after.passwordHash).toBe('[redacted]')
      expect(u.passwordHash).toBe(hash) // payload itself isn't mutated
    })

    it('does not write logs when auditing is disabled', async () => {
      await withAuditDisabled(async () => {
        await guardianRepo.create({
          firstName: 'Hidden', lastName: 'Z', phone: '9000000003', relation: 'father',
        })
      })
      expect(await listAudit()).toHaveLength(0)
    })

    it('never logs writes to the auditLogs table itself', async () => {
      await recordAudit({ entity: 'test', action: 'event', meta: { hello: 'world' } })
      const logs = await listAudit()
      expect(logs).toHaveLength(1)
      // auditRepo is registered with audit:false → calling its writers must
      // not produce a second meta-log row.
      await auditRepo.list()
      expect(await listAudit()).toHaveLength(1)
    })

    it('captures the current actor from the registered provider', async () => {
      setAuditActorProvider(() => ({ id: 42, role: 'admin', name: 'Alice' }))
      await teacherRepo.create({
        employeeNo: 'E001', firstName: 'T', lastName: 'X',
        email: 't.x@school.local', phone: '9000000004',
      })
      const logs = await listAudit()
      expect(logs[0]).toMatchObject({ actorId: 42, actorRole: 'admin', actorName: 'Alice' })
    })

    it('logs an update only when fields actually change (updatedAt is ignored)', async () => {
      const g = await guardianRepo.create({
        firstName: 'NoOp', lastName: 'Q', phone: '9000000005', relation: 'father',
      })
      await guardianRepo.update(g.id, { firstName: 'NoOp' }) // no real change
      const updates = (await listAudit()).filter((l) => l.action === 'entity.updated')
      expect(updates).toHaveLength(0)
    })
  })

  describe('auth store events', () => {
    beforeEach(async () => {
      // seed a single admin user manually so we can test login events without
      // pulling in the noisy full seed file
      await userRepo.create({
        email: 'admin@x.test',
        passwordHash: (await import('bcryptjs')).default.hashSync('pw12345', 4),
        role: 'admin',
        name: 'Admin',
      })
    })

    it('emits auth.login_success on a good login', async () => {
      const auth = useAuthStore()
      const ok = await auth.login('admin@x.test', 'pw12345')
      expect(ok).toBe(true)
      const logs = (await listAudit()).filter((l) => l.entity === 'auth')
      expect(logs.some((l) => l.action === 'auth.login_success')).toBe(true)
    })

    it('emits auth.login_failed for unknown users and bad passwords', async () => {
      const auth = useAuthStore()
      await auth.login('nobody@x.test', 'whatever')
      await auth.login('admin@x.test', 'wrongpw')
      const failures = (await listAudit()).filter((l) => l.action === 'auth.login_failed')
      expect(failures.map((f) => f.meta.reason).sort()).toEqual(['bad_password', 'unknown_user'])
    })

    it('emits auth.logout when a logged-in user signs out', async () => {
      const auth = useAuthStore()
      await auth.login('admin@x.test', 'pw12345')
      auth.logout()
      // logout's audit call is fire-and-forget; give it a tick to land.
      await new Promise((r) => setTimeout(r, 20))
      const logs = (await listAudit()).filter((l) => l.action === 'auth.logout')
      expect(logs).toHaveLength(1)
    })
  })
})
