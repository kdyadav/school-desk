<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-semibold text-gray-900">Sections</h2>
                <p class="text-sm text-gray-500">Divisions within a class (e.g. A, B). Optionally assign a class
                    teacher.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate" :disabled="!store.classes.length">+ New Section
            </BaseButton>
        </div>

        <div v-if="!store.classes.length"
            class="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
            Create a class first.
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <label class="text-sm text-gray-600 whitespace-nowrap">Filter by class:</label>
                <div class="w-64">
                    <BaseSelect size="sm" :modelValue="filterClassId"
                        @update:modelValue="(v) => filterClassId = Number(v)" :options="filterClassOptions" />
                </div>
            </div>
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Section</th>
                        <th class="text-left px-4 py-2 font-medium">Class</th>
                        <th class="text-left px-4 py-2 font-medium">Class Teacher</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="s in filteredSections" :key="s.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ s.name }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ store.classById(s.classId)?.name || '—' }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ teacherName(s.classTeacherId) }}</td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(s)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(s)">Delete
                            </BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!filteredSections.length">
                        <td colspan="4" class="px-4 py-8 text-center text-gray-400">No sections yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <BaseModal v-model="modalOpen" :title="editing?.id ? 'Edit Section' : 'New Section'">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseInput label="Section name" :modelValue="form.name" @update:modelValue="(v) => setField('name', v)"
                    @blur="() => validateField('name')" :error="errors.name" placeholder="A" />
                <BaseSelect label="Class" :modelValue="form.classId"
                    @update:modelValue="(v) => setField('classId', Number(v))" :options="classOptions"
                    :error="errors.classId" required />
                <BaseSelect label="Class teacher (optional)" :modelValue="form.classTeacherId || ''"
                    @update:modelValue="(v) => setField('classTeacherId', v ? Number(v) : null)"
                    :options="teacherOptions" placeholder="— none —" />
                <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
            </form>
            <template #footer>
                <BaseButton variant="secondary" :full-width="false" @click="modalOpen = false">Cancel</BaseButton>
                <BaseButton :full-width="false" :loading="saving" @click="onSubmit">Save</BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAcademicStore } from '../../stores/academic'
import { useForm } from '../../ui-lib/useForm'
import { required } from '../../ui-lib/validators'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseModal from '../../ui-lib/BaseModal.vue'

const store = useAcademicStore()
store.loadAll()

const modalOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')
const filterClassId = ref(0)

const classOptions = computed(() =>
    store.classes.map((c) => ({
        value: c.id,
        label: `${c.name} — ${store.yearById(c.academicYearId)?.name || ''}`,
    }))
)

const filterClassOptions = computed(() => [
    { value: 0, label: 'All' },
    ...classOptions.value,
])

const teacherOptions = computed(() =>
    store.teachers.map((t) => ({ value: t.id, label: `${t.firstName} ${t.lastName}` }))
)

const filteredSections = computed(() =>
    filterClassId.value
        ? store.sections.filter((s) => s.classId === filterClassId.value)
        : store.sections
)

const teacherName = (id) => {
    if (!id) return '—'
    const t = store.teacherById(id)
    return t ? `${t.firstName} ${t.lastName}` : '—'
}

const { values: form, errors, setField, validateField, validateAll, reset } = useForm(
    { name: '', classId: '', classTeacherId: null },
    { name: [required], classId: [required] }
)

function openCreate() {
    editing.value = null
    formError.value = ''
    reset()
    setField('classId', store.classes[0]?.id || '')
    modalOpen.value = true
}

function openEdit(s) {
    editing.value = s
    formError.value = ''
    reset()
    setField('name', s.name)
    setField('classId', s.classId)
    setField('classTeacherId', s.classTeacherId || null)
    modalOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    saving.value = true
    try {
        const payload = {
            name: form.name,
            classId: Number(form.classId),
            classTeacherId: form.classTeacherId || null,
        }
        if (editing.value?.id) payload.id = editing.value.id
        await store.saveItem('sections', payload)
        modalOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally {
        saving.value = false
    }
}

async function onDelete(s) {
    if (!window.confirm(`Delete section "${s.name}"?`)) return
    await store.deleteItem('sections', s.id)
}
</script>
