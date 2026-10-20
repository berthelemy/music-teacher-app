import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/app-shell'
import { DataTable, esc, type Column } from '@/components/data-table'
import { ConfirmModal, Modal } from '@/components/modal'
import { useAnnounce } from '@/components/announcer'
import { fullName, newId, useAdminData } from '@/data/store'
import { INSTRUMENTS, type Teacher } from '@/data/fixtures'
import { formatDateTime } from '@/lib/dates'

export const Route = createFileRoute('/admin/')({
  component: TeachersPage,
})

type TeacherRow = Teacher & { studentCount: number }

function TeachersPage() {
  const { teachers, studentCounts, dispatch } = useAdminData()
  const announce = useAnnounce()
  const [editing, setEditing] = useState<Teacher | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Teacher | null>(null)

  // Student counts are aggregated only — admins never see student records.
  const rows = useMemo<TeacherRow[]>(
    () => teachers.map((t) => ({ ...t, studentCount: studentCounts.get(t.id) ?? 0 })),
    [teachers, studentCounts],
  )

  const columns = useMemo<Column<TeacherRow>[]>(
    () => [
      {
        title: 'Name',
        value: (t) => `${t.lastName}, ${t.firstName}`,
        html: (t) => `<span class="fw-bold">${esc(fullName(t))}</span>`,
        priority: 1,
      },
      { title: 'Email', value: (t) => t.email, priority: 4 },
      { title: 'Instruments', value: (t) => t.instruments.join(', '), priority: 6 },
      { title: 'Students', value: (t) => t.studentCount, className: 'text-end', priority: 5 },
      {
        title: 'Last login',
        value: (t) => t.lastLogin ?? '',
        html: (t) =>
          t.lastLogin
            ? `<time datetime="${esc(t.lastLogin)}">${esc(formatDateTime(t.lastLogin))}</time>`
            : '<span class="text-body-secondary">Never</span>',
        priority: 2,
      },
      {
        title: 'Status',
        value: (t) => t.status,
        html: (t) =>
          t.status === 'active'
            ? '<span class="badge text-bg-success">Active</span>'
            : '<span class="badge text-bg-secondary">Suspended</span>',
        priority: 3,
      },
      {
        title: 'Actions',
        value: () => '',
        orderable: false,
        className: 'text-end text-nowrap',
        priority: 1,
        html: (t) => {
          const name = esc(fullName(t))
          return `<div class="btn-group btn-group-sm" role="group" aria-label="Actions for ${name}">
            <button type="button" class="btn btn-outline-primary" data-action="edit" data-id="${esc(t.id)}">Edit<span class="visually-hidden"> ${name}</span></button>
            <button type="button" class="btn btn-outline-danger" data-action="delete" data-id="${esc(t.id)}">Delete<span class="visually-hidden"> ${name}</span></button>
          </div>`
        },
      },
    ],
    [],
  )

  const editingTeacher = editing === 'new' ? undefined : (editing ?? undefined)

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Teachers"
        description="Create and manage teacher accounts. Teachers’ students and lesson notes stay private to them."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
            <Plus size={18} aria-hidden /> Add teacher
          </button>
        }
      />
      <div className="card">
        <div className="card-body">
          <DataTable
            rows={rows}
            columns={columns}
            caption="Teachers"
            emptyMessage="No teachers yet."
            order={[[4, 'desc']]}
            onAction={(action, id) => {
              const t = teachers.find((x) => x.id === id)
              if (!t) return
              if (action === 'edit') setEditing(t)
              if (action === 'delete') setDeleting(t)
            }}
          />
        </div>
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editingTeacher ? `Edit ${fullName(editingTeacher)}` : 'Add a teacher'}
        description={editingTeacher ? undefined : 'They’ll receive an email invitation to set their password.'}
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" form="teacher-form" className="btn btn-primary">
              {editingTeacher ? 'Save changes' : 'Add teacher'}
            </button>
          </>
        }
      >
        <TeacherForm
          key={editingTeacher?.id ?? 'new'}
          initial={editingTeacher}
          onSubmit={(values) => {
            const teacher: Teacher = editingTeacher
              ? { ...editingTeacher, ...values }
              : { id: newId('t'), lastLogin: null, ...values }
            dispatch({ type: 'teacher/save', teacher })
            announce(editingTeacher ? `Saved ${fullName(teacher)}.` : `Invitation sent to ${teacher.email}.`)
            setEditing(null)
          }}
        />
      </Modal>

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting ? fullName(deleting) : ''}?`}
        body="This removes the teacher’s account along with all of their students, lessons and notes. Consider suspending the account instead."
        confirmLabel="Delete teacher"
        danger
        onConfirm={() => {
          if (!deleting) return
          dispatch({ type: 'teacher/delete', id: deleting.id })
          announce(`${fullName(deleting)} deleted.`, 'danger')
        }}
      />
    </>
  )
}

type TeacherFields = Pick<Teacher, 'firstName' | 'lastName' | 'email' | 'instruments' | 'status'>

function TeacherForm({ initial, onSubmit }: { initial?: Teacher; onSubmit: (v: TeacherFields) => void }) {
  const [v, setV] = useState<TeacherFields>(
    initial ?? { firstName: '', lastName: '', email: '', instruments: [], status: 'active' },
  )
  const [errors, setErrors] = useState<Partial<Record<'firstName' | 'lastName' | 'email', string>>>({})

  const text = (k: 'firstName' | 'lastName' | 'email', label: string, type = 'text') => (
    <div className={k === 'email' ? 'col-12' : 'col-sm-6'}>
      <label htmlFor={`tf-${k}`} className="form-label">
        {label}
      </label>
      <input
        id={`tf-${k}`}
        name={k}
        type={type}
        className={`form-control${errors[k] ? ' is-invalid' : ''}`}
        value={v[k]}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={errors[k] ? `tf-${k}-error` : undefined}
        onChange={(e) => setV({ ...v, [k]: e.target.value })}
      />
      {errors[k] && (
        <div id={`tf-${k}-error`} className="invalid-feedback">
          {errors[k]}
        </div>
      )}
    </div>
  )

  return (
    <form
      id="teacher-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const found: typeof errors = {}
        if (!v.firstName.trim()) found.firstName = 'Enter a first name.'
        if (!v.lastName.trim()) found.lastName = 'Enter a last name.'
        if (!/^\S+@\S+\.\S+$/.test(v.email)) found.email = 'Enter a valid email address.'
        setErrors(found)
        const first = Object.keys(found)[0]
        if (first) return document.getElementById(`tf-${first}`)?.focus()
        onSubmit(v)
      }}
    >
      <div className="row g-3">
        {text('firstName', 'First name')}
        {text('lastName', 'Last name')}
        {text('email', 'Email address', 'email')}
        <fieldset className="col-12">
          <legend className="form-label fs-6">Instruments taught</legend>
          <div className="row row-cols-2 row-cols-sm-3 g-1">
            {INSTRUMENTS.map((i) => (
              <div className="col" key={i}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`tf-inst-${i}`}
                    checked={v.instruments.includes(i)}
                    onChange={(e) =>
                      setV({
                        ...v,
                        instruments: e.target.checked ? [...v.instruments, i] : v.instruments.filter((x) => x !== i),
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor={`tf-inst-${i}`}>
                    {i}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
        <div className="col-12">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="tf-status"
              checked={v.status === 'active'}
              onChange={(e) => setV({ ...v, status: e.target.checked ? 'active' : 'suspended' })}
            />
            <label className="form-check-label" htmlFor="tf-status">
              Account active (can sign in)
            </label>
          </div>
        </div>
      </div>
    </form>
  )
}
