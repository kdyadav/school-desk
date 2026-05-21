# skoolDesk

A serverless school-management SPA built with Vue 3 and Vite, talking directly to a Supabase project (Postgres + Auth + Storage) via `@supabase/supabase-js`. Row-Level Security enforces role-based access; Postgres triggers write the audit log.

**Live demo:** [skool-desk.netlify.app](https://skool-desk.netlify.app/)

## Features

- **First-run setup wizard** — two-step onboarding (school profile, then owner account). The very first Supabase Auth signup becomes the `owner` via the `on_auth_user_created` trigger.
- **Multi-role auth** — Supabase Auth handles credentials; a `profiles` row keyed on `auth.users.id` carries `role` (`owner` / `admin` / `teacher` / `student` / `parent`), `name`, and `linkedId`. Role-based route guards work off the cached profile.
- **Editable school profile** — admins update branding and contact info at `/app/settings/school`. Logos and favicons live in the public `branding` Supabase Storage bucket and are referenced from the `school_profile` row as URLs.
- **Academic setup, people, enrollment, timetable, attendance, exams, fees, payroll, announcements** — all CRUD goes through PostgREST (`@supabase/supabase-js`) with per-table RLS policies.
- **Audit log** — Postgres triggers write one `audit_logs` row per INSERT/UPDATE/DELETE on every domain table; auth events (login / logout / signup) are written via the `record_auth_event` RPC. Admins read the timeline; the owner can clear it.
- **Reusable UI library** — form primitives in `src/ui-lib` with a lightweight `useForm` composable and Zod-backed validation.
- **Command palette & theme** — keyboard-driven navigation and light/dark theming.

## Tech stack

- [Vue 3](https://vuejs.org/) with `<script setup>` SFCs
- [Vite](https://vitejs.dev/) for dev server and build
- [Vue Router](https://router.vuejs.org/) for routing and guards
- [Pinia](https://pinia.vuejs.org/) for state
- [Supabase JS](https://supabase.com/docs/reference/javascript) (PostgREST + Auth + Storage)
- [Zod](https://zod.dev/) for schema validation
- [Tailwind CSS](https://tailwindcss.com/) + PrimeFlex for styling

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier is fine). Apply the SQL migration at [`../supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql) via the Supabase SQL editor or `supabase db push`.

### Configure

Set the project URL and anon (publishable) key in [`ui/.env`](.env):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-key>
```

The anon key is safe to ship to the browser — RLS controls access.

### Install & develop

```bash
npm install
npm run dev
```

Open the printed local URL. On first launch the SPA hits the `needs_setup()` RPC and redirects to `/setup` until an `owner` profile exists.

### Build & preview

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/     # Top-level views (Login, Dashboard, AdminSetup, …)
  layouts/        # AppShell, CommandPalette, navigation config
  modules/        # Feature areas (academic, people, attendance, exams, fees, …)
  router/         # Routes and auth/role guards
  stores/         # Pinia stores per domain
  repositories/   # Repository facade + supabase adapter (adapters/supabase)
  schemas/        # Zod schemas for every entity
  ui-lib/         # Reusable form components, useForm, validators
  composables/    # useTheme, useTableState, useCommandPalette, useRoleContext, useBranding
  audit/          # Auth-event audit writer (CRUD audit is server-side via DB triggers)
  plugins/        # Plugin setup
  site/           # Public marketing site (Home/About/Contact/…) and siteConfig defaults
  supabase.js     # Shared @supabase/supabase-js client instances
```

## Data & persistence

All data lives in your Supabase Postgres database. Tables, RLS, triggers, RPCs, and the `branding` storage bucket are defined in [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

Key design notes:
- API table names are camelCase (`academicYears`, `examMarks`); Postgres table names are snake_case (`academic_years`, `exam_marks`) via the original Prisma `@@map(...)` directives. The mapping lives in `src/repositories/adapters/supabase/index.js`.
- `profiles` shadows `auth.users` and carries the `role` everything else gates on.
- `pending_invites` lets an admin pre-register a role before the invitee signs up.

## Limitations vs. the legacy Fastify backend

These are intentional consequences of moving to PostgREST + RLS without an Edge Function tier:

- **Admin "Create User" can't set the password directly** — Supabase Auth requires service-role privileges for `admin.createUser`. The flow uses a secondary `signUp` client (no session persistence) plus a `pending_invites` row that the trigger consumes. Users sign in with whatever password the admin set in the form.
- **"Change password for another user"** maps to `resetPasswordForEmail` (sends a magic-link reset email).
- **"Delete user"** removes the `profiles` row only. The orphaned `auth.users` row can be deleted from the Supabase dashboard.

## License

This project is currently unlicensed. Add a `LICENSE` file before distributing.
