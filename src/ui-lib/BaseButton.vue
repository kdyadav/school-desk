<template>
    <button :type="type" :disabled="isDisabled" @click="handleClick" :class="buttonClasses">
        <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="h-4 w-4 animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ loadingText }}</span>
        </span>
        <span v-else class="flex items-center justify-center gap-2">
            <slot />
        </span>
    </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    type: { type: String, default: 'button' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    loadingText: { type: String, default: 'Loading...' },
    fullWidth: { type: Boolean, default: true },
})

const emit = defineEmits(['click'])

const isDisabled = computed(() => props.loading || props.disabled)

const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
}

const variantClasses = {
    primary:
        'bg-indigo-600 text-white border border-indigo-600 ' +
        'hover:bg-indigo-700 hover:border-indigo-700 ' +
        'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ' +
        'shadow-sm',
    secondary:
        'bg-white text-gray-700 border border-gray-300 ' +
        'hover:bg-gray-50 hover:border-gray-400 ' +
        'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ' +
        'shadow-sm',
    ghost:
        'bg-transparent text-indigo-600 border border-transparent ' +
        'hover:bg-indigo-50 hover:border-indigo-100 ' +
        'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
    danger:
        'bg-red-600 text-white border border-red-600 ' +
        'hover:bg-red-700 hover:border-red-700 ' +
        'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ' +
        'shadow-sm',
    link:
        'bg-transparent text-indigo-600 border-0 ' +
        'hover:underline focus-visible:underline',
    'link-danger':
        'bg-transparent text-red-600 border-0 ' +
        'hover:underline focus-visible:underline',
    'link-muted':
        'bg-transparent text-gray-500 border-0 ' +
        'hover:underline focus-visible:underline',
}

const isLinkVariant = computed(() =>
    ['link', 'link-danger', 'link-muted'].includes(props.variant)
)

const linkSizeClasses = {
    sm: 'px-0 py-0 text-xs',
    md: 'px-0 py-0 text-sm',
    lg: 'px-0 py-0 text-base',
}

const buttonClasses = computed(() => [
    // layout
    'inline-flex items-center justify-center',
    props.fullWidth ? 'w-full' : '',
    // shape & typography
    isLinkVariant.value ? 'font-medium' : 'rounded-md font-semibold tracking-wide',
    'transition-colors duration-150 outline-none',
    // size — link variants drop padding for inline use
    isLinkVariant.value
        ? (linkSizeClasses[props.size] ?? linkSizeClasses.md)
        : (sizeClasses[props.size] ?? sizeClasses.md),
    // variant
    variantClasses[props.variant] ?? variantClasses.primary,
    // state
    isDisabled.value ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
])

function handleClick(event) {
    if (isDisabled.value) return
    emit('click', event)
}
</script>
