import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { BrandMark } from '@/components/brand'

export const Route = createFileRoute('/sign-in')({
  head: () => ({ meta: [{ title: 'Sign in · Cadenza' }] }),
  component: SignIn,
})

function SignIn() {
  const navigate = useNavigate()
  const [role, setRole] = useState<'teacher' | 'admin'>('teacher')

  return (
    <main id="main" className="min-vh-100 d-flex align-items-center hero py-5">
      <div className="container" style={{ maxWidth: '27rem' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <BrandMark />
          </Link>
        </div>
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h3 mb-1">Sign in</h1>
            <p className="text-body-secondary small">
              This preview uses sample accounts — any email and password will do.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void navigate({ to: role === 'admin' ? '/admin' : '/teacher' })
              }}
            >
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  autoComplete="email"
                  defaultValue="clara.hughes@example.com"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  autoComplete="current-password"
                  defaultValue="demo-password"
                  required
                />
              </div>
              <fieldset className="mb-4">
                <legend className="form-label fs-6">Preview as</legend>
                <div className="btn-group w-100" role="group">
                  {(['teacher', 'admin'] as const).map((r) => (
                    <span key={r} className="flex-fill d-flex">
                      <input
                        type="radio"
                        className="btn-check"
                        name="role"
                        id={`role-${r}`}
                        checked={role === r}
                        onChange={() => setRole(r)}
                      />
                      <label
                        className={`btn btn-outline-primary w-100 ${r === 'teacher' ? 'rounded-end-0' : 'rounded-start-0'}`}
                        htmlFor={`role-${r}`}
                      >
                        {r === 'teacher' ? 'Teacher' : 'Administrator'}
                      </label>
                    </span>
                  ))}
                </div>
              </fieldset>
              <button type="submit" className="btn btn-primary w-100 btn-lg">
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
