<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-semibold text-gray-900">Classes</h2>
                <p class="text-sm text-gray-500">Grades / standards within an academic year.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate" :disabled="!store.years.length">+ New Class</BaseButton>
        </div>

        <div v-if="!store.years.length" class="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
            Create an academic year first.
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <label class="text-sm text-gray-600 whitespace-nowrap">Filter by year:</label>
                <div class="w-48">
                    <BaseSelect size="sm" :modelValue="filterYearId"
                        @update:modelValue="(v) => filterYearId = Number(v)"
                        :options="filterYearOptions" />
                </div>
            </div>
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-left px-4 py-2 font-medium">Academic Year</th>
                        <th class="text-left px-4 py-2 font-medium">Sections</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="c in filteredClasses" :key="c.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ c.name }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ store.yearById(c.academicYearId)?.name || '—' }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ store.sectionsByClass(c.id).length }}</td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(c)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(c)">Delete</BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!filteredClasses.length">
                        <td colspan="4" class="px-4 py-8 text-center text-gray-400">No classes yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <BaseModal v-model="modalOpen" :title="editing?.id ? 'Edit Class' : 'New Class'">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseInput label="Class name" :modelValue="form.name"
                    @update:modelValue="(v) => setField('name', v)" @blur="() => validateField('name')"
                    :error="errors.name" placeholder="Grade 1" />
                <BaseSelect label="Academic year" :modelValue="form.academicYearId"
                    @update:modelValue="(v) => setField('academicYearId', Number(v))"
                    :options="yearOptions" :error="errors.academicYearId" required />
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
import { ref, computed, watch } from 'vue'
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
const filterYearId = ref(0)

const yearOptions = computed(() =>
    store.years.map((y) => ({ value: y.id, label: y.name }))
)

const filterYearOptions = computed(() => [
    { value: 0, label: 'All' },
    ...store.years.map((y) => ({ value: y.id, label: y.name })),
])

const filteredClasses = computed(() =>
    filterYearId.value
        ? store.classes.filter((c) => c.academicYearId === filterYearId.value)
        : store.classes
)

const { values: form, errors, setField, validateField, validateAll, reset } = useForm(
    { name: '', academicYearId: '' },
    { name: [required], academicYearId: [required] }
)

function openCreate() {
    editing.value = null
    formError.value = ''
    reset()
    setField('academicYearId', store.activeYear?.id || store.years[0]?.id || '')
    modalOpen.value = true
}

function openEdit(c) {
    editing.value = c
    formError.value = ''
    reset()
    setField('name', c.name)
    setField('academicYearId', c.academicYearId)
    modalOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    saving.value = true
    try {
        const payload = { name: form.name, academicYearId: Number(form.academicYearId) }
        if (editing.value?.id) payload.id = editing.value.id
        await store.saveItem('classes', payload)
        modalOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally {
        saving.value = false
    }
}

async function onDelete(c) {
    if (!window.confirm(`Delete class "${c.name}"?`)) return
    await store.deleteItem('classes', c.id)
}

watch(() => store.activeYear, (y) => {
    if (!filterYearId.value && y?.id) filterYearId.value = y.id
})
</script>
