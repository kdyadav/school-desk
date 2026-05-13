# skoolDesk

A browser-based, offline-first school management application built with Vue 3 and Vite. All data is stored locally in the browser via IndexedDB (Dexie), so the app runs entirely without a backend.

**Live demo:** [skool-desk.netlify.app](https://skool-desk.netlify.app/)

## Features

- **First-run setup wizard** — a two-step onboarding flow (school profile, then admin account) is forced until both have been configured.
- **Per-deployment multi-tenancy** — every browser-installed copy is its own tenant. School name, short name, tagline, contact details, social/nav links, logo, favicon, and primary colour are configured at runtime and stored in IndexedDB. The document title, favicon, and theme colour update live from the saved profile.
- **Editable school profile** — admins can update branding and contact information any time at `/app/settings/school`.
- **Authentication & roles** — local auth with bcrypt-hashed passwords; role-based route guards for `admin`, `teacher`, `student`, and `parent`.
- **Academic setup** — academic years, classes, sections, and subjects.
- **People** — students, guardians, teachers, and user accounts.
- **Enrollment** — assign students to sections per academic year.
- **Timetable** — periods and a weekly section/teacher grid.
- **Attendance** — daily marking and per-student/section summaries.
- **Exams** — exam definitions, mark entry, and report cards.
- **Fees** — fee structures, invoices, payments, and a student-facing fee view.
- **Payroll** — staff salary structures (earnings/deductions), monthly payslip generation, salary payments, and a staff-facing payslip view.
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

Open the printed local URL. On first launch you will be redirected to `/setup` to fill in the school profile and create the initial admin account.

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
  site/           # Public marketing site (Home/About/Contact/…) and siteConfig defaults
tests/            # Vitest suites for stores, repositories, schemas, audit, and site
```

## Data & persistence

Data lives entirely in the browser's IndexedDB under the `SchoolDeskDB` database (see `src/db/dexie.js`). Clearing site data in your browser will reset the application, including the admin account and the school profile. Seed data can be loaded from `src/db/seed.js`.

## Branding the app for a school

Each install is a self-contained tenant; there is no central registry of schools. To rebrand:

1. Run the app and complete the setup wizard, providing the school name, short name, tagline, contact details, primary colour, and (optionally) a logo and favicon.
2. After login, an admin can revisit **System → School Profile** (`/app/settings/school`) to change any of the above.

Logos and favicons are stored as base64 data URLs on the singleton `schoolProfile` row, so no asset pipeline or backend is involved. The fallback values used before the profile is saved live in `src/site/siteConfig.js`.

## License

This project is currently unlicensed. Add a `LICENSE` file before distributing.
