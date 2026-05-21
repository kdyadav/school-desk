// Client-side audit writer. After the Supabase migration, CRUD operations are
// audited by Postgres triggers (see supabase/migrations/0001_init.sql); the
// only events this module still emits are the auth.* lifecycle events
// (login_success, login_failed, logout, register_success, register_failed).
//
// RLS denies plain INSERTs to audit_logs, so auth events are written through
// a SECURITY DEFINER RPC `public.record_auth_event(...)` that bypasses RLS.
// The helper falls back to a silent no-op if the RPC is unavailable so a
// broken audit pipeline never blocks a sign-in.

import { supabase } from '../supabase'

const DEFAULT_REDACT = new Set(['passwordHash', 'password', 'token'])
const ALWAYS_IGNORED = new Set(['updatedAt'])
const REDACTED = '[redacted]'

let enabled = true
let actorProvider = () => null

export const setAuditEnabled = (v) => { enabled = !!v }
export const isAuditEnabled = () => enabled
export const setAuditActorProvider = (fn) => {
  actorProvider = typeof fn === 'function' ? fn : () => null
}

export async function withAuditDisabled(fn) {
  const prev = enabled
  enabled = false
  try { return await fn() } finally { enabled = prev }
}

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

const shallowEqual = (a, b) => {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false
  try { return JSON.stringify(a) === JSON.stringify(b) } catch { return false }
}

// Kept exported so any future client-side caller can compute diffs that match
// the server-side trigger's shape. Not used by the repository layer anymore.
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

/**
 * Persist a single audit entry. Best-effort: failures are swallowed so a
 * broken audit pipeline never blocks a user action.
 *
 * In the Supabase build this is only used for `entity === 'auth'` rows; CRUD
 * audit happens server-side via triggers.
 */
export async function recordAudit({
  entity,
  action,
  entityId = null,
  entityUuid = null,
  meta = null,
} = {}) {
  if (!enabled) return null
  if (!entity || !action) return null

  const actor = resolveActor()
  try {
    const { error } = await supabase.rpc('record_auth_event', {
      p_entity:      entity,
      p_action:      action,
      p_entity_id:   entityId,
      p_entity_uuid: entityUuid,
      p_actor_id:    actor.actorId,
      p_actor_role:  actor.actorRole,
      p_actor_name:  actor.actorName,
      p_meta:        meta,
    })
    if (error) {
      if (typeof console !== 'undefined') console.warn('[audit] rpc failed:', error.message)
      return null
    }
    return { entity, action, ...actor, meta, entityId, entityUuid }
  } catch (err) {
    if (typeof console !== 'undefined') console.warn('[audit] write failed:', err)
    return null
  }
}

export default { recordAudit, changedFields, setAuditEnabled, setAuditActorProvider, withAuditDisabled }
