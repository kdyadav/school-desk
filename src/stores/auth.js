import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import bcrypt from 'bcryptjs'
import { userRepo } from '../repositories'
import { recordAudit } from '../audit/logger'
import { seedDatabase, isDbEmpty } from '../db/seed'
import { withAuditDisabled } from '../audit'

const SESSION_KEY = 'school.session'

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const saveSession = (session) => {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

const toPublic = (u) => ({
  id: u.id,
  uuid: u.uuid,
  email: u.email,
  role: u.role,
  name: u.name || u.email.split('@')[0],
  linkedId: u.linkedId ?? null,
})

export const useAuthStore = defineStore('auth', () => {
  const initial = loadSession()
  const user = ref(initial?.user || null)
  const token = ref(initial?.token || null)

  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role || null)
  const hasRole = (roles) => {
    if (!roles || roles.length === 0) return true
    // Owner has admin-level access everywhere.
    if (role.value === 'owner') return true
    return roles.includes(role.value)
  }

  const login = async (email, password) => {
    const found = await userRepo.where('email', email)
    const u = found[0]
    if (!u) {
      await recordAudit({ entity: 'auth', action: 'auth.login_failed', meta: { email, reason: 'unknown_user' } })
      return false
    }
    const ok = bcrypt.compareSync(password, u.passwordHash)
    if (!ok) {
      await recordAudit({ entity: 'auth', action: 'auth.login_failed', meta: { email, reason: 'bad_password' } })
      return false
    }
    user.value = toPublic(u)
    token.value = u.uuid
    saveSession({ user: user.value, token: token.value })
    await recordAudit({
      entity: 'auth',
      action: 'auth.login_success',
      entityId: u.id,
      entityUuid: u.uuid,
      meta: { email, role: u.role },
    })
    return true
  }

  /** Returns true when no users exist yet (first-time setup needed). */
  const needsSetup = async () => {
    const users = await userRepo.list()
    return users.length === 0
  }

  /**
   * First-time onboarding: create the owner user and seed demo data.
   * Only works when the users table is empty.
   */
  const createOwner = async (name, email, password) => {
    const users = await userRepo.list()
    if (users.length > 0) return false

    const created = await userRepo.create({
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'owner',
      name,
    })

    // Seed the rest of the demo data using this owner as the actor.
    await withAuditDisabled(() => seedDatabase(created))

    user.value = toPublic(created)
    token.value = created.uuid
    saveSession({ user: user.value, token: token.value })

    await recordAudit({
      entity: 'auth',
      action: 'auth.setup_complete',
      entityId: created.id,
      entityUuid: created.uuid,
      meta: { email, role: 'owner' },
    })
    return true
  }

  const forgotPassword = async (_email) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return true
  }

  const logout = () => {
    const previous = user.value
    user.value = null
    token.value = null
    saveSession(null)
    if (previous) {
      // Fire-and-forget; `logout` stays synchronous for callers.
      recordAudit({
        entity: 'auth',
        action: 'auth.logout',
        entityId: previous.id,
        entityUuid: previous.uuid,
        meta: { email: previous.email, role: previous.role },
      })
    }
  }

  return {
    token,
    user,
    role,
    isAuthenticated,
    hasRole,
    needsSetup,
    createOwner,
    login,
    forgotPassword,
    logout,
  }
})