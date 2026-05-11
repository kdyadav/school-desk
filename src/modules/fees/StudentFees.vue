<template>
    <div class="space-y-4">
        <div>
            <h2 class="text-xl font-semibold text-gray-900">My Fees</h2>
            <p class="text-sm text-gray-500">View your invoices and payment history.</p>
        </div>

        <!-- Admin/Teacher: pick a student. Student/Parent: auto-resolved -->
        <div v-if="canPickStudent" class="bg-white rounded-xl border border-gray-200 p-4">
            <BaseSelect label="Student" :modelValue="selStudentId"
                @update:modelValue="(v) => { selStudentId = Number(v); loadForStudent() }" :options="studentOpts"
                placeholder="Select student" />
        </div>

        <div v-if="myInvoices.length" class="space-y-4">
            <div v-for="inv in myInvoices" :key="inv.id"
                class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-900">
                            {{ academic.yearById(inv.academicYearId)?.name || '' }}
                        </p>
                        <p class="text-xs text-gray-500">Due: {{ inv.dueDate }}</p>
                    </div>
                    <span :class="statusBadge(inv.status)"
                        class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">{{ inv.status }}</span>
                </div>

                <!-- Fee items -->
                <table class="min-w-full text-sm">
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="item in (inv.items || [])" :key="item.label">
                            <td class="py-1 text-gray-700">{{ item.label }}</td>
                            <td class="py-1 text-right text-gray-900">₹{{ item.amount }}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="border-t border-gray-200">
                            <td class="py-1 font-semibold text-gray-900">Total</td>
                            <td class="py-1 text-right font-semibold text-gray-900">₹{{ inv.amount }}</td>
                        </tr>
                        <tr>
                            <td class="py-1 text-green-700 font-medium">Paid</td>
                            <td class="py-1 text-right text-green-700 font-medium">₹{{ store.totalPaidForInvoice(inv.id)
                            }}</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium" :class="balance(inv) > 0 ? 'text-red-600' : 'text-green-600'">
                                Balance</td>
                            <td class="py-1 text-right font-medium"
                                :class="balance(inv) > 0 ? 'text-red-600' : 'text-green-600'">₹{{ balance(inv) }}</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Payment history -->
                <div v-if="store.paymentsForInvoice(inv.id).length" class="pt-2 border-t border-gray-100">
                    <p class="text-xs font-medium text-gray-500 mb-1">Payment History</p>
                    <div v-for="p in store.paymentsForInvoice(inv.id)" :key="p.id"
                        class="flex items-center justify-between text-xs text-gray-600 py-0.5">
                        <span>{{ p.paidOn }} · {{ p.mode }} · {{ p.receiptNo }}</span>
                        <span class="font-medium text-green-700">₹{{ p.amount }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            {{ selStudentId ? 'No invoices found.' : 'Select a student to view fees.' }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFeesStore } from '../../stores/fees'
import { useAcademicStore } from '../../stores/academic'
import { usePeopleStore } from '../../stores/people'
import { useAuthStore } from '../../stores/auth'
import { useRoleContext } from '../../composables/useRoleContext'
import BaseSelect from '../../ui-lib/BaseSelect.vue'

const store = useFeesStore()
const academic = useAcademicStore()
const people = usePeopleStore()
const auth = useAuthStore()
store.loadAll(); academic.loadAll(); people.loadAll()

const rc = useRoleContext()
const selStudentId = ref('')

const canPickStudent = computed(() => rc.isAdmin.value)

const studentOpts = computed(() =>
    people.students.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName} (${s.admissionNo})` }))
)

const myInvoices = computed(() =>
    selStudentId.value ? store.invoicesForStudent(selStudentId.value) : []
)

function balance(inv) { return inv.amount - store.totalPaidForInvoice(inv.id) }

function statusBadge(st) {
    return { pending: 'bg-amber-100 text-amber-700', partial: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700' }[st]
}

// Auto-select for student/parent
watch(() => rc.ready, (ready) => {
    if (!ready) return
    if (rc.myStudentId.value) selStudentId.value = rc.myStudentId.value
}, { immediate: true })
</script>
