<template>
    <div class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-2xl font-semibold text-gray-900">
                Welcome, {{ authStore.user?.name }}
            </h2>
            <p class="mt-1 text-gray-600">
                Signed in as <span class="font-medium">{{ authStore.user?.email }}</span>
                <span class="ml-2 text-xs uppercase tracking-wide text-indigo-600">{{ authStore.role }}</span>
            </p>
        </div>

        <!-- KPI tiles -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="tile in tiles" :key="tile.label" class="bg-white rounded-xl border border-gray-200 p-5">
                <p class="text-sm text-gray-500">{{ tile.label }}</p>
                <p class="mt-2 text-2xl font-semibold" :class="tile.color || 'text-gray-900'">{{ tile.value }}</p>
            </div>
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Attendance — last 7 days -->
            <div class="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-gray-700">Attendance — last 7 days</h3>
                    <span class="text-xs text-gray-400">{{ attendance7dSubtitle }}</span>
                </div>
                <div v-show="attendance7d.some((d) => d.total > 0)" ref="attendanceChartEl" style="height: 260px"></div>
                <div v-if="!attendance7d.some((d) => d.total > 0)"
                    class="h-[260px] flex items-center justify-center text-sm text-gray-400">
                    No attendance data for the last 7 days.
                </div>
            </div>

            <!-- Fees donut -->
            <div v-if="showFeesChart" class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Fees status</h3>
                <div v-show="feeTotal > 0" ref="feesChartEl" style="height: 260px"></div>
                <div v-if="feeTotal === 0" class="h-[260px] flex items-center justify-center text-sm text-gray-400">
                    No invoices yet.
                </div>
            </div>
        </div>

        <!-- Students per class / section -->
        <div v-if="composition.rows.length" class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ composition.title }}</h3>
            <div ref="compositionChartEl" :style="{ height: compositionHeight + 'px' }"></div>
        </div>

        <!-- Recent announcements -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-5 py-3 border-b border-gray-200">
                <h3 class="text-sm font-semibold text-gray-700">Recent Announcements</h3>
            </div>
            <div v-if="recentAnnouncements.length" class="divide-y divide-gray-100">
                <div v-for="a in recentAnnouncements" :key="a.id" class="px-5 py-3">
                    <div class="flex items-center gap-2">
                        <h4 class="text-sm font-medium text-gray-900">{{ a.title }}</h4>
                        <span
                            class="text-[10px] px-1.5 py-0.5 rounded-full capitalize font-medium bg-gray-100 text-gray-500">{{
                                a.audience }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ a.body }}</p>
                </div>
            </div>
            <div v-else class="px-5 py-6 text-center text-sm text-gray-400">No announcements.</div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usePeopleStore } from '../stores/people'
import { useAcademicStore } from '../stores/academic'
import { useFeesStore } from '../stores/fees'
import { useAnnouncementsStore } from '../stores/announcements'
import { useRoleContext } from '../composables/useRoleContext'
import { useFusionChart } from '../composables/useFusionChart'
import { attendanceRepo, enrollmentRepo } from '../repositories'

const authStore = useAuthStore()
const people = usePeopleStore()
const academic = useAcademicStore()
const fees = useFeesStore()
const ann = useAnnouncementsStore()
const rc = useRoleContext()

const todayAttendancePct = ref('—')
const today = new Date().toISOString().slice(0, 10)

const attendance7d = ref([])
const enrollmentsByYear = ref([])

function buildLast7Days() {
    const days = []
    const base = new Date()
    for (let i = 6; i >= 0; i--) {
        const d = new Date(base)
        d.setDate(base.getDate() - i)
        days.push(d.toISOString().slice(0, 10))
    }
    return days
}

function scopeAttendanceRows(rows) {
    if (rc.isTeacher.value) return rows.filter((r) => rc.mySectionIds.value.includes(r.sectionId))
    if (rc.isStudent.value) return rows.filter((r) => r.studentId === rc.myStudentId.value)
    if (rc.isParent.value) return rows.filter((r) => rc.myStudentIds.value.includes(r.studentId))
    return rows
}

