<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">Subjects</h2>
                <p class="text-sm text-gray-500">Catalog of subjects taught across the school.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate">+ New Subject</BaseButton>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100">
                <div class="w-full sm:w-64">
                    <BaseInput size="sm" type="search" placeholder="Search by name or code" :modelValue="search"
                        @update:modelValue="(v) => search = v" />
                </div>
            </div>
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Code</th>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="s in filteredSubjects" :key="s.id">
                        <td class="px-4 py-2 font-mono text-gray-700">{{ s.code }}</td>
                        <td class="px-4 py-2 font-medium text-gray-900">{{ s.name }}</td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(s)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(s)">Delete
                            </BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!filteredSubjects.length">
                        <td colspan="3" class="px-4 py-8 text-center text-gray-400">No subjects found.</td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>

        <BaseModal v-model="modalOpen" :title="editing?.id ? 'Edit Subject' : 'New Subject'">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseInput label="Code" :modelValue="form.code"
                    @update:modelValue="(v) => setField('code', v.toUpperCase())" @blur="() => validateField('code')"
                    :error="errors.code" placeholder="MATH" />
                <BaseInput label="Name" :modelValue="form.name" @update:modelValue="(v) => setField('name', v)"
                    @blur="() => validateField('name')" :error="errors.name" placeholder="Mathematics" />
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
import BaseModal from '../../ui-lib/BaseModal.vue'

const store = useAcademicStore()
store.loadAll()

const modalOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')
const search = ref('')

const filteredSubjects = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return store.subjects
    return store.subjects.filter((s) =>
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    )
})

const { values: form, errors, setField, validateField, validateAll, reset } = useForm(
    { name: '', code: '' },
    { name: [required], code: [required] }
)

function openCreate() {
    editing.value = null
    formError.value = ''
    reset()
    modalOpen.value = true
}

function openEdit(s) {
    editing.value = s
    formError.value = ''
    reset()
    setField('name', s.name)
    setField('code', s.code)
    modalOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    saving.value = true
    try {
        const payload = { name: form.name, code: form.code }
        if (editing.value?.id) payload.id = editing.value.id
        await store.saveItem('subjects', payload)
        modalOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally {
        saving.value = false
    }
}

async function onDelete(s) {
    if (!window.confirm(`Delete subject "${s.name}"?`)) return
    await store.deleteItem('subjects', s.id)
}
</script>
