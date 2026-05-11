<template>
    <Teleport to="body">
        <transition name="cmdk">
            <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
                @click.self="hide">
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                <div
                    class="relative w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                    <div class="flex items-center gap-2 px-3 py-2.5 border-b border-slate-200 dark:border-slate-700">
                        <span class="w-4 h-4 text-slate-400" v-html="ICONS.search" />
                        <input ref="inputEl" v-model="query" type="text" placeholder="Search pages…"
                            class="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                            @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)"
                            @keydown.enter.prevent="run()" @keydown.esc.prevent="hide" />
                        <kbd
                            class="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded">
                            ESC
                        </kbd>
                    </div>

                    <div ref="listEl" class="max-h-[50vh] overflow-y-auto py-1">
                        <template v-if="results.length">
                            <div v-for="(section, si) in results" :key="section.key">
                                <div v-if="section.label"
                                    class="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                    {{ section.label }}
                                </div>
                                <button v-for="item in section.items" :key="item.to"
                                    :data-idx="indexOf(item)" @mousemove="active = indexOf(item)"
                                    @click="run(item)" :class="[
                                        'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
                                        active === indexOf(item)
                                            ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-white'
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60',
                                    ]">
                                    <span class="w-4 h-4 flex items-center justify-center text-slate-400"
                                        v-html="ICONS.arrow" />
                                    <span class="flex-1 truncate">{{ item.label }}</span>
                                    <span v-if="section.label"
                                        class="text-[11px] text-slate-400 truncate">{{ section.label }}</span>
                                </button>
                                <div v-if="si < results.length - 1"
                                    class="my-1 border-t border-slate-100 dark:border-slate-700" />
                            </div>
                        </template>
                        <div v-else class="px-4 py-8 text-center text-sm text-slate-400">
                            No matching pages
                        </div>
                    </div>

                    <div
                        class="flex items-center justify-between px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400">
                        <span class="flex items-center gap-3">
                            <span class="flex items-center gap-1"><kbd class="cmdk-kbd">↑</kbd><kbd
                                    class="cmdk-kbd">↓</kbd> Navigate</span>
                            <span class="flex items-center gap-1"><kbd class="cmdk-kbd">↵</kbd> Open</span>
                        </span>
                        <span>{{ flatItems.length }} page{{ flatItems.length === 1 ? '' : 's' }}</span>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { navGroups } from './navConfig'
import { useAuthStore } from '../stores/auth'
import { useCommandPalette } from '../composables/useCommandPalette'

const router = useRouter()
const auth = useAuthStore()
const { open, show, hide, toggle } = useCommandPalette()

const query = ref('')
const active = ref(0)
const inputEl = ref(null)
const listEl = ref(null)

const visibleGroups = computed(() =>
    navGroups
        .map((g) => ({ ...g, items: g.items.filter((it) => !it.roles || auth.hasRole(it.roles)) }))
        .filter((g) => g.items.length > 0)
)

const results = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return visibleGroups.value
    return visibleGroups.value
        .map((g) => ({ ...g, items: g.items.filter((it) => it.label.toLowerCase().includes(q)) }))
        .filter((g) => g.items.length > 0)
})

const flatItems = computed(() => results.value.flatMap((g) => g.items))
const indexOf = (item) => flatItems.value.indexOf(item)

watch(results, () => { active.value = 0 })
watch(open, async (v) => {
    if (v) {
        query.value = ''
        active.value = 0
        await nextTick()
        inputEl.value?.focus()
    }
})

const move = (delta) => {
    const n = flatItems.value.length
    if (!n) return
    active.value = (active.value + delta + n) % n
    nextTick(() => {
        const el = listEl.value?.querySelector(`[data-idx="${active.value}"]`)
        el?.scrollIntoView({ block: 'nearest' })
    })
}

const run = (item) => {
    const target = item || flatItems.value[active.value]
    if (!target) return
    hide()
    router.push(target.to)
}

const onKey = (e) => {
    const isMod = e.metaKey || e.ctrlKey
    if (isMod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        toggle()
    } else if (e.key === 'Escape' && open.value) {
        e.preventDefault()
        hide()
    }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// Icons kept inline so the palette is self-contained.
const ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="11" cy="11" r="7"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.3-4.3"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>',
}

defineExpose({ show, hide })
</script>

<style scoped>
.cmdk-enter-active,
.cmdk-leave-active {
    transition: opacity 0.12s ease;
}

.cmdk-enter-from,
.cmdk-leave-to {
    opacity: 0;
}

.cmdk-kbd {
    @apply px-1 py-px text-[10px] font-medium bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded;
}
</style>