async function loadAttendance7d() {
    const days = buildLast7Days()
    try {
        const all = await attendanceRepo.query((r) => r.date >= days[0] && r.date <= days[6])
        const scoped = scopeAttendanceRows(all)
        attendance7d.value = days.map((date) => {
            const rows = scoped.filter((r) => r.date === date)
            const present = rows.filter((r) => r.status === 'present' || r.status === 'late').length
            return {
                date,
                label: new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }),
                total: rows.length,
                present,
                pct: rows.length ? Math.round((present / rows.length) * 100) : 0,
            }
        })
    } catch {
        attendance7d.value = buildLast7Days().map((date) => ({
            date, label: '', total: 0, present: 0, pct: 0,
        }))
    }
}

onMounted(async () => {
    await Promise.all([people.loadAll(), academic.loadAll(), fees.loadAll(), ann.loadAll()])
    await rc.resolve()
    try {
        const todayRecords = await attendanceRepo.query((r) => r.date === today)
        const scopedToday = scopeAttendanceRows(todayRecords)
        if (scopedToday.length) {
            const present = scopedToday.filter((r) => r.status === 'present' || r.status === 'late').length
            todayAttendancePct.value = `${Math.round((present / scopedToday.length) * 100)}%`
        }
    } catch { /* ignore */ }
    await loadAttendance7d()
    if (rc.isAdmin.value && academic.activeYear) {
        try {
            enrollmentsByYear.value = await enrollmentRepo.where('academicYearId', academic.activeYear.id)
        } catch { /* ignore */ }
    } else if (rc.isTeacher.value && academic.activeYear) {
        try {
            const all = await enrollmentRepo.where('academicYearId', academic.activeYear.id)
            enrollmentsByYear.value = all.filter((e) => rc.mySectionIds.value.includes(e.sectionId))
        } catch { /* ignore */ }
    }
})

const pendingFees = computed(() => {
    if (rc.isAdmin.value) return fees.invoices.filter((i) => i.status !== 'paid').length
    if (rc.isStudent.value || rc.isParent.value) {
        const ids = rc.isParent.value ? rc.myStudentIds.value : [rc.myStudentId.value]
        return fees.invoices.filter((i) => ids.includes(i.studentId) && i.status !== 'paid').length
    }
    return 0
})

const tiles = computed(() => {
    if (rc.isAdmin.value) return [
        { label: 'Students', value: people.students.length, color: 'text-indigo-600' },
        { label: 'Teachers', value: people.teachers.length, color: 'text-blue-600' },
        { label: 'Sections', value: academic.sections.length, color: 'text-green-600' },
        { label: "Today's Attendance", value: todayAttendancePct.value, color: 'text-emerald-600' },
        { label: 'Pending Invoices', value: pendingFees.value, color: pendingFees.value > 0 ? 'text-red-600' : 'text-green-600' },
        { label: 'Announcements', value: ann.items.length, color: 'text-purple-600' },
    ]
    if (rc.isTeacher.value) return [
        { label: 'My Sections', value: rc.mySectionIds.value.length, color: 'text-indigo-600' },
        { label: "Today's Attendance", value: todayAttendancePct.value, color: 'text-emerald-600' },
        { label: 'Announcements', value: ann.forRole('teacher').length, color: 'text-purple-600' },
    ]
    // Student / Parent
    return [
        { label: "Today's Attendance", value: todayAttendancePct.value, color: 'text-emerald-600' },
        { label: 'Pending Fees', value: pendingFees.value, color: pendingFees.value > 0 ? 'text-red-600' : 'text-green-600' },
        { label: 'Announcements', value: ann.forRole(authStore.role).length, color: 'text-purple-600' },
    ]
})

const recentAnnouncements = computed(() => ann.recent(authStore.role, 5))

const attendance7dSubtitle = computed(() => {
    if (rc.isAdmin.value) return 'all sections'
    if (rc.isTeacher.value) return 'my sections'
    if (rc.isParent.value) return 'my children'
    if (rc.isStudent.value) return 'my attendance'
    return ''
})

const scopedInvoices = computed(() => {
    if (rc.isAdmin.value) return fees.invoices
    if (rc.isStudent.value || rc.isParent.value) {
        const ids = rc.isParent.value ? rc.myStudentIds.value : [rc.myStudentId.value]
        return fees.invoices.filter((i) => ids.includes(i.studentId))
    }
    return []
})

const showFeesChart = computed(() => rc.isAdmin.value || rc.isStudent.value || rc.isParent.value)

const FEE_COLORS = { paid: '#10b981', partial: '#f59e0b', pending: '#ef4444' }

const feeTotal = computed(() => scopedInvoices.value.length)

