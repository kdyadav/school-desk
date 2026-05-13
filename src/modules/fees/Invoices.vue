<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">Invoices & Payments</h2>
                <p class="text-sm text-gray-500">Generate invoices per section, record payments.</p>
            </div>
            <BaseButton :full-width="false" @click="genOpen = true">Generate Invoices</BaseButton>
        </div>

        <!-- Filter bar -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-40">
                <BaseSelect label="Status" size="sm" :modelValue="filterStatus"
                    @update:modelValue="(v) => filterStatus = v" :options="statusOptions" />
            </div>
            <div class="flex-1 min-w-48">
                <BaseInput size="sm" type="search" placeholder="Search student name / adm no." :modelValue="search"
                    @update:modelValue="(v) => search = v" />
            </div>
        </div>

        <!-- Invoice table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Student</th>
                        <th class="text-right px-4 py-2 font-medium">Amount</th>
                        <th class="text-right px-4 py-2 font-medium">Paid</th>
                        <th class="text-center px-4 py-2 font-medium">Due Date</th>
                        <th class="text-center px-4 py-2 font-medium">Status</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="inv in filteredInvoices" :key="inv.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ studentName(inv.studentId) }}</td>
                        <td class="px-4 py-2 text-right text-gray-700">₹{{ inv.amount }}</td>
                        <td class="px-4 py-2 text-right text-green-700">₹{{ store.totalPaidForInvoice(inv.id) }}</td>
                        <td class="px-4 py-2 text-center text-gray-600">{{ inv.dueDate }}</td>
                        <td class="px-4 py-2 text-center"><span :class="statusBadge(inv.status)"
                                class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">{{ inv.status }}</span>
                        </td>
                        <td class="px-4 py-2 text-right">
                            <BaseButton v-if="inv.status !== 'paid'" variant="link" :full-width="false"
                                @click="openPay(inv)">Pay</BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!filteredInvoices.length">
                        <td colspan="6" class="px-4 py-8 text-center text-gray-400">No invoices found.</td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>

        <!-- Generate modal -->
        <BaseModal v-model="genOpen" title="Generate Invoices" size="sm">
            <div class="space-y-4">
                <BaseSelect label="Academic year" :modelValue="genYear" @update:modelValue="(v) => genYear = Number(v)"
                    :options="yearOpts" required />
                <BaseSelect label="Class" :modelValue="genClass"
                    @update:modelValue="(v) => { genClass = Number(v); genSection = '' }" :options="classOpts"
                    required />
                <BaseSelect label="Section" :modelValue="genSection" @update:modelValue="(v) => genSection = Number(v)"
                    :options="sectionOpts" required />
                <BaseInput label="Due date" type="date" :modelValue="genDue" @update:modelValue="(v) => genDue = v" />
                <p v-if="genMsg" :class="genMsg.startsWith('Error') ? 'text-red-600' : 'text-green-600'"
                    class="text-sm">{{ genMsg }}</p>
            </div>
            <template #footer>
                <BaseButton variant="secondary" :full-width="false" @click="genOpen = false">Close</BaseButton>
                <BaseButton :full-width="false" :loading="generating" @click="onGenerate">Generate</BaseButton>
            </template>
        </BaseModal>

        <!-- Pay modal -->
        <BaseModal v-model="payOpen" title="Record Payment" size="sm">
            <div class="space-y-4">
                <p class="text-sm text-gray-600">Invoice: ₹{{ payInv?.amount }} — Paid: ₹{{
                    store.totalPaidForInvoice(payInv?.id) }} — Balance: ₹{{ (payInv?.amount || 0) -
                        store.totalPaidForInvoice(payInv?.id) }}</p>
                <BaseInput label="Amount" type="number" :modelValue="payAmt"
                    @update:modelValue="(v) => payAmt = Number(v)" />
                <BaseInput label="Date" type="date" :modelValue="payDate" @update:modelValue="(v) => payDate = v" />
                <BaseSelect label="Mode" :modelValue="payMode" @update:modelValue="(v) => payMode = v"
                    :options="[{ label: 'Cash', value: 'cash' }, { label: 'Online', value: 'online' }, { label: 'Cheque', value: 'cheque' }, { label: 'Other', value: 'other' }]" />
            </div>
            <template #footer>
                <BaseButton variant="secondary" :full-width="false" @click="payOpen = false">Cancel</BaseButton>
                <BaseButton :full-width="false" :loading="paying" @click="onPay">Save Payment</BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFeesStore } from '../../stores/fees'
import { useAcademicStore } from '../../stores/academic'
import { usePeopleStore } from '../../stores/people'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseModal from '../../ui-lib/BaseModal.vue'

const store = useFeesStore()
const academic = useAcademicStore()
const people = usePeopleStore()
store.loadAll(); academic.loadAll(); people.loadAll()

const filterStatus = ref('')
const search = ref('')

const statusOptions = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
]

const filteredInvoices = computed(() => {
    let list = store.invoices
    if (filterStatus.value) list = list.filter((i) => i.status === filterStatus.value)
    const q = search.value.trim().toLowerCase()
    if (q) list = list.filter((i) => studentName(i.studentId).toLowerCase().includes(q))
    return list
})

function studentName(id) { const s = people.studentById(id); return s ? `${s.firstName} ${s.lastName} (${s.admissionNo})` : '?' }
function statusBadge(st) { return { pending: 'bg-amber-100 text-amber-700', partial: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700' }[st] }

// Generate
const genOpen = ref(false); const genYear = ref(''); const genClass = ref(''); const genSection = ref(''); const genDue = ref('')
const generating = ref(false); const genMsg = ref('')
const yearOpts = computed(() => academic.years.map((y) => ({ value: y.id, label: y.name })))
const classOpts = computed(() => academic.classes.map((c) => ({ value: c.id, label: c.name })))
const sectionOpts = computed(() => genClass.value ? academic.sectionsByClass(genClass.value).map((s) => ({ value: s.id, label: s.name })) : [])

async function onGenerate() {
    if (!genYear.value || !genSection.value || !genDue.value) { genMsg.value = 'Error: fill all fields'; return }
    generating.value = true; genMsg.value = ''
    try {
        const n = await store.generateInvoices(genSection.value, genYear.value, genClass.value, genDue.value)
        genMsg.value = `Created ${n} invoice(s).`
    } catch (e) { genMsg.value = `Error: ${e.message}` } finally { generating.value = false }
}

// Pay
const payOpen = ref(false); const payInv = ref(null); const payAmt = ref(0); const payDate = ref(''); const payMode = ref('cash'); const paying = ref(false)
function openPay(inv) { payInv.value = inv; payAmt.value = inv.amount - store.totalPaidForInvoice(inv.id); payDate.value = new Date().toISOString().slice(0, 10); payMode.value = 'cash'; payOpen.value = true }
async function onPay() {
    if (!payAmt.value || !payDate.value) return
    paying.value = true
    try { await store.recordPayment({ invoiceId: payInv.value.id, amount: payAmt.value, paidOn: payDate.value, mode: payMode.value }); payOpen.value = false } finally { paying.value = false }
}
</script>
