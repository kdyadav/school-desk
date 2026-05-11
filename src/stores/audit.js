import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../db/dexie'
import { auditRepo } from '../repositories'

const DEFAULT_FILTERS = () => ({
  entity: '',
  action: '',
  actorId: null,
  since: '',  // ISO date (yyyy-mm-dd) inclusive
  until: '',  // ISO date (yyyy-mm-dd) inclusive
})

export const useAuditStore = defineStore('audit', () => {
  const items = ref([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const filters = ref(DEFAULT_FILTERS())
  const page = ref(1)
  const pageSize = ref(50)

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  function setFilter(key, value) {
    filters.value = { ...filters.value, [key]: value }
    page.value = 1
  }

  function resetFilters() {
    filters.value = DEFAULT_FILTERS()
    page.value = 1
  }

  function setPage(p) {
    page.value = Math.min(Math.max(1, p), pageCount.value)
  }

  // Build a Dexie query that uses the most selective index available, then
  // applies remaining filters via .filter(). Always sorts newest-first.
  async function load() {
    loading.value = true
    error.value = null
    try {
      const f = filters.value
      let coll
      const t = db.table('auditLogs')
      if (f.entity && f.actorId) {
        coll = t.filter((r) => r.entity === f.entity && r.actorId === f.actorId)
      } else if (f.entity) {
        coll = t.where('entity').equals(f.entity)
      } else if (f.actorId != null) {
        coll = t.where('actorId').equals(f.actorId)
      } else {
        coll = t.toCollection()
      }
      coll = coll.filter((r) => {
        if (f.action && r.action !== f.action) return false
        if (f.since && r.createdAt < f.since) return false
        if (f.until && r.createdAt > f.until + 'T23:59:59.999Z') return false
        return true
      })
      const all = await coll.toArray()
      all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      total.value = all.length
      const start = (page.value - 1) * pageSize.value
      items.value = all.slice(start, start + pageSize.value)
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  /** Hard-delete every audit row. Admin-only at the call site. */
  async function clearAll() {
    await db.table('auditLogs').clear()
    items.value = []
    total.value = 0
  }

  /** Convenience: load logs for a single entity row. */
  async function loadForEntity(entity, entityId) {
    const rows = await db.table('auditLogs')
      .where('[entity+entityId]').equals([entity, entityId])
      .toArray()
    rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    items.value = rows
    total.value = rows.length
    return rows
  }

  return {
    items,
    total,
    loading,
    error,
    filters,
    page,
    pageSize,
    pageCount,
    setFilter,
    resetFilters,
    setPage,
    load,
    loadForEntity,
    clearAll,
    repo: auditRepo,
  }
})

export default useAuditStore
