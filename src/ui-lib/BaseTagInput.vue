<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <div
      :class="[
        'flex flex-wrap gap-2 min-h-[46px] w-full px-3 py-2 border rounded-lg transition-colors duration-200 cursor-text',
        isFocused
          ? 'border-indigo-500 ring-1 ring-indigo-500'
          : error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white',
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
      ]"
      @click="inputRef?.focus()"
    >
      <!-- Tag chips -->
      <span
        v-for="(tag, idx) in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
      >
        {{ tag }}
        <button
          v-if="!disabled"
          type="button"
          @click.stop="removeTag(idx)"
          class="ml-0.5 text-indigo-500 hover:text-indigo-700 focus:outline-none"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </span>

      <!-- Input -->
      <input
        ref="inputRef"
        v-model="inputVal"
        type="text"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        :disabled="disabled"
        :maxlength="maxTagLength"
        @keydown="handleKeydown"
        @focus="isFocused = true"
        @blur="handleBlur"
        class="flex-1 min-w-[120px] outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
      />
    </div>

    <p class="text-xs text-gray-400">Press <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> or <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">{{ separator }}</kbd> to add a tag</p>

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
import { ref } from 'vue'

const props = defineProps({
  label:        { type: String,  default: '' },
  modelValue:   { type: Array,   default: () => [] },
  placeholder:  { type: String,  default: 'Add tags...' },
  separator:    { type: String,  default: ',' },
  maxTagLength: { type: Number,  default: 32 },
  maxTags:      { type: Number,  default: null },
  error:        { type: String,  default: '' },
  hint:         { type: String,  default: '' },
  disabled:     { type: Boolean, default: false },
  required:     { type: Boolean, default: false },
  allowDupes:   { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'blur'])

const inputRef = ref(null)
const inputVal = ref('')
const isFocused = ref(false)

function addTag() {
  const tag = inputVal.value.trim()
  if (!tag) return
  if (!props.allowDupes && props.modelValue.includes(tag)) { inputVal.value = ''; return }
  if (props.maxTags && props.modelValue.length >= props.maxTags) return
  emit('update:modelValue', [...props.modelValue, tag])
  inputVal.value = ''
}

function removeTag(idx) {
  const next = [...props.modelValue]
  next.splice(idx, 1)
  emit('update:modelValue', next)
}

function handleKeydown(e) {
  if (e.key === 'Enter' || e.key === props.separator) {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && !inputVal.value && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}

function handleBlur(e) {
  isFocused.value = false
  if (inputVal.value.trim()) addTag()
  emit('blur', e)
}
</script>

