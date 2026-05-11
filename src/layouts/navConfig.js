// Sidebar navigation organised in groups, ordered by typical usage frequency.
// Each group: { key, label?, items: [...] }. A group with no label renders without a header
// and is not collapsible. `key` is a stable identifier used to persist collapse state.
// Each item: { label, to, icon, roles? }. If roles is omitted, the item is visible to every authenticated user.
export const navGroups = [
  {
    key: 'overview',
    items: [
      { label: 'Dashboard', to: '/', icon: 'home' },
    ],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    items: [
      { label: 'Mark Attendance', to: '/attendance/mark', icon: 'check-circle', roles: ['admin', 'teacher'] },
      { label: 'Attendance Report', to: '/attendance/summary', icon: 'chart-bar', roles: ['admin', 'teacher', 'student', 'parent'] },
    ],
  },
  {
    key: 'timetable',
    label: 'Timetable',
    items: [
      { label: 'Periods', to: '/timetable/periods', icon: 'clock', roles: ['admin'] },
      { label: 'Timetable', to: '/timetable/grid', icon: 'table', roles: ['admin', 'teacher', 'student'] },
    ],
  },
  {
    key: 'communication',
    label: 'Communication',
    items: [
      { label: 'Announcements', to: '/announcements', icon: 'megaphone' },
    ],
  },
  {
    key: 'exams',
    label: 'Exams',
    items: [
      { label: 'Exams', to: '/exams', icon: 'document-text', roles: ['admin'] },
      { label: 'Enter Marks', to: '/exams/marks', icon: 'pencil', roles: ['admin', 'teacher'] },
      { label: 'Report Card', to: '/exams/report-card', icon: 'document-report', roles: ['admin', 'teacher', 'student', 'parent'] },
    ],
  },
  {
    key: 'fees',
    label: 'Fees',
    items: [
      { label: 'Fee Structures', to: '/fees/structures', icon: 'currency', roles: ['admin'] },
      { label: 'Invoices', to: '/fees/invoices', icon: 'receipt', roles: ['admin'] },
      { label: 'My Fees', to: '/fees/my-fees', icon: 'wallet', roles: ['admin', 'student', 'parent'] },
    ],
  },
  {
    key: 'people',
    label: 'People',
    items: [
      { label: 'Students', to: '/people/students', icon: 'users', roles: ['admin'] },
      { label: 'Guardians', to: '/people/guardians', icon: 'user-group', roles: ['admin'] },
      { label: 'Teachers', to: '/people/teachers', icon: 'academic-cap', roles: ['admin'] },
      { label: 'User Accounts', to: '/people/users', icon: 'key', roles: ['admin'] },
      { label: 'Enrollment', to: '/enrollment', icon: 'clipboard-list', roles: ['admin'] },
    ],
  },
  {
    key: 'academics',
    label: 'Academics',
    items: [
      { label: 'Academic Years', to: '/setup/years', icon: 'calendar', roles: ['admin'] },
      { label: 'Classes', to: '/setup/classes', icon: 'layers', roles: ['admin'] },
      { label: 'Sections', to: '/setup/sections', icon: 'grid', roles: ['admin'] },
      { label: 'Subjects', to: '/setup/subjects', icon: 'book', roles: ['admin'] },
    ],
  },
  {
    key: 'system',
    label: 'System',
    items: [
      { label: 'Audit Log', to: '/audit-log', icon: 'clipboard-list', roles: ['admin'] },
    ],
  },
]

// Flat list kept for backward compatibility with any consumer expecting a flat array.
export const navItems = navGroups.flatMap((g) => g.items)

export default navGroups
