# Future School — School Management System

A full-stack school management system built as a learning project, with four
distinct roles — **Admin**, **Teacher**, **Student**, and **Parent** — each
with their own permissions and views. Live example:

- **Website:** https://future-school-ten.vercel.app
- **API:** https://future-school.onrender.com

---

## Table of contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Database schema](#database-schema)
- [Features by role](#features-by-role)
- [API reference](#api-reference)
- [Environment variables](#environment-variables)
- [Local development](#local-development)
- [Database setup & seeding](#database-setup--seeding)
- [Deployment](#deployment)
- [Design system](#design-system)
- [Known limitations & ideas for later](#known-limitations--ideas-for-later)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, React Router, Tailwind CSS v4, DaisyUI |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (raw SQL via the `pg` library, no ORM) |
| Auth | Hand-rolled JWT (jsonwebtoken) + bcrypt password hashing |
| Validation | Zod (both frontend types and backend request validation) |
| Hosting | Vercel (frontend), Render (backend), Neon (PostgreSQL) |

---

## Project structure

This is a monorepo with two independent apps:

```
future-school/
├── client/                      React + Vite frontend
│   └── src/
│       ├── api/                 One file per backend resource; wraps fetch calls
│       ├── components/
│       │   └── layout/          Navbar, Footer, PublicLayout, AppLayout
│       ├── context/              AuthContext (login state, token, current user)
│       ├── pages/
│       │   ├── public/           Home, About, Contact
│       │   ├── auth/             Login
│       │   ├── admin/            All Admin screens
│       │   ├── teacher/          Teacher dashboard, Attendance, Grades
│       │   ├── student/          Student dashboard
│       │   └── parent/           Parent dashboard
│       ├── types/                 TypeScript types, one file per resource
│       └── constants.ts           Shared fixed dropdown values (grade levels, terms...)
│
└── server/                       Express + TypeScript backend
    ├── schema.sql                 Full database schema (run this first)
    └── src/
        ├── config/db.ts           PostgreSQL connection pool
        ├── validators/            One Zod schema file per resource
        ├── services/              Database queries, one file per resource
        ├── controllers/           Request handlers, call services
        ├── routes/                Express routers, wire up middleware + controllers
        ├── middlewares/           authenticate, authorize, errorHandler
        ├── utils/asyncHandler.ts  Wraps async route handlers for error handling
        └── scripts/               seedAdmin.ts, resetAndSeed.ts
```

**Backend request flow:** `route → authenticate → authorize(role) → controller
→ service → database`. Every protected route checks the JWT first
(`authenticate`), then checks the user's role (`authorize`). Controllers
validate the request body with Zod, call a service function to touch the
database, and shape the response. Services are the only files that run SQL
queries.

**Frontend data flow:** a page calls a function from `api/`, which calls the
shared `apiFetch` helper in `api/client.ts` (adds the JSON header, parses the
response, throws a typed `ApiError` on failure). Pages read the current user
and JWT from `AuthContext` via the `useAuth()` hook.

---

## Database schema

10 tables, no ORM — see [`server/schema.sql`](server/schema.sql) for the full
definition with constraints and indexes. High-level relationships:

```
users (role: admin | teacher | student | parent)
 ├── teachers / students / parents   (1-to-1 detail tables, PK = users.id)
 │
 ├── classes ── academic_years            (class belongs to one academic year)
 │     └── class_subjects ── subjects      (subject + teacher assigned to a class)
 │
 ├── enrollments                          (student ↔ class, per academic year)
 ├── parent_student                       (parent ↔ student, many-to-many)
 ├── attendance                           (student, class, date, status)
 └── grades                               (student, subject, class, term, score)
```

Notable design decisions:
- **Role is fixed after account creation.** Changing a user's role would
  conflict with their existing role-specific data (grades, attendance...).
  To fix a wrong role, delete the account and create a new one.
- **`academic_years` is a real table** (not a free-text field) with an
  `is_current` flag, referenced by `classes` and `enrollments` via foreign
  key. Deleting an academic year still in use is blocked (`ON DELETE
  RESTRICT`) rather than silently cascading.
- **Fixed-choice fields use SQL `CHECK` constraints + Zod enums**, not free
  text: `role`, `attendance.status`, `grade_level`, `term`, and
  `assessment_type` all come from a closed list on both the frontend
  (`<select>`) and backend (`z.enum`).
- Deleting a `class` or `subject` cascades to its related
  `class_subjects`, `enrollments`, `attendance`, and `grades` rows
  (`ON DELETE CASCADE`) — the UI warns about this before confirming a delete.

---

## Features by role

**Admin**
- Add / view / edit / delete users (any role)
- Manage academic years (add, mark one as current, delete)
- Manage classes and subjects (create, edit, delete, search)
- Assign a teacher to teach a subject in a class
- Enroll students into a class for an academic year
- Link parents to their children

**Teacher**
- See the classes/subjects they're assigned to
- Take attendance for a class (present / absent / late / excused), re-editable per date
- Enter grades for a student in a subject (term, assessment type, score)

**Student**
- See their class, subjects, and teachers
- See their own attendance history
- See their own grades

**Parent**
- See a list of their linked children
- For each child: class, subjects, attendance, and grades (read-only)

---

## API reference

All routes are prefixed with `/api`. Every route except `POST /auth/login`
requires a `Authorization: Bearer <token>` header. `GET /health` (outside
`/api`) is public and used for uptime checks.

| Method & path | Role required | Purpose |
|---|---|---|
| `POST /auth/login` | — (public) | Log in, returns a JWT + user |
| `POST /auth/register` | admin | Create a new user account |
| `GET /users` | admin | List all users |
| `PUT /users/:id` | admin | Update a user's name/email/password |
| `DELETE /users/:id` | admin | Delete a user |
| `GET /academic-years` | admin | List academic years |
| `POST /academic-years` | admin | Create an academic year |
| `PUT /academic-years/:id/set-current` | admin | Mark one year as current |
| `DELETE /academic-years/:id` | admin | Delete an academic year |
| `GET /classes` | admin | List classes |
| `POST /classes` | admin | Create a class |
| `PUT /classes/:id` | admin | Update a class |
| `DELETE /classes/:id` | admin | Delete a class |
| `GET /subjects` | admin | List subjects |
| `POST /subjects` | admin | Create a subject |
| `PUT /subjects/:id` | admin | Update a subject |
| `DELETE /subjects/:id` | admin | Delete a subject |
| `GET /class-subjects` | admin | List all teacher assignments |
| `POST /class-subjects` | admin | Assign a teacher to a subject in a class |
| `GET /enrollments` | admin | List all enrollments |
| `POST /enrollments` | admin | Enroll a student in a class |
| `GET /parent-students` | admin | List parent-child links |
| `POST /parent-students` | admin | Link a parent to a student |
| `GET /teacher/my-classes` | teacher | Classes/subjects assigned to me |
| `GET /teacher/classes/:classId/students` | teacher | Roster for a class I teach |
| `GET /teacher/classes/:classId/attendance?date=` | teacher | Attendance for a class on a date |
| `POST /teacher/classes/:classId/attendance` | teacher | Save attendance for a class/date |
| `GET /teacher/classes/:classId/subjects/:subjectId/grades` | teacher | Grades I've entered |
| `POST /teacher/classes/:classId/subjects/:subjectId/grades` | teacher | Enter a grade |
| `GET /student/my-class` | student | My class + subjects/teachers |
| `GET /student/my-attendance` | student | My attendance history |
| `GET /student/my-grades` | student | My grades |
| `GET /parent/my-children` | parent | My linked children |
| `GET /parent/children/:studentId/details` | parent | One child's class, attendance, grades |

---

## Environment variables

**`server/.env`** (see `server/.env.example`):
```
PORT=5000

# Local development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=school_management

# OR for cloud databases (Neon, Supabase...) — takes priority if set
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

JWT_SECRET=a_long_random_string
JWT_EXPIRES_IN=1d

# used only by npm run seed:admin
SEED_ADMIN_EMAIL=admin@school.com
SEED_ADMIN_PASSWORD=ChangeMe123!
SEED_ADMIN_NAME=System Admin
```

**`client/.env`** (see `client/.env.example`):
```
VITE_API_URL=http://localhost:5000/api
```

---

## Local development

**1. Database** — create a PostgreSQL database, then run `server/schema.sql`
against it (via `psql` or a GUI like pgAdmin).

**2. Backend:**
```bash
cd server
npm install
# create .env from .env.example, fill in DB credentials and JWT_SECRET
npm run dev
```
Visit `http://localhost:5000/health` — should return `{"status":"ok"}`.

**3. Frontend:**
```bash
cd client
npm install
# create .env from .env.example
npm run dev
```
Visit the printed local URL (usually `http://localhost:5173`).

**4. Create the first Admin account** (needed because `/auth/register` itself
requires an Admin to be logged in already):
```bash
cd server
npm run seed:admin
```

**Type-checking:**
```bash
# server
npx tsc --noEmit

# client (the root tsconfig.json only references sub-projects,
# so -b is required for a real check)
npx tsc -b --noEmit
```

---

## Database setup & seeding

- `npm run seed:admin` — creates a single Admin account only. Safe to run on
  a database that already has data (skips if the email already exists).
- `npm run db:reset-and-seed` — ⚠️ **destructive**. Truncates every table
  and rebuilds a full sample dataset: 1 admin, 10 teachers, 52 students
  spread across 13 classes (Grade 1–13), 10 subjects, 20 parents linked to
  students, one academic year marked current, plus sample attendance and
  grades. Every seeded account uses the password `Password123!`.

---

## Deployment

Current live setup (all free tiers):

| Part | Provider | Notes |
|---|---|---|
| Frontend | Vercel | Root directory `client`, env var `VITE_API_URL` |
| Backend | Render | Root directory `server`, build `npm install && npm run build`, start `npm start` |
| Database | Neon | Serverless PostgreSQL, connection via `DATABASE_URL` with SSL |

Notes:
- `server/src/config/db.ts` automatically uses `DATABASE_URL` with SSL if
  it's set, otherwise falls back to the discrete `DB_*` variables for local
  development without SSL.
- Render's free tier spins the backend down after ~15 minutes of
  inactivity; the first request after that can take 30–60 seconds.
- After any schema change (editing `schema.sql`), the cloud database needs
  to be updated manually (re-run the SQL against it) — schema changes are
  not applied automatically on deploy.

---

## Design system

Colors and fonts are defined once as CSS variables in `client/src/index.css`
(Tailwind v4 `@theme` block) and referenced everywhere as utility classes
(`bg-marigold`, `font-display`, etc.) rather than hex codes, so the whole
site's look can be changed by editing that one file.

| Token | Value | Used for |
|---|---|---|
| `--color-marigold` | `#FFB238` | Primary actions |
| `--color-sky-teal` | `#2FA9A0` | Secondary accents, footer |
| `--color-coral` | `#FF6F5E` | Destructive actions, highlights |
| `--color-leaf` | `#7CC576` | Success states |
| `--color-ink` | `#2B3A55` | Body text |
| `--color-sun-cream` | `#FFF8E7` | Page background |
| `--font-display` | Fredoka | Headings |
| `--font-body` | Nunito | Body text |

---

## Known limitations & ideas for later

- No password reset / "forgot password" flow (Admin resets passwords manually
  via Edit on the Users list).
- No file uploads (e.g. profile photos, documents).
- No pagination — list pages load everything at once, fine at this data
  scale but would need it for a larger school.
- No automated tests yet.
- Contact page form is UI-only (not wired to a backend endpoint or email).
- Single-tenant: the system serves one school. Supporting multiple schools
  would need a `school_id` added across most tables.
