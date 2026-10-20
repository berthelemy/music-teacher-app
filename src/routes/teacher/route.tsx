import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/app-shell'
import { fullName, useTeacherData } from '@/data/store'

export const Route = createFileRoute('/teacher')({
  component: TeacherLayout,
})

function TeacherLayout() {
  const { teacher } = useTeacherData()
  return (
    <AppShell role="teacher" userName={teacher ? fullName(teacher) : 'Teacher'}>
      <Outlet />
    </AppShell>
  )
}
