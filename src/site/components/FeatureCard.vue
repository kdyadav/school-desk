<template>
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/40 transition">
        <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
            <span class="text-lg" aria-hidden="true">{{ icon }}</span>
        </div>
        <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <slot>{{ description }}</slot>
        </p>
    </div>
</template>

<script setup>
defineProps({
    icon: { type: String, default: '✦' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
})
</script>
