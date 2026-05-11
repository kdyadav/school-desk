<template>
    <div class="space-y-1">
        <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">{{ label }}</label>
        <input :id="id" :name="name" :type="type" :placeholder="placeholder" :autocomplete="autocomplete"
            :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur', $event)"
            :class="inputClasses" :disabled="disabled" />
        <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    id: { type: String, default: null },
    name: { type: String, default: '' },
    label: { type: String, default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    autocomplete: { type: String, default: 'off' },
    modelValue: { type: [String, Number], default: '' },
    error: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
})

const sizeClasses = {
    sm: 'pl-3 pr-2 py-1.5 text-sm',
    md: 'pl-4 pr-3 py-3',
}

const inputClasses = computed(() => {
    const sizing = sizeClasses[props.size] || sizeClasses.md
    const base = `block w-full ${sizing} border rounded-lg transition-colors duration-200 `
    const state = props.error
        ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 '
        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white '

    return `${base}${state}${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
})
</script>
