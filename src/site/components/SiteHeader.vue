<template>
    <header class="sticky top-0 z-30 bg-white/85 dark:bg-slate-950/85 backdrop-blur border-b border-slate-200/70 dark:border-slate-800/70">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="h-16 flex items-center justify-between gap-4">
                <router-link to="/" class="flex items-center gap-2.5 group">
                    <span class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-sm">
                        sD
                    </span>
                    <span class="font-semibold text-slate-900 dark:text-white tracking-tight">
                        {{ siteConfig.shortName }}
                    </span>
                </router-link>

                <nav class="hidden md:flex items-center gap-1">
                    <router-link
                        v-for="item in siteConfig.nav"
                        :key="item.to"
                        :to="item.to"
                        class="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors"
                        active-class="text-indigo-700 dark:text-indigo-300"
                        exact-active-class="text-indigo-700 dark:text-indigo-300"
                    >
                        {{ item.label }}
                    </router-link>
                </nav>

                <div class="flex items-center gap-2">
                    <router-link
                        :to="auth.isAuthenticated ? '/app' : '/login'"
                        class="hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
                    >
                        {{ auth.isAuthenticated ? 'Open dashboard' : 'Sign in' }}
                    </router-link>
                    <button
                        type="button"
                        class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        :aria-expanded="open"
                        aria-controls="site-mobile-nav"
                        aria-label="Toggle navigation"
                        @click="open = !open"
                    >
                        <svg v-if="!open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>
            </div>

            <div v-if="open" id="site-mobile-nav" class="md:hidden pb-4 flex flex-col gap-1">
                <router-link
                    v-for="item in siteConfig.nav"
                    :key="item.to"
                    :to="item.to"
                    class="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    active-class="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                    exact-active-class="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                    @click="open = false"
                >
                    {{ item.label }}
                </router-link>
                <router-link
                    :to="auth.isAuthenticated ? '/app' : '/login'"
                    class="sm:hidden mt-1 px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white text-center"
                    @click="open = false"
                >
                    {{ auth.isAuthenticated ? 'Open dashboard' : 'Sign in' }}
                </router-link>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { siteConfig } from '../siteConfig'

const auth = useAuthStore()
const route = useRoute()
const open = ref(false)

watch(() => route.fullPath, () => { open.value = false })
</script>
