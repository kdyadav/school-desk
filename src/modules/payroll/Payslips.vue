<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-xl font-semibold text-gray-900">Payslips & Payments</h2>
                <p class="text-sm text-gray-500">Generate monthly payslips for staff and record payouts.</p>
            </div>
            <BaseButton :full-width="false" @click="genOpen = true">Generate Payslips</BaseButton>
        </div>

        <!-- Filter bar -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-40">
                <BaseSelect label="Status" size="sm" :modelValue="filterStatus"
                    @update:modelValue="(v) => filterStatus = v" :options="statusOptions" />
            </div>
            <div class="flex-1 min-w-40">
                <BaseInput label="Month" size="sm" type="month" :modelValue="filterMonth"
                    @update:modelValue="(v) => filterMonth = v" />
            </div>
            <div class="flex-1 min-w-48">
                <BaseInput size="sm" type="search" placeholder="Search staff name / emp no." :modelValue="search"
                    @update:modelValue="(v) => search = v" />
            </div>
        </div>

        <!-- Payslip table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                    <tr>
                        <th class="text-left px-4 py-2 font-medium">Staff</th>
                        <th class="text-center px-4 py-2 font-medium">Month</th>
                        <th class="text-right px-4 py-2 font-medium">Gross</th>
                        <th class="text-right px-4 py-2 font-medium">Deductions</th>
                        <th class="text-right px-4 py-2 font-medium">Net</th>
                        <th class="text-right px-4 py-2 font-medium">Paid</th>
                        <th class="text-center px-4 py-2 font-medium">Status</th>
                        <th class="text-right px-4 py-2 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="ps in filteredPayslips" :key="ps.id">
                        <td class="px-4 py-2 font-medium text-gray-900">{{ teacherName(ps.teacherId) }}</td>
                        <td class="px-4 py-2 text-center text-gray-600">{{ ps.month }}</td>
                        <td class="px-4 py-2 text-right text-gray-700">₹{{ ps.gross }}</td>
                        <td class="px-4 py-2 text-right text-gray-700">₹{{ ps.deductions }}</td>
                        <td class="px-4 py-2 text-right font-medium text-gray-900">₹{{ ps.netAmount }}</td>
                        <td class="px-4 py-2 text-right text-green-700">₹{{ store.totalPaidForPayslip(ps.id) }}</td>
                        <td class="px-4 py-2 text-center"><span :class="statusBadge(ps.status)"
                                class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">{{ ps.status }}</span>
                        </td>
                        <td class="px-4 py-2 text-right space-x-2">
                            <BaseButton v-if="ps.status !== 'paid'" variant="link" :full-width="false"
                                @click="openPay(ps)">Pay</BaseButton>
                            <BaseButton variant="link-danger" :full-width="false" @click="onDelete(ps)">Delete
                            </BaseButton>
                        </td>
                    </tr>
                    <tr v-if="!filteredPayslips.length">
                        <td colspan="8" class="px-4 py-8 text-center text-gray-400">No payslips found.</td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>

        <!-- Generate modal -->
        <BaseModal v-model="genOpen" title="Generate Payslips" size="sm">
            <div class="space-y-4">
                <BaseInput label="Month" type="month" :modelValue="genMonth"
                    @update:modelValue="(v) => genMonth = v" required />
                <p class="text-xs text-gray-500">Payslips will be generated for every staff member with an active
                    salary structure on or before the 1st of the selected month.</p>
                <p v-if="genMsg" :class="genMsg.startsWith('Error') ? 'text-red-600' : 'text-green-600'"
                    class="text-sm">{{ genMsg }}</p>
            </div>
            <template #footer>
                <BaseButton variant="secondary" :full-width="false" @click="genOpen = false">Close</BaseButton>
                <BaseButton :full-width="false" :loading="generating" @click="onGenerate">Generate</BaseButton>
            </template>
        </BaseModal>

        <!-- Pay modal -->
        <BaseModal v-model="payOpen" title="Record Salary Payment" size="sm">
            <div class="space-y-4">
                <p class="text-sm text-gray-600">Net: ₹{{ payPs?.netAmount }} — Paid: ₹{{
                    store.totalPaidForPayslip(payPs?.id) }} — Balance: ₹{{ (payPs?.netAmount || 0) -
                        store.totalPaidForPayslip(payPs?.id) }}</p>
                <BaseInput label="Amount" type="number" :modelValue="payAmt"
                    @update:modelValue="(v) => payAmt = Number(v)" />
                <BaseInput label="Date" type="date" :modelValue="payDate" @update:modelValue="(v) => payDate = v" />
                <BaseSelect label="Mode" :modelValue="payMode" @update:modelValue="(v) => payMode = v"
                    :options="modeOpts" />
                <BaseInput label="Reference (optional)" :modelValue="payRef"
                    @update:modelValue="(v) => payRef = v" placeholder="UTR / cheque no." />
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
import { usePayrollStore } from '../../stores/payroll'
import { usePeopleStore } from '../../stores/people'
import BaseButton from '../../ui-lib/BaseButton.vue'
import BaseInput from '../../ui-lib/BaseInput.vue'
import BaseSelect from '../../ui-lib/BaseSelect.vue'
import BaseModal from '../../ui-lib/BaseModal.vue'

