<template>
    <footer class="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
            <div class="md:col-span-2">
                <div class="flex items-center gap-2.5">
                    <span class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                        sD
                    </span>
                    <span class="font-semibold text-slate-900 dark:text-white">{{ siteConfig.schoolName }}</span>
                </div>
                <p class="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                    {{ siteConfig.tagline }} A community of educators and learners committed to academic
                    excellence, character, and lifelong curiosity since {{ siteConfig.established }}.
                </p>
            </div>

            <div>
                <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Explore
                </h3>
                <ul class="mt-3 space-y-2 text-sm">
                    <li v-for="item in siteConfig.nav" :key="item.to">
                        <router-link
                            :to="item.to"
                            class="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300"
                        >
                            {{ item.label }}
                        </router-link>
                    </li>
                </ul>
            </div>

            <div>
                <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Visit us
                </h3>
                <address class="mt-3 not-italic text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <div v-for="line in siteConfig.contact.addressLines" :key="line">{{ line }}</div>
                    <div class="pt-2">{{ siteConfig.contact.phone }}</div>
                    <div>
                        <a :href="`mailto:${siteConfig.contact.email}`" class="hover:text-indigo-600 dark:hover:text-indigo-300">
                            {{ siteConfig.contact.email }}
                        </a>
                    </div>
                </address>
                <ul class="mt-4 flex gap-3 text-sm">
                    <li v-for="s in siteConfig.social" :key="s.label">
                        <a :href="s.href" class="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300">
                            {{ s.label }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="border-t border-slate-200 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div>© {{ year }} {{ siteConfig.schoolName }}. All rights reserved.</div>
                <div class="flex items-center gap-4">
                    <span>{{ siteConfig.contact.officeHours }}</span>
                    <router-link to="/login" class="hover:text-indigo-600 dark:hover:text-indigo-300">
                        Staff portal
                    </router-link>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { computed } from 'vue'
import { siteConfig } from '../siteConfig'

const year = computed(() => new Date().getFullYear())
</script>
