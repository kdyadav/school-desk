import { v4 as uuidv4 } from 'uuid'
import { dexieAdapter } from './adapters/dexie'
import { httpAdapter } from './adapters/http'
import { recordAudit, changedFields } from '../audit/logger'

const ADAPTER_NAME = import.meta.env?.VITE_DATA_ADAPTER || 'dexie'

const adapters = {
  dexie: dexieAdapter,
  http: httpAdapter,
}

export const adapter = adapters[ADAPTER_NAME] || dexieAdapter

const nowIso = () => new Date().toISOString()

const stamp = (data, { isCreate }) => {
  const out = { ...data }
  if (isCreate) {
    if (!out.uuid) out.uuid = uuidv4()
    if (!out.createdAt) out.createdAt = nowIso()
  }
  out.updatedAt = nowIso()
  return out
}

/**
 * Build a repository for `tableName`.
 *
 * @param {string} tableName
 * @param {object} schema    Zod schema (optional)
 * @param {object} [opts]
 * @param {boolean} [opts.audit=true]  Emit audit-log entries on writes.
 * @param {string[]} [opts.redact=[]]  Field names to redact in audit entries.
 */
export function createRepo(tableName, schema, opts = {}) {
  const { audit = true, redact = [] } = opts

  const validateFull = (data) => {
    if (!schema) return data
    const result = schema.safeParse(data)
    if (!result.success) {
      const err = new Error(`Validation failed for ${tableName}`)
      err.issues = result.error.issues
      throw err
    }
    return result.data
  }

  // Audit emitters are intentionally fire-and-forget at the call site: we
  // await them so writes are sequenced, but failures are swallowed inside
  // recordAudit() so the user-facing operation always succeeds.
  const auditCreate = async (after) => {
    if (!audit) return
    await recordAudit({
      entity: tableName,
      action: 'entity.created',
      entityId: after?.id ?? null,
      entityUuid: after?.uuid ?? null,
      after,
      redact,
    })
  }

  const auditUpdate = async (before, after) => {
    if (!audit) return
    const changes = changedFields(before, after, { redact })
    if (Object.keys(changes).length === 0) return
    await recordAudit({
      entity: tableName,
      action: 'entity.updated',
      entityId: after?.id ?? before?.id ?? null,
      entityUuid: after?.uuid ?? before?.uuid ?? null,
      changes,
      redact,
    })
  }

  const auditRemove = async (before) => {
    if (!audit) return
    await recordAudit({
      entity: tableName,
      action: 'entity.deleted',
      entityId: before?.id ?? null,
      entityUuid: before?.uuid ?? null,
      before,
      redact,
    })
  }

  return {
    table: tableName,

    list: (opts) => adapter.list(tableName, opts),
    get: (id) => adapter.get(tableName, id),
    getByUuid: (uuid) => adapter.getByUuid(tableName, uuid),
    query: (predicate) => adapter.query(tableName, predicate),
    where: (field, value) => adapter.where(tableName, field, value),
    count: () => adapter.count(tableName),

    async create(data) {
      const stamped = stamp(data, { isCreate: true })
      const validated = validateFull(stamped)
      const created = await adapter.create(tableName, validated)
      await auditCreate(created)
      return created
    },

    async update(id, patch) {
      const current = await adapter.get(tableName, id)
      if (!current) throw new Error(`${tableName} #${id} not found`)
      const merged = stamp({ ...current, ...patch, id: current.id, uuid: current.uuid }, { isCreate: false })
      const validated = validateFull(merged)
      const updated = await adapter.update(tableName, id, validated)
      await auditUpdate(current, updated)
      return updated
    },

    async remove(id) {
      const current = await adapter.get(tableName, id)
      const result = await adapter.remove(tableName, id)
      if (current) await auditRemove(current)
      return result
    },
  }
}

export default createRepo
