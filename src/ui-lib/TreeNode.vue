<template>
  <div>
    <div :class="[
      'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors duration-100 text-sm',
      isSelected ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-700',
    ]" :style="{ paddingLeft: `${12 + depth * 20}px` }" @click="handleClick">
      <!-- Expand / collapse chevron for nodes with children -->
      <button v-if="node.children && node.children.length" type="button" @click.stop="$emit('toggle-expand', node.id)"
        class="p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none">
        <svg class="w-3.5 h-3.5 transition-transform duration-150" :class="{ 'rotate-90': isExpanded }" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <!-- Indent spacer when leaf node -->
      <span v-else class="w-4 flex-shrink-0" />

      <!-- Checkbox for multi-select (hidden on parent nodes in leaf-only mode) -->
      <div v-if="multi && showCheckbox" :class="[
        'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-100',
        isSelected
          ? 'bg-indigo-600 border-indigo-600'
          : isIndeterminate
            ? 'bg-indigo-50 border-indigo-400'
            : 'border-gray-300',
      ]">
        <!-- Checked -->
        <svg v-if="isSelected" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
        <!-- Indeterminate dash -->
        <svg v-else-if="isIndeterminate" class="w-2.5 h-2.5 text-indigo-600" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12h14" />
        </svg>
      </div>

      <span class="flex-1 leading-5">{{ node.label }}</span>

      <!-- Selected dot for single-select -->
      <div v-if="!multi && isSelected" class="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
    </div>

    <!-- Recursive children -->
    <template v-if="isExpanded && node.children && node.children.length">
      <TreeNode v-for="child in node.children" :key="child.id" :node="child" :selected="selected" :multi="multi"
        :selection-strategy="selectionStrategy" :indeterminate-ids="indeterminateIds" :expanded-ids="expandedIds"
        :depth="depth + 1" @toggle-expand="$emit('toggle-expand', $event)" @select="$emit('select', $event)" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: { type: Object, required: true },
  selected: { type: [Array, String, Number], default: null },
  multi: { type: Boolean, default: false },
  // 'independent' | 'leaf-only' | 'cascade'
  selectionStrategy: { type: String, default: 'independent' },
  indeterminateIds: { type: Object, default: () => new Set() },
  expandedIds: { type: Object, default: () => new Set() },
  depth: { type: Number, default: 0 },
})

const emit = defineEmits(['toggle-expand', 'select'])

const isParent = computed(() => !!(props.node.children?.length))
const isExpanded = computed(() => props.expandedIds.has(props.node.id))
const isSelected = computed(() => {
  if (props.multi) return Array.isArray(props.selected) && props.selected.includes(props.node.id)
  return props.selected === props.node.id
})
// Cascade indeterminate — computed externally and passed down
const isIndeterminate = computed(() => props.indeterminateIds.has(props.node.id))
// leaf-only: hide checkbox on parent nodes
const showCheckbox = computed(() => props.selectionStrategy !== 'leaf-only' || !isParent.value)

function handleClick() {
  if (isParent.value) {
    emit('toggle-expand', props.node.id)
    // leaf-only: parent nodes cannot be selected
    if (props.selectionStrategy === 'leaf-only') return
  }
  emit('select', props.node.id)
}
</script>