const feeSegments = computed(() => {
    const total = feeTotal.value
    if (!total) return []
    const counts = { paid: 0, partial: 0, pending: 0 }
    for (const inv of scopedInvoices.value) {
        const k = counts[inv.status] != null ? inv.status : 'pending'
        counts[k]++
    }
    let cumulative = 0
    return ['paid', 'partial', 'pending']
        .filter((k) => counts[k] > 0)
        .map((k) => {
            const pct = (counts[k] / total) * 100
            const offset = 25 - cumulative
            cumulative += pct
            return { key: k, count: counts[k], pct, offset, color: FEE_COLORS[k] }
        })
})

const composition = computed(() => {
    if (rc.isAdmin.value) {
        const counts = {}
        for (const e of enrollmentsByYear.value) {
            const sec = academic.sections.find((s) => s.id === e.sectionId)
            if (!sec) continue
            counts[sec.classId] = (counts[sec.classId] || 0) + 1
        }
        const max = Math.max(1, ...Object.values(counts))
        const rows = academic.classes
            .filter((c) => !academic.activeYear || c.academicYearId === academic.activeYear.id)
            .map((c) => ({
                id: c.id,
                label: c.name,
                count: counts[c.id] || 0,
                pct: ((counts[c.id] || 0) / max) * 100,
            }))
            .sort((a, b) => b.count - a.count)
        return { title: 'Students per class', rows }
    }
    if (rc.isTeacher.value) {
        const counts = {}
        for (const e of enrollmentsByYear.value) {
            counts[e.sectionId] = (counts[e.sectionId] || 0) + 1
        }
        const max = Math.max(1, ...Object.values(counts))
        const rows = rc.mySectionIds.value
            .map((sid) => {
                const sec = academic.sections.find((s) => s.id === sid)
                if (!sec) return null
                const cls = academic.classes.find((c) => c.id === sec.classId)
                return {
                    id: sid,
                    label: cls ? `${cls.name} — ${sec.name}` : sec.name,
                    count: counts[sid] || 0,
                    pct: ((counts[sid] || 0) / max) * 100,
                }
            })
            .filter(Boolean)
            .sort((a, b) => b.count - a.count)
        return { title: 'Students in my sections', rows }
    }
    return { title: '', rows: [] }
})

const compositionHeight = computed(() => Math.max(220, composition.value.rows.length * 36 + 60))

// ── FusionCharts ──────────────────────────────────────────────────────
const attendanceChartEl = ref(null)
const feesChartEl = ref(null)
const compositionChartEl = ref(null)

const baseChart = {
    theme: 'fusion',
    showBorder: '0',
    bgColor: '#ffffff',
    showShadow: '0',
}

useFusionChart({
    el: attendanceChartEl,
    type: 'column2d',
    height: 260,
    enabled: () => attendance7d.value.some((d) => d.total > 0),
    config: () => ({
        chart: {
            ...baseChart,
            yAxisName: 'Attendance %',
            numberSuffix: '%',
            yAxisMaxValue: '100',
            paletteColors: '#10b981',
            canvasBgColor: '#ffffff',
            showCanvasBorder: '0',
            divLineAlpha: '40',
            showAlternateHGridColor: '0',
        },
        data: attendance7d.value.map((d) => ({ label: d.label, value: d.total ? d.pct : 0 })),
    }),
})

useFusionChart({
    el: feesChartEl,
    type: 'doughnut2d',
    height: 260,
    enabled: () => showFeesChart.value && feeTotal.value > 0,
    config: () => ({
        chart: {
            ...baseChart,
            showPercentValues: '1',
            decimals: '0',
            doughnutRadius: '70',
            defaultCenterLabel: `${feeTotal.value} invoices`,
            centerLabel: '$label: $value',
        },
        data: feeSegments.value.map((s) => ({
            label: s.key, value: s.count, color: s.color.replace('#', ''),
        })),
    }),
})

useFusionChart({
    el: compositionChartEl,
    type: 'bar2d',
    height: () => compositionHeight.value,
    enabled: () => composition.value.rows.length > 0,
    config: () => ({
        chart: {
            ...baseChart,
            paletteColors: '#6366f1',
            canvasBgColor: '#ffffff',
            showCanvasBorder: '0',
        },
        data: composition.value.rows.map((r) => ({ label: r.label, value: r.count })),
    }),
})
</script>