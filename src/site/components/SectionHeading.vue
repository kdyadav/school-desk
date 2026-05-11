<template>
    <div :class="['max-w-2xl', center ? 'mx-auto text-center' : '']">
        <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            {{ eyebrow }}
        </p>
        <h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            <slot name="title">{{ title }}</slot>
        </h2>
        <p v-if="$slots.default || description" class="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            <slot>{{ description }}</slot>
        </p>
    </div>
</template>

<script setup>
defineProps({
    eyebrow: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    center: { type: Boolean, default: false },
})
</script>
