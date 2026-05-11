<template>
  <div class="space-y-1">
    <label class="inline-flex items-start gap-3 cursor-pointer group" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
      <div class="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          :id="id"
          :name="name"
          :checked="modelValue"
          :disabled="disabled"
          :value="value"
          @change="$emit('update:modelValue', $event.target.checked)"
          @blur="$emit('blur', $event)"
          class="sr-only peer"
        />
        <!-- Custom checkbox box -->
        <div :class="[
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150',
          modelValue
            ? 'bg-indigo-600 border-indigo-600'
            : error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white group-hover:border-indigo-400',
        ]">
          <svg v-if="modelValue" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
      </div>
      <div>
        <span v-if="label" class="text-sm font-medium text-gray-700 leading-5">{{ label }}</span>
        <p v-if="description" class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
      </div>
    </label>
    <p v-if="error" class="text-xs text-red-600 flex items-center gap-1 pl-8">
      <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  id:          { type: String,  default: null },
  name:        { type: String,  default: '' },
  label:       { type: String,  default: '' },
  description: { type: String,  default: '' },
  modelValue:  { type: Boolean, default: false },
  value:       { type: [String, Number, Boolean], default: null },
  error:       { type: String,  default: '' },
  disabled:    { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'blur'])
</script>

