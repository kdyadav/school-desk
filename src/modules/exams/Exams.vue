<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-semibold text-gray-900">Exams</h2>
                <p class="text-sm text-gray-500">Define exams with subjects and max marks.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate">+ New Exam</BaseButton>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-left px-4 py-2 font-medium">Class</th>
                        <th class="text-left px-4 py-2 font-medium">Year</th>
                        <th class="text-left px-4 py-2 font-medium">Subjects</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="ex in store.exams" :key="ex.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ ex.name }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ academic.classById(ex.classId)?.name || '—' }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ academic.yearById(ex.academicYearId)?.name || '—' }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ ex.subjects?.length || 0 }}</td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(ex)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(ex)">Delete
                            </BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!store.exams.length">
                        <td colspan="5" class="px-4 py-8 text-center text-gray-400">No exams yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Create/Edit Drawer -->
        <BaseDrawer v-model="drawerOpen" :title="editing?.id ? 'Edit Exam' : 'New Exam'" width="lg">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseInput label="Exam name" :modelValue="form.name" @update:modelValue="(v) => setField('name', v)"
                    @blur="() => validateField('name')" :error="errors.name" placeholder="Mid-Term 1" />
                <BaseSelect label="Academic year" :modelValue="form.academicYearId"
                    @update:modelValue="(v) => setField('academicYearId', Number(v))" :options="yearOpts"
                    :error="errors.academicYearId" required />
                <BaseSelect label="Class" :modelValue="form.classId"
                    @update:modelValue="(v) => setField('classId', Number(v))" :options="classOpts"
                    :error="errors.classId" required />

                <!-- Subject list with max marks -->
                <div class="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-gray-700">Subjects & Max Marks</p>
                        <BaseButton type="button" variant="link" size="sm" :full-width="false" @click="addSubjectRow">+
                            Add</BaseButton>
                    </div>
                    <div v-for="(row, idx) in subjectRows" :key="idx" class="flex gap-2 items-end">
                        <div class="flex-1">
                            <BaseSelect :label="idx === 0 ? 'Subject' : ''" :modelValue="row.subjectId"
                                @update:modelValue="(v) => row.subjectId = Number(v)" :options="subjectOpts"
                                placeholder="Subject" />
                        </div>
                        <div class="w-24">
                            <BaseInput :label="idx === 0 ? 'Max' : ''" type="number" :modelValue="row.maxMarks"
                                @update:modelValue="(v) => row.maxMarks = Number(v)" placeholder="100" />
                        </div>
                        <BaseButton type="button" variant="link-danger" :full-width="false"
                            @click="subjectRows.splice(idx, 1)">✕</BaseButton>
                    </div>
                    <p v-if="!subjectRows.length" class="text-xs text-gray-400">Add at least one subject.</p>
                </div>
                <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
            </form>
            <template #footer>
                <BaseButton variant="secondary" :full-width="false" @click="drawerOpen = false">Cancel</BaseButton>
                <BaseButton :full-width="false" :loading="saving" @click="onSubmit">Save</BaseButton>
            </template>
        </BaseDrawer>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useExamsStore } from '../../stores/exams'
import { useAcademicStore } from '../../stores/academic'
import { useForm } from '../../ui-lib/useForm'
import { required } from '../../ui-lib/validators'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseDrawer from '../../ui-lib/BaseDrawer.vue'

const store = useExamsStore()
const academic = useAcademicStore()
store.loadExams()
academic.loadAll()

const drawerOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')
const subjectRows = reactive([])

const yearOpts = computed(() => academic.years.map((y) => ({ value: y.id, label: y.name })))
const classOpts = computed(() => academic.classes.map((c) => ({ value: c.id, label: `${c.name} — ${academic.yearById(c.academicYearId)?.name || ''}` })))
const subjectOpts = computed(() => academic.subjects.map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })))

const { values: form, errors, setField, validateField, validateAll, reset } = useForm(
    { name: '', academicYearId: '', classId: '' },
    { name: [required], academicYearId: [required], classId: [required] }
)

function addSubjectRow() { subjectRows.push({ subjectId: '', maxMarks: 100 }) }

function openCreate() {
    editing.value = null; formError.value = ''; reset()
    subjectRows.splice(0, subjectRows.length)
    addSubjectRow()
    drawerOpen.value = true
}

function openEdit(ex) {
    editing.value = ex; formError.value = ''; reset()
    setField('name', ex.name)
    setField('academicYearId', ex.academicYearId)
    setField('classId', ex.classId)
    subjectRows.splice(0, subjectRows.length, ...(ex.subjects || []).map((s) => ({ ...s })))
    drawerOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    const validRows = subjectRows.filter((r) => r.subjectId && r.maxMarks > 0)
    if (!validRows.length) { formError.value = 'Add at least one subject.'; return }
    saving.value = true
    try {
        const payload = {
            name: form.name,
            academicYearId: Number(form.academicYearId),
            classId: Number(form.classId),
            subjects: validRows,
        }
        if (editing.value?.id) payload.id = editing.value.id
        await store.saveExam(payload)
        drawerOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally { saving.value = false }
}

async function onDelete(ex) {
    if (!window.confirm(`Delete exam "${ex.name}"?`)) return
    await store.deleteExam(ex.id)
}
</script>
