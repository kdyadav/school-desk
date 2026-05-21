import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseAdapter } from '../repositories/adapters/supabase'
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

  // Paginate + filter server-side via the Supabase adapter; the envelope
  // matches the previous Fastify response shape so the view stays the same.
  async function load() {
    loading.value = true
    error.value = null
    try {
      const f = filters.value
      const where = {}
      if (f.entity) where.entity = f.entity
      if (f.actorId != null && f.actorId !== '') where.actorId = f.actorId
      const offset = (page.value - 1) * pageSize.value
      const { rows, total: t } = await supabaseAdapter.audit.list('auditLogs', {
        where,
        action: f.action || undefined,
        since: f.since || undefined,
        until: f.until || undefined,
        limit: pageSize.value,
        offset,
      })
      items.value = rows
      total.value = t
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  /** Hard-delete every audit row. Admin-only at the call site (RLS enforces it). */
  async function clearAll() {
    await supabaseAdapter.audit.clearAll()
    items.value = []
    total.value = 0
  }

  /** Convenience: load logs for a single entity row. */
  async function loadForEntity(entity, entityId) {
    const { rows } = await supabaseAdapter.audit.list('auditLogs', {
      where: { entity, entityId },
      limit: 200,
      offset: 0,
    })
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
