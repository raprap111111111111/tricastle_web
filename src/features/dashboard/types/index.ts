// src/features/dashboard/types/index.ts

export type StatVariant = 'apricot' | 'blueberry' | 'citrus' | 'appleCore'

export interface StatCard {
  label: string
  value: number | string
  icon: string
  variant: StatVariant
  trend: number
  trend_label: string
}

export interface DashboardStats {
  total_applicants: StatCard
  pending_documents: StatCard
  verified_today: StatCard
  corrections: StatCard
}

export interface ActivityItem {
  id: string
  type: string
  title: string
  description?: string | null
  actor?: string | null
  icon: string
  created_at: string
}

export interface TrendData {
  labels: string[]
  applicants: number[]
  documents: number[]
}

export interface StatusBreakdown {
  pending: number
  under_review: number
  verified: number
  rejected: number
  incomplete: number
}

export interface PipelineData {
  applied: number
  documents_submitted: number
  under_review: number
  verified: number
  batched: number
  deployed: number
}

export interface ActiveBatch {
  id: number
  name: string
  batch_number: string
  applicants_count: number
  verified_count: number
  target_count: number
  status: 'preparing' | 'in_progress' | 'ready' | 'deployed'
  deployment_date?: string | null
}

export interface QuickStat {
  label: string
  value: string | number
  icon: string
  color: string
  bg: string
}

export interface QuickStatsData {
  this_month: number
  success_rate: number
  avg_processing_days: number
  active_batches: number
}

export interface AttentionItem {
  id: string | number
  type: 'expiring' | 'correction' | 'mismatch' | 'incomplete'
  title: string
  count: number
  href?: string
}

export interface AttentionData {
  expiring_documents: number
  pending_corrections: number
  verification_mismatches: number
  incomplete_applications: number
}

export interface DashboardStatsFilters {
  range?: 'today' | 'week' | 'month' | 'year'
  from?: string
  to?: string
}

export type TrendRange = '7d' | '14d' | '30d'

// ─── NEW: Birthdays ───────────────────────────────
export interface BirthdayPerson {
  id: string | number
  name: string
  date_of_birth: string
  age: number
  is_today: boolean
  days_left: number
  formatted_date: string
}

export interface BirthdaysData {
  applicants: BirthdayPerson[]
  staff: BirthdayPerson[]
}