// Supabase / PostgREST adapter that mirrors the repository contract in
// src/repositories/base.js. Row-Level Security on the database side does the
// authorisation work that the Fastify server used to do.
//
// Notes on naming:
//   * API table names (the keys used by repositories/index.js and the legacy
//     dexie schema) are camelCase, e.g. `academicYears`, `examMarks`.
//   * The Postgres tables are snake_case (`academic_years`, `exam_marks`) via
//     the original Prisma `@@map(...)` directives.
//   * The `users` API name now maps to the `profiles` table (Supabase Auth
//     owns credentials; profiles holds role / name / linkedId).
//
// The audit log gets a bespoke handler because the server response shape
// was `{ rows, total, limit, offset }` and the audit store relies on
// since/until date filters.

import { supabase } from '../../../supabase'

// ── Table-name mapping ──────────────────────────────────────────────────────

const PG_TABLE = {
  academicYears:    'academic_years',
  classes:          'classes',
  sections:         'sections',
  subjects:         'subjects',
  guardians:        'guardians',
  students:         'students',
  teachers:         'teachers',
  users:            'profiles',
  enrollments:      'enrollments',
  periods:          'periods',
  timetable:        'timetable',
  attendance:       'attendance',
  exams:            'exams',
  examMarks:        'exam_marks',
  feeStructures:    'fee_structures',
  invoices:         'invoices',
  payments:         'payments',
  announcements:    'announcements',
  salaryStructures: 'salary_structures',
  payslips:         'payslips',
  salaryPayments:   'salary_payments',
  auditLogs:        'audit_logs',
  schoolProfile:    'school_profile',
}

const pgTable = (api) => {
  const t = PG_TABLE[api]
  if (!t) throw new Error(`Unknown API table: ${api}`)
  return t
}

// PostgREST throws a typed PostgrestError on failure. Re-throw with status
// metadata to match the previous ApiError contract the auth store relied on.
const rethrow = (error) => {
  if (!error) return
  const err = new Error(error.message || 'supabase_error')
  err.status = error.code === 'PGRST116' ? 404 : Number(error.status) || 400
  err.code = error.code
  err.body = error
  throw err
}

const SERVER_MANAGED = new Set(['id', 'uuid', 'createdAt', 'updatedAt'])
const stripServerManaged = (data) => {
  if (!data || typeof data !== 'object') return {}
  const out = {}
  for (const [k, v] of Object.entries(data)) {
    if (SERVER_MANAGED.has(k)) continue
    if (v === undefined) continue
    out[k] = v
  }
  return out
}

// ── Generic CRUD ────────────────────────────────────────────────────────────

const generic = {
  async list(tableName, { limit, offset, where, dateFrom, dateTo } = {}) {
    let q = supabase.from(pgTable(tableName)).select('*').order('id', { ascending: true })
    if (where && typeof where === 'object') {
      for (const [k, v] of Object.entries(where)) {
        if (v !== undefined && v !== null) q = q.eq(k, v)
      }
    }
    if (tableName === 'attendance') {
      if (dateFrom) q = q.gte('date', dateFrom)
      if (dateTo)   q = q.lte('date', dateTo)
    }
    if (typeof offset === 'number' && typeof limit === 'number') {
      q = q.range(offset, offset + limit - 1)
    } else if (typeof limit === 'number') {
      q = q.limit(limit)
    } else if (typeof offset === 'number') {
      q = q.range(offset, offset + 999)
    }
    const { data, error } = await q
    if (error) rethrow(error)
    return data || []
  },

  async get(tableName, id) {
    const { data, error } = await supabase
      .from(pgTable(tableName))
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') rethrow(error)
    return data || null
  },

  async getByUuid(tableName, uuid) {
    const { data, error } = await supabase
      .from(pgTable(tableName))
      .select('*')
      .eq('uuid', uuid)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') rethrow(error)
    return data || null
  },

  async create(tableName, data) {
    const payload = stripServerManaged(data)
    const { data: row, error } = await supabase
      .from(pgTable(tableName))
      .insert(payload)
      .select('*')
      .single()
    if (error) rethrow(error)
    return row
  },

  async update(tableName, id, patch) {
    const payload = stripServerManaged(patch)
    const { data: row, error } = await supabase
      .from(pgTable(tableName))
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) rethrow(error)
    return row
  },

  async remove(tableName, id) {
    const { error } = await supabase.from(pgTable(tableName)).delete().eq('id', id)
    if (error) rethrow(error)
    return true
  },

  async where(tableName, field, value) {
    const { data, error } = await supabase
      .from(pgTable(tableName))
      .select('*')
      .eq(field, value)
      .order('id', { ascending: true })
    if (error) rethrow(error)
    return data || []
  },

  async count(tableName) {
    const { count, error } = await supabase
      .from(pgTable(tableName))
      .select('*', { count: 'exact', head: true })
    if (error) rethrow(error)
    return count ?? 0
  },
}

