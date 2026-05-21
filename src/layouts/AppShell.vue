<template>
    <div
        class="h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 overflow-hidden max-w-full antialiased">
        <!-- Mobile backdrop -->
        <transition name="drawer-fade">
            <div v-if="mobileNavOpen" class="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
                @click="mobileNavOpen = false" />
        </transition>

        <!-- Sidebar -->
        <aside :class="[
            'flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden',
            'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 lg:static lg:flex-shrink-0 lg:transition-[width]',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            collapsed ? 'lg:w-[68px]' : 'lg:w-64',
        ]">
            <!-- Workspace header -->
            <div :class="[
                'border-b border-slate-200 dark:border-slate-800',
                collapsed
                    ? 'flex flex-col items-center gap-1.5 py-2.5 px-2'
                    : 'h-14 flex items-center px-3 gap-2.5',
            ]">
                <div class="w-9 h-9 flex-shrink-0">
                    <BrandMark size="md" />
                </div>
                <div v-if="!collapsed" class="flex-1 min-w-0">
                    <div class="text-[13px] font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate">
                        {{ school.profile?.shortName || school.profile?.schoolName || 'skoolDesk' }}
                    </div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                        Administration
                    </div>
                </div>
                <button v-if="!collapsed" @click="collapsed = true" title="Close sidebar"
                    class="hidden lg:inline-flex p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 flex-shrink-0">
                    <span class="w-5 h-5 block" v-html="iconSvg('sidebar')" />
                </button>
                <button v-else @click="collapsed = false" title="Open sidebar"
                    class="hidden lg:inline-flex p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 flex-shrink-0">
                    <span class="w-5 h-5 block" v-html="iconSvg('sidebar')" />
                </button>
                <button v-if="!collapsed" @click="mobileNavOpen = false" title="Close menu"
                    class="lg:hidden p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 flex-shrink-0">
                    <span class="w-5 h-5 block" v-html="iconSvg('close')" />
                </button>
            </div>

            <nav class="flex-1 overflow-y-auto py-2">
                <div v-for="(group, gi) in visibleGroups" :key="group.key" class="mb-0.5">
                    <button v-if="group.label && !collapsed" @click="toggleGroup(group)"
                        class="w-full flex items-center justify-between px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                        <span class="truncate">{{ group.label }}</span>
                        <span class="w-3 h-3 flex items-center justify-center transition-transform duration-150"
                            :class="isGroupOpen(group) ? '' : '-rotate-90'" v-html="iconSvg('chevron-down')" />
                    </button>
                    <div v-else-if="group.label && collapsed && gi > 0"
                        class="mx-3 my-1.5 border-t border-slate-100 dark:border-slate-800" />
                    <template v-if="collapsed || isGroupOpen(group)">
                        <router-link v-for="item in group.items" :key="item.to" :to="item.to" custom
                            v-slot="{ navigate, isActive, isExactActive }">
                            <button @click="navigate" :title="collapsed ? item.label : null" :class="[
                                'group relative w-full flex items-center text-[13px] transition-colors',
                                collapsed
                                    ? 'justify-center mx-2 my-0.5 py-2 rounded-md'
                                    : 'pl-4 pr-3 py-1.5 my-px',
                                (item.to === '/app' ? isExactActive : isActive)
                                    ? (collapsed
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium')
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
                            ]">
                                <span v-if="!collapsed && (item.to === '/' ? isExactActive : isActive)"
                                    class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r" />
                                <span class="w-5 h-5 flex items-center justify-center flex-shrink-0"
                                    v-html="iconSvg(item.icon)" />
                                <span v-if="!collapsed" class="ml-3 truncate">{{ item.label }}</span>
                            </button>
                        </router-link>
                    </template>
                </div>
            </nav>

            <!-- Footer: user menu -->
            <div class="border-t border-slate-200 dark:border-slate-800">
                <div class="relative" data-user-menu>
                    <button @click="userMenuOpen = !userMenuOpen"
                        :title="collapsed ? `${auth.user?.name} (${auth.role})` : null" :class="[
                            'w-full flex items-center transition-colors',
                            collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-2.5 py-2 text-left',
                            'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                        ]">
                        <div
                            class="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-semibold text-xs shadow-sm flex-shrink-0">
                            {{ initials }}
                        </div>
                        <div v-if="!collapsed" class="flex-1 min-w-0 leading-tight">
                            <div class="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">
                                {{ auth.user?.name }}
                            </div>
                            <div class="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                                {{ auth.role }}
                            </div>
                        </div>
                        <span v-if="!collapsed" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                            v-html="iconSvg('chevron-up')" />
                    </button>

                    <div v-if="userMenuOpen" :class="[
                        'absolute w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-30',
                        collapsed ? 'left-full bottom-0 ml-2' : 'left-2 right-2 bottom-full mb-2 w-auto',
                    ]">
                        <div class="px-3 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {{ auth.user?.name }}
                            </p>
                            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ auth.user?.email }}</p>
                            <span :class="roleBadgeClass"
                                class="mt-1.5 inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-wider rounded font-semibold">
                                {{ auth.role }}
                            </span>
                        </div>
                        <router-link to="/app/profile" @click="userMenuOpen = false"
                            class="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60">
                            <span class="w-4 h-4 text-slate-400" v-html="iconSvg('user-circle')" />
                            Profile
                        </router-link>
                        <div class="my-1 border-t border-slate-100 dark:border-slate-700" />
                        <button @click="handleLogout"
                            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60">
                            <span class="w-4 h-4 text-slate-400" v-html="iconSvg('logout')" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main column -->
        <div class="flex-1 flex flex-col min-w-0">
            <!-- Top bar -->
            <header
                class="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-5 gap-2 sm:gap-4">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <!-- Mobile hamburger -->
                    <button @click="mobileNavOpen = true" title="Open menu"
                        class="lg:hidden p-2 -ml-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 flex-shrink-0">
                        <span class="w-5 h-5 block" v-html="iconSvg('menu')" />
                    </button>
                    <!-- Mobile brand (sidebar logo lives in the drawer) -->
                    <router-link to="/app" class="lg:hidden flex items-center gap-2 min-w-0" title="Home">
                        <BrandMark size="sm" />
                        <span class="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {{ school.profile?.shortName || school.profile?.schoolName || 'skoolDesk' }}
                        </span>
                    </router-link>
                    <!-- Breadcrumbs (desktop only) -->
                    <nav class="hidden lg:flex items-center gap-1.5 min-w-0 text-sm">
                        <template v-for="(crumb, i) in breadcrumbs" :key="i">
                            <span v-if="i > 0"
                                class="text-slate-300 dark:text-slate-600 w-3 h-3 flex items-center justify-center flex-shrink-0"
                                v-html="iconSvg('chevron-right')" />
                            <span
                                :class="['truncate', i === breadcrumbs.length - 1 ? 'text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-500 dark:text-slate-400']">
                                {{ crumb }}
                            </span>
                        </template>
                    </nav>
                </div>

                <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <!-- Page actions slot (filled via <Teleport to="#page-actions"> from pages) -->
                    <div id="page-actions" class="flex items-center gap-2"></div>

                    <div v-if="hasPageActions" class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                    <!-- Command palette trigger -->
                    <button @click="showPalette" :title="`Quick search (${modKeyLabel}+K)`"
                        class="hidden md:flex items-center gap-2 w-56 lg:w-64 pl-2.5 pr-1.5 py-1.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-500 dark:hover:text-slate-400 transition-colors">
                        <span class="w-4 h-4 flex-shrink-0" v-html="iconSvg('search')" />
                        <span class="flex-1 text-left">Quick search…</span>
                        <kbd
                            class="px-1.5 py-0.5 text-[10px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-slate-500 dark:text-slate-400">
                            {{ modKeyLabel }}K
                        </kbd>
                    </button>
                    <button @click="showPalette" title="Quick search"
                        class="md:hidden p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200">
                        <span class="w-5 h-5 block" v-html="iconSvg('search')" />
                    </button>

                    <!-- Theme toggle -->
                    <button @click="toggleTheme" :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
                        class="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200">
                        <span class="w-5 h-5 block" v-html="theme === 'dark' ? iconSvg('sun') : iconSvg('moon')" />
                    </button>

                    <!-- Notifications -->
                    <button title="Notifications"
                        class="relative p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200">
                        <span class="w-5 h-5 block" v-html="iconSvg('bell')" />
                    </button>
                </div>
            </header>

            <main class="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 lg:p-6">
                <router-view />
            </main>
        </div>

        <CommandPalette />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSchoolStore } from '../stores/school'
