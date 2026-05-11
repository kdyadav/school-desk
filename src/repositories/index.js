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
// Users hold credentials — keep audit on but redact secret fields.
export const userRepo = createRepo('users', userSchema, { redact: ['passwordHash'] })
// The audit log table itself is never audited (avoids infinite recursion).
export const auditRepo = createRepo('auditLogs', auditLogSchema, { audit: false })

export { createRepo }
