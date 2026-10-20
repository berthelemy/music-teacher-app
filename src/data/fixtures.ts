/**
 * Sample data for the first product milestone.
 *
 * Everything the UI shows comes from this module (via `src/data/store.tsx`).
 * A later milestone replaces it with Netlify Database tables of the same shape
 * — see PLAN.md. Dates are plain `YYYY-MM-DD` strings handled in UTC so the
 * server render and the browser agree.
 */
import { addDays, dayOfWeek, todayKey } from '@/lib/dates'

export type Role = 'teacher' | 'admin'

export type Teacher = {
  id: string
  firstName: string
  lastName: string
  email: string
  instruments: string[]
  /** ISO timestamp, or null if never signed in */
  lastLogin: string | null
  status: 'active' | 'suspended'
}

export type Schedule = {
  /** 0 = Sunday … 6 = Saturday */
  weekday: number
  startTime: string
  durationMins: number
  startDate: string
  endDate: string
  location: string
}

export type Student = {
  id: string
  teacherId: string
  firstName: string
  lastName: string
  instrument: string
  school: string
  level: string
  email: string
  guardianName: string
  phone: string
  notes: string
  archived: boolean
  schedule: Schedule | null
}

export type Attendance = 'scheduled' | 'present' | 'late' | 'absent' | 'cancelled'

export type Lesson = {
  id: string
  teacherId: string
  studentId: string
  date: string
  startTime: string
  durationMins: number
  location: string
  attendance: Attendance
  plan: string
  homework: string
  teacherNotes: string
}

export type Holiday = {
  id: string
  teacherId: string
  title: string
  startDate: string
  endDate: string
}

export const INSTRUMENTS = [
  'Piano',
  'Violin',
  'Viola',
  'Cello',
  'Flute',
  'Clarinet',
  'Saxophone',
  'Trumpet',
  'Guitar',
  'Voice',
]

export const LEVELS = [
  'Beginner',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Diploma',
]

export const SCHOOLS = [
  'Riverside Music School',
  'St. Cecilia Academy',
  'Northgate Conservatoire',
  'Private',
]

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/** The teacher the demo is signed in as. */
export const CURRENT_TEACHER_ID = 't1'

const today = todayKey()

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString()
}

export const teachers: Teacher[] = [
  {
    id: 't1',
    firstName: 'Clara',
    lastName: 'Hughes',
    email: 'clara.hughes@example.com',
    instruments: ['Violin', 'Viola'],
    lastLogin: hoursAgo(1),
    status: 'active',
  },
  {
    id: 't2',
    firstName: 'Tomás',
    lastName: 'Okafor',
    email: 'tomas.okafor@example.com',
    instruments: ['Piano'],
    lastLogin: hoursAgo(26),
    status: 'active',
  },
  {
    id: 't3',
    firstName: 'Priya',
    lastName: 'Raman',
    email: 'priya.raman@example.com',
    instruments: ['Flute', 'Clarinet'],
    lastLogin: hoursAgo(24 * 6),
    status: 'active',
  },
  {
    id: 't4',
    firstName: 'Jonas',
    lastName: 'Lindqvist',
    email: 'jonas.l@example.com',
    instruments: ['Guitar'],
    lastLogin: hoursAgo(24 * 41),
    status: 'suspended',
  },
  {
    id: 't5',
    firstName: 'Amara',
    lastName: 'Bello',
    email: 'amara.bello@example.com',
    instruments: ['Voice', 'Piano'],
    lastLogin: null,
    status: 'active',
  },
]

// Term runs from five weeks ago to ten weeks ahead of "today".
const termStart = addDays(today, -35)
const termEnd = addDays(today, 70)

function sched(
  weekday: number,
  startTime: string,
  durationMins: number,
  location = 'Studio 2',
): Schedule {
  return {
    weekday,
    startTime,
    durationMins,
    startDate: termStart,
    endDate: termEnd,
    location,
  }
}

