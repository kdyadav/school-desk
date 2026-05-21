import { createRouter, createWebHistory } from 'vue-router'
import AdminSetup from '../components/AdminSetup.vue'
import Login from '../components/Login.vue'
import ForgotPassword from '../components/ForgotPassword.vue'
import Dashboard from '../components/Dashboard.vue'
import FormDemo from '../components/FormDemo.vue'
import AppShell from '../layouts/AppShell.vue'
import AcademicYears from '../modules/academic/AcademicYears.vue'
import Classes from '../modules/academic/Classes.vue'
import Sections from '../modules/academic/Sections.vue'
import Subjects from '../modules/academic/Subjects.vue'
import Students from '../modules/people/Students.vue'
import Guardians from '../modules/people/Guardians.vue'
import Teachers from '../modules/people/Teachers.vue'
import Users from '../modules/people/Users.vue'
import Enrollment from '../modules/enrollment/Enrollment.vue'
import Periods from '../modules/timetable/Periods.vue'
import TimetableGrid from '../modules/timetable/TimetableGrid.vue'
import MarkAttendance from '../modules/attendance/MarkAttendance.vue'
import AttendanceSummary from '../modules/attendance/AttendanceSummary.vue'
import ExamsList from '../modules/exams/Exams.vue'
import MarkEntry from '../modules/exams/MarkEntry.vue'
import ReportCard from '../modules/exams/ReportCard.vue'
import FeeStructures from '../modules/fees/FeeStructures.vue'
import FeesInvoices from '../modules/fees/Invoices.vue'
import StudentFees from '../modules/fees/StudentFees.vue'
import SalaryStructures from '../modules/payroll/SalaryStructures.vue'
import Payslips from '../modules/payroll/Payslips.vue'
import MyPayslips from '../modules/payroll/MyPayslips.vue'
import Announcements from '../modules/announcements/Announcements.vue'
import AuditLog from '../modules/audit/AuditLog.vue'
import UserProfile from '../components/UserProfile.vue'
import SchoolSettings from '../modules/settings/SchoolSettings.vue'
import siteRoutes from '../site/routes'
import { useAuthStore } from '../stores/auth'
import { useSchoolStore } from '../stores/school'
import { applyFavicon, applyPrimaryColor, composeTitle } from '../composables/useBranding'

