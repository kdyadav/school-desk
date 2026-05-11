import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { announcementRepo } from '../repositories'
import { AUDIENCE_OPTIONS } from '../schemas/announcement'
import { useAuthStore } from './auth'

export { AUDIENCE_OPTIONS }

// Lower number = higher privilege. Owner sits above admin; student and parent
// are peers at the bottom.
const ROLE_RANK = { owner: 0, admin: 1, teacher: 2, student: 3, parent: 3 }

/**
 * Audience values a creator with the given role may target. A creator can
 * target their own role or any role with equal-or-lower privilege. `'all'` is
 * treated as a peer-broadcast and is always available to creators.
 */
export function audiencesForRole(role) {
  const myRank = ROLE_RANK[role]
  if (myRank == null) return []
  return AUDIENCE_OPTIONS.filter((aud) => {
    if (aud === 'all') return true
    const r = ROLE_RANK[aud]
    return r != null && r >= myRank
  })
}

export const useAnnouncementsStore = defineStore('announcements', () => {
  const items = ref([])
  const loading = ref(false)

  async function loadAll() {
    loading.value = true
    try {
      const all = await announcementRepo.list()
      items.value = all.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    const actorRole = useAuthStore().role
    if (actorRole && !audiencesForRole(actorRole).includes(payload.audience)) {
      throw new Error('You cannot post announcements to a higher-privileged audience.')
    }
    await announcementRepo.create(payload)
    await loadAll()
  }

  async function remove(id) {
    await announcementRepo.remove(id)
    await loadAll()
  }

  /** Filter announcements visible to a given role */
  function forRole(role) {
    // Owner sees the same audiences as admin.
    const effective = role === 'owner' ? 'admin' : role
    return items.value.filter((a) => a.audience === 'all' || a.audience === effective)
  }

  /** Most recent N announcements for a role */
  function recent(role, n = 5) {
    return forRole(role).slice(0, n)
  }

  return { items, loading, loadAll, create, remove, forRole, recent }
})
