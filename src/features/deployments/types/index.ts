// src/features/deployments/types/index.ts

import type { Applicant, BatchSummary, StaffRef, Pagination } from '@features/applicants/types'

// ─── Enums / Literals ─────────────────────────────────────────────────────────

export type DeploymentStatus = 'deployed' | 'accepted' | 'cancelled' | 'pending'

export type SalaryCurrency = 'USD' | 'JPY' | 'PHP' | 'EUR' | 'SAR' | 'AED' | 'SGD'

// ─── Main Deployment (extends ApplicantBatch) ─────────────────────────────────

export interface Deployment {
  id: number
  applicant_id: number
  batch_id: number
  status: string

  // Deployment info
  deployment_country: string | null
  deployment_company: string | null
  deployment_position: string | null
  deployed_at: string | null

  // Contract
  contract_duration_months: number | null
  contract_start_date: string | null
  contract_end_date: string | null

  // Salary
  monthly_salary: number | null
  salary_currency: string | null

  // Travel
  flight_date: string | null
  visa_type: string | null

  // Notes
  deployment_notes: string | null
  cancellation_reason: string | null
  cancelled_at: string | null

  // Relations
  applicant?: DeploymentApplicant | null
  batch?: BatchSummary | null
  processed_by?: StaffRef | null
  cancelled_by?: StaffRef | null

  created_at: string
  updated_at: string
}

// ─── Simplified applicant inside deployment payload ───────────────────────────

export interface DeploymentApplicant {
  id: number
  applicant_code: string
  first_name: string
  middle_name: string | null
  last_name: string
  full_name: string
  email: string
  mobile: string | null
  gender: string | null
  nationality: string | null
  passport_number: string | null
  passport_expiry: string | null
  status: string
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface DeployApplicantPayload {
  deployment_country: string
  deployment_company: string
  deployment_date: string          // Y-m-d
  deployment_position?: string | null
  contract_duration_months?: number | null
  contract_start_date?: string | null
  contract_end_date?: string | null
  monthly_salary?: number | null
  salary_currency?: string | null
  flight_date?: string | null
  visa_type?: string | null
  deployment_notes?: string | null
}

export interface UpdateDeploymentPayload extends Partial<DeployApplicantPayload> {}

export interface CancelDeploymentPayload {
  cancellation_reason: string
}

export interface BulkDeployPayload extends DeployApplicantPayload {
  applicant_batch_ids: number[]
}

export interface BulkDeployResult {
  successful: number[]
  failed: Array<{ id: number; reason: string }>
  total: number
  success_count: number
  failed_count: number
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface DeploymentFilters {
  search?: string
  offset?: number
  limit?: number
  order_by?: string
  order_dir?: 'asc' | 'desc'

  country?: string
  company?: string
  batch_id?: number | null
  status?: string

  date_from?: string
  date_to?: string

  include_all_statuses?: boolean
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface DeploymentStats {
  total_deployed: number
  today: number
  this_week: number
  this_month: number
  by_country: Record<string, number>
}

// ─── Pagination (re-exported for convenience) ─────────────────────────────────

export type { Pagination }

// ─── Salary currency options ──────────────────────────────────────────────────

export const SALARY_CURRENCIES: Array<{ label: string; value: string; symbol: string }> = [
  { label: 'USD - US Dollar',     value: 'USD', symbol: '$' },
  { label: 'JPY - Japanese Yen',  value: 'JPY', symbol: '¥' },
  { label: 'PHP - Philippine Peso', value: 'PHP', symbol: '₱' },
  { label: 'EUR - Euro',          value: 'EUR', symbol: '€' },
  { label: 'SAR - Saudi Riyal',   value: 'SAR', symbol: 'ر.س' },
  { label: 'AED - UAE Dirham',    value: 'AED', symbol: 'د.إ' },
  { label: 'SGD - Singapore Dollar', value: 'SGD', symbol: 'S$' },
]

// ─── Common visa types ────────────────────────────────────────────────────────

export const VISA_TYPES: string[] = [
  'Working Visa',
  'Skilled Worker Visa',
  'TITP (Technical Intern)',
  'SSW Type 1',
  'SSW Type 2',
  'Contract Worker Visa',
  'Tourist Visa',
  'Other',
]

// ─── Common countries (top OFW destinations) ──────────────────────────────────

export const COMMON_COUNTRIES: string[] = [
  'Japan',
  'Saudi Arabia',
  'United Arab Emirates',
  'Singapore',
  'Qatar',
  'Kuwait',
  'Taiwan',
  'Hong Kong',
  'South Korea',
  'Australia',
  'Canada',
  'United States',
  'United Kingdom',
  'Malaysia',
  'Bahrain',
  'Oman',
]