type StudentSeed = Omit<Student, 'teacherId' | 'archived' | 'notes'> &
  Partial<Pick<Student, 'archived' | 'notes' | 'teacherId'>>

const studentSeeds: StudentSeed[] = [
  { id: 's1', firstName: 'Maya', lastName: 'Chen', instrument: 'Violin', school: 'Riverside Music School', level: 'Grade 3', email: 'chen.family@example.com', guardianName: 'Lin Chen', phone: '07700 900112', schedule: sched(1, '16:00', 30), notes: 'Preparing for Grade 4 in spring. Loves fiddle tunes.' },
  { id: 's2', firstName: 'Oliver', lastName: 'Grant', instrument: 'Violin', school: 'Riverside Music School', level: 'Grade 5', email: 'ogrant@example.com', guardianName: 'Sarah Grant', phone: '07700 900245', schedule: sched(1, '16:45', 45) },
  { id: 's3', firstName: 'Isla', lastName: 'Murphy', instrument: 'Viola', school: 'St. Cecilia Academy', level: 'Grade 6', email: 'isla.m@example.com', guardianName: 'Declan Murphy', phone: '07700 900318', schedule: sched(2, '15:30', 45, 'St. Cecilia, Room 4'), notes: 'Youth orchestra on Saturdays — coordinate repertoire.' },
  { id: 's4', firstName: 'Noah', lastName: 'Patel', instrument: 'Violin', school: 'St. Cecilia Academy', level: 'Beginner', email: 'patels@example.com', guardianName: 'Anjali Patel', phone: '07700 900401', schedule: sched(2, '16:30', 30, 'St. Cecilia, Room 4') },
  { id: 's5', firstName: 'Freya', lastName: 'Walsh', instrument: 'Violin', school: 'Private', level: 'Grade 8', email: 'freya.walsh@example.com', guardianName: '', phone: '07700 900577', schedule: sched(3, '18:00', 60, 'Home studio'), notes: 'Adult learner. Working towards ARSM diploma.' },
  { id: 's6', firstName: 'Leo', lastName: 'Novak', instrument: 'Viola', school: 'Northgate Conservatoire', level: 'Grade 4', email: 'novak.home@example.com', guardianName: 'Petra Novak', phone: '07700 900633', schedule: sched(4, '17:00', 45, 'Northgate, Room B') },
  { id: 's7', firstName: 'Ava', lastName: 'Thompson', instrument: 'Violin', school: 'Northgate Conservatoire', level: 'Grade 2', email: 'ava.t@example.com', guardianName: 'Mark Thompson', phone: '07700 900719', schedule: sched(4, '17:45', 30, 'Northgate, Room B') },
  { id: 's8', firstName: 'Samuel', lastName: 'Adeyemi', instrument: 'Violin', school: 'Riverside Music School', level: 'Grade 1', email: 'adeyemi@example.com', guardianName: 'Grace Adeyemi', phone: '07700 900802', schedule: sched(5, '15:45', 30) },
  { id: 's9', firstName: 'Ruby', lastName: 'Fischer', instrument: 'Viola', school: 'Private', level: 'Diploma', email: 'ruby.fischer@example.com', guardianName: '', phone: '07700 900955', schedule: sched(6, '10:00', 60, 'Home studio') },
  { id: 's10', firstName: 'Ethan', lastName: 'Brooks', instrument: 'Violin', school: 'St. Cecilia Academy', level: 'Grade 3', email: 'brooks@example.com', guardianName: 'Helen Brooks', phone: '07700 900116', schedule: null, archived: true, notes: 'Moved away in the summer. Archived.' },
  // Another teacher's student — never visible to Clara.
  { id: 's11', teacherId: 't2', firstName: 'Zoe', lastName: 'Marsh', instrument: 'Piano', school: 'Riverside Music School', level: 'Grade 4', email: 'zoe@example.com', guardianName: 'Tim Marsh', phone: '07700 900222', schedule: null },
]

