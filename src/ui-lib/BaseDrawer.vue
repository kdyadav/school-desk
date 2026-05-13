<template>
    <Teleport to="body">
        <transition name="drawer-fade">
            <div v-if="modelValue" class="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm"
                @click="closeOnBackdrop && $emit('update:modelValue', false)" />
        </transition>
        <transition name="drawer-slide">
            <aside v-if="modelValue" :class="[
                'fixed top-0 right-0 z-50 h-full bg-white shadow-2xl flex flex-col',
                widthClass,
            ]">
                <header class="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <slot name="header">
                        <div class="min-w-0">
                            <h3 class="text-base sm:text-lg font-semibold text-gray-900 truncate">{{ title }}</h3>
                            <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5 truncate">{{ subtitle }}</p>
                        </div>
                    </slot>
                    <button @click="$emit('update:modelValue', false)"
                        class="text-gray-400 hover:text-gray-600 p-1 rounded flex-shrink-0">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div class="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5">
                    <slot />
                </div>

                <footer v-if="$slots.footer"
                    class="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2 sm:gap-3 justify-end flex-shrink-0">
                    <slot name="footer" />
                </footer>
            </aside>
        </transition>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    width: { type: String, default: 'md' }, // sm | md | lg
    closeOnBackdrop: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])

const widthClass = computed(() => ({
    sm: 'w-full sm:max-w-sm',
    md: 'w-full sm:max-w-md',
    lg: 'w-full sm:max-w-xl',
}[props.width] || 'w-full sm:max-w-md'))
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
    transition: opacity 0.2s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
    opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
    transition: transform 0.25s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
    transform: translateX(100%);
}
</style>