import { navGroups } from './navConfig'
import { useTheme } from '../composables/useTheme'
import { useCommandPalette } from '../composables/useCommandPalette'
import CommandPalette from './CommandPalette.vue'
import BrandMark from '../components/BrandMark.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const school = useSchoolStore()

const { theme, toggle: toggleTheme } = useTheme()
const { show: showPalette } = useCommandPalette()

const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || '')
const modKeyLabel = isMac ? '⌘' : 'Ctrl '

const hasPageActions = ref(false)
let pageActionsObserver = null

const SIDEBAR_STORAGE_KEY = 'sidebar.collapsed'
const collapsed = ref((() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1' } catch { return false }
})())
watch(collapsed, (v) => {
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, v ? '1' : '0') } catch { /* ignore */ }
})

const userMenuOpen = ref(false)
const mobileNavOpen = ref(false)
// Close mobile drawer whenever the route changes
watch(() => route.fullPath, () => { mobileNavOpen.value = false })

const visibleGroups = computed(() =>
    navGroups
        .map((g) => ({
            ...g,
            items: g.items.filter((it) => !it.roles || auth.hasRole(it.roles)),
        }))
        .filter((g) => g.items.length > 0)
)

const GROUPS_STORAGE_KEY = 'sidebar.groups.collapsed'
const collapsedGroups = ref(loadCollapsedGroups())

