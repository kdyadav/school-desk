// Thin repository facade over the Supabase adapter. Audit rows and field
// redaction are emitted by Postgres triggers (see supabase/migrations), so
// the client no longer writes audit entries for CRUD operations — only for
// the auth/* events handled in src/stores/auth.js.

import { v4 as uuidv4 } from 'uuid'
import { supabaseAdapter } from './adapters/supabase'

export const adapter = supabaseAdapter

const nowIso = () => new Date().toISOString()

// Server-side defaults (gen_random_uuid(), now(), id sequence) would handle
// these too, but stamping them client-side keeps the create() return shape
// stable even for callers that read the local copy before round-tripping
// through PostgREST.
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
 * @param {object} [schema]   Zod schema (optional; validates writes when given).
 */
export function createRepo(tableName, schema /* , opts unused — audit/redact are server-side */) {
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

  return {
    table: tableName,

    list: (opts) => adapter.list(tableName, opts),
    get: (id) => adapter.get(tableName, id),
    getByUuid: (uuid) => adapter.getByUuid(tableName, uuid),
    where: (field, value) => adapter.where(tableName, field, value),
    count: () => adapter.count(tableName),

    async create(data) {
      const stamped = stamp(data, { isCreate: true })
      const validated = validateFull(stamped)
      return adapter.create(tableName, validated)
    },

    async update(id, patch) {
      const current = await adapter.get(tableName, id)
      if (!current) throw new Error(`${tableName} #${id} not found`)
      const merged = stamp({ ...current, ...patch, id: current.id, uuid: current.uuid }, { isCreate: false })
      const validated = validateFull(merged)
      return adapter.update(tableName, id, validated)
    },

    async remove(id) {
      await adapter.remove(tableName, id)
      return true
    },
  }
}

export default createRepo
