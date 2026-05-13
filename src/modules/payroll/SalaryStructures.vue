<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">Salary Structures</h2>
                <p class="text-sm text-gray-500">Define monthly salary breakdown per staff member.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate">+ New Structure</BaseButton>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Staff</th>
                        <th class="text-left px-4 py-2 font-medium">Effective From</th>
                        <th class="text-right px-4 py-2 font-medium">Earnings</th>
                        <th class="text-right px-4 py-2 font-medium">Deductions</th>
                        <th class="text-right px-4 py-2 font-medium">Net</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="s in store.structures" :key="s.id">
                        <td class="px-4 py-2 text-gray-900 font-medium">{{ teacherName(s.teacherId) }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ s.effectiveFrom }}</td>
                        <td class="px-4 py-2 text-right text-gray-700">₹{{ sumByType(s.components, 'earning') }}</td>
                        <td class="px-4 py-2 text-right text-gray-700">₹{{ sumByType(s.components, 'deduction') }}</td>
                        <td class="px-4 py-2 text-right font-medium text-gray-900">
                            ₹{{ sumByType(s.components, 'earning') - sumByType(s.components, 'deduction') }}
                        </td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(s)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(s)">Delete
                            </BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!store.structures.length">
                        <td colspan="6" class="px-4 py-8 text-center text-gray-400">No salary structures yet.</td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>

        <BaseDrawer v-model="drawerOpen" :title="editing?.id ? 'Edit Salary Structure' : 'New Salary Structure'"
            width="lg">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseSelect label="Staff member" :modelValue="form.teacherId"
                    @update:modelValue="(v) => setField('teacherId', Number(v))" :options="teacherOpts"
                    :error="errors.teacherId" required />
                <BaseInput label="Effective from" type="date" :modelValue="form.effectiveFrom"
                    @update:modelValue="(v) => setField('effectiveFrom', v)" :error="errors.effectiveFrom" required />

                <div class="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-gray-700">Salary Components</p>
                        <BaseButton type="button" variant="link" size="sm" :full-width="false" @click="addRow">+ Add
                        </BaseButton>
                    </div>
                    <div v-for="(row, idx) in rows" :key="idx" class="flex flex-wrap gap-2 items-end">
                        <div class="flex-1 min-w-[8rem]">
                            <BaseInput :label="idx === 0 ? 'Label' : ''" :modelValue="row.label"
                                @update:modelValue="(v) => row.label = v" placeholder="Basic / HRA / PF" />
                        </div>
                        <div class="w-32">
                            <BaseSelect :label="idx === 0 ? 'Type' : ''" :modelValue="row.type"
                                @update:modelValue="(v) => row.type = v" :options="typeOpts" />
                        </div>
                        <div class="w-28">
                            <BaseInput :label="idx === 0 ? 'Amount' : ''" type="number" :modelValue="row.amount"
                                @update:modelValue="(v) => row.amount = Number(v)" placeholder="0" />
                        </div>
                        <BaseButton type="button" variant="link-danger" :full-width="false"
                            @click="rows.splice(idx, 1)">✕</BaseButton>
                    </div>
                    <div class="flex flex-wrap justify-end gap-x-4 gap-y-1 sm:gap-6 text-sm font-medium text-gray-700 pt-2 border-t border-gray-100">
                        <span>Earnings: ₹{{ sumByType(rows, 'earning') }}</span>
                        <span>Deductions: ₹{{ sumByType(rows, 'deduction') }}</span>
                        <span>Net: ₹{{ sumByType(rows, 'earning') - sumByType(rows, 'deduction') }}</span>
                    </div>
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
import { usePayrollStore } from '../../stores/payroll'
import { usePeopleStore } from '../../stores/people'
import { useForm } from '../../ui-lib/useForm'
import { required } from '../../ui-lib/validators'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseDrawer from '../../ui-lib/BaseDrawer.vue'

const store = usePayrollStore()
const people = usePeopleStore()
store.loadStructures()
people.loadAll()

const drawerOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')
const rows = reactive([])

const teacherOpts = computed(() =>
    people.teachers.map((t) => ({ value: t.id, label: `${t.firstName} ${t.lastName} (${t.employeeNo})` }))
)
const typeOpts = [
    { value: 'earning', label: 'Earning' },
    { value: 'deduction', label: 'Deduction' },
]

const { values: form, errors, setField, validateAll, reset } = useForm(
    { teacherId: '', effectiveFrom: '' },
    { teacherId: [required], effectiveFrom: [required] }
)

const sumByType = (items, type) =>
    (items || []).filter((i) => i.type === type).reduce((s, i) => s + (i.amount || 0), 0)

function teacherName(id) { const t = people.teacherById(id); return t ? `${t.firstName} ${t.lastName}` : '?' }
function addRow() { rows.push({ label: '', amount: 0, type: 'earning' }) }

function openCreate() {
    editing.value = null; formError.value = ''; reset()
    rows.splice(0, rows.length); addRow()
    drawerOpen.value = true
}

function openEdit(s) {
    editing.value = s; formError.value = ''; reset()
    setField('teacherId', s.teacherId); setField('effectiveFrom', s.effectiveFrom)
    rows.splice(0, rows.length, ...(s.components || []).map((c) => ({ ...c })))
    drawerOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    const valid = rows.filter((r) => r.label && r.amount >= 0 && r.type)
    if (!valid.length) { formError.value = 'Add at least one component.'; return }
    saving.value = true
    try {
        const payload = {
            teacherId: Number(form.teacherId),
            effectiveFrom: form.effectiveFrom,
            components: valid,
        }
        if (editing.value?.id) payload.id = editing.value.id
        await store.saveStructure(payload)
        drawerOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally { saving.value = false }
}

async function onDelete(s) {
    if (!window.confirm('Delete this salary structure?')) return
    await store.deleteStructure(s.id)
}
</script>
