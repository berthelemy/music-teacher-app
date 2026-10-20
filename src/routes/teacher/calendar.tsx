import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/app-shell'
import { ATTENDANCE_LABEL, AttendanceBadge } from '@/components/status-badges'
import { fullName, useTeacherData } from '@/data/store'
import { isHoliday, type Lesson } from '@/data/fixtures'
import {
  addDays,
  addMonths,
  dayOfWeek,
  endTime,
  formatDate,
  formatLongDate,
  formatMonth,
  startOfMonth,
  todayKey,
} from '@/lib/dates'

export const Route = createFileRoute('/teacher/calendar')({
  head: () => ({ meta: [{ title: 'Calendar · Cadenza' }] }),
  component: CalendarPage,
})

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DOW_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function CalendarPage() {
  const { lessons, holidays, studentById, students } = useTeacherData()
  const today = todayKey()
  const [month, setMonth] = useState(startOfMonth(today))
  const [studentFilter, setStudentFilter] = useState('')

  const visible = useMemo(
    () =>
      lessons.filter((l) => {
        const s = studentById.get(l.studentId)
        return s && !s.archived && (!studentFilter || l.studentId === studentFilter)
      }),
    [lessons, studentById, studentFilter],
  )

  const byDate = useMemo(() => {
    const m = new Map<string, Lesson[]>()
    for (const l of visible) m.set(l.date, [...(m.get(l.date) ?? []), l])
    return m
  }, [visible])

  // Build a Monday-first grid of whole weeks covering the month.
  const weeks = useMemo(() => {
    const gridStart = addDays(month, -((dayOfWeek(month) + 6) % 7))
    const monthEnd = addDays(addMonths(month, 1), -1)
    const gridEnd = addDays(monthEnd, 6 - ((dayOfWeek(monthEnd) + 6) % 7))
    const out: string[][] = []
    for (let d = gridStart, i = 0; d <= gridEnd; d = addDays(d, 1), i++) {
      if (i % 7 === 0) out.push([])
      out[out.length - 1].push(d)
    }
    return out
  }, [month])

  const inMonth = (d: string) => d.slice(0, 7) === month.slice(0, 7)
  const monthDays = weeks.flat().filter(inMonth)
  const activeStudents = students.filter((s) => !s.archived)

  const chipLabel = (l: Lesson) => {
    const s = studentById.get(l.studentId)!
    return `${l.startTime} ${fullName(s)}`
  }

  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title={formatMonth(month)}
        description="Select a lesson to open its plan, homework and attendance."
        actions={
          <>
            <div className="btn-group" role="group" aria-label="Change month">
              <button type="button" className="btn btn-outline-primary" onClick={() => setMonth(addMonths(month, -1))}>
                <ChevronLeft size={16} aria-hidden />
                <span className="visually-hidden">Previous month</span>
              </button>
              <button type="button" className="btn btn-outline-primary" onClick={() => setMonth(startOfMonth(today))}>
                Today
              </button>
              <button type="button" className="btn btn-outline-primary" onClick={() => setMonth(addMonths(month, 1))}>
                <ChevronRight size={16} aria-hidden />
                <span className="visually-hidden">Next month</span>
              </button>
            </div>
          </>
        }
      />

      <div className="d-flex flex-wrap gap-3 align-items-end justify-content-between mb-3">
        <div>
          <label htmlFor="cal-student" className="form-label small fw-bold mb-1">
            Show lessons for
          </label>
          <select
            id="cal-student"
            className="form-select form-select-sm"
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
          >
            <option value="">All active students</option>
            {activeStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {fullName(s)}
              </option>
            ))}
          </select>
        </div>
        <ul className="list-inline small mb-0" aria-label="Legend">
          <li className="list-inline-item">
            <span className="legend-swatch bg-success" aria-hidden="true" /> Present
          </li>
          <li className="list-inline-item">
            <span className="legend-swatch bg-warning" aria-hidden="true" /> Late
          </li>
          <li className="list-inline-item">
            <span className="legend-swatch bg-danger" aria-hidden="true" /> Absent
          </li>
          <li className="list-inline-item">
            <span className="legend-swatch bg-primary" aria-hidden="true" /> Scheduled
          </li>
          <li className="list-inline-item">
            <span className="legend-swatch bg-brass-soft border" aria-hidden="true" /> Holiday
          </li>
        </ul>
      </div>

      {/* Month grid on tablets and up */}
      <div className="d-none d-md-block card overflow-hidden">
        <table className="table table-bordered cal-grid mb-0">
          <caption className="visually-hidden">Lessons in {formatMonth(month)}</caption>
          <thead>
            <tr>
              {DOW.map((d, i) => (
                <th scope="col" key={d}>
                  <abbr title={DOW_LONG[i]} className="text-decoration-none">
                    {d}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0]}>
                {week.map((d) => {
                  const hol = isHoliday(d, holidays)
                  const dayLessons = byDate.get(d) ?? []
                  const cls = [!inMonth(d) && 'outside', hol && 'holiday', d === today && 'today']
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <td key={d} className={cls} aria-current={d === today ? 'date' : undefined}>
                      <span className="day-num">
                        <span aria-hidden="true">{Number(d.slice(8))}</span>
                        <span className="visually-hidden">{formatLongDate(d)}</span>
                      </span>
                      {hol && <span className="d-block small fw-bold text-brass text-truncate">{hol.title}</span>}
                      {dayLessons.slice(0, 4).map((l) => (
                        <Link
                          key={l.id}
                          to="/teacher/lessons/$lessonId"
                          params={{ lessonId: l.id }}
                          className={`lesson-chip att-${l.attendance}`}
                          aria-label={`${chipLabel(l)}, ${ATTENDANCE_LABEL[l.attendance]}`}
                        >
                          {chipLabel(l)}
                        </Link>
                      ))}
                      {dayLessons.length > 4 && (
                        <span className="small text-body-secondary">+{dayLessons.length - 4} more</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Agenda list on phones */}
      <div className="d-md-none">
        {monthDays
          .filter((d) => byDate.has(d) || isHoliday(d, holidays))
          .map((d) => {
            const hol = isHoliday(d, holidays)
            return (
              <section key={d} className="mb-3" aria-label={formatLongDate(d)}>
                <h2 className={`h6 mb-2 ${d === today ? 'text-primary' : ''}`}>
                  {formatDate(d)}
                  {d === today && <span className="badge text-bg-primary ms-2">Today</span>}
                </h2>
                {hol && <p className="small fw-bold text-brass mb-1">Holiday: {hol.title}</p>}
                <div className="list-group">
                  {(byDate.get(d) ?? []).map((l) => {
                    const s = studentById.get(l.studentId)!
                    return (
                      <Link
                        key={l.id}
                        to="/teacher/lessons/$lessonId"
                        params={{ lessonId: l.id }}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <span>
                          <span className="fw-bold">{fullName(s)}</span>
                          <span className="d-block small text-body-secondary">
                            {l.startTime}–{endTime(l.startTime, l.durationMins)} · {s.instrument}
                          </span>
                        </span>
                        <AttendanceBadge value={l.attendance} />
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        {!monthDays.some((d) => byDate.has(d)) && (
          <p className="text-body-secondary">No lessons this month.</p>
        )}
      </div>
    </>
  )
}
