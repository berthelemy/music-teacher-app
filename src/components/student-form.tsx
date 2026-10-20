import { useRef, useState } from 'react'
import { INSTRUMENTS, LEVELS, SCHOOLS } from '@/data/fixtures'
import type { Student } from '@/data/fixtures'

type Fields = Pick<
  Student,
  'firstName' | 'lastName' | 'instrument' | 'school' | 'level' | 'email' | 'guardianName' | 'phone' | 'notes'
>
type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = {
  firstName: '',
  lastName: '',
  instrument: '',
  school: '',
  level: '',
  email: '',
  guardianName: '',
  phone: '',
  notes: '',
}

function validate(v: Fields): Errors {
  const e: Errors = {}
  if (!v.firstName.trim()) e.firstName = 'Enter a first name.'
  if (!v.lastName.trim()) e.lastName = 'Enter a last name.'
  if (!v.instrument) e.instrument = 'Choose an instrument.'
  if (!v.school.trim()) e.school = 'Enter a music school, or “Private”.'
  if (!v.level) e.level = 'Choose a level.'
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address, like name@example.com.'
  return e
}

/** Create/edit form for a student. Renders inside a Modal body. */
export function StudentForm({
  id,
  initial,
  onSubmit,
}: {
  /** form id so a submit button in the modal footer can target it */
  id: string
  initial?: Student
  onSubmit: (values: Fields) => void
}) {
  const [values, setValues] = useState<Fields>(initial ?? EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const formRef = useRef<HTMLFormElement>(null)

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }))

  const field = (k: keyof Fields) => ({
    id: `${id}-${k}`,
    name: k,
    value: values[k],
    onChange: set(k),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${id}-${k}-error` : undefined,
  })

  const err = (k: keyof Fields) =>
    errors[k] && (
      <div id={`${id}-${k}-error`} className="invalid-feedback d-block">
        {errors[k]}
      </div>
    )

  const cls = (base: string, k: keyof Fields) => `${base}${errors[k] ? ' is-invalid' : ''}`

  return (
    <form
      id={id}
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const found = validate(values)
        setErrors(found)
        const first = Object.keys(found)[0]
        if (first) {
          formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
          return
        }
        onSubmit({ ...values, firstName: values.firstName.trim(), lastName: values.lastName.trim() })
      }}
    >
      <p className="small text-body-secondary">
        Fields marked <span aria-hidden="true">*</span>
        <span className="visually-hidden">with an asterisk</span> are required.
      </p>
      <div className="row g-3">
        <div className="col-sm-6">
          <label className="form-label" htmlFor={`${id}-firstName`}>
            First name <span aria-hidden="true">*</span>
          </label>
          <input className={cls('form-control', 'firstName')} autoComplete="off" required {...field('firstName')} />
          {err('firstName')}
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor={`${id}-lastName`}>
            Last name <span aria-hidden="true">*</span>
          </label>
          <input className={cls('form-control', 'lastName')} autoComplete="off" required {...field('lastName')} />
          {err('lastName')}
        </div>
        <div className="col-sm-4">
          <label className="form-label" htmlFor={`${id}-instrument`}>
            Instrument <span aria-hidden="true">*</span>
          </label>
          <select className={cls('form-select', 'instrument')} required {...field('instrument')}>
            <option value="">Choose…</option>
            {INSTRUMENTS.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
          {err('instrument')}
        </div>
        <div className="col-sm-4">
          <label className="form-label" htmlFor={`${id}-level`}>
            Level <span aria-hidden="true">*</span>
          </label>
          <select className={cls('form-select', 'level')} required {...field('level')}>
            <option value="">Choose…</option>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          {err('level')}
        </div>
        <div className="col-sm-4">
          <label className="form-label" htmlFor={`${id}-school`}>
            Music school <span aria-hidden="true">*</span>
          </label>
          <input
            className={cls('form-control', 'school')}
            list={`${id}-schools`}
            required
            {...field('school')}
          />
          <datalist id={`${id}-schools`}>
            {SCHOOLS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          {err('school')}
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor={`${id}-guardianName`}>
            Parent or guardian
          </label>
          <input className="form-control" autoComplete="off" {...field('guardianName')} />
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor={`${id}-phone`}>
            Phone
          </label>
          <input className="form-control" type="tel" autoComplete="off" {...field('phone')} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor={`${id}-email`}>
            Contact email
          </label>
          <input className={cls('form-control', 'email')} type="email" autoComplete="off" {...field('email')} />
          {err('email')}
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor={`${id}-notes`}>
            Notes about this student
          </label>
          <textarea className="form-control" rows={3} {...field('notes')} />
        </div>
      </div>
    </form>
  )
}
