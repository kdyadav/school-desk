<template>
  <div class="space-y-1">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <textarea
        :id="id"
        :name="name"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :maxlength="maxlength"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        :class="textareaClasses"
      />
      <span v-if="maxlength" class="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
        {{ (modelValue || '').length }}/{{ maxlength }}
      </span>
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
  placeholder: { type: String,  default: '' },
  modelValue:  { type: String,  default: '' },
  error:       { type: String,  default: '' },
  hint:        { type: String,  default: '' },
  rows:        { type: Number,  default: 4 },
  maxlength:   { type: Number,  default: null },
  disabled:    { type: Boolean, default: false },
  required:    { type: Boolean, default: false },
  resize:      { type: String,  default: 'vertical', validator: (v) => ['none','vertical','horizontal','both'].includes(v) },
})

defineEmits(['update:modelValue', 'blur'])

const textareaClasses = computed(() => {
  const resize = { none: 'resize-none', vertical: 'resize-y', horizontal: 'resize-x', both: 'resize' }
  const base  = `block w-full pl-4 pr-3 py-3 border rounded-lg text-sm transition-colors duration-200 ${resize[props.resize] || 'resize-y'} `
  const state = props.error
    ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 focus:outline-none focus:ring-1 '
    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white focus:outline-none focus:ring-1 '
  return `${base}${state}${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
})
</script>

