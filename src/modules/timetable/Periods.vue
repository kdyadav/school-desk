<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">Periods</h2>
                <p class="text-sm text-gray-500">Define the time slots for each school day.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate">+ New Period</BaseButton>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-left px-4 py-2 font-medium">Start</th>
                        <th class="text-left px-4 py-2 font-medium">End</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="p in store.periods" :key="p.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ p.name }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ p.startTime }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ p.endTime }}</td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(p)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(p)">Delete
                            </BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!store.periods.length">
                        <td colspan="4" class="px-4 py-8 text-center text-gray-400">No periods defined yet.</td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>

        <BaseModal v-model="modalOpen" :title="editing?.id ? 'Edit Period' : 'New Period'">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseInput label="Name" :modelValue="form.name" @update:modelValue="(v) => setField('name', v)"
                    @blur="() => validateField('name')" :error="errors.name" placeholder="Period 1" />
                <BaseInput label="Start time" type="time" :modelValue="form.startTime"
                    @update:modelValue="(v) => setField('startTime', v)" @blur="() => validateField('startTime')"
                    :error="errors.startTime" />
                <BaseInput label="End time" type="time" :modelValue="form.endTime"
                    @update:modelValue="(v) => setField('endTime', v)" @blur="() => validateField('endTime')"
                    :error="errors.endTime" />
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
import { ref } from 'vue'
import { useTimetableStore } from '../../stores/timetable'
import { useForm } from '../../ui-lib/useForm'
import { required } from '../../ui-lib/validators'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseModal from '../../ui-lib/BaseModal.vue'

const store = useTimetableStore()
store.loadPeriods()

const modalOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')

const { values: form, errors, setField, validateField, validateAll, reset } = useForm(
    { name: '', startTime: '', endTime: '' },
    { name: [required], startTime: [required], endTime: [required] }
)

function openCreate() { editing.value = null; formError.value = ''; reset(); modalOpen.value = true }

function openEdit(p) {
    editing.value = p; formError.value = ''; reset()
    setField('name', p.name); setField('startTime', p.startTime); setField('endTime', p.endTime)
    modalOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    if (form.startTime >= form.endTime) { formError.value = 'Start must be before end.'; return }
    saving.value = true
    try {
        const payload = { ...form }
        if (editing.value?.id) payload.id = editing.value.id
        await store.savePeriod(payload)
        modalOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally {
        saving.value = false
    }
}

async function onDelete(p) {
    if (!window.confirm(`Delete period "${p.name}"?`)) return
    await store.deletePeriod(p.id)
}
</script>
