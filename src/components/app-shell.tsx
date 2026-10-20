import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Palmtree,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { BrandMark } from './brand'

type NavItem = {
  to: '/teacher' | '/teacher/students' | '/teacher/calendar' | '/teacher/holidays' | '/admin'
  label: string
  icon: LucideIcon
  exact?: boolean
}

const NAV: Record<'teacher' | 'admin', NavItem[]> = {
  teacher: [
    { to: '/teacher', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/teacher/students', label: 'Students', icon: Users },
    { to: '/teacher/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/teacher/holidays', label: 'Holidays', icon: Palmtree },
  ],
  admin: [{ to: '/admin', label: 'Teachers', icon: ShieldCheck, exact: true }],
}

export function AppShell({
  role,
  userName,
  children,
}: {
  role: 'teacher' | 'admin'
  userName: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [location.pathname])

  return (
    <div className="d-flex">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      {open && (
        <div className="sidebar-backdrop d-lg-none" aria-hidden="true" onClick={() => setOpen(false)} />
      )}
      <nav
        id="app-sidebar"
        className={`app-sidebar d-flex flex-column p-3 ${open ? 'open' : ''}`}
        aria-label={role === 'admin' ? 'Admin navigation' : 'Teacher navigation'}
      >
        <div className="d-flex align-items-center justify-content-between mb-4 px-2">
          <Link to="/" className="text-white text-decoration-none">
            <BrandMark light />
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-outline-light d-lg-none"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <p className="text-uppercase small fw-bold px-2 mb-2" style={{ color: '#9aa3bd', letterSpacing: '0.1em' }}>
          {role === 'admin' ? 'Administration' : 'Teaching'}
        </p>
        <ul className="nav flex-column gap-1">
          {NAV[role].map((item) => (
            <li className="nav-item" key={item.to}>
              <Link
                to={item.to}
                className="nav-link"
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: 'active' }}
              >
                <item.icon size={18} aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4 border-top border-secondary-subtle border-opacity-25">
          <p className="small mb-1 px-2" style={{ color: '#9aa3bd' }}>
            Signed in as
          </p>
          <p className="fw-bold px-2 mb-3">{userName}</p>
          <Link to="/sign-in" className="nav-link">
            <LogOut size={18} aria-hidden />
            Sign out
          </Link>
        </div>
      </nav>

      <div className="app-main flex-grow-1 min-vh-100 d-flex flex-column">
        <header className="d-lg-none d-flex align-items-center gap-2 border-bottom bg-white px-3 py-2 sticky-top">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="app-sidebar"
            aria-label="Open navigation menu"
          >
            <Menu size={20} aria-hidden />
          </button>
          <BrandMark />
        </header>
        <main id="main" tabIndex={-1} className="flex-grow-1 px-3 px-md-4 px-xl-5 py-4">
          {children}
        </main>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  title: string
  eyebrow?: string
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="h2 mb-1">{title}</h1>
        {description && <p className="text-body-secondary mb-0">{description}</p>}
      </div>
      {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
