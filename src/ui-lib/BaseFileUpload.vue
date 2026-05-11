<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Drop zone -->
    <div
      :class="[
        'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer',
        isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="fileInput?.click()"
    >
      <input ref="fileInput" type="file" :multiple="multiple" :accept="accept" :disabled="disabled" class="hidden" @change="handleChange"/>
      <div class="flex flex-col items-center gap-2">
        <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700">
            <span class="text-indigo-600">Click to upload</span> or drag & drop
          </p>
          <p v-if="accept" class="text-xs text-gray-500 mt-1">{{ accept }}</p>
          <p v-if="maxSize" class="text-xs text-gray-500">Max {{ maxSize }} MB</p>
        </div>
      </div>
    </div>

    <!-- File list -->
    <ul v-if="files.length > 0" class="space-y-2">
      <li
        v-for="(file, idx) in files"
        :key="idx"
        class="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
      >
        <span class="flex-shrink-0 text-indigo-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </span>
        <div class="flex-1 min-w-0">
          <p class="truncate font-medium text-gray-700">{{ file.name }}</p>
          <p class="text-xs text-gray-400">{{ formatSize(file.size) }}</p>
        </div>
        <button type="button" @click="removeFile(idx)" class="text-gray-400 hover:text-red-500 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </li>
    </ul>

    <p v-if="error" class="text-xs text-red-600 flex items-center gap-1">
      <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  label:    { type: String,  default: '' },
  error:    { type: String,  default: '' },
  accept:   { type: String,  default: '' },
  maxSize:  { type: Number,  default: null },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'blur'])

const fileInput = ref(null)
const isDragging = ref(false)
const files = ref([])

function handleChange(e) {
  addFiles(Array.from(e.target.files || []))
  e.target.value = ''
}

function handleDrop(e) {
  isDragging.value = false
  addFiles(Array.from(e.dataTransfer.files || []))
}

function addFiles(newFiles) {
  const updated = props.multiple ? [...files.value, ...newFiles] : newFiles.slice(0, 1)
  files.value = updated
  emit('update:modelValue', props.multiple ? updated : updated[0] || null)
}

function removeFile(idx) {
  files.value.splice(idx, 1)
  emit('update:modelValue', props.multiple ? [...files.value] : files.value[0] || null)
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

