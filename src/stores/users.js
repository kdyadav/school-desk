import { defineStore } from 'pinia'
import { ref } from 'vue'
import bcrypt from 'bcryptjs'
import { userRepo } from '../repositories'
import { useAuthStore } from './auth'

const PRIVILEGED_ROLES = ['owner', 'admin']

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
    const created = await userRepo.create({
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      role,
      name,
      linkedId: linkedId || null,
    })
    await loadAll()
    return created
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
    if (password) {
      patch.passwordHash = bcrypt.hashSync(password, 10)
    }
    const updated = await userRepo.update(id, patch)
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
