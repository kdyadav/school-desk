<template>
  <div class="space-y-1">
    <label class="inline-flex items-center justify-between gap-4 w-full cursor-pointer group" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
      <div v-if="label || description">
        <span v-if="label" class="text-sm font-medium text-gray-700">
          {{ label }}
          <span v-if="required" class="text-red-500 ml-0.5">*</span>
        </span>
        <p v-if="description" class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
      </div>

      <div class="relative flex-shrink-0">
        <input
          type="checkbox"
          :checked="modelValue"
          :disabled="disabled"
          @change="$emit('update:modelValue', $event.target.checked)"
          @blur="$emit('blur', $event)"
          class="sr-only peer"
        />
        <!-- Track -->
        <div :class="[
          'w-11 h-6 rounded-full transition-colors duration-200',
          modelValue ? 'bg-indigo-600' : error ? 'bg-red-200' : 'bg-gray-300 group-hover:bg-gray-400',
        ]"/>
        <!-- Thumb -->
        <div :class="[
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
          modelValue ? 'translate-x-5' : 'translate-x-0',
        ]"/>
      </div>
    </label>
    <!-- When label is on the left (slot for status text) -->
    <div v-if="showStatus" class="text-xs font-medium" :class="modelValue ? 'text-indigo-600' : 'text-gray-400'">
      {{ modelValue ? activeLabel : inactiveLabel }}
    </div>
    <p v-if="error" class="text-xs text-red-600 flex items-center gap-1">
      <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  label:         { type: String,  default: '' },
  description:   { type: String,  default: '' },
  modelValue:    { type: Boolean, default: false },
  error:         { type: String,  default: '' },
  disabled:      { type: Boolean, default: false },
  required:      { type: Boolean, default: false },
  showStatus:    { type: Boolean, default: false },
  activeLabel:   { type: String,  default: 'Enabled' },
  inactiveLabel: { type: String,  default: 'Disabled' },
})

defineEmits(['update:modelValue', 'blur'])
</script>

