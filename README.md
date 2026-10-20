# Cadenza

Cadenza is a secure, web-based lesson planner for musical instrument teachers. Teachers keep their students, weekly lesson schedules, holidays, lesson plans, homework, private notes and attendance in one place. Admins manage teacher accounts.

This version is the first milestone: the full clickable product, running on realistic sample data. Changes you make while exploring last until you reload the page. See [PLAN.md](PLAN.md) for the roadmap to real accounts and persistent storage.

## What's here

| Screen | Path |
| --- | --- |
| Landing page | `/` |
| Sign-in (preview) | `/sign-in` |
| Teacher overview | `/teacher` |
| Students list (filterable, CRUD, archive) | `/teacher/students` |
| Student profile, schedule and lessons | `/teacher/students/:id` |
| Calendar | `/teacher/calendar` |
| Lesson plan, homework, notes and attendance | `/teacher/lessons/:id` |
| Holidays | `/teacher/holidays` |
| Admin: teachers | `/admin` |

## Technology

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, SSR) on Netlify
- [Bootstrap 5](https://getbootstrap.com/), themed with Sass in `src/styles.scss`
- [DataTables](https://datatables.net/) with Bootstrap 5 styling and the Responsive extension, for every table
- Native `<dialog>` modals, `lucide-react` icons, and the Fraunces and Atkinson Hyperlegible fonts

## Running locally

```bash
pnpm install
netlify dev        # or: pnpm dev (Vite only, on port 3000)
```

## Roadmap

Still to build: Netlify Identity sign-in with teacher and admin roles, Netlify Database tables for students, lessons and holidays, server functions that scope every query to the signed-in teacher, admin account management, and an accessibility audit. Details are in [PLAN.md](PLAN.md).
