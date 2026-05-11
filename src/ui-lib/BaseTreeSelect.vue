<template>
  <div class="space-y-1" ref="rootEl">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Trigger -->
    <button ref="triggerEl" type="button" :disabled="disabled" @click="toggleDropdown" @blur="handleTriggerBlur" :class="[
      'w-full flex items-center justify-between px-4 py-3 border rounded-lg text-sm text-left transition-colors duration-200',
      open ? 'border-indigo-500 ring-1 ring-indigo-500' : error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-indigo-400',
      disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer',
    ]">
      <span v-if="selectedLabels.length" class="flex flex-wrap gap-1.5 flex-1">
        <span v-for="lbl in selectedLabels" :key="lbl"
          class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
          {{ lbl }}
        </span>
      </span>
      <span v-else class="text-gray-400">{{ placeholder }}</span>
      <svg class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ml-2"
        :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown — teleported to <body> so overflow:hidden ancestors can't clip it -->
    <Teleport to="body">
      <div v-if="open" ref="panelEl" :style="dropdownStyle"
        class="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
        style="max-height: 288px;">
        <!-- Search -->
        <div class="p-2 border-b border-gray-100 bg-white">
          <input v-model="search" type="text" placeholder="Search..."
            class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
            @click.stop />
        </div>
        <div class="p-1 overflow-y-auto" style="max-height: 236px;">
          <TreeNode v-for="node in filteredTree" :key="node.id" :node="node" :selected="modelValue" :multi="multi"
            :selection-strategy="selectionStrategy" :indeterminate-ids="indeterminateIds" :expanded-ids="expandedIds"
            @toggle-expand="toggleExpand" @select="selectNode" />
          <p v-if="filteredTree.length === 0" class="text-sm text-gray-400 text-center py-4">No results found.</p>
        </div>
      </div>
    </Teleport>

    <p v-if="error" class="text-xs text-red-600 flex items-center gap-1">
      <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd" />
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Select...' },
  tree: { type: Array, default: () => [] },
  modelValue: { type: [Array, String, Number], default: null },
  multi: { type: Boolean, default: false },
  // 'independent' | 'leaf-only' | 'cascade'
  selectionStrategy: { type: String, default: 'independent' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'blur'])

const open = ref(false)
const search = ref('')
const expandedIds = ref(new Set())
const rootEl = ref(null)
const triggerEl = ref(null)
const panelEl = ref(null)

// Computed position for the teleported dropdown panel
const dropdownRect = ref({ top: 0, left: 0, width: 0 })
const dropdownStyle = computed(() => ({
  top: `${dropdownRect.value.top}px`,
  left: `${dropdownRect.value.left}px`,
  width: `${dropdownRect.value.width}px`,
}))

function updateDropdownRect() {
  if (!triggerEl.value) return
  const r = triggerEl.value.getBoundingClientRect()
  dropdownRect.value = { top: r.bottom + 6, left: r.left, width: r.width }
}

async function toggleDropdown() {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    updateDropdownRect()
  }
}

function toggleExpand(id) {
  const s = new Set(expandedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expandedIds.value = s
}

// ─── Tree helpers ────────────────────────────────────────────────────
function findNodeById(id, nodes) {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) { const f = findNodeById(id, n.children); if (f) return f }
  }
  return null
}

function findParentOf(id, nodes, parent = null) {
  for (const n of nodes) {
    if (n.id === id) return parent
    if (n.children) { const f = findParentOf(id, n.children, n); if (f !== undefined) return f }
  }
  return undefined
}

function addDescendants(node, sel) {
  for (const c of (node.children || [])) { sel.add(c.id); addDescendants(c, sel) }
}

function removeDescendants(node, sel) {
  for (const c of (node.children || [])) { sel.delete(c.id); removeDescendants(c, sel) }
}

// Walk tree bottom-up: auto-select parent when ALL its children are selected
function syncAncestors(nodes, sel) {
  function check(list) {
    for (const n of list) {
      if (n.children?.length) {
        check(n.children)
        n.children.every(c => sel.has(c.id)) ? sel.add(n.id) : sel.delete(n.id)
      }
    }
  }
  check(nodes)
}

function selectNode(id) {
  if (!props.multi) {
    emit('update:modelValue', id)
    open.value = false
    return
  }

  const strategy = props.selectionStrategy
  const sel = new Set(Array.isArray(props.modelValue) ? props.modelValue : [])

  if (strategy === 'leaf-only') {
    const node = findNodeById(id, props.tree)
    if (!node || node.children?.length) return   // parent nodes are not selectable
    sel.has(id) ? sel.delete(id) : sel.add(id)

  } else if (strategy === 'cascade') {
    const node = findNodeById(id, props.tree)
    if (!node) return
    if (sel.has(id)) {
      sel.delete(id)
      removeDescendants(node, sel)
    } else {
      sel.add(id)
      addDescendants(node, sel)
    }
    syncAncestors(props.tree, sel)

  } else {
    // independent (default)
    sel.has(id) ? sel.delete(id) : sel.add(id)
  }

  emit('update:modelValue', [...sel])
}

// Flatten tree to map id -> label
function flattenTree(nodes, map = {}) {
  for (const n of nodes) {
    map[n.id] = n.label
    if (n.children) flattenTree(n.children, map)
  }
  return map
}

const flatMap = computed(() => flattenTree(props.tree))

// Cascade: parent is indeterminate when it has some (not all) selected descendants
const indeterminateIds = computed(() => {
  if (props.selectionStrategy !== 'cascade' || !props.multi) return new Set()
  const sel = new Set(Array.isArray(props.modelValue) ? props.modelValue : [])
  const result = new Set()
  function hasAny(n) { return sel.has(n.id) || (n.children || []).some(hasAny) }
  function check(list) {
    for (const n of list) {
      if (n.children?.length) { check(n.children); if (!sel.has(n.id) && hasAny(n)) result.add(n.id) }
    }
  }
  check(props.tree)
  return result
})

const selectedLabels = computed(() => {
  if (!props.modelValue) return []
  const ids = props.multi ? (Array.isArray(props.modelValue) ? props.modelValue : []) : [props.modelValue]
  // Cascade: only show top-level selected nodes (skip children whose parent is also selected)
  if (props.multi && props.selectionStrategy === 'cascade') {
    const selSet = new Set(ids)
    return ids
      .filter(id => { const p = findParentOf(id, props.tree); return p === null || p === undefined || !selSet.has(p.id) })
      .map(id => flatMap.value[id])
      .filter(Boolean)
  }
  return ids.map(id => flatMap.value[id]).filter(Boolean)
})

// Filter tree nodes by search
function filterNodes(nodes, q) {
  return nodes
    .map((n) => {
      const children = n.children ? filterNodes(n.children, q) : []
      const match = n.label.toLowerCase().includes(q)
      if (match || children.length > 0) return { ...n, children: children.length ? children : n.children }
      return null
    })
    .filter(Boolean)
}

const filteredTree = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? filterNodes(props.tree, q) : props.tree
})

function handleTriggerBlur(e) { emit('blur', e) }

function handleOutsideClick(e) {
  const insideTrigger = rootEl.value?.contains(e.target)
  const insidePanel = panelEl.value?.contains(e.target)
  if (!insideTrigger && !insidePanel) open.value = false
}

// Close + reposition on scroll so teleported panel never orphans
function handleScroll() {
  if (open.value) updateDropdownRect()
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleScroll)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)
})
</script>
