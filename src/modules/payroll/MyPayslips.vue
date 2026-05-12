<template>
    <div class="space-y-4">
        <div>
            <h2 class="text-xl font-semibold text-gray-900">My Payslips</h2>
            <p class="text-sm text-gray-500">View your monthly salary slips and payment history.</p>
        </div>

        <!-- Admin: pick a staff member. Teacher: auto-resolved -->
        <div v-if="canPickTeacher" class="bg-white rounded-xl border border-gray-200 p-4">
            <BaseSelect label="Staff member" :modelValue="selTeacherId"
                @update:modelValue="(v) => selTeacherId = Number(v)" :options="teacherOpts"
                placeholder="Select staff" />
        </div>

        <div v-if="myPayslips.length" class="space-y-4">
            <div v-for="ps in myPayslips" :key="ps.id"
                class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-900">{{ ps.month }}</p>
                        <p class="text-xs text-gray-500">Net Pay</p>
                    </div>
                    <span :class="statusBadge(ps.status)"
                        class="px-2 py-0.5 rounded-full text-xs font-medium capitalize">{{ ps.status }}</span>
                </div>

                <table class="min-w-full text-sm">
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="c in (ps.components || [])" :key="c.label">
                            <td class="py-1 text-gray-700">
                                {{ c.label }}
                                <span class="text-xs text-gray-400 ml-1">({{ c.type }})</span>
                            </td>
                            <td class="py-1 text-right"
                                :class="c.type === 'deduction' ? 'text-red-600' : 'text-gray-900'">
                                {{ c.type === 'deduction' ? '-' : '' }}₹{{ c.amount }}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="border-t border-gray-200">
                            <td class="py-1 text-gray-700">Gross</td>
                            <td class="py-1 text-right text-gray-900">₹{{ ps.gross }}</td>
                        </tr>
                        <tr>
                            <td class="py-1 text-gray-700">Deductions</td>
                            <td class="py-1 text-right text-red-600">-₹{{ ps.deductions }}</td>
                        </tr>
                        <tr class="border-t border-gray-200">
                            <td class="py-1 font-semibold text-gray-900">Net Pay</td>
                            <td class="py-1 text-right font-semibold text-gray-900">₹{{ ps.netAmount }}</td>
                        </tr>
                        <tr>
                            <td class="py-1 text-green-700 font-medium">Paid</td>
                            <td class="py-1 text-right text-green-700 font-medium">
                                ₹{{ store.totalPaidForPayslip(ps.id) }}
                            </td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium"
                                :class="balance(ps) > 0 ? 'text-red-600' : 'text-green-600'">Balance</td>
                            <td class="py-1 text-right font-medium"
                                :class="balance(ps) > 0 ? 'text-red-600' : 'text-green-600'">₹{{ balance(ps) }}</td>
                        </tr>
                    </tfoot>
                </table>

                <div v-if="store.paymentsForPayslip(ps.id).length" class="pt-2 border-t border-gray-100">
                    <p class="text-xs font-medium text-gray-500 mb-1">Payment History</p>
                    <div v-for="p in store.paymentsForPayslip(ps.id)" :key="p.id"
                        class="flex items-center justify-between text-xs text-gray-600 py-0.5">
                        <span>{{ p.paidOn }} · {{ p.mode }} · {{ p.voucherNo }}{{ p.reference ? ` · ${p.reference}` : '' }}</span>
                        <span class="font-medium text-green-700">₹{{ p.amount }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
            {{ selTeacherId ? 'No payslips found.' : 'Select a staff member to view payslips.' }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePayrollStore } from '../../stores/payroll'
import { usePeopleStore } from '../../stores/people'
import { useRoleContext } from '../../composables/useRoleContext'
import BaseSelect from '../../ui-lib/BaseSelect.vue'

const store = usePayrollStore()
const people = usePeopleStore()
store.loadAll(); people.loadAll()

const rc = useRoleContext()
const selTeacherId = ref('')

const canPickTeacher = computed(() => rc.isAdmin.value)

const teacherOpts = computed(() =>
    people.teachers.map((t) => ({ value: t.id, label: `${t.firstName} ${t.lastName} (${t.employeeNo})` }))
)

const myPayslips = computed(() =>
    selTeacherId.value
        ? [...store.payslipsForTeacher(selTeacherId.value)].sort((a, b) => (a.month < b.month ? 1 : -1))
        : []
)

function balance(ps) { return ps.netAmount - store.totalPaidForPayslip(ps.id) }

function statusBadge(st) {
    return { pending: 'bg-amber-100 text-amber-700', partial: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700' }[st]
}

// Auto-select for teachers
watch(() => rc.ready, (ready) => {
    if (!ready) return
    if (rc.myTeacherId.value) selTeacherId.value = rc.myTeacherId.value
}, { immediate: true })
</script>
