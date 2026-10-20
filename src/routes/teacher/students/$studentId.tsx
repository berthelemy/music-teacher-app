import { useMemo, useState } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { CalendarPlus, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/app-shell'
import { DataTable, esc, type Column } from '@/components/data-table'
import { Modal } from '@/components/modal'
import { StudentForm } from '@/components/student-form'
import { useAnnounce } from '@/components/announcer'
import { ATTENDANCE_LABEL, attendanceBadgeHtml } from '@/components/status-badges'
import { fullName, useTeacherData } from '@/data/store'
import { WEEKDAYS, type Lesson, type Schedule } from '@/data/fixtures'
import { addDays, endTime, formatDate, todayKey } from '@/lib/dates'

export const Route = createFileRoute('/teacher/students/$studentId')({
  head: () => ({ meta: [{ title: 'Student · Cadenza' }] }),
  component: StudentPage,
})

function StudentPage() {
  const { studentId } = Route.useParams()
  const { studentById, lessons, dispatch } = useTeacherData()
  const announce = useAnnounce()
  const [editOpen, setEditOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const own = useMemo(() => lessons.filter((l) => l.studentId === studentId), [lessons, studentId])
  const today = todayKey()
  const taken = own.filter((l) => l.date < today && l.attendance !== 'scheduled')
  const count = (a: Lesson['attendance']) => taken.filter((l) => l.attendance === a).length
  const rate = taken.length ? Math.round(((count('present') + count('late')) / taken.length) * 100) : null
  const next = own.find((l) => l.date >= today && l.attendance !== 'cancelled')

  const columns = useMemo<Column<Lesson>[]>(
    () => [
      {
        title: 'Date',
        value: (l) => l.date + l.startTime,
        html: (l) =>
          `<a href="/teacher/lessons/${esc(l.id)}" data-nav class="fw-bold text-nowrap">${esc(formatDate(l.date))}</a>`,
        priority: 1,
      },
      { title: 'Time', value: (l) => `${l.startTime}–${endTime(l.startTime, l.durationMins)}`, priority: 4 },
      {
        title: 'Attendance',
        value: (l) => ATTENDANCE_LABEL[l.attendance],
        html: (l) => attendanceBadgeHtml(l.attendance),
        priority: 2,
      },
      {
        title: 'Plan',
        value: (l) => l.plan,
        html: (l) =>
          l.plan
            ? `<span class="d-inline-block text-truncate" style="max-width: 22rem">${esc(l.plan)}</span>`
            : '<span class="text-body-secondary">No plan yet</span>',
        priority: 3,
      },
      {
        title: 'Homework set',
        value: (l) => (l.homework ? 'Yes' : 'No'),
        priority: 5,
      },
    ],
    [],
  )

  // Teacher-scoped lookup: another teacher's student is simply "not found".
  const student = studentById.get(studentId)
  if (!student) throw notFound()

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/teacher/students">Students</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {fullName(student)}
          </li>
        </ol>
      </nav>
      <PageHeader
        eyebrow={`${student.instrument} · ${student.level}`}
        title={fullName(student)}
        description={
          <>
            {student.school}
            {student.archived && <span className="badge text-bg-secondary ms-2">Archived</span>}
          </>
        }
        actions={
          <>
            <button type="button" className="btn btn-outline-primary" onClick={() => setEditOpen(true)}>
              <Pencil size={16} aria-hidden /> Edit details
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setScheduleOpen(true)}
              disabled={student.archived}
            >
              <CalendarPlus size={16} aria-hidden /> {student.schedule ? 'Change schedule' : 'Create schedule'}
            </button>
          </>
        }
      />

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <section className="card h-100" aria-labelledby="details-heading">
            <div className="card-body">
              <h2 id="details-heading" className="h5">
                Details
              </h2>
              <dl className="row small mb-0">
                <dt className="col-5">Guardian</dt>
                <dd className="col-7">{student.guardianName || '—'}</dd>
                <dt className="col-5">Email</dt>
                <dd className="col-7 text-break">{student.email || '—'}</dd>
                <dt className="col-5">Phone</dt>
                <dd className="col-7">{student.phone || '—'}</dd>
                <dt className="col-5">Notes</dt>
                <dd className="col-7 mb-0">{student.notes || '—'}</dd>
              </dl>
            </div>
          </section>
        </div>
        <div className="col-sm-6 col-lg-4">
          <section className="card h-100" aria-labelledby="schedule-heading">
            <div className="card-body">
              <h2 id="schedule-heading" className="h5">
                Weekly schedule
              </h2>
              {student.schedule ? (
                <>
                  <p className="fs-5 font-display mb-1">
                    {WEEKDAYS[student.schedule.weekday]}s, {student.schedule.startTime}–
                    {endTime(student.schedule.startTime, student.schedule.durationMins)}
                  </p>
                  <p className="small text-body-secondary mb-2">
                    {student.schedule.location} · {formatDate(student.schedule.startDate)} to{' '}
                    {formatDate(student.schedule.endDate)}
                  </p>
                  {next && (
                    <p className="small mb-0">
                      Next lesson:{' '}
                      <Link to="/teacher/lessons/$lessonId" params={{ lessonId: next.id }}>
                        {formatDate(next.date)}
                      </Link>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-body-secondary mb-0">
                  No regular lesson yet. Create a schedule to fill the calendar.
                </p>
              )}
            </div>
          </section>
        </div>
        <div className="col-sm-6 col-lg-4">
          <section className="card h-100" aria-labelledby="attendance-heading">
            <div className="card-body">
              <h2 id="attendance-heading" className="h5">
                Attendance
              </h2>
              <p className="stat-value font-display fs-1 text-primary mb-1">{rate === null ? '—' : `${rate}%`}</p>
              <p className="small text-body-secondary">
                of {taken.length} recorded lessons attended
              </p>
              <ul className="list-inline small mb-0">
                <li className="list-inline-item">Present {count('present')}</li>
                <li className="list-inline-item">Late {count('late')}</li>
                <li className="list-inline-item">Absent {count('absent')}</li>
                <li className="list-inline-item">Cancelled {count('cancelled')}</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <section className="card" aria-labelledby="lessons-heading">
        <div className="card-body">
          <h2 id="lessons-heading" className="h5 mb-3">
            Lessons and plans
          </h2>
          <DataTable
            rows={own}
            columns={columns}
            caption={`Lessons for ${fullName(student)}`}
            emptyMessage="No lessons yet. Create a schedule to add them."
            order={[[0, 'desc']]}
          />
        </div>
      </section>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit ${fullName(student)}`}
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="student-edit" className="btn btn-primary">
              Save changes
            </button>
          </>
        }
      >
        <StudentForm
          id="student-edit"
          initial={student}
          onSubmit={(values) => {
            dispatch({ type: 'student/save', student: { ...student, ...values } })
            announce('Student details saved.')
            setEditOpen(false)
          }}
        />
      </Modal>

      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title={student.schedule ? 'Change weekly schedule' : 'Create a weekly schedule'}
        description="Lessons are added every week between the dates you choose, skipping your holidays. Lessons you’ve already planned or marked are kept."
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setScheduleOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="schedule-form" className="btn btn-primary">
              Save schedule
            </button>
          </>
        }
      >
        <ScheduleForm
          initial={student.schedule}
          onSubmit={(schedule) => {
            dispatch({ type: 'student/schedule', id: student.id, schedule })
            announce(`Schedule saved. Lessons added on ${WEEKDAYS[schedule.weekday]}s.`)
            setScheduleOpen(false)
          }}
        />
      </Modal>
    </>
  )
}

function ScheduleForm({
  initial,
  onSubmit,
}: {
  initial: Schedule | null
  onSubmit: (s: Schedule) => void
}) {
  const today = todayKey()
  const [v, setV] = useState<Schedule>(
    initial ?? {
      weekday: 1,
      startTime: '16:00',
      durationMins: 30,
      startDate: today,
      endDate: addDays(today, 70),
      location: 'Studio 2',
    },
  )
  const [error, setError] = useState('')

  return (
    <form
      id="schedule-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (!v.startDate || !v.endDate || v.endDate < v.startDate) {
          setError('The end date must be on or after the start date.')
          return
        }
        onSubmit(v)
      }}
    >
      <div className="row g-3">
        <div className="col-sm-6">
          <label className="form-label" htmlFor="sch-day">
            Day of the week
          </label>
          <select
            id="sch-day"
            className="form-select"
            value={v.weekday}
            onChange={(e) => setV({ ...v, weekday: Number(e.target.value) })}
          >
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-sm-3">
          <label className="form-label" htmlFor="sch-time">
            Start time
          </label>
          <input
            id="sch-time"
            type="time"
            className="form-control"
            value={v.startTime}
            onChange={(e) => setV({ ...v, startTime: e.target.value })}
            required
          />
        </div>
        <div className="col-6 col-sm-3">
          <label className="form-label" htmlFor="sch-dur">
            Length
          </label>
          <select
            id="sch-dur"
            className="form-select"
            value={v.durationMins}
            onChange={(e) => setV({ ...v, durationMins: Number(e.target.value) })}
          >
            {[20, 30, 40, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="sch-start">
            First lesson on or after
          </label>
          <input
            id="sch-start"
            type="date"
            className="form-control"
            value={v.startDate}
            onChange={(e) => setV({ ...v, startDate: e.target.value })}
          />
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="sch-end">
            Last lesson on or before
          </label>
          <input
            id="sch-end"
            type="date"
            className={`form-control${error ? ' is-invalid' : ''}`}
            value={v.endDate}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'sch-end-error' : undefined}
            onChange={(e) => setV({ ...v, endDate: e.target.value })}
          />
          {error && (
            <div id="sch-end-error" className="invalid-feedback d-block">
              {error}
            </div>
          )}
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="sch-loc">
            Location
          </label>
          <input
            id="sch-loc"
            className="form-control"
            value={v.location}
            onChange={(e) => setV({ ...v, location: e.target.value })}
          />
        </div>
      </div>
    </form>
  )
}
