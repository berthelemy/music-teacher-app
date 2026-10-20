import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/app-shell'
import { DataTable, esc, type Column } from '@/components/data-table'
import { ConfirmModal, Modal } from '@/components/modal'
import { StudentForm } from '@/components/student-form'
import { useAnnounce } from '@/components/announcer'
import { fullName, newId, useTeacherData } from '@/data/store'
import { WEEKDAYS, type Student } from '@/data/fixtures'

export const Route = createFileRoute('/teacher/students/')({
  head: () => ({ meta: [{ title: 'Students · Cadenza' }] }),
  component: StudentsPage,
})

type StatusFilter = 'active' | 'archived' | 'all'

function StudentsPage() {
  const { students, dispatch, teacherId } = useTeacherData()
  const announce = useAnnounce()
  const [status, setStatus] = useState<StatusFilter>('active')
  const [instrument, setInstrument] = useState('')
  const [school, setSchool] = useState('')
  const [level, setLevel] = useState('')
  const [editing, setEditing] = useState<Student | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Student | null>(null)
  const [archiving, setArchiving] = useState<Student | null>(null)

  const options = useMemo(() => {
    const uniq = (k: 'instrument' | 'school' | 'level') =>
      [...new Set(students.map((s) => s[k]))].sort()
    return { instrument: uniq('instrument'), school: uniq('school'), level: uniq('level') }
  }, [students])

  const rows = useMemo(
    () =>
      students.filter(
        (s) =>
          (status === 'all' || (status === 'archived') === s.archived) &&
          (!instrument || s.instrument === instrument) &&
          (!school || s.school === school) &&
          (!level || s.level === level),
      ),
    [students, status, instrument, school, level],
  )

  const columns = useMemo<Column<Student>[]>(
    () => [
      {
        title: 'Name',
        value: (s) => `${s.lastName}, ${s.firstName}`,
        html: (s) =>
          `<a href="/teacher/students/${esc(s.id)}" data-nav class="fw-bold">${esc(fullName(s))}</a>`,
        priority: 1,
      },
      { title: 'Instrument', value: (s) => s.instrument, priority: 3 },
      { title: 'Music school', value: (s) => s.school, priority: 4 },
      {
        title: 'Level',
        value: (s) => s.level,
        priority: 2,
      },
      {
        title: 'Weekly lesson',
        value: (s) => (s.schedule ? `${s.schedule.weekday}${s.schedule.startTime}` : '9'),
        html: (s) =>
          s.schedule
            ? `${WEEKDAYS[s.schedule.weekday].slice(0, 3)} ${esc(s.schedule.startTime)} <span class="text-body-secondary">(${s.schedule.durationMins} min)</span>`
            : '<span class="text-body-secondary">Not scheduled</span>',
        priority: 6,
      },
      {
        title: 'Status',
        value: (s) => (s.archived ? 'Archived' : 'Active'),
        html: (s) =>
          s.archived
            ? '<span class="badge text-bg-secondary">Archived</span>'
            : '<span class="badge text-bg-success">Active</span>',
        priority: 5,
      },
      {
        title: 'Actions',
        value: () => '',
        orderable: false,
        className: 'text-end text-nowrap',
        priority: 1,
        html: (s) => {
          const name = esc(fullName(s))
          return `<div class="btn-group btn-group-sm" role="group" aria-label="Actions for ${name}">
            <button type="button" class="btn btn-outline-primary" data-action="edit" data-id="${esc(s.id)}">Edit<span class="visually-hidden"> ${name}</span></button>
            <button type="button" class="btn btn-outline-secondary" data-action="archive" data-id="${esc(s.id)}">${s.archived ? 'Restore' : 'Archive'}<span class="visually-hidden"> ${name}</span></button>
            <button type="button" class="btn btn-outline-danger" data-action="delete" data-id="${esc(s.id)}">Delete<span class="visually-hidden"> ${name}</span></button>
          </div>`
        },
      },
    ],
    [],
  )

  const onAction = (action: string, id: string) => {
    const s = students.find((x) => x.id === id)
    if (!s) return
    if (action === 'edit') setEditing(s)
    if (action === 'delete') setDeleting(s)
    if (action === 'archive') {
      if (s.archived) {
        dispatch({ type: 'student/archive', id, archived: false })
        announce(`${fullName(s)} restored to active students.`)
      } else setArchiving(s)
    }
  }

  const filterSelect = (
    label: string,
    value: string,
    set: (v: string) => void,
    list: string[],
    idName: string,
  ) => (
    <div className="col-6 col-md-3">
      <label htmlFor={idName} className="form-label small fw-bold mb-1">
        {label}
      </label>
      <select id={idName} className="form-select form-select-sm" value={value} onChange={(e) => set(e.target.value)}>
        <option value="">All</option>
        {list.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  )

  const activeCount = students.filter((s) => !s.archived).length
  const editingStudent = editing === 'new' ? undefined : (editing ?? undefined)

  return (
    <>
      <PageHeader
        eyebrow="Students"
        title="Your students"
        description={`${activeCount} active, ${students.length - activeCount} archived. Only you can see these students.`}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
            <Plus size={18} aria-hidden /> Add student
          </button>
        }
      />

      <div className="card">
        <div className="card-body">
          <fieldset className="mb-3">
            <legend className="visually-hidden">Filter students</legend>
            <div className="row g-2 align-items-end">
              <div className="col-12 col-xl-auto me-xl-3">
                <span className="form-label small fw-bold mb-1 d-block" id="status-label">
                  Status
                </span>
                <div className="btn-group btn-group-sm" role="group" aria-labelledby="status-label">
                  {(['active', 'archived', 'all'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`btn ${status === s ? 'btn-primary' : 'btn-outline-primary'}`}
                      aria-pressed={status === s}
                      onClick={() => setStatus(s)}
                    >
                      {s === 'active' ? 'Active' : s === 'archived' ? 'Archived' : 'All'}
                    </button>
                  ))}
                </div>
              </div>
              {filterSelect('Instrument', instrument, setInstrument, options.instrument, 'f-instrument')}
              {filterSelect('Music school', school, setSchool, options.school, 'f-school')}
              {filterSelect('Level', level, setLevel, options.level, 'f-level')}
            </div>
          </fieldset>
          <p className="visually-hidden" aria-live="polite">
            Showing {rows.length} students.
          </p>
          <DataTable
            rows={rows}
            columns={columns}
            caption="Your students"
            emptyMessage="No students match these filters."
            onAction={onAction}
          />
        </div>
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add a student' : `Edit ${editingStudent ? fullName(editingStudent) : ''}`}
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" form="student-form" className="btn btn-primary">
              {editing === 'new' ? 'Add student' : 'Save changes'}
            </button>
          </>
        }
      >
        <StudentForm
          key={editingStudent?.id ?? 'new'}
          id="student-form"
          initial={editingStudent}
          onSubmit={(values) => {
            const student: Student = editingStudent
              ? { ...editingStudent, ...values }
              : { id: newId('s'), teacherId, archived: false, schedule: null, ...values }
            dispatch({ type: 'student/save', student })
            announce(editingStudent ? `Saved changes to ${fullName(student)}.` : `${fullName(student)} added.`)
            setEditing(null)
          }}
        />
      </Modal>

      <ConfirmModal
        open={archiving !== null}
        onClose={() => setArchiving(null)}
        title={`Archive ${archiving ? fullName(archiving) : ''}?`}
        body="Archived students are hidden from your active list and calendar planning, but their lesson history and notes are kept. You can restore them at any time."
        confirmLabel="Archive student"
        onConfirm={() => {
          if (!archiving) return
          dispatch({ type: 'student/archive', id: archiving.id, archived: true })
          announce(`${fullName(archiving)} archived.`)
        }}
      />

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting ? fullName(deleting) : ''}?`}
        body="This permanently deletes the student and all of their lessons, plans and attendance records. If they might return, archive them instead."
        confirmLabel="Delete permanently"
        danger
        onConfirm={() => {
          if (!deleting) return
          dispatch({ type: 'student/delete', id: deleting.id })
          announce(`${fullName(deleting)} deleted.`, 'danger')
        }}
      />
    </>
  )
}
