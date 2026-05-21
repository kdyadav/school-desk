import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'
import { recordAudit } from '../audit/logger'

// Maps a Supabase Session + profile row onto the shape the rest of the SPA
// expects (id is the integer profiles.id; auth.users.id is exposed as authId
// for the few callers that need it for storage paths).
const toPublicUser = (profile, session) => ({
  id: profile?.id ?? null,
  uuid: profile?.uuid ?? null,
  authId: session?.user?.id ?? null,
  email: profile?.email ?? session?.user?.email ?? null,
  role: profile?.role ?? null,
  name: profile?.name || (profile?.email || session?.user?.email || '').split('@')[0],
  linkedId: profile?.linkedId ?? null,
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role || null)
  const hasRole = (roles) => {
    if (!roles || roles.length === 0) return true
    if (role.value === 'owner') return true
    return roles.includes(role.value)
  }

  // Fetch the profile row that corresponds to the current auth.users entry.
  // Returns null if a profile has not been provisioned yet (transient state
  // immediately after signup before the on_auth_user_created trigger fires).
  const fetchProfile = async (authUserId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUserId)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      await recordAudit({ entity: 'auth', action: 'auth.login_failed', meta: { email, reason: error.message } })
      if (error.status === 400 || error.status === 401) return false
      throw error
    }
    session.value = data.session
    const profile = await fetchProfile(data.session.user.id)
    user.value = toPublicUser(profile, data.session)
    await recordAudit({
      entity: 'auth', action: 'auth.login_success',
      entityId: user.value.id, entityUuid: user.value.uuid,
      meta: { email, role: user.value.role },
    })
    return true
  }

  const _setupChecked = ref(false)
  const _setupNeeded = ref(false)

  /** Returns true when no profile row exists yet. Cached after first fetch. */
  const needsSetup = async () => {
    if (_setupChecked.value) return _setupNeeded.value
    const { data, error } = await supabase.rpc('needs_setup')
    if (error) {
      // Surface the real reason in dev; assume not-needed in prod so we don't
      // lock users out behind a broken RPC.
      console.warn('[auth] needs_setup RPC failed:', error.message)
      _setupNeeded.value = false
    } else {
      _setupNeeded.value = !!data
    }
    _setupChecked.value = true
    return _setupNeeded.value
  }

  /**
   * First-time onboarding: create the owner via supabase.auth.signUp. The DB
   * trigger on auth.users assigns role='owner' because no profile exists yet.
   * Returns false if a profile already exists (409 equivalent).
   */
  const createOwner = async (name, email, password) => {
    const needs = await needsSetup()
    if (!needs) {
      await recordAudit({ entity: 'auth', action: 'auth.register_failed', meta: { email, reason: 'already_initialised' } })
      return false
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'owner' } },
    })
    if (error) throw error

    // signUp may or may not return a session depending on whether the project
    // requires email confirmation. If it does, fall back to an immediate
    // password sign-in so the SPA can finish the onboarding flow without
    // requiring the user to click an email link.
    let s = data.session
    if (!s) {
      const { data: signed, error: signErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signErr) throw signErr
      s = signed.session
    }
    session.value = s
    // Trigger runs after-insert; small retry loop in case PostgREST sees the
    // commit just before the trigger flushes.
    let profile = null
    for (let i = 0; i < 5 && !profile; i++) {
      profile = await fetchProfile(s.user.id)
      if (!profile) await new Promise((r) => setTimeout(r, 150))
    }
    user.value = toPublicUser(profile, s)
    _setupChecked.value = false
    await recordAudit({
      entity: 'auth', action: 'auth.register_success',
      entityId: user.value.id, entityUuid: user.value.uuid,
      meta: { email, role: 'owner' },
    })
    return true
  }

  // Supabase Auth ships a password reset flow via email; this surfaces it on
  // the existing UI button. Returns true if the request was accepted.
  const forgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      console.warn('[auth] forgotPassword failed:', error.message)
      return false
    }
    return true
  }

  const logout = async () => {
    const snapshot = user.value
    user.value = null
    session.value = null
    if (snapshot) {
      await recordAudit({
        entity: 'auth', action: 'auth.logout',
        entityId: snapshot.id, entityUuid: snapshot.uuid,
        meta: { email: snapshot.email, role: snapshot.role },
      })
    }
    await supabase.auth.signOut()
  }

  /**
   * Re-hydrate user + profile from the persisted Supabase session. Returns
   * true if a session exists and the profile resolved successfully.
   */
  const rehydrate = async () => {
    const { data: { session: s } } = await supabase.auth.getSession()
    if (!s) {
      user.value = null
      session.value = null
      return false
    }
    session.value = s
    const profile = await fetchProfile(s.user.id)
    user.value = toPublicUser(profile, s)
    return true
  }

  // Keep the in-memory state in sync with token refresh + cross-tab signouts.
  // The callback must not await other supabase calls inline — supabase-js holds
  // a navigator lock for the duration of the callback and any nested supabase
  // request (e.g. fetchProfile, or school.load() running in a route guard)
  // deadlocks behind it. Defer the work with setTimeout(0). INITIAL_SESSION is
  // already handled by rehydrate() at startup, so skip it here.
  supabase.auth.onAuthStateChange((event, s) => {
    if (event === 'INITIAL_SESSION') return
    if (!s) {
      user.value = null
      session.value = null
      return
    }
    session.value = s
    setTimeout(async () => {
      const profile = await fetchProfile(s.user.id)
      user.value = toPublicUser(profile, s)
    }, 0)
  })

  return {
    user,
    session,
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
