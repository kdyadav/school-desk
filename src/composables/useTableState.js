import { ref, computed, watch } from 'vue'

/**
 * Generic search + pagination state for tables.
 * @param {import('vue').Ref<Array>|Function} source  reactive list or getter
 * @param {Object} options
 * @param {Function} options.matcher  (item, query) => boolean
 * @param {number} options.pageSize  default 10
 */
export function useTableState(source, { matcher, pageSize = 10 } = {}) {
  const search = ref('')
  const page = ref(1)
  const perPage = ref(pageSize)

  const items = computed(() => (typeof source === 'function' ? source() : source.value || []))

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q || !matcher) return items.value
    return items.value.filter((it) => matcher(it, q))
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))

  const paged = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filtered.value.slice(start, start + perPage.value)
  })

  watch([search, perPage], () => { page.value = 1 })
  watch(totalPages, (tp) => { if (page.value > tp) page.value = tp })

  const next = () => { if (page.value < totalPages.value) page.value++ }
  const prev = () => { if (page.value > 1) page.value-- }

  return { search, page, perPage, filtered, paged, totalPages, next, prev }
}

export default useTableState
