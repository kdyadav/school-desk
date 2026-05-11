<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label v-if="label" class="block text-sm font-medium text-gray-700">
        {{ label }}
        <span v-if="required" class="text-red-500 ml-0.5">*</span>
      </label>
      <span class="text-sm font-semibold text-indigo-600 tabular-nums">{{ displayValue }}</span>
    </div>

    <div class="relative py-1">
      <!-- Track fill -->
      <div class="relative h-2 rounded-full bg-gray-200">
        <div
          class="absolute h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
          :style="{ width: fillPercent + '%' }"
        />
      </div>
      <!-- Range input -->
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        :disabled="disabled"
        @input="$emit('update:modelValue', Number($event.target.value))"
        @blur="$emit('blur', $event)"
        :class="['absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1', disabled ? 'cursor-not-allowed' : '']"
      />
      <!-- Thumb -->
      <div
        class="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-2 border-indigo-600 shadow-md pointer-events-none transition-all"
        :style="{ left: `calc(${fillPercent}% - 10px)` }"
      />
    </div>

    <!-- Min/Max labels -->
    <div class="flex justify-between text-xs text-gray-400 select-none">
      <span>{{ prefix }}{{ min }}{{ suffix }}</span>
      <span v-if="showTicks" class="flex gap-2">
        <span v-for="tick in ticks" :key="tick" class="text-gray-300">|</span>
      </span>
      <span>{{ prefix }}{{ max }}{{ suffix }}</span>
    </div>

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
import { computed } from 'vue'

const props = defineProps({
  label:      { type: String,  default: '' },
  modelValue: { type: Number,  default: 0 },
  min:        { type: Number,  default: 0 },
  max:        { type: Number,  default: 100 },
  step:       { type: Number,  default: 1 },
  prefix:     { type: String,  default: '' },
  suffix:     { type: String,  default: '' },
  error:      { type: String,  default: '' },
  hint:       { type: String,  default: '' },
  disabled:   { type: Boolean, default: false },
  required:   { type: Boolean, default: false },
  showTicks:  { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'blur'])

const fillPercent = computed(() => ((props.modelValue - props.min) / (props.max - props.min)) * 100)
const displayValue = computed(() => `${props.prefix}${props.modelValue}${props.suffix}`)
const ticks = computed(() => {
  const count = Math.floor((props.max - props.min) / props.step)
  return Array.from({ length: count - 1 }, (_, i) => props.min + props.step * (i + 1))
})
</script>

