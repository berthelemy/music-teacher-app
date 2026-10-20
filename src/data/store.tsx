/**
 * In-browser store for the first milestone. It holds the sample data from
 * `fixtures.ts` and applies create/update/delete actions so every screen is
 * interactive. Changes last until the page is reloaded; a later milestone
 * swaps this for server functions backed by Netlify Database (see PLAN.md).
 */
import { createContext, useContext, useMemo, useReducer } from 'react'
import * as fx from './fixtures'
import type { Holiday, Lesson, Schedule, Student, Teacher } from './fixtures'
import { todayKey } from '@/lib/dates'

type State = {
  teachers: Teacher[]
  students: Student[]
  lessons: Lesson[]
  holidays: Holiday[]
}

type Action =
  | { type: 'student/save'; student: Student }
  | { type: 'student/delete'; id: string }
  | { type: 'student/archive'; id: string; archived: boolean }
  | { type: 'student/schedule'; id: string; schedule: Schedule }
  | { type: 'lesson/update'; id: string; patch: Partial<Lesson> }
  | { type: 'holiday/save'; holiday: Holiday }
  | { type: 'holiday/delete'; id: string }
  | { type: 'teacher/save'; teacher: Teacher }
  | { type: 'teacher/delete'; id: string }

let seq = 0
export function newId(prefix: string) {
  seq += 1
  return `${prefix}${Date.now().toString(36)}${seq}`
}

function upsert<T extends { id: string }>(list: T[], item: T) {
  return list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? item : x))
    : [...list, item]
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'student/save':
      return { ...state, students: upsert(state.students, action.student) }
    case 'student/delete':
      return {
        ...state,
        students: state.students.filter((s) => s.id !== action.id),
        lessons: state.lessons.filter((l) => l.studentId !== action.id),
      }
    case 'student/archive':
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === action.id ? { ...s, archived: action.archived } : s,
        ),
      }
    case 'student/schedule': {
      const student = state.students.find((s) => s.id === action.id)
      if (!student) return state
      const today = todayKey()
      // Replace future, untouched lessons; keep history and anything recorded.
      const kept = state.lessons.filter(
        (l) =>
          l.studentId !== student.id ||
          l.date < today ||
          l.attendance !== 'scheduled' ||
          l.plan ||
          l.homework ||
          l.teacherNotes,
      )
      const fresh = fx
        .expandSchedule(
          student,
          { ...action.schedule, startDate: action.schedule.startDate < today ? today : action.schedule.startDate },
          state.holidays.filter((h) => h.teacherId === student.teacherId),
          newId('l'),
        )
        .filter((l) => !kept.some((k) => k.studentId === student.id && k.date === l.date))
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === student.id ? { ...s, schedule: action.schedule } : s,
        ),
        lessons: [...kept, ...fresh],
      }
    }
    case 'lesson/update':
      return {
        ...state,
        lessons: state.lessons.map((l) =>
          l.id === action.id ? { ...l, ...action.patch } : l,
        ),
      }
    case 'holiday/save': {
      // Lessons that haven't happened yet are cancelled by a new holiday.
      const h = action.holiday
      const today = todayKey()
      return {
        ...state,
        holidays: upsert(state.holidays, h),
        lessons: state.lessons.map((l) =>
          l.teacherId === h.teacherId &&
          l.attendance === 'scheduled' &&
          l.date >= today &&
          l.date >= h.startDate &&
          l.date <= h.endDate
            ? { ...l, attendance: 'cancelled' }
            : l,
        ),
      }
    }
    case 'holiday/delete':
      return {
        ...state,
        holidays: state.holidays.filter((h) => h.id !== action.id),
      }
    case 'teacher/save':
      return { ...state, teachers: upsert(state.teachers, action.teacher) }
    case 'teacher/delete':
      return {
        ...state,
        teachers: state.teachers.filter((t) => t.id !== action.id),
      }
  }
}

const StoreContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    teachers: fx.teachers,
    students: fx.students,
    lessons: fx.lessons,
    holidays: fx.holidays,
  }))
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

/**
 * Teacher-scoped view of the data. Every teacher screen reads through this
 * hook so it only ever sees rows owned by the signed-in teacher — the same
 * rule the server will enforce once real persistence lands.
 */
export function useTeacherData(teacherId = fx.CURRENT_TEACHER_ID) {
  const { state, dispatch } = useStore()
  return useMemo(() => {
    const students = state.students.filter((s) => s.teacherId === teacherId)
    const lessons = state.lessons
      .filter((l) => l.teacherId === teacherId)
      .sort((a, b) =>
        (a.date + a.startTime).localeCompare(b.date + b.startTime),
      )
    const holidays = state.holidays
      .filter((h) => h.teacherId === teacherId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
    const teacher = state.teachers.find((t) => t.id === teacherId)
    const studentById = new Map(students.map((s) => [s.id, s]))
    return { teacher, students, lessons, holidays, studentById, dispatch, teacherId }
  }, [state, dispatch, teacherId])
}

export function useAdminData() {
  const { state, dispatch } = useStore()
  return useMemo(() => {
    const studentCounts = new Map<string, number>()
    for (const s of state.students) {
      if (!s.archived)
        studentCounts.set(s.teacherId, (studentCounts.get(s.teacherId) ?? 0) + 1)
    }
    return { teachers: state.teachers, studentCounts, dispatch }
  }, [state, dispatch])
}

export function fullName(p: { firstName: string; lastName: string }) {
  return `${p.firstName} ${p.lastName}`
}
