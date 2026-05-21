import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch, ApiError } from '../repositories/adapters/http/client'

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
    try {
      const res = await apiFetch('/auth/login', { method: 'POST', body: { email, password } })
      user.value = res.user
      token.value = res.token
      saveSession({ user: user.value, token: token.value })
      return true
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return false
      throw err
    }
  }

  const _setupChecked = ref(false)

  /** Returns true when no users exist yet (first-time setup needed). Cached after first fetch. */
  const needsSetup = async () => {
    if (_setupChecked.value) return _setupNeeded.value
    const res = await apiFetch('/auth/needs-setup')
    _setupNeeded.value = !!res?.needsSetup
    _setupChecked.value = true
    return _setupNeeded.value
  }

  /**
   * First-time onboarding: create the owner user. The server's /auth/setup
   * endpoint refuses with 409 if any user already exists.
   */
  const createOwner = async (name, email, password) => {
    try {
      const res = await apiFetch('/auth/setup', { method: 'POST', body: { name, email, password } })
      user.value = res.user
      token.value = res.token
      saveSession({ user: user.value, token: token.value })
      _setupChecked.value = false
      return true
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) return false
      throw err
    }
  }

  const forgotPassword = async (_email) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return true
  }

  const logout = () => {
    user.value = null
    token.value = null
    saveSession(null)
    // Fire-and-forget; the server records the audit event when the bearer
    // token is still present on the request. We don't await it so callers
    // can treat logout() as synchronous.
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => {})
  }

  /**
   * Re-validate the persisted token against the server. Returns true if the
   * token is still good (and refreshes `user` from /auth/me), false otherwise
   * (in which case local state is cleared). Intended for SPA boot-up.
   */
  const rehydrate = async () => {
    if (!token.value) return false
    try {
      const res = await apiFetch('/auth/me')
      user.value = res.user
      saveSession({ user: user.value, token: token.value })
      return true
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        user.value = null
        token.value = null
        saveSession(null)
        return false
      }
      throw err
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
    rehydrate,
  }
})