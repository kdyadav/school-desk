<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-semibold text-gray-900">Guardians</h2>
                <p class="text-sm text-gray-500">{{ store.guardians.length }} guardian(s) on record.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate">+ New Guardian</BaseButton>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100">
                <div class="w-full sm:w-72">
                    <BaseInput size="sm" type="search" placeholder="Search by name or phone" :modelValue="search"
                        @update:modelValue="(v) => search = v" />
                </div>
            </div>
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Name</th>
                        <th class="text-left px-4 py-2 font-medium">Relation</th>
                        <th class="text-left px-4 py-2 font-medium">Phone</th>
                        <th class="text-left px-4 py-2 font-medium">Email</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="g in paged" :key="g.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ g.firstName }} {{ g.lastName }}</td>
                        <td class="px-4 py-2 text-gray-600 capitalize">{{ g.relation }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ g.phone }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ g.email || '—' }}</td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(g)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(g)">Delete
                            </BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!paged.length">
                        <td colspan="5" class="px-4 py-8 text-center text-gray-400">No guardians found.</td>
                    </tr>
                </tbody>
            </table>
            <div v-if="totalPages > 1"
                class="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                <span>Page {{ page }} of {{ totalPages }}</span>
                <div class="flex gap-2">
                    <BaseButton variant="secondary" size="sm" :full-width="false" :disabled="page === 1" @click="prev">
                        Prev</BaseButton>
                    <BaseButton variant="secondary" size="sm" :full-width="false" :disabled="page === totalPages"
                        @click="next">Next</BaseButton>
                </div>
            </div>
        </div>

        <BaseDrawer v-model="drawerOpen" :title="editing?.id ? 'Edit Guardian' : 'New Guardian'" width="md">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <BaseInput label="First name" :modelValue="form.firstName"
                        @update:modelValue="(v) => setField('firstName', v)" @blur="() => validateField('firstName')"
                        :error="errors.firstName" />
                    <BaseInput label="Last name" :modelValue="form.lastName"
                        @update:modelValue="(v) => setField('lastName', v)" @blur="() => validateField('lastName')"
                        :error="errors.lastName" />
                </div>
                <BaseSelect label="Relation" :modelValue="form.relation"
                    @update:modelValue="(v) => setField('relation', v)"
                    :options="[{ label: 'Father', value: 'father' }, { label: 'Mother', value: 'mother' }, { label: 'Guardian', value: 'guardian' }]"
                    :error="errors.relation" required />
                <BaseInput label="Phone" :modelValue="form.phone" @update:modelValue="(v) => setField('phone', v)"
                    @blur="() => validateField('phone')" :error="errors.phone" />
                <BaseInput label="Email (optional)" type="email" :modelValue="form.email"
                    @update:modelValue="(v) => setField('email', v)" :error="errors.email" />
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
import { ref } from 'vue'
import { usePeopleStore } from '../../stores/people'
import { useTableState } from '../../composables/useTableState'
import { useForm } from '../../ui-lib/useForm'
import { required } from '../../ui-lib/validators'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseDrawer from '../../ui-lib/BaseDrawer.vue'

const store = usePeopleStore()
store.loadAll()

const { search, page, paged, totalPages, next, prev } = useTableState(
    () => store.guardians,
    {
        matcher: (g, q) =>
            `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
            g.phone.includes(q),
    }
)

const drawerOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')

const { values: form, errors, setField, validateField, validateAll, reset } = useForm(
    { firstName: '', lastName: '', relation: 'father', phone: '', email: '' },
    { firstName: [required], lastName: [required], relation: [required], phone: [required] }
)

function openCreate() { editing.value = null; formError.value = ''; reset(); drawerOpen.value = true }

function openEdit(g) {
    editing.value = g; formError.value = ''; reset()
    setField('firstName', g.firstName); setField('lastName', g.lastName)
    setField('relation', g.relation); setField('phone', g.phone)
    setField('email', g.email || '')
    drawerOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    saving.value = true
    try {
        const payload = { ...form }
        if (editing.value?.id) payload.id = editing.value.id
        await store.saveItem('guardians', payload)
        drawerOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally {
        saving.value = false
    }
}

async function onDelete(g) {
    if (!window.confirm(`Delete guardian ${g.firstName} ${g.lastName}?`)) return
    await store.deleteItem('guardians', g.id)
}
</script>
