// src/shared/utils/ais/formatters.ts

/** Format any value → trimmed string, empty for null/undefined/'null'/'undefined'. */
export function fmt(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v).trim()
  return s === 'null' || s === 'undefined' ? '' : s
}

/** Boolean → "Yes" / "No" / empty when undefined. */
export function fmtBool(v?: boolean): string {
  if (v === undefined) return ''
  return v ? 'Yes' : 'No'
}

/** Date string → "YYYY.MM.DD" or empty on invalid. */
export function fmtDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const y   = d.getFullYear()
    const m   = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}.${m}.${day}`
  } catch { return '' }
}

/** Date string → "Jun-13" (Month-YY). */
export function fmtMonthYear(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const month = d.toLocaleString('en-US', { month: 'short' })
  const year  = String(d.getFullYear()).slice(-2)
  return `${month}-${year}`
}

/** Calculate whole years between two dates. */
export function calcYears(start?: string, end?: string): number {
  if (!start) return 0
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  return Math.max(0, e.getFullYear() - s.getFullYear())
}

/** Calculate remaining months between two dates. */
export function calcMonths(start?: string, end?: string): number {
  if (!start) return 0
  const s = new Date(start)
  const e = end ? new Date(end) : new Date()
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
  return Math.max(0, months % 12)
}