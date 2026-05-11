<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-semibold text-gray-900">Fee Structures</h2>
                <p class="text-sm text-gray-500">Define fee breakdowns per class and academic year.</p>
            </div>
            <BaseButton :full-width="false" @click="openCreate">+ New Structure</BaseButton>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Class</th>
                        <th class="text-left px-4 py-2 font-medium">Year</th>
                        <th class="text-left px-4 py-2 font-medium">Items</th>
                        <th class="text-right px-4 py-2 font-medium">Total</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="s in store.structures" :key="s.id">
                        <td class="px-4 py-2 text-gray-900 font-medium">{{ academic.classById(s.classId)?.name || '—' }}
                        </td>
                        <td class="px-4 py-2 text-gray-600">{{ academic.yearById(s.academicYearId)?.name || '—' }}</td>
                        <td class="px-4 py-2 text-gray-600">{{ s.items?.length || 0 }}</td>
                        <td class="px-4 py-2 text-right font-medium text-gray-900">₹{{ itemsTotal(s.items) }}</td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton variant="link" :full-width="false" @click="openEdit(s)">Edit</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(s)">Delete
                            </BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!store.structures.length">
                        <td colspan="5" class="px-4 py-8 text-center text-gray-400">No fee structures yet.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <BaseDrawer v-model="drawerOpen" :title="editing?.id ? 'Edit Fee Structure' : 'New Fee Structure'" width="lg">
            <form @submit.prevent="onSubmit" class="space-y-4">
                <BaseSelect label="Academic year" :modelValue="form.academicYearId"
                    @update:modelValue="(v) => setField('academicYearId', Number(v))" :options="yearOpts"
                    :error="errors.academicYearId" required />
                <BaseSelect label="Class" :modelValue="form.classId"
                    @update:modelValue="(v) => setField('classId', Number(v))" :options="classOpts"
                    :error="errors.classId" required />

                <div class="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-gray-700">Fee Items</p>
                        <BaseButton type="button" variant="link" size="sm" :full-width="false" @click="addRow">+ Add
                        </BaseButton>
                    </div>
                    <div v-for="(row, idx) in rows" :key="idx" class="flex gap-2 items-end">
                        <div class="flex-1">
                            <BaseInput :label="idx === 0 ? 'Label' : ''" :modelValue="row.label"
                                @update:modelValue="(v) => row.label = v" placeholder="Tuition Fee" />
                        </div>
                        <div class="w-28">
                            <BaseInput :label="idx === 0 ? 'Amount' : ''" type="number" :modelValue="row.amount"
                                @update:modelValue="(v) => row.amount = Number(v)" placeholder="5000" />
                        </div>
                        <BaseButton type="button" variant="link-danger" :full-width="false"
                            @click="rows.splice(idx, 1)">✕</BaseButton>
                    </div>
                    <p class="text-sm font-medium text-gray-700 text-right">Total: ₹{{ itemsTotal(rows) }}</p>
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
import { useFeesStore } from '../../stores/fees'
import { useAcademicStore } from '../../stores/academic'
import { useForm } from '../../ui-lib/useForm'
import { required } from '../../ui-lib/validators'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseDrawer from '../../ui-lib/BaseDrawer.vue'

const store = useFeesStore()
const academic = useAcademicStore()
store.loadStructures()
academic.loadAll()

const drawerOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const formError = ref('')
const rows = reactive([])

const yearOpts = computed(() => academic.years.map((y) => ({ value: y.id, label: y.name })))
const classOpts = computed(() => academic.classes.map((c) => ({ value: c.id, label: c.name })))

const { values: form, errors, setField, validateAll, reset } = useForm(
    { academicYearId: '', classId: '' },
    { academicYearId: [required], classId: [required] }
)

const itemsTotal = (items) => (items || []).reduce((s, i) => s + (i.amount || 0), 0)
function addRow() { rows.push({ label: '', amount: 0 }) }

function openCreate() {
    editing.value = null; formError.value = ''; reset()
    rows.splice(0, rows.length); addRow()
    drawerOpen.value = true
}

function openEdit(s) {
    editing.value = s; formError.value = ''; reset()
    setField('academicYearId', s.academicYearId); setField('classId', s.classId)
    rows.splice(0, rows.length, ...(s.items || []).map((i) => ({ ...i })))
    drawerOpen.value = true
}

async function onSubmit() {
    formError.value = ''
    if (!validateAll()) return
    const valid = rows.filter((r) => r.label && r.amount > 0)
    if (!valid.length) { formError.value = 'Add at least one fee item.'; return }
    saving.value = true
    try {
        const payload = { academicYearId: Number(form.academicYearId), classId: Number(form.classId), items: valid }
        if (editing.value?.id) payload.id = editing.value.id
        await store.saveStructure(payload)
        drawerOpen.value = false
    } catch (e) {
        formError.value = e?.issues?.[0]?.message || e.message || 'Save failed'
    } finally { saving.value = false }
}

async function onDelete(s) {
    if (!window.confirm('Delete this fee structure?')) return
    await store.deleteStructure(s.id)
}
</script>
