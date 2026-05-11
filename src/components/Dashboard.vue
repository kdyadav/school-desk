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
import { attendanceRepo } from '../repositories'

const authStore = useAuthStore()
const people = usePeopleStore()
const academic = useAcademicStore()
const fees = useFeesStore()
const ann = useAnnouncementsStore()
const rc = useRoleContext()

const todayAttendancePct = ref('—')
const today = new Date().toISOString().slice(0, 10)

onMounted(async () => {
    await Promise.all([people.loadAll(), academic.loadAll(), fees.loadAll(), ann.loadAll()])
    try {
        const todayRecords = await attendanceRepo.query((r) => r.date === today)
        if (todayRecords.length) {
            const present = todayRecords.filter((r) => r.status === 'present' || r.status === 'late').length
            todayAttendancePct.value = `${Math.round((present / todayRecords.length) * 100)}%`
        }
    } catch { /* ignore */ }
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
</script>