import {
  Link,
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <main className="d-grid min-vh-100 px-4 py-5" style={{ placeItems: 'center' }}>
      <div className="text-center" style={{ maxWidth: '28rem' }}>
        <p className="eyebrow">404</p>
        <h1 className="h2">Page not found</h1>
        <p className="text-body-secondary">
          This page doesn’t exist. Check the address or return to the home page.
        </p>
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
      </div>
    </main>
  )
}

export function RouteErrorPage({ reset }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <main className="d-grid min-vh-100 px-4 py-5" style={{ placeItems: 'center' }}>
      <div className="text-center" style={{ maxWidth: '28rem' }}>
        <h1 className="h2">This page couldn’t load</h1>
        <p role="alert" className="text-body-secondary">
          Please try again, or return to the home page.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              void router.invalidate()
              reset()
            }}
          >
            Try again
          </button>
          <a href="/" className="btn btn-outline-primary">
            Go home
          </a>
        </div>
      </div>
    </main>
  )
}
