<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="flex items-center gap-1" @mouseleave="hovered = 0">
      <button
        v-for="star in count"
        :key="star"
        type="button"
        :disabled="disabled || readonly"
        @mouseenter="hovered = star"
        @click="handleClick(star)"
        @blur="$emit('blur', $event)"
        class="focus:outline-none transition-transform duration-100 hover:scale-110 disabled:cursor-not-allowed"
        :aria-label="`Rate ${star} out of ${count}`"
      >
        <svg
          class="transition-colors duration-100"
          :class="[starSize, filledColor(star)]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </button>

      <!-- Clear button -->
      <button
        v-if="clearable && modelValue > 0 && !disabled && !readonly"
        type="button"
        @click="$emit('update:modelValue', 0)"
        class="ml-1 text-gray-400 hover:text-gray-600 text-xs underline focus:outline-none"
      >
        Clear
      </button>
    </div>

    <!-- Label for selected value -->
    <p v-if="labels && labels[modelValue - 1]" class="text-xs font-medium text-indigo-600">
      {{ labels[modelValue - 1] }}
    </p>

    <p v-if="error" class="text-xs text-red-600 flex items-center gap-1">
      <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  label:      { type: String,  default: '' },
  modelValue: { type: Number,  default: 0 },
  count:      { type: Number,  default: 5 },
  size:       { type: String,  default: 'md', validator: (v) => ['sm','md','lg'].includes(v) },
  clearable:  { type: Boolean, default: true },
  readonly:   { type: Boolean, default: false },
  disabled:   { type: Boolean, default: false },
  required:   { type: Boolean, default: false },
  error:      { type: String,  default: '' },
  hint:       { type: String,  default: '' },
  // Optional text label per rating, e.g. ['Poor','Fair','Good','Great','Excellent']
  labels:     { type: Array,   default: null },
})

const emit = defineEmits(['update:modelValue', 'blur'])

const hovered = ref(0)

const starSize = computed(() => ({ sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-9 h-9' }[props.size] || 'w-7 h-7'))

function filledColor(star) {
  const active = hovered.value || props.modelValue
  if (star <= active) return 'text-yellow-400'
  return 'text-gray-300'
}

function handleClick(star) {
  if (props.disabled || props.readonly) return
  emit('update:modelValue', props.modelValue === star ? 0 : star)
}
</script>

