import { createRepo } from './base'
import {
  academicYearSchema,
  classSchema,
  sectionSchema,
  subjectSchema,
  guardianSchema,
  studentSchema,
  teacherSchema,
  userSchema,
  enrollmentSchema,
  periodSchema,
  timetableEntrySchema,
  attendanceSchema,
  examSchema,
  examMarkSchema,
  feeStructureSchema,
  invoiceSchema,
  paymentSchema,
  announcementSchema,
  auditLogSchema,
  salaryStructureSchema,
  payslipSchema,
  salaryPaymentSchema,
  schoolProfileSchema,
} from '../schemas'

export const academicYearRepo = createRepo('academicYears', academicYearSchema)
export const classRepo = createRepo('classes', classSchema)
export const sectionRepo = createRepo('sections', sectionSchema)
export const subjectRepo = createRepo('subjects', subjectSchema)
export const guardianRepo = createRepo('guardians', guardianSchema)
export const studentRepo = createRepo('students', studentSchema)
export const teacherRepo = createRepo('teachers', teacherSchema)

export const enrollmentRepo = createRepo('enrollments', enrollmentSchema)
export const periodRepo = createRepo('periods', periodSchema)
export const timetableRepo = createRepo('timetable', timetableEntrySchema)
export const attendanceRepo = createRepo('attendance', attendanceSchema)
export const examRepo = createRepo('exams', examSchema)
export const examMarkRepo = createRepo('examMarks', examMarkSchema)
export const feeStructureRepo = createRepo('feeStructures', feeStructureSchema)
export const invoiceRepo = createRepo('invoices', invoiceSchema)
export const paymentRepo = createRepo('payments', paymentSchema)
export const announcementRepo = createRepo('announcements', announcementSchema)
// `users` API name → `profiles` Postgres table; Supabase Auth owns credentials.
export const userRepo = createRepo('users', userSchema)
// Audit rows are written by Postgres triggers; the repo here is read-only.
export const auditRepo = createRepo('auditLogs', auditLogSchema)

export const salaryStructureRepo = createRepo('salaryStructures', salaryStructureSchema)
export const payslipRepo = createRepo('payslips', payslipSchema)
export const salaryPaymentRepo = createRepo('salaryPayments', salaryPaymentSchema)

// School profile is a singleton row keyed on `key=1`. Logos/favicons live in
// Supabase Storage; the row only stores the public URLs.
export const schoolProfileRepo = createRepo('schoolProfile', schoolProfileSchema)

export { createRepo }
