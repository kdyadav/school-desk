// Sidebar navigation organised in groups, ordered by typical usage frequency.
// Each group: { key, label?, items: [...] }. A group with no label renders without a header
// and is not collapsible. `key` is a stable identifier used to persist collapse state.
// Each item: { label, to, icon, roles? }. If roles is omitted, the item is visible to every authenticated user.
export const navGroups = [
  {
    key: 'overview',
    items: [
      { label: 'Dashboard', to: '/app', icon: 'home' },
    ],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    items: [
      { label: 'Mark Attendance', to: '/app/attendance/mark', icon: 'check-circle', roles: ['admin', 'teacher'] },
      { label: 'Attendance Report', to: '/app/attendance/summary', icon: 'chart-bar', roles: ['admin', 'teacher', 'student', 'parent'] },
    ],
  },
  {
    key: 'timetable',
    label: 'Timetable',
    items: [
      { label: 'Periods', to: '/app/timetable/periods', icon: 'clock', roles: ['admin'] },
      { label: 'Timetable', to: '/app/timetable/grid', icon: 'table', roles: ['admin', 'teacher', 'student'] },
    ],
  },
  {
    key: 'communication',
    label: 'Communication',
    items: [
      { label: 'Announcements', to: '/app/announcements', icon: 'megaphone' },
    ],
  },
  {
    key: 'exams',
    label: 'Exams',
    items: [
      { label: 'Exams', to: '/app/exams', icon: 'document-text', roles: ['admin'] },
      { label: 'Enter Marks', to: '/app/exams/marks', icon: 'pencil', roles: ['admin', 'teacher'] },
      { label: 'Report Card', to: '/app/exams/report-card', icon: 'document-report', roles: ['admin', 'teacher', 'student', 'parent'] },
    ],
  },
  {
    key: 'fees',
    label: 'Fees',
    items: [
      { label: 'Fee Structures', to: '/app/fees/structures', icon: 'currency', roles: ['admin'] },
      { label: 'Invoices', to: '/app/fees/invoices', icon: 'receipt', roles: ['admin'] },
      { label: 'My Fees', to: '/app/fees/my-fees', icon: 'wallet', roles: ['admin', 'student', 'parent'] },
    ],
  },
  {
    key: 'payroll',
    label: 'Payroll',
    items: [
      { label: 'Salary Structures', to: '/app/payroll/structures', icon: 'currency', roles: ['admin'] },
      { label: 'Payslips', to: '/app/payroll/payslips', icon: 'receipt', roles: ['admin'] },
      { label: 'My Payslips', to: '/app/payroll/my-payslips', icon: 'wallet', roles: ['admin', 'teacher'] },
    ],
  },
  {
    key: 'people',
    label: 'People',
    items: [
      { label: 'Students', to: '/app/people/students', icon: 'users', roles: ['admin'] },
      { label: 'Guardians', to: '/app/people/guardians', icon: 'user-group', roles: ['admin'] },
      { label: 'Teachers', to: '/app/people/teachers', icon: 'academic-cap', roles: ['admin'] },
      { label: 'User Accounts', to: '/app/people/users', icon: 'key', roles: ['admin'] },
      { label: 'Enrollment', to: '/app/enrollment', icon: 'clipboard-list', roles: ['admin'] },
    ],
  },
  {
    key: 'academics',
    label: 'Academics',
    items: [
      { label: 'Academic Years', to: '/app/setup/years', icon: 'calendar', roles: ['admin'] },
      { label: 'Classes', to: '/app/setup/classes', icon: 'layers', roles: ['admin'] },
      { label: 'Sections', to: '/app/setup/sections', icon: 'grid', roles: ['admin'] },
      { label: 'Subjects', to: '/app/setup/subjects', icon: 'book', roles: ['admin'] },
    ],
  },
  {
    key: 'system',
    label: 'System',
    items: [
      { label: 'School Profile', to: '/app/settings/school', icon: 'cog', roles: ['admin'] },
      { label: 'Audit Log', to: '/app/audit-log', icon: 'clipboard-list', roles: ['admin'] },
    ],
  },
]

// Flat list kept for backward compatibility with any consumer expecting a flat array.
export const navItems = navGroups.flatMap((g) => g.items)

export default navGroups
