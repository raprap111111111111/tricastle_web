// src/features/applicants/utils/final-list.utils.ts

import type { Applicant, FinalListFolder, FinalListGroupBy } from '../types'

/**
 * Group final list applicants into folders by date period.
 */
export function groupApplicantsByDate(
  applicants: Applicant[],
  groupBy: FinalListGroupBy = 'month',
): FinalListFolder[] {
  const groups = new Map<string, Applicant[]>()

  for (const applicant of applicants) {
    const dateStr = applicant.final_listed_at
    if (!dateStr) continue

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) continue

    const key = getGroupKey(date, groupBy)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(applicant)
  }

  // Convert to array of folders, sorted newest → oldest
  const folders: FinalListFolder[] = Array.from(groups.entries())
    .map(([key, apps]) => {
      const date = new Date(apps[0].final_listed_at!)
      return {
        key,
        label: formatFolderLabel(date, groupBy),
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        count: apps.length,
        applicants: apps.sort(
          (a, b) =>
            new Date(b.final_listed_at!).getTime() -
            new Date(a.final_listed_at!).getTime(),
        ),
        latest_date: apps
          .map((a) => a.final_listed_at!)
          .sort()
          .reverse()[0],
      }
    })
    .sort((a, b) => b.latest_date.localeCompare(a.latest_date))

  return folders
}

function getGroupKey(date: Date, groupBy: FinalListGroupBy): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  switch (groupBy) {
    case 'day':
      return `${y}-${m}-${d}`
    case 'week': {
      const week = getWeekNumber(date)
      return `${y}-W${String(week).padStart(2, '0')}`
    }
    case 'month':
      return `${y}-${m}`
    case 'year':
      return `${y}`
  }
}

function formatFolderLabel(date: Date, groupBy: FinalListGroupBy): string {
  switch (groupBy) {
    case 'day':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'week': {
      const week = getWeekNumber(date)
      return `Week ${week}, ${date.getFullYear()}`
    }
    case 'month':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    case 'year':
      return String(date.getFullYear())
  }
}

function getWeekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - firstDay.getTime()) / 86400000)
  return Math.ceil((days + firstDay.getDay() + 1) / 7)
}

/**
 * Get relative time (e.g. "2 days ago", "1 hour ago")
 */
export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (months < 12) return `${months}mo ago`
  return `${years}y ago`
}