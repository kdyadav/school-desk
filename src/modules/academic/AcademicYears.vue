<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">Academic Years</h2>
                <p class="text-sm text-gray-500">Define each session and mark the active one.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate">+ New Year</BaseButton>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-left px-4 py-2 font-medium">Start</th>
                        <th class="text-left px-4 py-2 font-medium">End</th>
                        <th class="text-left px-4 py-2 font-medium">Active</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="y in store.years" :key="y.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ y.name }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ y.startDate }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ y.endDate }}</td>
                        <td class="px-4 py-2">
                            <BaseButton v-if="!y.isActive" variant="link" size="sm" :full-width="false"
                                @click="store.setActiveYear(y.id)">Mark active</BaseButton>
                            <span v-else class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                        </td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(y)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(y)">Delete</BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!store.years.length">
                        <td colspan="5" class="px-4 py-8 text-center text-gray-400">No years yet.</td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>

        <BaseModal v-model="modalOpen" :title="editing?.id ? 'Edit Academic Year' : 'New Academic Year'">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseInput label="Name" :modelValue="form.name" @update:modelValue="(v) => setField('name', v)"
                    @blur="() => validateField('name')" :error="errors.name" placeholder="2025-2026" />
                <BaseInput label="Start date" type="date" :modelValue="form.startDate"
                    @update:modelValue="(v) => setField('startDate', v)" @blur="() => validateField('startDate')"
                    :error="errors.startDate" />
                <BaseInput label="End date" type="date" :modelValue="form.endDate"
                    @update:modelValue="(v) => setField('endDate', v)" @blur="() => validateField('endDate')"
                    :error="errors.endDate" />
                <BaseCheckbox label="Mark as active" :modelValue="form.isActive"
                    @update:modelValue="(v) => setField('isActive', v)" />
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
import { ref, reactive } from 'vue'
import { useAcademicStore } from '../../stores/academic'
import { useForm } from '../../ui-lib/useForm'
import { required } from '../../ui-lib/validators'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseCheckbox from '../../ui-lib/BaseCheckbox.vue'
import BaseModal from '../../ui-lib/BaseModal.vue'

const store = useAcademicStore()
store.loadAll()

const modalOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')

const { values: form, errors, setField, validateField, validateAll, reset } = useForm(
    { name: '', startDate: '', endDate: '', isActive: false },
    { name: [required], startDate: [required], endDate: [required] }
)

function openCreate() {
    editing.value = null
    formError.value = ''
    reset()
    modalOpen.value = true
}

function openEdit(y) {
    editing.value = y
    formError.value = ''
    reset()
    setField('name', y.name)
    setField('startDate', y.startDate)
    setField('endDate', y.endDate)
    setField('isActive', !!y.isActive)
    modalOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    if (form.startDate > form.endDate) {
        formError.value = 'End date must be on or after start date.'
        return
    }
    saving.value = true
    try {
        const payload = { ...form }
        if (editing.value?.id) payload.id = editing.value.id
        await store.saveItem('years', payload)
        modalOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally {
        saving.value = false
    }
}

async function onDelete(y) {
    if (!window.confirm(`Delete academic year "${y.name}"?`)) return
    await store.deleteItem('years', y.id)
}
</script>