const routes = [
  { path: '/setup', name: 'AdminSetup', component: AdminSetup, meta: { setup: true } },
  { path: '/login', name: 'Login', component: Login, meta: { public: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword, meta: { public: true } },
  {
    path: '/app',
    component: AppShell,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' },
      },
      {
        path: 'form-demo',
        name: 'FormDemo',
        component: FormDemo,
        meta: { title: 'Form Demo', roles: ['admin'] },
      },
      {
        path: 'setup/years',
        name: 'AcademicYears',
        component: AcademicYears,
        meta: { title: 'Academic Years', roles: ['admin'] },
      },
      {
        path: 'setup/classes',
        name: 'Classes',
        component: Classes,
        meta: { title: 'Classes', roles: ['admin'] },
      },
      {
        path: 'setup/sections',
        name: 'Sections',
        component: Sections,
        meta: { title: 'Sections', roles: ['admin'] },
      },
      {
        path: 'setup/subjects',
        name: 'Subjects',
        component: Subjects,
        meta: { title: 'Subjects', roles: ['admin'] },
      },
      {
        path: 'people/students',
        name: 'Students',
        component: Students,
        meta: { title: 'Students', roles: ['admin'] },
      },
      {
        path: 'people/guardians',
        name: 'Guardians',
        component: Guardians,
        meta: { title: 'Guardians', roles: ['admin'] },
      },
      {
        path: 'people/teachers',
        name: 'Teachers',
        component: Teachers,
        meta: { title: 'Teachers', roles: ['admin'] },
      },
      {
        path: 'people/users',
        name: 'Users',
        component: Users,
        meta: { title: 'User Accounts', roles: ['admin'] },
      },
      {
        path: 'enrollment',
        name: 'Enrollment',
        component: Enrollment,
        meta: { title: 'Enrollment', roles: ['admin'] },
      },
      {
        path: 'timetable/periods',
        name: 'Periods',
        component: Periods,
        meta: { title: 'Periods', roles: ['admin'] },
      },
      {
        path: 'timetable/grid',
        name: 'TimetableGrid',
        component: TimetableGrid,
        meta: { title: 'Timetable', roles: ['admin', 'teacher', 'student'] },
      },
      {
        path: 'attendance/mark',
        name: 'MarkAttendance',
        component: MarkAttendance,
        meta: { title: 'Mark Attendance', roles: ['admin', 'teacher'] },
      },
      {
        path: 'attendance/summary',
        name: 'AttendanceSummary',
        component: AttendanceSummary,
        meta: { title: 'Attendance Summary', roles: ['admin', 'teacher', 'student', 'parent'] },
      },
      {
        path: 'exams',
        name: 'Exams',
        component: ExamsList,
        meta: { title: 'Exams', roles: ['admin'] },
      },
      {
        path: 'exams/marks',
        name: 'MarkEntry',
        component: MarkEntry,
        meta: { title: 'Enter Marks', roles: ['admin', 'teacher'] },
      },
      {
        path: 'exams/report-card',
        name: 'ReportCard',
        component: ReportCard,
        meta: { title: 'Report Card', roles: ['admin', 'teacher', 'student', 'parent'] },
      },
      {
        path: 'fees/structures',
        name: 'FeeStructures',
        component: FeeStructures,
        meta: { title: 'Fee Structures', roles: ['admin'] },
      },
      {
        path: 'fees/invoices',
        name: 'Invoices',
        component: FeesInvoices,
        meta: { title: 'Invoices', roles: ['admin'] },
      },
      {
        path: 'fees/my-fees',
        name: 'StudentFees',
        component: StudentFees,
        meta: { title: 'My Fees', roles: ['admin', 'student', 'parent'] },
      },
      {
        path: 'payroll/structures',
        name: 'SalaryStructures',
        component: SalaryStructures,
        meta: { title: 'Salary Structures', roles: ['admin'] },
      },
      {
        path: 'payroll/payslips',
        name: 'Payslips',
        component: Payslips,
        meta: { title: 'Payslips', roles: ['admin'] },
      },
      {
        path: 'payroll/my-payslips',
        name: 'MyPayslips',
        component: MyPayslips,
        meta: { title: 'My Payslips', roles: ['admin', 'teacher'] },
      },
      {
        path: 'announcements',
        name: 'Announcements',
        component: Announcements,
        meta: { title: 'Announcements' },
      },
      {
        path: 'audit-log',
        name: 'AuditLog',
        component: AuditLog,
        meta: { title: 'Audit Log', roles: ['admin'] },
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile,
        meta: { title: 'My Profile' },
      },
      {
        path: 'settings/school',
        name: 'SchoolSettings',
        component: SchoolSettings,
        meta: { title: 'School Profile', roles: ['admin'] },
      },
    ],
  },
  ...siteRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const school = useSchoolStore()

  // Lazy-load the tenant profile once per session so navigation stays cheap
  // and offline-first while branding follows the configured profile. The
  // endpoint is auth-gated, so skip it for logged-out visitors (login,
  // setup, public site routes) — defaults from siteConfig keep rendering.
  if (!school.loaded && auth.isAuthenticated) {
    try { await school.load() } catch { /* keep defaults */ }
  }

  // Check if onboarding is needed (no users in DB)
  const setupNeeded = await auth.needsSetup()

  // If setup is needed, force everyone to the setup page
  if (setupNeeded && to.name !== 'AdminSetup') {
    return { name: 'AdminSetup' }
  }

  // If setup is done, block access to the setup page
  if (!setupNeeded && to.meta?.setup) {
    return auth.isAuthenticated ? { name: 'Dashboard' } : { name: 'Login' }
  }

  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth)

  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta?.public && auth.isAuthenticated) {
    return { name: 'Dashboard' }
  }

  const required = to.meta?.roles
  if (required && !auth.hasRole(required)) {
    return { name: 'Dashboard' }
  }

  return true
})

// Apply tenant branding after each successful navigation so the document
// title, favicon, and primary colour always reflect the current profile.
router.afterEach((to) => {
  const school = useSchoolStore()
  const profile = school.profile || {}
  if (typeof document !== 'undefined') {
    document.title = composeTitle(to.meta?.title, profile.schoolName)
  }
  applyFavicon(profile.faviconUrl || profile.logoUrl || null)
  applyPrimaryColor(profile.primaryColor)
})

export default router