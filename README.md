# skoolDesk

A browser-based, offline-first school management application built with Vue 3 and Vite. All data is stored locally in the browser via IndexedDB (Dexie), so the app runs entirely without a backend.

**Live demo:** [skool-desk.netlify.app](https://skool-desk.netlify.app/)

## Features

- **First-run admin setup** — the app forces an onboarding flow until an admin account exists.
- **Authentication & roles** — local auth with bcrypt-hashed passwords; role-based route guards for `admin`, `teacher`, `student`, and `parent`.
- **Academic setup** — academic years, classes, sections, and subjects.
- **People** — students, guardians, teachers, and user accounts.
- **Enrollment** — assign students to sections per academic year.
- **Timetable** — periods and a weekly section/teacher grid.
- **Attendance** — daily marking and per-student/section summaries.
- **Exams** — exam definitions, mark entry, and report cards.
- **Fees** — fee structures, invoices, payments, and a student-facing fee view.
- **Announcements** — audience-targeted notices.
- **Audit log** — every repository write is recorded (with secret fields redacted) and viewable by admins.
- **Reusable UI library** — form primitives in `src/ui-lib` with a lightweight `useForm` composable and Zod-backed validation.
- **Command palette & theme** — keyboard-driven navigation and light/dark theming.

## Tech stack

- [Vue 3](https://vuejs.org/) with `<script setup>` SFCs
- [Vite](https://vitejs.dev/) for dev server and build
- [Vue Router](https://router.vuejs.org/) for routing and guards
- [Pinia](https://pinia.vuejs.org/) for state
- [Dexie](https://dexie.org/) over IndexedDB for persistence
- [Zod](https://zod.dev/) for schema validation
- [Tailwind CSS](https://tailwindcss.com/) + PrimeFlex for styling
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing
- [Vitest](https://vitest.dev/) + [fake-indexeddb](https://github.com/dumbmatter/fakeIndexedDB) for tests

## Getting started

### Prerequisites

- Node.js 18+ and npm

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Open the printed local URL. On first launch you will be redirected to `/setup` to create the initial admin account.

### Build & preview

```bash
npm run build
npm run preview
```

### Test

```bash
npm test          # run once
npm run test:watch
```

## Project structure

```
src/
  components/     # Top-level views (Login, Dashboard, AdminSetup, …)
  layouts/        # AppShell, CommandPalette, navigation config
  modules/        # Feature areas (academic, people, attendance, exams, fees, …)
  router/         # Routes and auth/role guards
  stores/         # Pinia stores per domain
  repositories/   # Dexie-backed repositories with schema validation + audit
  schemas/        # Zod schemas for every entity
  db/             # Dexie database definition and seed data
  ui-lib/         # Reusable form components, useForm, validators
  composables/    # useTheme, useTableState, useCommandPalette, useRoleContext
  audit/          # Audit logger wired into repositories
  plugins/        # PrimeVue and other plugin setup
tests/            # Vitest suites for stores, repositories, and audit
```

## Data & persistence

Data lives entirely in the browser's IndexedDB under the `SchoolDeskDB` database (see `src/db/dexie.js`). Clearing site data in your browser will reset the application, including the admin account. Seed data can be loaded from `src/db/seed.js`.

## License

This project is currently unlicensed. Add a `LICENSE` file before distributing.
