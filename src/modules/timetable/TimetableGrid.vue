<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
                <h2 class="text-xl font-semibold text-gray-900">Timetable</h2>
                <p class="text-sm text-gray-500">{{ scheduleLabel }}</p>
            </div>
            <div v-if="rc.isAdmin" class="flex gap-3 items-end">
                <div class="w-40">
                    <BaseSelect label="Class" size="sm" :modelValue="selClassId"
                        @update:modelValue="(v) => { selClassId = Number(v); selSectionId = '' }"
                        :options="classOptions" placeholder="Class" />
                </div>
                <div class="w-40">
                    <BaseSelect label="Section" size="sm" :modelValue="selSectionId"
                        @update:modelValue="(v) => { selSectionId = Number(v); onSectionChange() }"
                        :options="sectionOptions" placeholder="Section" />
                </div>
            </div>
        </div>

        <div v-if="!selSectionId && rc.isAdmin"
            class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            Select a class and section to view the timetable.
        </div>

        <!-- Grid -->
        <div v-else class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-3 py-2 text-left font-medium text-gray-600 sticky left-0 bg-gray-50 z-10">Period
                        </th>
                        <th v-for="day in DAYS" :key="day"
                            class="px-3 py-2 text-center font-medium text-gray-600 min-w-[120px]">
                            {{ day }}
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="p in store.periods" :key="p.id">
                        <td class="px-3 py-2 sticky left-0 bg-white z-10 border-r border-gray-100">
                            <p class="font-medium text-gray-800 text-xs">{{ p.name }}</p>
                            <p class="text-[10px] text-gray-400">{{ p.startTime }}–{{ p.endTime }}</p>
                        </td>
                        <td v-for="day in DAYS" :key="day" class="px-1 py-1 text-center">
                            <button @click="rc.isAdmin && openSlotEditor(day, p)"
                                :class="[slotClass(day, p.id), rc.isAdmin ? 'cursor-pointer' : 'cursor-default']"
                                class="w-full rounded-lg px-2 py-2 text-xs transition-colors min-h-[48px]">
                                <template v-if="slotData(day, p.id)">
                                    <p class="font-medium truncate">{{ subjectName(slotData(day, p.id).subjectId) }}</p>
                                    <p class="text-[10px] opacity-70 truncate">{{ teacherName(slotData(day,
                                        p.id).teacherId) }}</p>
                                </template>
                                <span v-else-if="rc.isAdmin" class="text-gray-300">+</span>
                                <span v-else class="text-gray-200">—</span>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!store.periods.length">
                        <td :colspan="DAYS.length + 1" class="px-4 py-8 text-center text-gray-400">
                            Define periods first.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Slot editor modal -->
        <BaseModal v-model="editorOpen" title="Edit Slot" size="sm">
            <div class="space-y-4">
                <p class="text-sm text-gray-500">{{ editCtx.day }} — {{ editCtx.periodName }}</p>
                <BaseSelect label="Subject" :modelValue="slotForm.subjectId"
                    @update:modelValue="(v) => slotForm.subjectId = Number(v)" :options="subjectOptions"
                    placeholder="Select subject" required />
                <BaseSelect label="Teacher" :modelValue="slotForm.teacherId"
                    @update:modelValue="(v) => slotForm.teacherId = Number(v)" :options="teacherOptions"
                    placeholder="Select teacher" required />
                <p v-if="conflictMsg" class="text-sm text-red-600">{{ conflictMsg }}</p>
            </div>
            <template #footer>
                <BaseButton v-if="editCtx.hasExisting" variant="danger" :full-width="false" @click="onClear">Clear
                </BaseButton>
                <div class="flex-1" />
                <BaseButton variant="secondary" :full-width="false" @click="editorOpen = false">Cancel</BaseButton>
                <BaseButton :full-width="false" :loading="saving" @click="onSaveSlot">Save</BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useAcademicStore } from '../../stores/academic'
import { useTimetableStore, DAYS } from '../../stores/timetable'
import { useRoleContext } from '../../composables/useRoleContext'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseModal from '../../ui-lib/BaseModal.vue'

const academic = useAcademicStore()
const store = useTimetableStore()
const rc = useRoleContext()
academic.loadAll()
store.loadPeriods()

const selClassId = ref('')
const selSectionId = ref('')

const scheduleLabel = computed(() => {
    if (rc.isAdmin.value) return 'Weekly schedule per section.'
    if (rc.isTeacher.value) return 'Your teaching schedule.'
    return 'Your class schedule.'
})

// Auto-load for teacher (first section they teach) or student (their section)
watch(() => rc.ready, (ready) => {
    if (!ready) return
    if (rc.isTeacher.value && rc.mySectionIds.value.length) {
        selSectionId.value = rc.mySectionIds.value[0]
        store.loadGrid(selSectionId.value)
    }
    if (rc.isStudent.value && rc.mySectionId.value) {
        selSectionId.value = rc.mySectionId.value
        store.loadGrid(selSectionId.value)
    }
}, { immediate: true })
const editorOpen = ref(false)
const saving = ref(false)
const conflictMsg = ref('')
const slotForm = reactive({ subjectId: '', teacherId: '' })
const editCtx = reactive({ day: '', periodId: null, periodName: '', hasExisting: false })

const sectionsForClass = computed(() =>
    selClassId.value ? academic.sectionsByClass(selClassId.value) : []
)
const classOptions = computed(() => academic.classes.map((c) => ({ value: c.id, label: c.name })))
const sectionOptions = computed(() => sectionsForClass.value.map((s) => ({ value: s.id, label: s.name })))
const subjectOptions = computed(() => academic.subjects.map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })))
const teacherOptions = computed(() => academic.teachers.map((t) => ({ value: t.id, label: `${t.firstName} ${t.lastName}` })))

function onSectionChange() { if (selSectionId.value) store.loadGrid(selSectionId.value) }

function slotData(day, periodId) { return store.getSlot(day, periodId) }
function subjectName(id) { return academic.subjects.find((s) => s.id === id)?.code || '?' }
function teacherName(id) { const t = academic.teachers.find((t) => t.id === id); return t ? `${t.firstName} ${t.lastName[0]}.` : '?' }

function slotClass(day, periodId) {
    return slotData(day, periodId)
        ? 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
        : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
}

function openSlotEditor(day, period) {
    const existing = slotData(day, period.id)
    editCtx.day = day; editCtx.periodId = period.id; editCtx.periodName = period.name
    editCtx.hasExisting = !!existing
    slotForm.subjectId = existing?.subjectId || ''
    slotForm.teacherId = existing?.teacherId || ''
    conflictMsg.value = ''
    editorOpen.value = true
}

async function onSaveSlot() {
    if (!slotForm.subjectId || !slotForm.teacherId) { conflictMsg.value = 'Select both subject and teacher.'; return }
    conflictMsg.value = ''
    saving.value = true
    try {
        const res = await store.saveSlot({
            dayOfWeek: editCtx.day, periodId: editCtx.periodId,
            subjectId: slotForm.subjectId, teacherId: slotForm.teacherId,
        })
        if (!res.ok) {
            conflictMsg.value = `Teacher is already booked in another section for this slot.`
            return
        }
        editorOpen.value = false
    } finally { saving.value = false }
}

async function onClear() {
    await store.clearSlot(editCtx.day, editCtx.periodId)
    editorOpen.value = false
}
</script>
