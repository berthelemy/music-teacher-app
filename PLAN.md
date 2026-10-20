# Cadenza roadmap

Cadenza is a secure lesson planner for instrument teachers, with an admin area for managing teacher accounts. It's being built in milestones. Each one is small and ships something that works on its own.

## Milestone 1 — Product surface ✅

The clickable product, running on sample data (`src/data/fixtures.ts`) held in an in-browser store (`src/data/store.tsx`):

- Landing page and sign-in screen (the sign-in is a preview; it doesn't check anyone's identity yet)
- Teacher overview: the next teaching day, things that need attention, the next holiday
- Students: a DataTables list you can filter by status, instrument, music school and level, with add, edit, archive/restore and delete
- Student profile: details, weekly schedule builder, attendance summary, and a table of lessons and plans
- Calendar: month grid (agenda list on phones) with holidays shaded. Every lesson links to its plan
- Lesson page: plan, homework and private teacher notes, attendance, last week's homework, and previous/next lesson
- Holidays: add, edit and delete. Lessons booked inside a new holiday are cancelled
- Admin › Teachers: a DataTables list with last login date, plus add, edit, suspend and delete

## Milestone 2 — Authentication and roles

- Turn on Netlify Identity (`@netlify/identity`). Admins invite teachers, so public sign-up stays off.
- Store the roles `teacher` and `admin` in `app_metadata.authorization.roles`.
- Replace `/sign-in` with a real login, password recovery and invite acceptance.
- Protect `/teacher/*` and `/admin/*` with route `beforeLoad` guards that use server-side auth, so unauthenticated visitors are redirected.
- Record `lastLogin` on every successful sign-in.

## Milestone 3 — Data model (Netlify Database + Drizzle)

- Write `db/schema.ts` with the tables `teachers` (linked to the Identity user id), `students`, `schedules`, `lessons` and `holidays`. Every row carries `teacher_id`.
- Indexes on `(teacher_id, date)` for lessons and on `(teacher_id, archived)` for students.
- Generate migrations and seed a demo teacher from the current fixtures.

## Milestone 4 — Teacher APIs and data isolation

- Add TanStack Start server functions for student CRUD and archiving, schedule expansion, lesson notes and attendance, and holiday CRUD.
- Each function works out `teacher_id` from the authenticated session and never accepts it from the client. Every query is scoped by it, so a request for another teacher's record returns not found.
- Swap `useTeacherData()` from the in-browser store to route loaders and mutations, keeping the same data shapes.
- Add tests that one teacher can't read or change another teacher's data.

## Milestone 5 — Admin APIs

- Admin-only server functions to create (invite), update, suspend and delete teachers through the Identity admin API, along with their teacher rows.
- Admins see aggregate counts only, never students or notes.
- Confirm before cascading deletes, and keep an audit log of admin actions.

## Milestone 6 — Scheduling polish

- One-off lessons, rescheduling a single lesson, and different lesson lengths within a series.
- Week view in the calendar, plus a print view of the day's plans.
- Optional: an iCal feed per teacher.

## Milestone 7 — Accessibility and quality pass

- Automated axe checks on every route in CI, plus a manual screen-reader pass with NVDA and VoiceOver.
- Keyboard testing for the DataTables controls and the calendar.
- Empty, loading and error states for every screen once data comes from the server.

## Milestone 8 — English and French interface

- Add a small translation layer: an English dictionary (the default), a French dictionary, and a hook that components use to look up text.
- Add a language switcher to the app layout and the landing page. Save the choice in a cookie so the server-rendered page and the browser agree, and set the page's `lang` attribute to match.
- Move every screen's text into the dictionaries, including labels, buttons, dialogs, status badges, error pages, table headings and screen-reader announcements.
- Show dates and the DataTables controls (search, paging, "no results") in the chosen language.
