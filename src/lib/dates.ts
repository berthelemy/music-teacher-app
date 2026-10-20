// Date helpers for `YYYY-MM-DD` keys. All math is done in UTC so the server
// render and the browser produce the same output.

const DAY = 86_400_000

export function toKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function parseKey(key: string) {
  return new Date(`${key}T00:00:00Z`)
}

export function todayKey() {
  return toKey(new Date())
}

export function addDays(key: string, days: number) {
  return toKey(new Date(parseKey(key).getTime() + days * DAY))
}

export function dayOfWeek(key: string) {
  return parseKey(key).getUTCDay()
}

export function startOfMonth(key: string) {
  return `${key.slice(0, 7)}-01`
}

export function addMonths(key: string, months: number) {
  const d = parseKey(startOfMonth(key))
  d.setUTCMonth(d.getUTCMonth() + months)
  return toKey(d)
}

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts })

export function formatDate(key: string) {
  return fmt({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(parseKey(key))
}

export function formatLongDate(key: string) {
  return fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseKey(key))
}

export function formatShortDate(key: string) {
  return fmt({ day: 'numeric', month: 'short' }).format(parseKey(key))
}

export function formatMonth(key: string) {
  return fmt({ month: 'long', year: 'numeric' }).format(parseKey(key))
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function endTime(start: string, durationMins: number) {
  const [h, m] = start.split(':').map(Number)
  const total = h * 60 + m + durationMins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
