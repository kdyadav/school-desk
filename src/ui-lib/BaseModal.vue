<template>
    <Teleport to="body">
        <transition name="modal">
            <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="closeOnBackdrop && $emit('update:modelValue', false)">
                <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
                <div :class="[
                    'relative bg-white rounded-2xl shadow-xl w-full overflow-hidden',
                    sizeClass,
                ]">
                    <div v-if="title || $slots.header"
                        class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <slot name="header">
                            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                        </slot>
                        <button @click="$emit('update:modelValue', false)"
                            class="text-gray-400 hover:text-gray-600 p-1 rounded">
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="px-6 py-5">
                        <slot />
                    </div>

                    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    size: { type: String, default: 'md' }, // sm | md | lg | xl
    closeOnBackdrop: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])

const sizeClass = computed(() => ({
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
}[props.size] || 'max-w-md'))
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>
