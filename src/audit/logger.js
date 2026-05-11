// Centralised audit-log writer. Keep this module dependency-light: it must not
// import from stores or repositories at the top level (would create cycles).
// Actor info is supplied through a registered provider (wired in main.js).

import { db } from '../db/dexie'
import { v4 as uuidv4 } from 'uuid'

// ── Defaults that callers can override ───────────────────────────────────────

// Fields that change on every write; never useful in a diff.
const ALWAYS_IGNORED = new Set(['updatedAt'])

// Fields that should never be persisted in clear text in the log.
const DEFAULT_REDACT = new Set(['passwordHash', 'password', 'token'])

const REDACTED = '[redacted]'

// ── Module state (kept tiny + test-friendly) ─────────────────────────────────

let enabled = true
let actorProvider = () => null

export const setAuditEnabled = (v) => { enabled = !!v }
export const isAuditEnabled = () => enabled
export const setAuditActorProvider = (fn) => {
  actorProvider = typeof fn === 'function' ? fn : () => null
}

/** Run an async block with auditing temporarily disabled (e.g. seeding). */
export async function withAuditDisabled(fn) {
  const prev = enabled
  enabled = false
  try { return await fn() } finally { enabled = prev }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const resolveActor = () => {
  try {
    const a = actorProvider()
    if (!a) return { actorId: null, actorRole: 'system', actorName: 'system' }
    return {
      actorId: a.id ?? null,
      actorRole: a.role ?? null,
      actorName: a.name ?? null,
    }
  } catch {
    return { actorId: null, actorRole: 'system', actorName: 'system' }
  }
}

const redactObject = (obj, redactSet) => {
  if (!obj || typeof obj !== 'object') return obj
  const out = {}
  for (const k of Object.keys(obj)) {
    out[k] = redactSet.has(k) ? REDACTED : obj[k]
  }
  return out
}

/**
 * Compute a shallow diff between two row snapshots.
 * Returns { [field]: { before, after } } only for changed keys.
 */
export function changedFields(before, after, { ignore = [], redact = [] } = {}) {
  const ignoreSet = new Set([...ALWAYS_IGNORED, ...ignore])
  const redactSet = new Set([...DEFAULT_REDACT, ...redact])
  const out = {}
  const keys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ])
  for (const k of keys) {
    if (ignoreSet.has(k)) continue
    const a = before ? before[k] : undefined
    const b = after ? after[k] : undefined
    if (!shallowEqual(a, b)) {
      out[k] = {
        before: redactSet.has(k) ? REDACTED : a,
        after: redactSet.has(k) ? REDACTED : b,
      }
    }
  }
  return out
}

const shallowEqual = (a, b) => {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false
  try { return JSON.stringify(a) === JSON.stringify(b) } catch { return false }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Persist a single audit entry. Best-effort: failures are swallowed so a
 * broken audit pipeline never blocks a user action.
 */
export async function recordAudit({
  entity,
  action,
  entityId = null,
  entityUuid = null,
  before = null,
  after = null,
  changes = null,
  redact = [],
  meta = null,
} = {}) {
  if (!enabled) return null
  if (!entity || !action) return null

  const redactSet = new Set([...DEFAULT_REDACT, ...redact])
  const safeBefore = before ? redactObject(before, redactSet) : null
  const safeAfter = after ? redactObject(after, redactSet) : null
  const safeChanges = changes
    ? Object.fromEntries(Object.entries(changes).map(([k, v]) => ([
      k,
      redactSet.has(k)
        ? { before: REDACTED, after: REDACTED }
        : v,
    ])))
    : null

  const actor = resolveActor()
  const row = {
    uuid: uuidv4(),
    entity,
    entityId,
    entityUuid,
    action,
    ...actor,
    changes: safeChanges,
    before: safeBefore,
    after: safeAfter,
    meta,
    createdAt: new Date().toISOString(),
  }

  try {
    const id = await db.table('auditLogs').add(row)
    return { ...row, id }
  } catch (err) {
    if (typeof console !== 'undefined') console.warn('[audit] write failed:', err)
    return null
  }
}

export default { recordAudit, changedFields, setAuditEnabled, setAuditActorProvider, withAuditDisabled }
