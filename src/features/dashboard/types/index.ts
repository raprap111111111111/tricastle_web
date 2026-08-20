export type StatVariant =
  | 'apricot'
  | 'blueberry'
  | 'citrus'
  | 'appleCore'

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

// ─── NEW: Trend Chart ─────────────────────────────
export interface TrendData {
  labels: string[]
  applicants: number[]
  documents: number[]
}

// ─── NEW: Status Breakdown ────────────────────────
export interface StatusBreakdown {
  pending: number
  under_review: number
  verified: number
  rejected: number
  incomplete: number
}

// ─── NEW: Pipeline ────────────────────────────────
export interface PipelineData {
  applied: number
  documents_submitted: number
  under_review: number
  verified: number
  batched: number
  deployed: number
}

// ─── NEW: Active Batch ────────────────────────────
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

// ─── NEW: Quick Stats ─────────────────────────────
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

// ─── NEW: Attention Items ─────────────────────────
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

// ─── Existing ─────────────────────────────────────
export interface DashboardStatsFilters {
  range?: 'today' | 'week' | 'month' | 'year'
  from?: string
  to?: string
}

export type TrendRange = '7d' | '14d' | '30d'