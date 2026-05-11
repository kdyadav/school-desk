<template>
  <div class="space-y-1">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <select
        :id="id"
        :name="name"
        :disabled="disabled"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        :class="selectClasses"
      >
        <option v-if="placeholder" value="" disabled :selected="!modelValue">{{ placeholder }}</option>

        <!-- Grouped options -->
        <template v-if="hasGroups">
          <optgroup v-for="group in options" :key="group.label" :label="group.label">
            <option v-for="opt in group.options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
              {{ opt.label }}
            </option>
          </optgroup>
        </template>

        <!-- Flat options -->
        <template v-else>
          <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
            {{ opt.label }}
          </option>
        </template>
      </select>
      <!-- Custom chevron -->
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
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
  id:          { type: String,  default: null },
  name:        { type: String,  default: '' },
  label:       { type: String,  default: '' },
  placeholder: { type: String,  default: 'Select an option' },
  modelValue:  { type: [String, Number], default: '' },
  // Flat: [{ label, value, disabled? }]
  // Grouped: [{ label, options: [{ label, value, disabled? }] }]
  options:     { type: Array, default: () => [] },
  error:       { type: String,  default: '' },
  hint:        { type: String,  default: '' },
  disabled:    { type: Boolean, default: false },
  required:    { type: Boolean, default: false },
  size:        { type: String,  default: 'md' },
})

defineEmits(['update:modelValue', 'blur'])

const hasGroups = computed(() => props.options.length > 0 && props.options[0]?.options !== undefined)

const sizeClasses = {
  sm: 'pl-3 pr-9 py-1.5 text-sm',
  md: 'pl-4 pr-10 py-3 text-sm',
}

const selectClasses = computed(() => {
  const sizing = sizeClasses[props.size] || sizeClasses.md
  const base  = `block w-full ${sizing} border rounded-lg appearance-none transition-colors duration-200 `
  const state = props.error
    ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 focus:outline-none focus:ring-1 '
    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white focus:outline-none focus:ring-1 '
  return `${base}${state}${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
})
</script>

