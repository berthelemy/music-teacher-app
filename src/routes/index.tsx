import { Link, createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays,
  ClipboardCheck,
  Lock,
  NotebookPen,
  Palmtree,
  Users,
} from 'lucide-react'
import { BrandMark } from '@/components/brand'

export const Route = createFileRoute('/')({
  component: Home,
})

const FEATURES = [
  {
    icon: Users,
    title: 'Every student, at a glance',
    body: 'Filter by instrument, music school and level. Archive students who move on without losing their history.',
  },
  {
    icon: CalendarDays,
    title: 'A calendar that knows your week',
    body: 'Set a weekly slot once and Cadenza fills the term — skipping your holidays automatically.',
  },
  {
    icon: NotebookPen,
    title: 'Plans, homework and private notes',
    body: 'Three notes on every lesson: what you’ll teach, what they’ll practise, and what only you need to remember.',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance in one tap',
    body: 'Mark present, late, absent or cancelled straight from the lesson, and see each student’s record over the term.',
  },
  {
    icon: Palmtree,
    title: 'Holidays that stay holidays',
    body: 'Add half-terms, tours and festival days. No lessons get scheduled on top of them.',
  },
  {
    icon: Lock,
    title: 'Private by design',
    body: 'Each teacher sees only their own students and notes. Your school’s admin manages accounts, not your planning.',
  },
]

function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className="border-bottom bg-paper">
        <nav className="navbar container py-3" aria-label="Main">
          <Link to="/" className="navbar-brand">
            <BrandMark />
          </Link>
          <div className="d-flex gap-2">
            <Link to="/sign-in" className="btn btn-outline-primary">
              Sign in
            </Link>
            <Link to="/teacher" className="btn btn-primary d-none d-sm-inline-block">
              Open the demo
            </Link>
          </div>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="hero py-5">
          <div className="container py-lg-5">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <p className="eyebrow mb-3">For instrument teachers</p>
                <h1 className="hero-title mb-4">
                  Your teaching week,{' '}
                  <span className="text-brass fst-italic">in tune.</span>
                </h1>
                <p className="lead text-body-secondary mb-4" style={{ maxWidth: '34rem' }}>
                  Cadenza is the lesson planner built for peripatetic and private
                  music teachers. Keep students, schedules, lesson plans,
                  homework and attendance together — across every school you
                  teach in.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/teacher" className="btn btn-primary btn-lg px-4">
                    Try the teacher demo
                  </Link>
                  <Link to="/admin" className="btn btn-outline-primary btn-lg px-4">
                    See the admin view
                  </Link>
                </div>
                <div className="staff-lines mt-5 d-none d-lg-block" aria-hidden="true" />
              </div>
              <div className="col-lg-6">
                <img
                  src="/.netlify/images?url=/img/hero-desk.png&w=1100&fm=webp"
                  srcSet="/.netlify/images?url=/img/hero-desk.png&w=640&fm=webp 640w, /.netlify/images?url=/img/hero-desk.png&w=1100&fm=webp 1100w"
                  sizes="(min-width: 992px) 50vw, 100vw"
                  width={1264}
                  height={848}
                  className="img-fluid hero-figure"
                  alt="A teacher’s desk with an open lesson planner, a violin and bow, sheet music and a metronome."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-5 bg-white border-top border-bottom" aria-labelledby="features-heading">
          <div className="container py-lg-4">
            <div className="text-center mx-auto mb-5" style={{ maxWidth: '40rem' }}>
              <p className="eyebrow">Everything in one place</p>
              <h2 id="features-heading" className="display-6">
                Less admin. More music.
              </h2>
            </div>
            <div className="row g-4">
              {FEATURES.map((f) => (
                <div className="col-md-6 col-lg-4" key={f.title}>
                  <div className="h-100 p-4 rounded-4 border bg-paper">
                    <span className="feature-icon mb-3">
                      <f.icon size={22} aria-hidden />
                    </span>
                    <h3 className="h5">{f.title}</h3>
                    <p className="text-body-secondary mb-0">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-5" aria-labelledby="cta-heading">
          <div className="container">
            <div className="rounded-4 p-4 p-lg-5 text-white d-lg-flex align-items-center justify-content-between gap-4" style={{ background: '#141c33' }}>
              <div>
                <h2 id="cta-heading" className="h3 text-white">
                  Ready for Monday’s lessons?
                </h2>
                <p className="mb-lg-0" style={{ color: '#cfd5e6' }}>
                  Explore a teacher’s week with sample students, plans and attendance.
                </p>
              </div>
              <Link to="/teacher" className="btn btn-lg fw-bold" style={{ background: '#c9952f', color: '#141c33' }}>
                Open the teacher demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-top py-4">
        <div className="container d-flex flex-wrap justify-content-between gap-2 small text-body-secondary">
          <span>© {new Date().getFullYear()} Cadenza</span>
          <span>Accessible, private lesson planning for music teachers.</span>
        </div>
      </footer>
    </>
  )
}
