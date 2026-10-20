import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Clock, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/app-shell'
import { AttendanceBadge } from '@/components/status-badges'
import { fullName, useTeacherData } from '@/data/store'
import {
  addDays,
  endTime,
  formatDate,
  formatLongDate,
  formatShortDate,
  todayKey,
} from '@/lib/dates'

export const Route = createFileRoute('/teacher/')({
  head: () => ({ meta: [{ title: 'Overview · Cadenza' }] }),
  component: Overview,
})

function Overview() {
  const { teacher, students, lessons, holidays, studentById } = useTeacherData()
  const today = todayKey()
  const weekEnd = addDays(today, 6)

  const activeStudents = students.filter((s) => !s.archived)
  const upcoming = lessons.filter((l) => l.date >= today && l.attendance !== 'cancelled')
  const thisWeek = upcoming.filter((l) => l.date <= weekEnd)
  const nextDay = upcoming[0]?.date
  const nextDayLessons = upcoming.filter((l) => l.date === nextDay)
  const needsPlan = thisWeek.filter((l) => !l.plan.trim())
  const past = lessons.filter((l) => l.date < today && l.attendance !== 'scheduled')
  const attended = past.filter((l) => l.attendance === 'present' || l.attendance === 'late')
  const attendanceRate = past.length ? Math.round((attended.length / past.length) * 100) : 0
  const unmarked = lessons.filter((l) => l.date < today && l.attendance === 'scheduled')
  const nextHoliday = holidays.find((h) => h.endDate >= today)

  const stats = [
    { label: 'Active students', value: activeStudents.length },
    { label: 'Lessons in the next 7 days', value: thisWeek.length },
    { label: 'Attendance this term', value: `${attendanceRate}%` },
    { label: 'Lessons to plan this week', value: needsPlan.length },
  ]

  return (
    <>
      <PageHeader
        eyebrow={formatLongDate(today)}
        title={`Good to see you, ${teacher?.firstName ?? 'there'}`}
        description="Here’s what’s coming up in your teaching week."
        actions={
          <>
            <Link to="/teacher/calendar" className="btn btn-outline-primary">
              Open calendar
            </Link>
            <Link to="/teacher/students" className="btn btn-primary">
              Manage students
            </Link>
          </>
        }
      />

      <section aria-labelledby="stats-heading" className="mb-4">
        <h2 id="stats-heading" className="visually-hidden">
          Summary
        </h2>
        <div className="row g-3">
          {stats.map((s) => (
            <div className="col-6 col-xl-3" key={s.label}>
              <div className="card stat-card h-100">
                <div className="card-body">
                  <p className="stat-value mb-2 text-primary">{s.value}</p>
                  <p className="small text-body-secondary mb-0">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="row g-4">
        <section className="col-xl-7" aria-labelledby="next-heading">
          <div className="card h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h2 id="next-heading" className="h5 mb-0">
                {nextDay ? (nextDay === today ? 'Today' : `Next teaching day · ${formatDate(nextDay)}`) : 'No upcoming lessons'}
              </h2>
            </div>
            <ul className="list-group list-group-flush">
              {nextDayLessons.map((l) => {
                const s = studentById.get(l.studentId)
                return (
                  <li key={l.id} className="list-group-item py-3">
                    <div className="d-flex flex-wrap justify-content-between gap-2">
                      <div>
                        <Link
                          to="/teacher/lessons/$lessonId"
                          params={{ lessonId: l.id }}
                          className="fw-bold"
                        >
                          {s ? fullName(s) : 'Student'}
                        </Link>
                        <span className="text-body-secondary"> · {s?.instrument}, {s?.level}</span>
                        <div className="small text-body-secondary mt-1 d-flex flex-wrap gap-3">
                          <span>
                            <Clock size={14} aria-hidden /> {l.startTime}–{endTime(l.startTime, l.durationMins)}
                          </span>
                          <span>
                            <MapPin size={14} aria-hidden /> {l.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-md-end">
                        {l.plan ? (
                          <span className="badge text-bg-light border">Plan ready</span>
                        ) : (
                          <span className="badge bg-brass-soft text-dark">Needs a plan</span>
                        )}
                      </div>
                    </div>
                    {l.plan && <p className="small mb-0 mt-2 text-truncate">{l.plan}</p>}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <div className="col-xl-5 d-flex flex-column gap-4">
          <section className="card" aria-labelledby="attention-heading">
            <div className="card-header bg-white py-3">
              <h2 id="attention-heading" className="h5 mb-0">
                Needs your attention
              </h2>
            </div>
            <ul className="list-group list-group-flush">
              {unmarked.slice(0, 4).map((l) => (
                <li key={l.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    Attendance not taken for{' '}
                    <Link to="/teacher/lessons/$lessonId" params={{ lessonId: l.id }}>
                      {fullName(studentById.get(l.studentId)!)}, {formatShortDate(l.date)}
                    </Link>
                  </span>
                  <AttendanceBadge value={l.attendance} />
                </li>
              ))}
              {needsPlan.slice(0, 4).map((l) => (
                <li key={l.id} className="list-group-item">
                  Plan{' '}
                  <Link to="/teacher/lessons/$lessonId" params={{ lessonId: l.id }}>
                    {fullName(studentById.get(l.studentId)!)}’s lesson on {formatShortDate(l.date)}
                  </Link>
                </li>
              ))}
              {unmarked.length === 0 && needsPlan.length === 0 && (
                <li className="list-group-item text-body-secondary">
                  You’re all caught up. Every lesson this week has a plan.
                </li>
              )}
            </ul>
          </section>

          {nextHoliday && (
            <section className="card bg-brass-soft border-0" aria-labelledby="holiday-heading">
              <div className="card-body">
                <p className="eyebrow mb-1">Next holiday</p>
                <h2 id="holiday-heading" className="h5">
                  {nextHoliday.title}
                </h2>
                <p className="mb-3">
                  {formatDate(nextHoliday.startDate)} – {formatDate(nextHoliday.endDate)}. No lessons are
                  scheduled during this time.
                </p>
                <Link to="/teacher/holidays" className="btn btn-sm btn-outline-dark">
                  Manage holidays <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