export const students: Student[] = studentSeeds.map((s) => ({
  teacherId: CURRENT_TEACHER_ID,
  archived: false,
  notes: '',
  ...s,
}))

export const holidays: Holiday[] = [
  {
    id: 'h1',
    teacherId: CURRENT_TEACHER_ID,
    title: 'Autumn half-term',
    startDate: addDays(today, 8),
    endDate: addDays(today, 12),
  },
  {
    id: 'h2',
    teacherId: CURRENT_TEACHER_ID,
    title: 'Festival adjudicating',
    startDate: addDays(today, -18),
    endDate: addDays(today, -17),
  },
  {
    id: 'h3',
    teacherId: CURRENT_TEACHER_ID,
    title: 'Winter break',
    startDate: addDays(today, 64),
    endDate: addDays(today, 78),
  },
]

export function isHoliday(date: string, list: Holiday[]) {
  return list.find((h) => date >= h.startDate && date <= h.endDate)
}

const PLANS = [
  'Warm-up: open-string bowing with metronome at 60. Scales: D major two octaves. Piece: work bars 9–24 slowly, focus on intonation of 3rd finger.',
  'Review last week’s homework. Introduce spiccato on open strings. Sight-reading: 8 bars in G major.',
  'Run the exam piece top to bottom, then isolate the shift in bar 17. Aural tests: clapping back rhythms.',
  'Tone work: long bows, contact point. Study: Wohlfahrt No. 2. Start new piece from the festival list.',
]
const HOMEWORK = [
  'Scales daily (D & A major). Bars 9–24 at ♩=72, five times each. Listen to the reference recording once.',
  'Practise spiccato 5 minutes a day. Sight-read one new tune from the book each day.',
  'Shift in bar 17: ten clean repetitions per day. Full run-through twice this week.',
  'Long bows with a mirror. Wohlfahrt No. 2, first line only.',
]
const NOTES = [
  'Bow hold collapsing at the tip — keep watching.',
  'Seemed tired; parent mentioned school exams this week.',
  'Great progress on intonation. Consider entering for the spring festival.',
  '',
]

/** Expand each student's weekly schedule into dated lessons, skipping holidays. */
export function expandSchedule(
  student: Pick<Student, 'id' | 'teacherId'>,
  schedule: Schedule,
  holidayList: Holiday[],
  idPrefix: string,
): Lesson[] {
  const lessons: Lesson[] = []
  let date = schedule.startDate
  while (dayOfWeek(date) !== schedule.weekday) date = addDays(date, 1)
  let n = 0
  for (; date <= schedule.endDate; date = addDays(date, 7)) {
    if (isHoliday(date, holidayList)) continue
    lessons.push({
      id: `${idPrefix}-${n++}`,
      teacherId: student.teacherId,
      studentId: student.id,
      date,
      startTime: schedule.startTime,
      durationMins: schedule.durationMins,
      location: schedule.location,
      attendance: 'scheduled',
      plan: '',
      homework: '',
      teacherNotes: '',
    })
  }
  return lessons
}

function seedLessons(): Lesson[] {
  const all: Lesson[] = []
  students.forEach((s, si) => {
    if (!s.schedule) return
    const ls = expandSchedule(s, s.schedule, holidays, `l${s.id}`)
    ls.forEach((l, i) => {
      const k = (si + i) % 4
      if (l.date < today && l.date >= addDays(today, -3)) {
        // Taught in the last few days but attendance not yet recorded.
        l.plan = PLANS[k]
      } else if (l.date < today) {
        // Past lessons: attendance taken and notes written.
        l.attendance =
          (si + i) % 9 === 0 ? 'absent' : (si + i) % 7 === 0 ? 'late' : 'present'
        l.plan = PLANS[k]
        l.homework = HOMEWORK[k]
        l.teacherNotes = NOTES[k]
      } else if (l.date <= addDays(today, 7)) {
        // This coming week is already planned.
        l.plan = PLANS[k]
      }
    })
    all.push(...ls)
  })
  return all
}

export const lessons: Lesson[] = seedLessons()
