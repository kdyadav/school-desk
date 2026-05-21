import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userRepo } from '../repositories'
import { supabase, supabaseSignupClient } from '../supabase'
import { useAuthStore } from './auth'

const PRIVILEGED_ROLES = ['owner', 'admin']

// The "users" surface in the UI now manages `public.profiles`. Credentials
// live in Supabase Auth (auth.users); creating a new account therefore
// involves both an auth signup and a pending_invites row so the DB trigger
// knows which role to assign.
//
// Limitations vs. the old Fastify backend:
//   * Direct password updates require service_role privileges. We surface
//     the equivalent affordance via `resetPasswordForEmail`, which sends the
//     user a reset link.
//   * Hard-deleting auth.users requires service_role too. `deleteUser`
//     removes the profile row; the orphaned auth.users entry can no longer
//     log in (no profile → role resolution fails) and can be cleaned up
//     from the Supabase dashboard if desired.

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      users.value = await userRepo.list()
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  function actorRole() {
    return useAuthStore().role
  }

  async function createUser({ name, email, password, role, linkedId }) {
    const me = actorRole()
    if (role === 'owner') {
      throw new Error('There can only be one owner account.')
    }
    if (role === 'admin' && me !== 'owner') {
      throw new Error('Only the owner can create admin accounts.')
    }
    const existing = await userRepo.where('email', email)
    if (existing.length) {
      throw new Error('A user with this email already exists.')
    }

    // Pre-register the role so the on_auth_user_created trigger picks it up
    // when the signup completes below.
    {
      const { error: e } = await supabase
        .from('pending_invites')
        .upsert({ email, role, name: name || null, linkedId: linkedId || null }, { onConflict: 'email' })
      if (e) throw new Error(e.message)
    }

    // Use the secondary client (no session persistence) so signing the new
    // user up does NOT replace the current admin's session.
    const { error: signErr } = await supabaseSignupClient.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })
    if (signErr) {
      // Roll back the invite so a retry can succeed.
      await supabase.from('pending_invites').delete().eq('email', email)
      throw new Error(signErr.message)
    }

    await loadAll()
    return users.value.find((u) => u.email === email) || null
  }

  async function updateUser(id, { name, role, linkedId, password }) {
    const me = actorRole()
    const target = await userRepo.get(id)
    if (!target) throw new Error('User not found.')

    if (target.role === 'owner' && role && role !== 'owner') {
      throw new Error('The owner role cannot be changed.')
    }
    if (role === 'owner' && target.role !== 'owner') {
      throw new Error('There can only be one owner account.')
    }
    if (me !== 'owner' && PRIVILEGED_ROLES.includes(target.role)) {
      throw new Error('Only the owner can modify admin or owner accounts.')
    }
    if (me !== 'owner' && role === 'admin') {
      throw new Error('Only the owner can assign the admin role.')
    }

    const patch = { name, role, linkedId: linkedId || null }
    const updated = await userRepo.update(id, patch)

    // The UI's edit drawer accepts a new password, but client-side we can't
    // overwrite an auth.users password without the service-role key. Best we
    // can do is trigger Supabase's email-based reset flow for the user.
    if (password) {
      const { error: e } = await supabase.auth.resetPasswordForEmail(target.email)
      if (e) console.warn('[users] resetPasswordForEmail failed:', e.message)
    }

    await loadAll()
    return updated
  }

  async function deleteUser(id) {
    const me = actorRole()
    const target = await userRepo.get(id)
    if (!target) throw new Error('User not found.')

    if (target.role === 'owner') {
      throw new Error('The owner account cannot be deleted.')
    }
    if (me !== 'owner' && target.role === 'admin') {
      throw new Error('Only the owner can delete admin accounts.')
    }
    await userRepo.remove(id)
    await loadAll()
  }

  return {
    users,
    loading,
    error,
    loadAll,
    createUser,
    updateUser,
    deleteUser,
  }
})