// ── auditLogs (read-only; writes happen via DB triggers) ────────────────────

const auditAdapter = {
  async list(_t, { limit = 50, offset = 0, where, since, until, action } = {}) {
    let q = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })

    if (where && typeof where === 'object') {
      for (const [k, v] of Object.entries(where)) {
        if (v !== undefined && v !== null) q = q.eq(k, v)
      }
    }
    if (action) q = q.eq('action', action)
    if (since) q = q.gte('createdAt', since)
    if (until) q = q.lte('createdAt', new Date(`${until}T23:59:59.999Z`).toISOString())

    const lo = offset
    const hi = offset + limit - 1
    q = q.range(lo, hi)

    const { data, error, count } = await q
    if (error) rethrow(error)
    // Mirror the previous server response shape so audit store callers stay
    // unchanged.
    return { rows: data || [], total: count ?? 0, limit, offset }
  },

  async count() {
    const { count, error } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
    if (error) rethrow(error)
    return count ?? 0
  },

  async clearAll() {
    // Postgres requires a non-empty WHERE for DELETE under postgrest; use a
    // tautology that matches every row.
    const { error } = await supabase.from('audit_logs').delete().gte('id', 0)
    if (error) rethrow(error)
    return true
  },

  // No-ops kept on the interface so dynamic callers don't crash if a code
  // path slips through.
  async where(_t, field, value) {
    const res = await auditAdapter.list(_t, { where: { [field]: value }, limit: 200 })
    return res.rows
  },

  get:        () => { throw new Error('auditLogs.get is not supported') },
  getByUuid:  () => { throw new Error('auditLogs.getByUuid is not supported') },
  create:     () => { throw new Error('auditLogs.create is not supported (DB triggers write)') },
  update:     () => { throw new Error('auditLogs.update is not supported') },
  remove:     () => { throw new Error('auditLogs.remove is not supported (use clearAll)') },
}

// ── schoolProfile singleton (keyed on key=1) ────────────────────────────────

const schoolProfileAdapter = {
  async get() {
    const { data, error } = await supabase
      .from('school_profile').select('*').eq('key', 1).maybeSingle()
    if (error && error.code !== 'PGRST116') rethrow(error)
    return data || null
  },
  async list() {
    const row = await schoolProfileAdapter.get()
    return row ? [row] : []
  },
  async getByUuid() {
    return schoolProfileAdapter.get()
  },
  async count() {
    const { count, error } = await supabase
      .from('school_profile').select('*', { count: 'exact', head: true })
    if (error) rethrow(error)
    return count ?? 0
  },
  // The CRUD factory used `PUT /schoolProfile` as upsert; expose the same
  // semantics for both create and update calls coming from the repo.
  async create(_t, data) {
    const payload = { ...stripServerManaged(data), key: 1 }
    const { data: row, error } = await supabase
      .from('school_profile').upsert(payload, { onConflict: 'key' }).select('*').single()
    if (error) rethrow(error)
    return row
  },
  async update(_t, _id, patch) {
    const payload = { ...stripServerManaged(patch), key: 1 }
    const { data: row, error } = await supabase
      .from('school_profile').upsert(payload, { onConflict: 'key' }).select('*').single()
    if (error) rethrow(error)
    return row
  },
  remove: () => { throw new Error('schoolProfile.remove is not supported') },
  where:  () => { throw new Error('schoolProfile.where is not supported (singleton row)') },
}

// ── Public adapter facade ──────────────────────────────────────────────────

const pick = (table) => {
  if (table === 'auditLogs')     return auditAdapter
  if (table === 'schoolProfile') return schoolProfileAdapter
  return generic
}

export const supabaseAdapter = {
  list:      (t, opts)        => pick(t).list(t, opts),
  get:       (t, id)          => pick(t).get(t, id),
  getByUuid: (t, uuid)        => pick(t).getByUuid(t, uuid),
  create:    (t, data)        => pick(t).create(t, data),
  update:    (t, id, patch)   => pick(t).update(t, id, patch),
  remove:    (t, id)          => pick(t).remove(t, id),
  where:     (t, field, val)  => pick(t).where(t, field, val),
  count:     (t)              => pick(t).count(t),

  // Direct handle for the audit store's list call that needs the `{ rows,
  // total }` envelope plus since/until filters.
  audit: auditAdapter,
}

export default supabaseAdapter
