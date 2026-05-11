import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { db } from '../../src/db/dexie'
import { useFeesStore } from '../../src/stores/fees'
import { useAcademicStore } from '../../src/stores/academic'
import { useEnrollmentStore } from '../../src/stores/enrollment'
import { usePeopleStore } from '../../src/stores/people'
import { seedDatabase } from '../../src/db/seed'

let yearId, classId, sectionId

describe('fees store', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    localStorage.clear()
    setActivePinia(createPinia())
    await seedDatabase()

    const academic = useAcademicStore()
    const people = usePeopleStore()
    await academic.loadAll()
    await people.loadAll()

    yearId = academic.years[0].id
    classId = academic.classes[0].id
    sectionId = academic.sections[0].id

    // Enroll 3 students
    const enrollment = useEnrollmentStore()
    await enrollment.load(yearId, sectionId)
    await enrollment.assignStudents(people.students.slice(0, 3).map((s) => s.id))
  })

  it('seed provides fee structures for all classes', async () => {
    const store = useFeesStore()
    await store.loadStructures()
    expect(store.structures.length).toBeGreaterThanOrEqual(5)
  })

  it('structureForClass returns the seeded structure', async () => {
    const store = useFeesStore()
    await store.loadStructures()
    const found = store.structureForClass(classId, yearId)
    expect(found).toBeTruthy()
    expect(found.items.length).toBeGreaterThan(0)
  })

  it('generateInvoices skips already-invoiced students', async () => {
    const store = useFeesStore()
    await store.loadAll()
    // Seed already generated invoices for this section, so second call should create 0
    const created = await store.generateInvoices(sectionId, yearId, classId, '2025-08-01')
    expect(created).toBe(0)
  })

  it('does not duplicate invoices on second generate', async () => {
    const store = useFeesStore()
    await store.loadAll()
    const before = store.invoices.length
    await store.generateInvoices(sectionId, yearId, classId, '2025-08-01')
    expect(store.invoices.length).toBe(before)
  })

  it('recordPayment on a pending invoice changes status', async () => {
    const store = useFeesStore()
    await store.loadAll()
    // Find a pending invoice
    const pending = store.invoices.find((i) => i.status === 'pending')
    if (!pending) return // all paid in seed, skip
    const before = store.totalPaidForInvoice(pending.id)
    await store.recordPayment({ invoiceId: pending.id, amount: 500, paidOn: '2025-08-15', mode: 'cash' })
    expect(store.totalPaidForInvoice(pending.id)).toBe(before + 500)
    const updated = store.invoices.find((i) => i.id === pending.id)
    expect(['partial', 'paid']).toContain(updated.status)
    // Check receipt number
    const pmt = store.paymentsForInvoice(pending.id).pop()
    expect(pmt.receiptNo).toMatch(/^RCP/)
  })

  it('invoicesForStudent returns only that student invoices', async () => {
    const store = useFeesStore()
    await store.loadAll()
    const inv = store.invoices[0]
    const result = store.invoicesForStudent(inv.studentId)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((r) => r.studentId === inv.studentId)).toBe(true)
  })
})
