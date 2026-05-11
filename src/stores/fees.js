import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  feeStructureRepo,
  invoiceRepo,
  paymentRepo,
  enrollmentRepo,
  studentRepo,
} from '../repositories'

const pad = (n, w = 6) => String(n).padStart(w, '0')

export const useFeesStore = defineStore('fees', () => {
  const structures = ref([])
  const invoices = ref([])
  const payments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ── Fee structures ────────────────────────────────────────────────────
  async function loadStructures() { structures.value = await feeStructureRepo.list() }

  async function saveStructure(payload) {
    if (payload.id) {
      const { id, ...patch } = payload
      await feeStructureRepo.update(id, patch)
    } else {
      await feeStructureRepo.create(payload)
    }
    await loadStructures()
  }

  async function deleteStructure(id) {
    await feeStructureRepo.remove(id)
    await loadStructures()
  }

  function structureForClass(classId, academicYearId) {
    return structures.value.find(
      (s) => s.classId === classId && s.academicYearId === academicYearId
    ) || null
  }

  // ── Invoices ──────────────────────────────────────────────────────────
  async function loadInvoices() { invoices.value = await invoiceRepo.list() }

  /** Generate invoices for all enrolled students in a section */
  async function generateInvoices(sectionId, academicYearId, classId, dueDate) {
    const structure = structureForClass(classId, academicYearId)
    if (!structure) throw new Error('No fee structure defined for this class + year')
    const total = structure.items.reduce((s, i) => s + i.amount, 0)

    const enrollments = await enrollmentRepo.where('sectionId', sectionId)
    let created = 0
    for (const e of enrollments) {
      const existing = invoices.value.find(
        (inv) => inv.studentId === e.studentId && inv.academicYearId === academicYearId
      )
      if (existing) continue
      await invoiceRepo.create({
        studentId: e.studentId,
        academicYearId,
        amount: total,
        dueDate,
        status: 'pending',
        items: structure.items,
      })
      created++
    }
    await loadInvoices()
    return created
  }

  // ── Payments ──────────────────────────────────────────────────────────
  async function loadPayments() { payments.value = await paymentRepo.list() }

  async function recordPayment({ invoiceId, amount, paidOn, mode }) {
    const count = await paymentRepo.count()
    const receiptNo = `RCP${pad(count + 1)}`
    await paymentRepo.create({ invoiceId, amount, paidOn, mode, receiptNo })

    // Update invoice status
    const inv = await invoiceRepo.get(invoiceId)
    if (inv) {
      const allPayments = await paymentRepo.where('invoiceId', invoiceId)
      const totalPaid = allPayments.reduce((s, p) => s + p.amount, 0)
      const status = totalPaid >= inv.amount ? 'paid' : 'partial'
      await invoiceRepo.update(inv.id, { status })
    }
    await loadInvoices()
    await loadPayments()
  }

  function paymentsForInvoice(invoiceId) {
    return payments.value.filter((p) => p.invoiceId === invoiceId)
  }

  function totalPaidForInvoice(invoiceId) {
    return paymentsForInvoice(invoiceId).reduce((s, p) => s + p.amount, 0)
  }

  function invoicesForStudent(studentId) {
    return invoices.value.filter((i) => i.studentId === studentId)
  }

  async function loadAll() {
    loading.value = true
    try {
      await Promise.all([loadStructures(), loadInvoices(), loadPayments()])
    } finally {
      loading.value = false
    }
  }

  return {
    structures, invoices, payments, loading, error,
    loadStructures, saveStructure, deleteStructure, structureForClass,
    loadInvoices, generateInvoices,
    loadPayments, recordPayment, paymentsForInvoice, totalPaidForInvoice,
    invoicesForStudent,
    loadAll,
  }
})
