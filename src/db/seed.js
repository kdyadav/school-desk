import bcrypt from 'bcryptjs'
import { db } from './dexie'
import {
  academicYearRepo,
  classRepo,
  sectionRepo,
  subjectRepo,
  teacherRepo,
  guardianRepo,
  studentRepo,
  userRepo,
  enrollmentRepo,
  periodRepo,
  timetableRepo,
  attendanceRepo,
  examRepo,
  examMarkRepo,
  feeStructureRepo,
  invoiceRepo,
  paymentRepo,
  announcementRepo,
} from '../repositories'

const pad = (n, w = 4) => String(n).padStart(w, '0')
const hash = (pw) => bcrypt.hashSync(pw, 10)

// ── Static data ─────────────────────────────────────────────────────────

const SUBJECTS = [
  { name: 'Mathematics', code: 'MATH' },
  { name: 'English', code: 'ENG' },
  { name: 'Science', code: 'SCI' },
  { name: 'Social Studies', code: 'SOC' },
  { name: 'Computer Science', code: 'CS' },
  { name: 'Hindi', code: 'HIN' },
  { name: 'Physical Education', code: 'PE' },
  { name: 'Art & Craft', code: 'ART' },
]

const TEACHERS = [
  { employeeNo: 'T001', firstName: 'Asha', lastName: 'Rao', email: 'asha.rao@school.local', phone: '9000000001' },
  { employeeNo: 'T002', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@school.local', phone: '9000000002' },
  { employeeNo: 'T003', firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@school.local', phone: '9000000003' },
  { employeeNo: 'T004', firstName: 'Rajesh', lastName: 'Pillai', email: 'rajesh.pillai@school.local', phone: '9000000004' },
  { employeeNo: 'T005', firstName: 'Sunita', lastName: 'Deshmukh', email: 'sunita.deshmukh@school.local', phone: '9000000005' },
  { employeeNo: 'T006', firstName: 'Anil', lastName: 'Kulkarni', email: 'anil.kulkarni@school.local', phone: '9000000006' },
  { employeeNo: 'T007', firstName: 'Meera', lastName: 'Iyer', email: 'meera.iyer@school.local', phone: '9000000007' },
  { employeeNo: 'T008', firstName: 'Karthik', lastName: 'Menon', email: 'karthik.menon@school.local', phone: '9000000008' },
]

const STUDENT_NAMES = [
  ['Aarav', 'Sharma'], ['Diya', 'Patel'], ['Ishaan', 'Kumar'], ['Anaya', 'Reddy'], ['Vihaan', 'Iyer'],
  ['Myra', 'Joshi'], ['Arjun', 'Mehta'], ['Sara', 'Khan'], ['Kabir', 'Gupta'], ['Aanya', 'Verma'],
  ['Rohan', 'Mishra'], ['Zara', 'Ali'], ['Aditya', 'Bhat'], ['Nisha', 'Rao'], ['Dev', 'Chopra'],
  ['Riya', 'Sinha'], ['Siddharth', 'Nair'], ['Pooja', 'Thakur'], ['Yash', 'Pandey'], ['Kavya', 'Menon'],
  ['Tanish', 'Das'], ['Sneha', 'Garg'], ['Harsh', 'Tiwari'], ['Ira', 'Saxena'], ['Kunal', 'Bansal'],
  ['Anvi', 'Chauhan'], ['Reyansh', 'Bose'], ['Tara', 'Malhotra'], ['Vivaan', 'Aggarwal'], ['Sia', 'Kapoor'],
  ['Dhruv', 'Jain'], ['Mira', 'Bhatt'], ['Arnav', 'Seth'], ['Pari', 'Dubey'], ['Laksh', 'Kulkarni'],
]

const GUARDIAN_FIRST = [
  'Ramesh', 'Suresh', 'Mahesh', 'Ganesh', 'Dinesh', 'Rajesh', 'Sanjay', 'Ajay',
  'Vijay', 'Mohan', 'Sunita', 'Rekha', 'Kavita', 'Nirmala', 'Geeta', 'Anita',
  'Pradeep', 'Manoj', 'Deepak', 'Prakash', 'Neeta', 'Shobha', 'Usha', 'Lata',
  'Arun', 'Vinod', 'Kishore', 'Naresh', 'Seema', 'Vandana', 'Poonam', 'Meena',
  'Ashok', 'Sunil', 'Ravi',
]

const PERIODS_DEF = [
  { name: 'Period 1', startTime: '08:00', endTime: '08:45' },
  { name: 'Period 2', startTime: '08:50', endTime: '09:35' },
  { name: 'Period 3', startTime: '09:40', endTime: '10:25' },
  { name: 'Break', startTime: '10:25', endTime: '10:45' },
  { name: 'Period 4', startTime: '10:45', endTime: '11:30' },
  { name: 'Period 5', startTime: '11:35', endTime: '12:20' },
  { name: 'Lunch', startTime: '12:20', endTime: '13:00' },
  { name: 'Period 6', startTime: '13:00', endTime: '13:45' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const ANNOUNCEMENTS = [
  { title: 'Welcome to the New Academic Year 2025-2026', body: 'We are excited to begin the new session. All students must report by 7:45 AM from June 2nd. Uniforms are mandatory.', audience: 'all' },
  { title: 'Parent-Teacher Meeting on July 15th', body: 'PTM will be held on July 15, 2025 from 9 AM to 1 PM. Parents are requested to meet the class teacher with the student diary.', audience: 'parent' },
  { title: 'Mid-Term Exam Schedule Published', body: 'Mid-term exams will commence from August 18th. Detailed timetable has been shared with class teachers. Students should start preparing.', audience: 'student' },
  { title: 'Staff Development Workshop', body: 'A workshop on modern teaching methodologies will be held on July 20th in the conference hall. All teachers must attend.', audience: 'teacher' },
  { title: 'Annual Sports Day Registration Open', body: 'Register for events by July 25th. Categories: Track & Field, Team Sports, Fun Games. Contact the PE department.', audience: 'all' },
]

// ── Helpers ──────────────────────────────────────────────────────────────

export async function isDbEmpty() {
  const count = await db.academicYears.count()
  return count === 0
}

// ── Main seed ────────────────────────────────────────────────────────────

/**
 * Seed the database with demo data.
 * @param {object} [existingOwner] - An already-created owner user record.
 *   When provided the seed skips creating its own bootstrap user.
 */
export async function seedDatabase(existingOwner) {
  if (!(await isDbEmpty())) return { skipped: true }

  // 1. Users
  const adminUser = existingOwner ||
    await userRepo.create({ email: 'owner@school.local', passwordHash: hash('owner123'), role: 'owner', name: 'Owner' })

  // 2. Academic year
  const year = await academicYearRepo.create({ name: '2025-2026', startDate: '2025-06-01', endDate: '2026-04-30', isActive: true })
  await academicYearRepo.create({ name: '2024-2025', startDate: '2024-06-01', endDate: '2025-04-30', isActive: false })

  // 3. Subjects
  const subjects = []
  for (const s of SUBJECTS) subjects.push(await subjectRepo.create(s))

  // 4. Teachers + teacher user accounts
  const teachers = []
  for (const t of TEACHERS) {
    const created = await teacherRepo.create(t)
    teachers.push(created)
    await userRepo.create({ email: t.email, passwordHash: hash('teacher123'), role: 'teacher', name: `${t.firstName} ${t.lastName}`, linkedId: created.id })
  }

  // 5. Classes (Grade 1–5) × 2 sections
  const classNames = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']
  const sectionLetters = ['A', 'B']
  const classes = []
  const sections = []
  for (const className of classNames) {
    const cls = await classRepo.create({ name: className, academicYearId: year.id })
    classes.push(cls)
    for (const letter of sectionLetters) {
      const sec = await sectionRepo.create({
        classId: cls.id, name: letter,
        classTeacherId: teachers[sections.length % teachers.length].id,
      })
      sections.push(sec)
    }
  }

  // 6. Students + guardians (35 students spread across 10 sections ≈ 3-4 per section)
  const students = []
  let admNo = 1
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const [firstName, lastName] = STUDENT_NAMES[i]
    const gFirst = GUARDIAN_FIRST[i] || 'Parent'
    const relation = i % 3 === 0 ? 'father' : i % 3 === 1 ? 'mother' : 'guardian'
    const guardian = await guardianRepo.create({
      firstName: gFirst, lastName, phone: `98${pad(1000 + i, 8)}`, relation,
      email: i % 2 === 0 ? `${gFirst.toLowerCase()}.${lastName.toLowerCase()}@email.com` : null,
    })
    const sectionIdx = i % sections.length
    const student = await studentRepo.create({
      admissionNo: `ADM${pad(admNo++)}`, firstName, lastName,
      dob: `20${14 + Math.floor(sectionIdx / 2)}-${pad((i % 12) + 1, 2)}-${pad((i % 28) + 1, 2)}`,
      gender: i % 2 === 0 ? 'male' : 'female',
      guardianId: guardian.id, currentSectionId: sections[sectionIdx].id,
    })
    students.push(student)
  }

  // Create a student user account for first student
  await userRepo.create({ email: 'student@school.local', passwordHash: hash('student123'), role: 'student', name: `${students[0].firstName} ${students[0].lastName}`, linkedId: students[0].id })
  // Create a parent user account linked to first student's guardian
  await userRepo.create({ email: 'parent@school.local', passwordHash: hash('parent123'), role: 'parent', name: GUARDIAN_FIRST[0] + ' ' + STUDENT_NAMES[0][1], linkedId: students[0].guardianId })

  // 7. Enrollments (all students into their section)
  for (const s of students) {
    const secIdx = sections.findIndex((sec) => sec.id === s.currentSectionId)
    await enrollmentRepo.create({
      studentId: s.id, sectionId: s.currentSectionId, academicYearId: year.id,
      rollNo: pad(students.filter((st) => st.currentSectionId === s.currentSectionId).indexOf(s) + 1, 3),
    })
  }

  // 8. Periods
  const periods = []
  for (const p of PERIODS_DEF) periods.push(await periodRepo.create(p))
  const teachablePeriods = periods.filter((p) => !['Break', 'Lunch'].includes(p.name))

  // 9. Timetable (fill Mon-Fri for first 4 sections)
  for (let si = 0; si < 4; si++) {
    const sec = sections[si]
    for (const day of DAYS.slice(0, 5)) {
      for (let pi = 0; pi < teachablePeriods.length; pi++) {
        const subj = subjects[pi % subjects.length]
        const teacher = teachers[(si + pi) % teachers.length]
        await timetableRepo.create({
          sectionId: sec.id, dayOfWeek: day, periodId: teachablePeriods[pi].id,
          subjectId: subj.id, teacherId: teacher.id,
        })
      }
    }
  }

  // 10. Attendance (2 weeks: July 1-12, Mon-Fri)
  const attDates = []
  for (let d = 1; d <= 12; d++) {
    const dt = new Date(2025, 6, d)
    if (dt.getDay() >= 1 && dt.getDay() <= 5) attDates.push(`2025-07-${pad(d, 2)}`)
  }
  const statuses = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'absent', 'present']
  for (const sec of sections.slice(0, 4)) {
    const secStudents = students.filter((s) => s.currentSectionId === sec.id)
    for (const date of attDates) {
      for (let si = 0; si < secStudents.length; si++) {
        await attendanceRepo.create({
          sectionId: sec.id, date, studentId: secStudents[si].id,
          status: statuses[(si + attDates.indexOf(date)) % statuses.length],
          markedBy: teachers[0].id,
        })
      }
    }
  }

  // — continued in next part (exams, fees, announcements) —
  await seedExamsFeesAnnouncements(year, classes, sections, subjects, students, teachers, adminUser)

  return { skipped: false }
}

async function seedExamsFeesAnnouncements(year, classes, sections, subjects, students, teachers, adminUser) {
  // 11. Exams — Mid-Term & Unit Test for Grade 1 and Grade 2
  const coreSubjects = subjects.slice(0, 5) // MATH, ENG, SCI, SOC, CS

  for (let ci = 0; ci < 2; ci++) {
    const cls = classes[ci]
    const maxMarks = ci === 0 ? 100 : 50
    const midTerm = await examRepo.create({
      name: `Mid-Term ${cls.name}`, academicYearId: year.id, classId: cls.id,
      subjects: coreSubjects.map((s) => ({ subjectId: s.id, maxMarks })),
    })
    const unitTest = await examRepo.create({
      name: `Unit Test 1 ${cls.name}`, academicYearId: year.id, classId: cls.id,
      subjects: coreSubjects.slice(0, 3).map((s) => ({ subjectId: s.id, maxMarks: 25 })),
    })

    // Enter marks for enrolled students in both sections of this class
    const classSections = sections.filter((s) => s.classId === cls.id)
    for (const sec of classSections) {
      const secStudents = students.filter((s) => s.currentSectionId === sec.id)
      for (const student of secStudents) {
        for (const es of midTerm.subjects) {
          const marks = Math.floor(Math.random() * (es.maxMarks * 0.5)) + Math.floor(es.maxMarks * 0.4)
          const grade = marks >= es.maxMarks * 0.9 ? 'A+' : marks >= es.maxMarks * 0.8 ? 'A' : marks >= es.maxMarks * 0.7 ? 'B+' : marks >= es.maxMarks * 0.6 ? 'B' : marks >= es.maxMarks * 0.5 ? 'C' : marks >= es.maxMarks * 0.4 ? 'D' : 'F'
          await examMarkRepo.create({ examId: midTerm.id, studentId: student.id, subjectId: es.subjectId, marks, grade })
        }
        for (const es of unitTest.subjects) {
          const marks = Math.floor(Math.random() * (es.maxMarks * 0.6)) + Math.floor(es.maxMarks * 0.35)
          const grade = marks >= es.maxMarks * 0.9 ? 'A+' : marks >= es.maxMarks * 0.8 ? 'A' : marks >= es.maxMarks * 0.7 ? 'B+' : marks >= es.maxMarks * 0.6 ? 'B' : marks >= es.maxMarks * 0.5 ? 'C' : marks >= es.maxMarks * 0.4 ? 'D' : 'F'
          await examMarkRepo.create({ examId: unitTest.id, studentId: student.id, subjectId: es.subjectId, marks, grade })
        }
      }
    }
  }

  // 12. Fee structures + invoices + payments
  const feeItems = [
    { label: 'Tuition Fee', amount: 15000 },
    { label: 'Lab Fee', amount: 2000 },
    { label: 'Library Fee', amount: 500 },
    { label: 'Activity Fee', amount: 1000 },
  ]
  const totalFee = feeItems.reduce((s, i) => s + i.amount, 0)

  for (const cls of classes) {
    await feeStructureRepo.create({ classId: cls.id, academicYearId: year.id, items: feeItems })
  }

  // Generate invoices for first 3 classes' students + some payments
  let receiptCounter = 1
  for (let ci = 0; ci < 3; ci++) {
    const classSections = sections.filter((s) => s.classId === classes[ci].id)
    for (const sec of classSections) {
      const secStudents = students.filter((s) => s.currentSectionId === sec.id)
      for (let si = 0; si < secStudents.length; si++) {
        const inv = await invoiceRepo.create({
          studentId: secStudents[si].id, academicYearId: year.id,
          amount: totalFee, dueDate: '2025-07-31', status: 'pending', items: feeItems,
        })
        // Some students have paid fully, some partially, some not at all
        if (si % 3 === 0) {
          await paymentRepo.create({ invoiceId: inv.id, amount: totalFee, paidOn: '2025-07-10', mode: 'online', receiptNo: `RCP${pad(receiptCounter++, 6)}` })
          await invoiceRepo.update(inv.id, { status: 'paid' })
        } else if (si % 3 === 1) {
          const partial = Math.floor(totalFee * 0.5)
          await paymentRepo.create({ invoiceId: inv.id, amount: partial, paidOn: '2025-07-15', mode: 'cash', receiptNo: `RCP${pad(receiptCounter++, 6)}` })
          await invoiceRepo.update(inv.id, { status: 'partial' })
        }
        // si % 3 === 2 → stays pending
      }
    }
  }

  // 13. Announcements
  for (const ann of ANNOUNCEMENTS) {
    await announcementRepo.create({ ...ann, createdBy: adminUser.id })
  }
}

export default seedDatabase
