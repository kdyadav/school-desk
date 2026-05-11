import Dexie from 'dexie'

export const db = new Dexie('SchoolDeskDB')

db.version(1).stores({
  academicYears: '++id, &uuid, name, isActive, startDate, endDate',
  classes: '++id, &uuid, name, academicYearId',
  sections: '++id, &uuid, classId, name, classTeacherId',
  subjects: '++id, &uuid, &code, name',
  students: '++id, &uuid, &admissionNo, firstName, lastName, currentSectionId, guardianId',
  guardians: '++id, &uuid, firstName, lastName, phone, email',
  teachers: '++id, &uuid, &employeeNo, &email, firstName, lastName',
  enrollments: '++id, &uuid, studentId, sectionId, academicYearId, rollNo, [sectionId+academicYearId]',
  periods: '++id, &uuid, name, startTime, endTime',
  timetable: '++id, &uuid, sectionId, dayOfWeek, periodId, subjectId, teacherId, [sectionId+dayOfWeek+periodId], [teacherId+dayOfWeek+periodId]',
  attendance: '++id, &uuid, sectionId, date, studentId, status, [sectionId+date], [studentId+date]',
  exams: '++id, &uuid, name, academicYearId, classId',
  examMarks: '++id, &uuid, examId, studentId, subjectId, [examId+studentId+subjectId]',
  feeStructures: '++id, &uuid, classId, academicYearId, [classId+academicYearId]',
  invoices: '++id, &uuid, studentId, academicYearId, status, dueDate',
  payments: '++id, &uuid, invoiceId, paidOn, &receiptNo',
  announcements: '++id, &uuid, audience, createdAt, createdBy',
  users: '++id, &uuid, &email, role, linkedId',
})

db.version(2).stores({
  auditLogs: '++id, &uuid, entity, entityId, action, actorId, createdAt, [entity+entityId], [actorId+createdAt], [entity+createdAt]',
})

export const TABLES = [
  'academicYears',
  'classes',
  'sections',
  'subjects',
  'students',
  'guardians',
  'teachers',
  'enrollments',
  'periods',
  'timetable',
  'attendance',
  'exams',
  'examMarks',
  'feeStructures',
  'invoices',
  'payments',
  'announcements',
  'users',
  'auditLogs',
]

export default db