const store = usePayrollStore()
const people = usePeopleStore()
store.loadAll(); people.loadAll()

const filterStatus = ref('')
const filterMonth = ref('')
const search = ref('')

const statusOptions = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
]
const modeOpts = [
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Cash', value: 'cash' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Other', value: 'other' },
]

const filteredPayslips = computed(() => {
    let list = store.payslips
    if (filterStatus.value) list = list.filter((p) => p.status === filterStatus.value)
    if (filterMonth.value) list = list.filter((p) => p.month === filterMonth.value)
    const q = search.value.trim().toLowerCase()
    if (q) list = list.filter((p) => teacherName(p.teacherId).toLowerCase().includes(q))
    return list
})

function teacherName(id) {
    const t = people.teacherById(id)
    return t ? `${t.firstName} ${t.lastName} (${t.employeeNo})` : '?'
}
function statusBadge(st) {
    return { pending: 'bg-amber-100 text-amber-700', partial: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700' }[st]
}

// Generate
const genOpen = ref(false); const genMonth = ref(''); const generating = ref(false); const genMsg = ref('')
async function onGenerate() {
    if (!genMonth.value) { genMsg.value = 'Error: pick a month'; return }
    generating.value = true; genMsg.value = ''
    try {
        const { created, skipped } = await store.generatePayslips(genMonth.value)
        genMsg.value = `Created ${created} payslip(s); skipped ${skipped}.`
    } catch (e) { genMsg.value = `Error: ${e.message}` } finally { generating.value = false }
}

// Pay
const payOpen = ref(false); const payPs = ref(null); const payAmt = ref(0); const payDate = ref('')
const payMode = ref('bank_transfer'); const payRef = ref(''); const paying = ref(false)
function openPay(ps) {
    payPs.value = ps
    payAmt.value = ps.netAmount - store.totalPaidForPayslip(ps.id)
    payDate.value = new Date().toISOString().slice(0, 10)
    payMode.value = 'bank_transfer'; payRef.value = ''
    payOpen.value = true
}
async function onPay() {
    if (!payAmt.value || !payDate.value) return
    paying.value = true
    try {
        await store.recordPayment({
            payslipId: payPs.value.id, amount: payAmt.value, paidOn: payDate.value,
            mode: payMode.value, reference: payRef.value || null,
        })
        payOpen.value = false
    } finally { paying.value = false }
}

async function onDelete(ps) {
    if (!window.confirm('Delete this payslip?')) return
    await store.deletePayslip(ps.id)
}
</script>
