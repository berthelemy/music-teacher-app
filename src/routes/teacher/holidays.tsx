import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/app-shell'
import { DataTable, esc, type Column } from '@/components/data-table'
import { ConfirmModal } from '@/components/modal'
import { useAnnounce } from '@/components/announcer'
import { newId, useTeacherData } from '@/data/store'
import type { Holiday } from '@/data/fixtures'
import { addDays, formatDate, parseKey, todayKey } from '@/lib/dates'

export const Route = createFileRoute('/teacher/holidays')({
  head: () => ({ meta: [{ title: 'Holidays · Cadenza' }] }),
  component: HolidaysPage,
})

const days = (h: Holiday) =>
  Math.round((parseKey(h.endDate).getTime() - parseKey(h.startDate).getTime()) / 86_400_000) + 1

function HolidaysPage() {
  const { holidays, lessons, dispatch, teacherId } = useTeacherData()
  const announce = useAnnounce()
  const today = todayKey()
  const [editing, setEditing] = useState<Holiday | null>(null)
  const [deleting, setDeleting] = useState<Holiday | null>(null)

  const columns = useMemo<Column<Holiday>[]>(
    () => [
      { title: 'Holiday', value: (h) => h.title, html: (h) => `<span class="fw-bold">${esc(h.title)}</span>`, priority: 1 },
      { title: 'From', value: (h) => h.startDate, html: (h) => esc(formatDate(h.startDate)), priority: 2 },
      { title: 'To', value: (h) => h.endDate, html: (h) => esc(formatDate(h.endDate)), priority: 3 },
      { title: 'Days', value: (h) => days(h), priority: 5 },
      {
        title: 'Status',
        value: (h) => (h.endDate < today ? 'Past' : h.startDate <= today ? 'Now' : 'Upcoming'),
        html: (h) =>
          h.endDate < today
            ? '<span class="badge text-bg-light border">Past</span>'
            : h.startDate <= today
              ? '<span class="badge text-bg-warning">Now</span>'
              : '<span class="badge text-bg-primary">Upcoming</span>',
        priority: 4,
      },
      {
        title: 'Actions',
        value: () => '',
        orderable: false,
        className: 'text-end text-nowrap',
        priority: 1,
        html: (h) => `<div class="btn-group btn-group-sm" role="group" aria-label="Actions for ${esc(h.title)}">
          <button type="button" class="btn btn-outline-primary" data-action="edit" data-id="${esc(h.id)}">Edit<span class="visually-hidden"> ${esc(h.title)}</span></button>
          <button type="button" class="btn btn-outline-danger" data-action="delete" data-id="${esc(h.id)}">Delete<span class="visually-hidden"> ${esc(h.title)}</span></button>
        </div>`,
      },
    ],
    [today],
  )

  return (
    <>
      <PageHeader
        eyebrow="Holidays"
        title="Your holidays"
        description="Days you’re not teaching. New lesson schedules skip these dates, and any lessons already booked inside them are cancelled."
      />
      <div className="row g-4">
        <div className="col-xl-8 order-2 order-xl-1">
          <section className="card" aria-labelledby="hol-list-heading">
            <div className="card-body">
              <h2 id="hol-list-heading" className="h5 mb-3">
                All holidays
              </h2>
              <DataTable
                rows={holidays}
                columns={columns}
                caption="Your holidays"
                emptyMessage="No holidays added yet."
                order={[[1, 'asc']]}
                onAction={(action, id) => {
                  const h = holidays.find((x) => x.id === id)
                  if (!h) return
                  if (action === 'edit') setEditing(h)
                  if (action === 'delete') setDeleting(h)
                }}
              />
            </div>
          </section>
        </div>
        <div className="col-xl-4 order-1 order-xl-2">
          <HolidayForm
            key={editing?.id ?? 'new'}
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={(values) => {
              const holiday: Holiday = editing
                ? { ...editing, ...values }
                : { id: newId('h'), teacherId, ...values }
              const affected = lessons.filter(
                (l) =>
                  l.attendance === 'scheduled' &&
                  l.date >= today &&
                  l.date >= holiday.startDate &&
                  l.date <= holiday.endDate,
              ).length
              dispatch({ type: 'holiday/save', holiday })
              announce(
                `${editing ? 'Holiday updated' : 'Holiday added'}.${affected ? ` ${affected} lesson${affected === 1 ? '' : 's'} cancelled.` : ''}`,
              )
              setEditing(null)
            }}
          />
        </div>
      </div>

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting?.title ?? ''}”?`}
        body="The holiday is removed from your calendar. Lessons that were cancelled because of it stay cancelled — you can reinstate them from each lesson."
        confirmLabel="Delete holiday"
        danger
        onConfirm={() => {
          if (!deleting) return
          dispatch({ type: 'holiday/delete', id: deleting.id })
          announce('Holiday deleted.', 'danger')
        }}
      />
    </>
  )
}

function HolidayForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: Holiday | null
  onSubmit: (v: Pick<Holiday, 'title' | 'startDate' | 'endDate'>) => void
  onCancel: () => void
}) {
  const today = todayKey()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [startDate, setStart] = useState(initial?.startDate ?? addDays(today, 14))
  const [endDate, setEnd] = useState(initial?.endDate ?? addDays(today, 18))
  const [errors, setErrors] = useState<{ title?: string; endDate?: string }>({})

  return (
    <section className="card" aria-labelledby="hol-form-heading">
      <div className="card-body">
        <h2 id="hol-form-heading" className="h5 mb-3">
          {initial ? 'Edit holiday' : 'Add a holiday'}
        </h2>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const found: typeof errors = {}
            if (!title.trim()) found.title = 'Give the holiday a name.'
            if (!startDate || !endDate || endDate < startDate) found.endDate = 'The last day must be on or after the first day.'
            setErrors(found)
            if (found.title) return document.getElementById('hol-title')?.focus()
            if (found.endDate) return document.getElementById('hol-end')?.focus()
            onSubmit({ title: title.trim(), startDate, endDate })
            if (!initial) setTitle('')
          }}
        >
          <div className="mb-3">
            <label htmlFor="hol-title" className="form-label">
              Name
            </label>
            <input
              id="hol-title"
              className={`form-control${errors.title ? ' is-invalid' : ''}`}
              value={title}
              placeholder="e.g. Spring half-term"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? 'hol-title-error' : undefined}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <div id="hol-title-error" className="invalid-feedback">
                {errors.title}
              </div>
            )}
          </div>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label htmlFor="hol-start" className="form-label">
                First day
              </label>
              <input id="hol-start" type="date" className="form-control" value={startDate} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="col-6">
              <label htmlFor="hol-end" className="form-label">
                Last day
              </label>
              <input
                id="hol-end"
                type="date"
                className={`form-control${errors.endDate ? ' is-invalid' : ''}`}
                value={endDate}
                aria-invalid={errors.endDate ? true : undefined}
                aria-describedby={errors.endDate ? 'hol-end-error' : undefined}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
            {errors.endDate && (
              <div id="hol-end-error" className="invalid-feedback d-block">
                {errors.endDate}
              </div>
            )}
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              {initial ? 'Save holiday' : 'Add holiday'}
            </button>
            {initial && (
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
