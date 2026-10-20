import type { Attendance } from '@/data/fixtures'

export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  scheduled: 'Scheduled',
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  cancelled: 'Cancelled',
}

export const ATTENDANCE_CLASS: Record<Attendance, string> = {
  scheduled: 'text-bg-light border',
  present: 'text-bg-success',
  late: 'text-bg-warning',
  absent: 'text-bg-danger',
  cancelled: 'text-bg-secondary',
}

export function attendanceBadgeHtml(a: Attendance) {
  return `<span class="badge rounded-pill ${ATTENDANCE_CLASS[a]}">${ATTENDANCE_LABEL[a]}</span>`
}

export function AttendanceBadge({ value }: { value: Attendance }) {
  return (
    <span className={`badge rounded-pill ${ATTENDANCE_CLASS[value]}`}>
      {ATTENDANCE_LABEL[value]}
    </span>
  )
}
