<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">Audit Log</h2>
                <p class="text-sm text-gray-500">Every data change and authentication event, in order.</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <BaseButton variant="secondary" :full-width="false" size="sm" @click="onRefresh">Refresh</BaseButton>
                <BaseButton variant="link-danger" :full-width="false" size="sm" @click="onClear">Clear all</BaseButton>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <BaseSelect label="Entity" :modelValue="store.filters.entity"
                @update:modelValue="(v) => store.setFilter('entity', v)" :options="entityOpts" />
            <BaseSelect label="Action" :modelValue="store.filters.action"
                @update:modelValue="(v) => store.setFilter('action', v)" :options="actionOpts" />
            <BaseInput label="From" type="date" :modelValue="store.filters.since"
                @update:modelValue="(v) => store.setFilter('since', v)" />
            <BaseInput label="To" type="date" :modelValue="store.filters.until"
                @update:modelValue="(v) => store.setFilter('until', v)" />
        </div>

        <div class="text-xs text-gray-500">
            Showing {{ store.items.length }} of {{ store.total }} entries
            <button class="ml-2 underline" @click="store.resetFilters(); load()">reset filters</button>
        </div>

        <!-- Timeline -->
        <div v-if="store.items.length" class="space-y-2">
            <div v-for="row in store.items" :key="row.id"
                class="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="actionBadge(row.action)">
                            {{ row.action }}
                        </span>
                        <span class="text-sm font-medium text-gray-900">{{ row.entity }}</span>
                        <span v-if="row.entityId != null" class="text-xs text-gray-400">#{{ row.entityId }}</span>
                    </div>
                    <div class="text-xs text-gray-500 flex items-center gap-3">
                        <span>{{ formatDate(row.createdAt) }}</span>
                        <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {{ row.actorName || 'system' }}<span v-if="row.actorRole"> · {{ row.actorRole }}</span>
                        </span>
                    </div>
                </div>

                <div v-if="row.changes && Object.keys(row.changes).length"
                    class="text-xs grid gap-1 border-l-2 border-amber-300 pl-3">
                    <div v-for="(diff, field) in row.changes" :key="field" class="flex flex-wrap gap-2 break-words">
                        <span class="font-mono text-gray-600">{{ field }}</span>
                        <span class="text-red-600 line-through break-all">{{ fmt(diff.before) }}</span>
                        <span class="text-gray-400">→</span>
                        <span class="text-green-700 break-all">{{ fmt(diff.after) }}</span>
                    </div>
                </div>
                <pre v-else-if="row.before || row.after || row.meta"
                    class="text-[11px] bg-gray-50 rounded p-2 overflow-x-auto text-gray-700">{{ fmtPayload(row) }}</pre>
            </div>
        </div>
        <div v-else class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            No audit entries match these filters.
        </div>

        <!-- Pagination -->
        <div v-if="store.pageCount > 1" class="flex items-center justify-center gap-2 pt-2">
            <BaseButton size="sm" variant="secondary" :full-width="false" :disabled="store.page <= 1"
                @click="goto(store.page - 1)">Prev</BaseButton>
            <span class="text-sm text-gray-600">Page {{ store.page }} / {{ store.pageCount }}</span>
            <BaseButton size="sm" variant="secondary" :full-width="false" :disabled="store.page >= store.pageCount"
                @click="goto(store.page + 1)">Next</BaseButton>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuditStore } from '../../stores/audit'
import { AUDIT_ACTIONS } from '../../audit'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'

// API table names — match the keys used by the repository registry and the
// PG_TABLE mapping in src/repositories/adapters/supabase/index.js.
const ENTITY_TABLES = [
    'academicYears', 'classes', 'sections', 'subjects',
    'guardians', 'students', 'teachers', 'users',
    'enrollments', 'periods', 'timetable', 'attendance',
    'exams', 'examMarks',
    'feeStructures', 'invoices', 'payments',
    'announcements',
    'salaryStructures', 'payslips', 'salaryPayments',
    'schoolProfile',
]

const store = useAuditStore()

const entityOpts = [
    { value: '', label: 'All entities' },
    { value: 'auth', label: 'auth' },
    ...ENTITY_TABLES.map((t) => ({ value: t, label: t })),
]
const actionOpts = [
    { value: '', label: 'All actions' },
    ...AUDIT_ACTIONS.map((a) => ({ value: a, label: a })),
]

const load = () => store.load()
const onRefresh = () => load()
const goto = (p) => { store.setPage(p); load() }
const onClear = async () => {
    if (!window.confirm('Permanently delete all audit entries?')) return
    await store.clearAll()
}

const actionBadge = (a) => {
    if (a.startsWith('auth.login_failed') || a === 'auth.register_failed') return 'bg-red-100 text-red-700'
    if (a.startsWith('auth.')) return 'bg-blue-100 text-blue-700'
    if (a === 'entity.created') return 'bg-green-100 text-green-700'
    if (a === 'entity.updated') return 'bg-amber-100 text-amber-700'
    if (a === 'entity.deleted') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
}

const fmt = (v) => {
    if (v === undefined) return '—'
    if (v === null) return 'null'
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
}

const fmtPayload = (row) => JSON.stringify({
    before: row.before, after: row.after, meta: row.meta,
}, null, 2)

const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

onMounted(() => load())

// React to filter changes by reloading. We watch via setFilter triggering page=1
// then reading filters in load(); a manual reload here keeps the Apply button-free UX.
import { watch } from 'vue'
watch(() => store.filters, () => load(), { deep: true })
</script>
