import { useState } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { PageHeader } from '@/components/app-shell'
import { useAnnounce } from '@/components/announcer'
import { ATTENDANCE_LABEL } from '@/components/status-badges'
import { fullName, useTeacherData } from '@/data/store'
import { isHoliday, type Attendance, type Lesson } from '@/data/fixtures'
import { endTime, formatDate, formatLongDate } from '@/lib/dates'

export const Route = createFileRoute('/teacher/lessons/$lessonId')({
  head: () => ({ meta: [{ title: 'Lesson plan · Cadenza' }] }),
  component: LessonPage,
})

const ATTENDANCE_OPTIONS: Attendance[] = ['scheduled', 'present', 'late', 'absent', 'cancelled']

function LessonPage() {
  const { lessonId } = Route.useParams()
  const { lessons, studentById, holidays } = useTeacherData()
  const lesson = lessons.find((l) => l.id === lessonId)
  const student = lesson && studentById.get(lesson.studentId)
  if (!lesson || !student) throw notFound()

  const series = lessons.filter((l) => l.studentId === student.id)
  const idx = series.findIndex((l) => l.id === lesson.id)
  const prev = series[idx - 1]
  const next = series[idx + 1]
  const holiday = isHoliday(lesson.date, holidays)

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/teacher/calendar">Calendar</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/teacher/students/$studentId" params={{ studentId: student.id }}>
              {fullName(student)}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {formatDate(lesson.date)}
          </li>
        </ol>
      </nav>
      <PageHeader
        eyebrow={`${student.instrument} · ${student.level} · ${student.school}`}
        title={`${fullName(student)}’s lesson`}
        description={`${formatLongDate(lesson.date)}, ${lesson.startTime}–${endTime(lesson.startTime, lesson.durationMins)} · ${lesson.location}`}
        actions={
          <nav aria-label="Other lessons for this student" className="btn-group">
            {prev ? (
              <Link to="/teacher/lessons/$lessonId" params={{ lessonId: prev.id }} className="btn btn-outline-primary">
                <ChevronLeft size={16} aria-hidden /> Previous<span className="visually-hidden"> lesson, {formatDate(prev.date)}</span>
              </Link>
            ) : (
              <span className="btn btn-outline-primary disabled" aria-disabled="true">
                <ChevronLeft size={16} aria-hidden /> Previous
              </span>
            )}
            {next ? (
              <Link to="/teacher/lessons/$lessonId" params={{ lessonId: next.id }} className="btn btn-outline-primary">
                Next<span className="visually-hidden"> lesson, {formatDate(next.date)}</span> <ChevronRight size={16} aria-hidden />
              </Link>
            ) : (
              <span className="btn btn-outline-primary disabled" aria-disabled="true">
                Next <ChevronRight size={16} aria-hidden />
              </span>
            )}
          </nav>
        }
      />
      {holiday && (
        <div className="alert alert-warning" role="note">
          This lesson falls during your holiday “{holiday.title}”. Consider marking it as cancelled.
        </div>
      )}
      {/* Remount the editor when moving between lessons so it loads fresh values. */}
      <LessonEditor key={lesson.id} lesson={lesson} previous={prev} />
    </>
  )
}

function LessonEditor({ lesson, previous }: { lesson: Lesson; previous?: Lesson }) {
  const { dispatch } = useTeacherData()
  const announce = useAnnounce()
  const [plan, setPlan] = useState(lesson.plan)
  const [homework, setHomework] = useState(lesson.homework)
  const [teacherNotes, setTeacherNotes] = useState(lesson.teacherNotes)
  const dirty = plan !== lesson.plan || homework !== lesson.homework || teacherNotes !== lesson.teacherNotes

  return (
    <div className="row g-4">
      <div className="col-xl-8">
        <form
          className="d-flex flex-column gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            dispatch({ type: 'lesson/update', id: lesson.id, patch: { plan, homework, teacherNotes } })
            announce('Lesson notes saved.')
          }}
        >
          <div className="card note-card">
            <div className="card-body">
              <label htmlFor="plan" className="h5 form-label">
                Lesson plan
              </label>
              <p id="plan-help" className="small text-body-secondary">
                What you’ll cover: warm-ups, technique, repertoire, theory.
              </p>
              <textarea id="plan" className="form-control" aria-describedby="plan-help" value={plan} onChange={(e) => setPlan(e.target.value)} />
            </div>
          </div>
          <div className="card note-card">
            <div className="card-body">
              <label htmlFor="homework" className="h5 form-label">
                Homework
              </label>
              <p id="homework-help" className="small text-body-secondary">
                What the student should practise before the next lesson.
              </p>
              <textarea
                id="homework"
                className="form-control"
                aria-describedby="homework-help"
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
              />
            </div>
          </div>
          <div className="card note-card border-primary-subtle">
            <div className="card-body">
              <label htmlFor="teacher-notes" className="h5 form-label d-flex align-items-center gap-2">
                <Lock size={18} aria-hidden /> Notes for me
              </label>
              <p id="notes-help" className="small text-body-secondary">
                Private to you — observations, reminders, things to follow up.
              </p>
              <textarea
                id="teacher-notes"
                className="form-control"
                aria-describedby="notes-help"
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <button type="submit" className="btn btn-primary btn-lg" disabled={!dirty}>
              Save notes
            </button>
            {dirty && <span className="small text-body-secondary">You have unsaved changes.</span>}
          </div>
        </form>
      </div>

      <div className="col-xl-4 d-flex flex-column gap-4">
        <section className="card" aria-labelledby="att-heading">
          <div className="card-body">
            <fieldset>
              <legend id="att-heading" className="h5">
                Attendance
              </legend>
              <div className="d-flex flex-column gap-2">
                {ATTENDANCE_OPTIONS.map((a) => (
                  <div className="form-check" key={a}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="attendance"
                      id={`att-${a}`}
                      checked={lesson.attendance === a}
                      onChange={() => {
                        dispatch({ type: 'lesson/update', id: lesson.id, patch: { attendance: a } })
                        announce(`Attendance marked as ${ATTENDANCE_LABEL[a].toLowerCase()}.`)
                      }}
                    />
                    <label className="form-check-label" htmlFor={`att-${a}`}>
                      {a === 'scheduled' ? 'Not yet recorded' : ATTENDANCE_LABEL[a]}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section className="card bg-paper" aria-labelledby="prev-heading">
          <div className="card-body">
            <h2 id="prev-heading" className="h5">
              Last lesson
            </h2>
            {previous ? (
              <>
                <p className="small text-body-secondary mb-2">{formatDate(previous.date)}</p>
                <h3 className="h6 mb-1">Homework set</h3>
                <p className="small">{previous.homework || 'No homework recorded.'}</p>
                {previous.teacherNotes && (
                  <>
                    <h3 className="h6 mb-1">Your notes</h3>
                    <p className="small mb-0">{previous.teacherNotes}</p>
                  </>
                )}
              </>
            ) : (
              <p className="small text-body-secondary mb-0">This is the first lesson in the series.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
