import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  salaryStructureRepo,
  payslipRepo,
  salaryPaymentRepo,
  teacherRepo,
} from '../repositories'

const pad = (n, w = 6) => String(n).padStart(w, '0')

const sumByType = (components, type) =>
  (components || []).filter((c) => c.type === type).reduce((s, c) => s + (c.amount || 0), 0)

export const usePayrollStore = defineStore('payroll', () => {
  const structures = ref([])
  const payslips = ref([])
  const payments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ── Salary structures ─────────────────────────────────────────────────
  async function loadStructures() { structures.value = await salaryStructureRepo.list() }

  async function saveStructure(payload) {
    if (payload.id) {
      const { id, ...patch } = payload
      await salaryStructureRepo.update(id, patch)
    } else {
      await salaryStructureRepo.create(payload)
    }
    await loadStructures()
  }

  async function deleteStructure(id) {
    await salaryStructureRepo.remove(id)
    await loadStructures()
  }

  /** Latest active salary structure for a teacher (effectiveFrom <= today). */
  function structureForTeacher(teacherId, asOf = new Date().toISOString().slice(0, 10)) {
    const eligible = structures.value
      .filter((s) => s.teacherId === teacherId && s.effectiveFrom <= asOf)
      .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? 1 : -1))
    return eligible[0] || null
  }

  // ── Payslips ──────────────────────────────────────────────────────────
  async function loadPayslips() { payslips.value = await payslipRepo.list() }

  /** Generate payslips for the given month for all teachers (or a subset). */
  async function generatePayslips(month, teacherIds = null) {
    const teachers = teacherIds
      ? (await teacherRepo.list()).filter((t) => teacherIds.includes(t.id))
      : await teacherRepo.list()

    const monthStart = `${month}-01`
    let created = 0
    let skipped = 0
    for (const t of teachers) {
      const existing = payslips.value.find((p) => p.teacherId === t.id && p.month === month)
      if (existing) { skipped++; continue }
      const struct = structureForTeacher(t.id, monthStart)
      if (!struct) { skipped++; continue }
      const gross = sumByType(struct.components, 'earning')
      const deductions = sumByType(struct.components, 'deduction')
      await payslipRepo.create({
        teacherId: t.id,
        month,
        gross,
        deductions,
        netAmount: gross - deductions,
        status: 'pending',
        components: struct.components,
      })
      created++
    }
    await loadPayslips()
    return { created, skipped }
  }

  async function deletePayslip(id) {
    await payslipRepo.remove(id)
    await loadPayslips()
  }

  // ── Payments ──────────────────────────────────────────────────────────
  async function loadPayments() { payments.value = await salaryPaymentRepo.list() }

  async function recordPayment({ payslipId, amount, paidOn, mode, reference }) {
    const count = await salaryPaymentRepo.count()
    const voucherNo = `VCH${pad(count + 1)}`
    await salaryPaymentRepo.create({ payslipId, amount, paidOn, mode, reference: reference || null, voucherNo })

    const ps = await payslipRepo.get(payslipId)
    if (ps) {
      const all = await salaryPaymentRepo.where('payslipId', payslipId)
      const totalPaid = all.reduce((s, p) => s + p.amount, 0)
      const status = totalPaid >= ps.netAmount ? 'paid' : 'partial'
      await payslipRepo.update(ps.id, { status })
    }
    await loadPayslips()
    await loadPayments()
  }

  function paymentsForPayslip(payslipId) {
    return payments.value.filter((p) => p.payslipId === payslipId)
  }

  function totalPaidForPayslip(payslipId) {
    return paymentsForPayslip(payslipId).reduce((s, p) => s + p.amount, 0)
  }

  function payslipsForTeacher(teacherId) {
    return payslips.value.filter((p) => p.teacherId === teacherId)
  }

  function structuresForTeacher(teacherId) {
    return structures.value.filter((s) => s.teacherId === teacherId)
  }

  async function loadAll() {
    loading.value = true
    try {
      await Promise.all([loadStructures(), loadPayslips(), loadPayments()])
    } finally {
      loading.value = false
    }
  }

  return {
    structures, payslips, payments, loading, error,
    loadStructures, saveStructure, deleteStructure, structureForTeacher, structuresForTeacher,
    loadPayslips, generatePayslips, deletePayslip, payslipsForTeacher,
    loadPayments, recordPayment, paymentsForPayslip, totalPaidForPayslip,
    loadAll,
  }
})