function loadCollapsedGroups() {
    try {
        const raw = localStorage.getItem(GROUPS_STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

watch(collapsedGroups, (val) => {
    try {
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(val))
    } catch { /* ignore */ }
}, { deep: true })

const isGroupOpen = (group) => {
    return !group.label || !collapsedGroups.value[group.key]
}

const toggleGroup = (group) => {
    if (!group.label) return
    collapsedGroups.value = {
        ...collapsedGroups.value,
        [group.key]: !collapsedGroups.value[group.key],
    }
}

const pageTitle = computed(() => route.meta?.title || route.name || 'Dashboard')

const breadcrumbs = computed(() => {
    const title = pageTitle.value
    const path = route.path
    for (const g of navGroups) {
        if (g.items.some((it) => it.to === path)) {
            return g.label ? [g.label, title] : [title]
        }
    }
    return [title]
})

const initials = computed(() => {
    const n = auth.user?.name || auth.user?.email || '?'
    return n.split(/[\s.@]/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('')
})

const roleBadgeClass = computed(() => ({
    owner: 'bg-rose-100 text-rose-700',
    admin: 'bg-violet-100 text-violet-700',
    teacher: 'bg-blue-100 text-blue-700',
    student: 'bg-emerald-100 text-emerald-700',
    parent: 'bg-amber-100 text-amber-700',
}[auth.role] || 'bg-slate-100 text-slate-700'))

const handleLogout = async () => {
    userMenuOpen.value = false
    await auth.logout()
    router.push('/login')
}

const onDocClick = (e) => {
    if (!e.target.closest('[data-user-menu]')) userMenuOpen.value = false
}

onMounted(() => {
    document.addEventListener('click', onDocClick)
    const el = document.getElementById('page-actions')
    if (el) {
        hasPageActions.value = el.children.length > 0
        pageActionsObserver = new MutationObserver(() => {
            hasPageActions.value = el.children.length > 0
        })
        pageActionsObserver.observe(el, { childList: true })
    }
})
onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
    pageActionsObserver?.disconnect()
})

const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l9 5-9 5-9-5 9-5zm0 9l9 5-9 5-9-5 9-5z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13M12 6.253A6.5 6.5 0 005.5 4H4v13h1.5A6.5 6.5 0 0112 19.253M12 6.253A6.5 6.5 0 0118.5 4H20v13h-1.5A6.5 6.5 0 0012 19.253"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    'user-group': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"/></svg>',
    'academic-cap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-3.5-3.5A14 14 0 0012 20a14 14 0 003.5-.5"/></svg>',
    'clipboard-list': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/></svg>',
    table: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z"/></svg>',
    'check-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    'chart-bar': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V9m6 10V5M3 19h18M15 19V5m-6 0v14"/></svg>',
    'document-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>',
    'document-report': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
    currency: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2v-4M3 10v4m18-4v4m-5 0a1 1 0 110-2 1 1 0 010 2z"/></svg>',
    megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>',
    sidebar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M6 18L18 6M6 6l12 12"/></svg>',
    'chevron-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>',
    'chevron-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>',
    'chevron-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>',
    'chevron-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="11" cy="11" r="7"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.3-4.3"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
    'user-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9m4-7H6a2 2 0 00-2 2v14a2 2 0 002 2h7"/></svg>',
    cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>',
}
const iconSvg = (name) => ICONS[name] || ICONS.home
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
</style>
