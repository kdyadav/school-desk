<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <div :class="['flex flex-wrap gap-3', layout === 'horizontal' ? 'flex-row' : 'flex-col']">
      <label
        v-for="option in options"
        :key="option.value"
        class="inline-flex items-center gap-2 cursor-pointer group"
        :class="{ 'opacity-50 cursor-not-allowed': disabled || option.disabled }"
      >
        <div class="relative flex-shrink-0">
          <input
            type="checkbox"
            :value="option.value"
            :checked="modelValue.includes(option.value)"
            :disabled="disabled || option.disabled"
            @change="handleChange(option.value, $event.target.checked)"
            @blur="$emit('blur', $event)"
            class="sr-only"
          />
          <div :class="[
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150',
            modelValue.includes(option.value)
              ? 'bg-indigo-600 border-indigo-600'
              : error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white group-hover:border-indigo-400',
          ]">
            <svg v-if="modelValue.includes(option.value)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>
        <span class="text-sm text-gray-700 leading-5">{{ option.label }}</span>
      </label>
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
const props = defineProps({
  label:      { type: String,  default: '' },
  modelValue: { type: Array,   default: () => [] },
  // [{ label, value, disabled? }]
  options:    { type: Array,   default: () => [] },
  error:      { type: String,  default: '' },
  hint:       { type: String,  default: '' },
  disabled:   { type: Boolean, default: false },
  required:   { type: Boolean, default: false },
  layout:     { type: String,  default: 'vertical', validator: (v) => ['vertical', 'horizontal'].includes(v) },
})

const emit = defineEmits(['update:modelValue', 'blur'])

function handleChange(value, checked) {
  const next = checked
    ? [...props.modelValue, value]
    : props.modelValue.filter((v) => v !== value)
  emit('update:modelValue', next)
}
</script>

