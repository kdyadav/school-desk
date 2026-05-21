<template>
    <div class="space-y-4">
        <div>
            <h2 class="text-xl font-semibold text-gray-900">Mark Attendance</h2>
            <p class="text-sm text-gray-500">Select section and date, then mark each student.</p>
        </div>

        <!-- Context selectors -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-40">
                <BaseSelect label="Class" size="sm" :modelValue="selClassId"
                    @update:modelValue="(v) => { selClassId = Number(v); selSectionId = '' }" :options="classOptions"
                    placeholder="Select class" />
            </div>
            <div class="flex-1 min-w-40">
                <BaseSelect label="Section" size="sm" :modelValue="selSectionId"
                    @update:modelValue="(v) => { selSectionId = Number(v); onContextChange() }"
                    :options="sectionOptions" placeholder="Select section" />
            </div>
            <div class="flex-1 min-w-40">
                <BaseInput label="Date" type="date" size="sm" :modelValue="selDate"
                    @update:modelValue="(v) => { selDate = v; onContextChange() }" />
            </div>
        </div>

        <!-- Roster -->
        <div v-if="ready" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-medium text-gray-700">{{ store.roster.length }} student(s)</p>
                <div class="flex gap-2 text-xs">
                    <button @click="markAll('present')"
                        class="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200">All Present</button>
                    <button @click="markAll('absent')"
                        class="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200">All Absent</button>
                </div>
            </div>
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">#</th>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-left px-4 py-2 font-medium">Adm No.</th>
                        <th class="text-center px-4 py-2 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="(s, i) in store.roster" :key="s.id">
                        <td class="px-4 py-2 text-gray-400">{{ i + 1 }}</td>
                        <td class="px-4 py-2 font-medium text-gray-900">{{ s.firstName }} {{ s.lastName }}</td>
                        <td class="px-4 py-2 text-gray-500 font-mono">{{ s.admissionNo }}</td>
                        <td class="px-4 py-2">
                            <div class="flex justify-center gap-1">
                                <button v-for="st in STATUS_LIST" :key="st" @click="store.setStatus(s.id, st)" :class="[
                                    'px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors',
                                    store.statusMap[s.id] === st ? statusColor(st) : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
                                ]">
                                    {{ st }}
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!store.roster.length">
                        <td colspan="4" class="px-4 py-8 text-center text-gray-400">No enrolled students.</td>
                    </tr>
                </tbody>
            </table>
            </div>
            <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
                <BaseButton :full-width="false" :loading="saving" @click="onSave">Save Attendance</BaseButton>
            </div>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            Select class, section, and date to mark attendance.
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAcademicStore } from '../../stores/academic'
import { useAttendanceStore, ATTENDANCE_STATUS } from '../../stores/attendance'
import { useAuthStore } from '../../stores/auth'
import { useRoleContext } from '../../composables/useRoleContext'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'

const academic = useAcademicStore()
const store = useAttendanceStore()
const auth = useAuthStore()
const rc = useRoleContext()
academic.loadAll()

const STATUS_LIST = ATTENDANCE_STATUS
const selClassId = ref('')
const selSectionId = ref('')
const selDate = ref(new Date().toISOString().slice(0, 10))
const saving = ref(false)

const ready = computed(() => !!(selSectionId.value && selDate.value))
const sectionsForClass = computed(() => {
    const all = selClassId.value ? academic.sectionsByClass(selClassId.value) : []
    return rc.filterSections(all)
})

const classOptions = computed(() =>
    academic.classes.map((c) => ({ value: c.id, label: c.name }))
)
const sectionOptions = computed(() =>
    sectionsForClass.value.map((s) => ({ value: s.id, label: s.name }))
)

function onContextChange() {
    if (!selSectionId.value || !selDate.value) return
    // Block non-admins from loading attendance for a section that isn't
    // theirs (URL/state manipulation guard — the picker already filters).
    if (!rc.canAccessSection(selSectionId.value)) {
        selSectionId.value = ''
        store.roster.splice(0)
        store.records.splice(0)
        return
    }
    store.load(selSectionId.value, selDate.value)
}

function markAll(status) {
    store.roster.forEach((s) => store.setStatus(s.id, status))
}

function statusColor(st) {
    return {
        present: 'bg-green-100 text-green-700',
        absent: 'bg-red-100 text-red-700',
        late: 'bg-amber-100 text-amber-700',
    }[st] || 'bg-gray-100 text-gray-600'
}

async function onSave() {
    saving.value = true
    try {
        await store.saveBulk(auth.user?.id ?? null)
    } finally {
        saving.value = false
    }
}
</script>
