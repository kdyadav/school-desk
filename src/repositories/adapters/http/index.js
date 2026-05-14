// REST adapter for the repository contract defined in src/repositories/base.js.
// The CRUD factory on the server registers identical routes for every table
// in src/crud/registry.js, so the only special cases here are the audit log
// (read-only, paginated envelope) and the school profile singleton.

import { apiFetch } from './client'

// ── Audit log (special endpoint at /audit-logs) ────────────────────────────

const auditAdapter = {
  // Server returns { rows, total, limit, offset }; the contract returns an
  // array, so unwrap the envelope here. Callers that need the total should
  // use count().
  async list(_table, { limit, offset, where } = {}) {
    const res = await apiFetch('/audit-logs', { query: { limit, offset, where } })
    return res?.rows || []
  },
  async count(_table) {
    const res = await apiFetch('/audit-logs', { query: { limit: 1 } })
    return res?.total ?? 0
  },
  async where(_table, field, value) {
    const res = await apiFetch('/audit-logs', { query: { where: { [field]: value } } })
    return res?.rows || []
  },
  // The audit log is append-only on the server side. Writes happen as a side
  // effect of every mutating route; these methods exist on the contract but
  // must not be called against /audit-logs.
  get:        () => { throw new Error('auditLogs.get is not supported over HTTP') },
  getByUuid:  () => { throw new Error('auditLogs.getByUuid is not supported over HTTP') },
  create:     () => { throw new Error('auditLogs.create is not supported (writes are server-side)') },
  update:     () => { throw new Error('auditLogs.update is not supported') },
  remove:     () => { throw new Error('auditLogs.remove is not supported (use auditRepo.clearAll via DELETE /audit-logs)') },
}

// ── School profile singleton (pinned at key=1) ─────────────────────────────

const schoolProfileAdapter = {
  async list() {
    const row = await apiFetch('/schoolProfile')
    return row ? [row] : []
  },
  // The repo calls .get(1) — the server route returns the singleton row or
  // null regardless of the id, which matches the dexie adapter's behaviour.
  async get() {
    return apiFetch('/schoolProfile')
  },
  async getByUuid() {
    return apiFetch('/schoolProfile')
  },
  async count() {
    const row = await apiFetch('/schoolProfile')
    return row ? 1 : 0
  },
  // PUT is upsert server-side, so create and update both funnel through it.
  async create(_table, data) {
    return apiFetch('/schoolProfile', { method: 'PUT', body: data })
  },
  async update(_table, _id, patch) {
    return apiFetch('/schoolProfile', { method: 'PUT', body: patch })
  },
  remove: () => { throw new Error('schoolProfile.remove is not supported') },
  where:  () => { throw new Error('schoolProfile.where is not supported (singleton row)') },
}

// ── Generic CRUD (matches server/src/crud/factory.js) ──────────────────────

const genericAdapter = {
  async list(table, { limit, offset, where, dateFrom, dateTo } = {}) {
    return apiFetch(`/${table}`, { query: { limit, offset, where, dateFrom, dateTo } })
  },
  async get(table, id) {
    try {
      return await apiFetch(`/${table}/${encodeURIComponent(id)}`)
    } catch (err) {
      if (err?.status === 404) return null
      throw err
    }
  },
  async getByUuid(table, uuid) {
    try {
      return await apiFetch(`/${table}/${encodeURIComponent(uuid)}`)
    } catch (err) {
      if (err?.status === 404) return null
      throw err
    }
  },
  async create(table, data) {
    return apiFetch(`/${table}`, { method: 'POST', body: data })
  },
  async update(table, id, patch) {
    return apiFetch(`/${table}/${encodeURIComponent(id)}`, { method: 'PUT', body: patch })
  },
  async remove(table, id) {
    await apiFetch(`/${table}/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return true
  },
  async where(table, field, value) {
    return apiFetch(`/${table}`, { query: { where: { [field]: value } } })
  },
  async count(table) {
    const res = await apiFetch(`/${table}/count`)
    return res?.count ?? 0
  },
}

const adapterFor = (table) => {
  if (table === 'auditLogs') return auditAdapter
  if (table === 'schoolProfile') return schoolProfileAdapter
  return genericAdapter
}

// Public adapter: thin trampoline that picks the right per-table handler.
export const httpAdapter = {
  list:      (table, opts)         => adapterFor(table).list(table, opts),
  get:       (table, id)           => adapterFor(table).get(table, id),
  getByUuid: (table, uuid)         => adapterFor(table).getByUuid(table, uuid),
  create:    (table, data)         => adapterFor(table).create(table, data),
  update:    (table, id, patch)    => adapterFor(table).update(table, id, patch),
  remove:    (table, id)           => adapterFor(table).remove(table, id),
  where:     (table, field, value) => adapterFor(table).where(table, field, value),
  count:     (table)               => adapterFor(table).count(table),
}

export default httpAdapter
