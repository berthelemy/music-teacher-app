import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/app-shell'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Teachers · Cadenza admin' }] }),
  component: () => (
    <AppShell role="admin" userName="Morgan Ellis (Admin)">
      <Outlet />
    </AppShell>
  ),
})
