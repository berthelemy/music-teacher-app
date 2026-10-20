# AGENTS.md

Guide for AI agents and developers working on **Cadenza**, a lesson-planning app for instrument teachers with an admin area for managing teacher accounts.

**Start with [PLAN.md](PLAN.md).** Milestone 1 (the product surface on sample data) is done. Pick up from the next unchecked milestone.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start (React 19, TanStack Router, SSR) |
| Build | Vite 8 + `@netlify/vite-plugin-tanstack-start` |
| Styling | Bootstrap 5.3 via Sass (`src/styles.scss`). Tailwind and shadcn were removed on purpose |
| Tables | `datatables.net-bs5` + `datatables.net-responsive-bs5` (v3 / v4, no jQuery) |
| Icons | lucide-react |
| Language | TypeScript (strict, `noUnusedLocals`) |

## Directory structure

```
src/
├── components/
│   ├── app-shell.tsx      # Sidebar layout (teacher/admin), skip link, PageHeader
│   ├── data-table.tsx     # DataTables React wrapper (client-only, imperative DOM)
│   ├── modal.tsx          # <dialog>-based Modal + ConfirmModal
│   ├── announcer.tsx      # Toasts that double as an aria-live status region
│   ├── student-form.tsx   # Validated create/edit form for students
│   ├── status-badges.tsx  # Attendance labels and badges (JSX + HTML string versions)
│   ├── brand.tsx          # Product name + logo mark
│   └── error-pages.tsx    # 404 / route error pages
├── data/
│   ├── fixtures.ts        # ALL sample data + domain types + schedule expansion
│   └── store.tsx          # In-browser reducer store; useTeacherData / useAdminData
├── lib/dates.ts           # YYYY-MM-DD helpers (UTC math, en-GB formatting)
├── routes/
│   ├── index.tsx          # Landing page
│   ├── sign-in.tsx        # Preview sign-in (role picker; replaced in milestone 2)
│   ├── teacher/route.tsx  # Teacher layout (AppShell)
│   ├── teacher/index.tsx  # Overview
│   ├── teacher/students/  # index.tsx list, $studentId.tsx profile + schedule
│   ├── teacher/lessons/$lessonId.tsx
│   ├── teacher/calendar.tsx
│   ├── teacher/holidays.tsx
│   ├── admin/route.tsx    # Admin layout
│   └── admin/index.tsx    # Teachers list
└── styles.scss            # Bootstrap variables + app styles
public/img/hero-desk.png   # Landing hero (served through /.netlify/images)
```

## Key decisions

- **Data isolation.** Every teacher screen reads data only through `useTeacherData()`, which filters by `teacherId`. A lookup for another teacher's record throws `notFound()`. When real persistence arrives, keep that rule on the server: work out `teacher_id` from the session and never trust the client to send it.
- **Swapping in real data.** `fixtures.ts` holds the types the database schema should mirror. Replace the store's internals with loaders and server functions, and keep the hook return shapes so the screens don't change.
- **DataTables owns its DOM.** React renders an empty `<div>`. The wrapper creates the `<table>` after hydration and pushes row changes with `clear()/rows.add()/draw(false)`. Cell content is an HTML string, so **always escape user text with `esc()`**. Interactive cells use `data-action`/`data-id` buttons (handled by `onAction`) and `<a data-nav>` links (client-side navigation). Column definitions are read once.
- **Dates** are `YYYY-MM-DD` strings with UTC arithmetic, so SSR and the browser agree.
- **Holidays.** Schedule expansion skips holiday dates, and saving a holiday cancels untouched future lessons inside it.

## Accessibility conventions

- One `h1` per page (through `PageHeader`). Each section has a heading wired up with `aria-labelledby`.
- Skip link and `<main id="main">` in every layout. Focus outlines use brass (`:focus-visible`).
- Forms use visible labels, mark required fields, and set `aria-invalid` and `aria-describedby` on errors. The first invalid field gets focus.
- Icon-only buttons have `aria-label`. Repeated row buttons include the row's name in visually hidden text.
- Status changes are announced through `useAnnounce()`.
- The calendar is a real `<table>` with full-date labels for screen readers, and becomes an agenda list below the `md` breakpoint.

## Conventions

- Components use PascalCase. Files and routes use kebab-case. Import from `src` with `@/`.
- Use Bootstrap utility classes before adding custom CSS. Put custom CSS in `styles.scss`.
- Don't edit `src/routeTree.gen.ts`, which is generated.
- Use Netlify primitives for persistence (Netlify Database, Netlify Identity). See PLAN.md.
