// src/features/batches/types/index.ts

export type BatchStatus =
  | 'draft'
  | 'ongoing'
  | 'deployed'
  | 'completed'
  | 'cancelled'

// ─── Applicant Batch Pivot ────────────────────────────────────────────────────
// Represents the pivot row between a batch and an applicant.
// Present when the API eager-loads the applicant_batches relation.

export interface ApplicantBatchPivot {
  id:                   number
  batch_id:             number
  applicant_id:         number
  status:               string
  interview_date?:      string | null
  interview_notes?:     string | null
  medical_date?:        string | null
  medical_notes?:       string | null
  exam_date?:           string | null
  exam_score?:          number | null
  assigned_at?:         string | null
  accepted_at?:         string | null
  deployed_at?:         string | null
  cancelled_at?:        string | null
  completed_at?:        string | null
  returned_at?:         string | null
  deployment_country?:  string | null
  deployment_company?:  string | null
  deployment_position?: string | null
  contract_duration_months?: number | null
  contract_start_date?: string | null
  contract_end_date?:   string | null
  monthly_salary?:      number | null
  salary_currency?:     string | null
  flight_date?:         string | null
  visa_type?:           string | null
  deployment_notes?:    string | null
  cancellation_reason?: string | null
  return_reason?:       string | null
  completion_notes?:    string | null
  rejection_reason?:    string | null
  remarks?:             string | null
  processed_by_id?:     number | null
  processed_by?:        { id: number; full_name: string } | null

  // ✅ Full applicant object — present when eager-loaded
  applicant?:           any | null
}

// ─── Batch ────────────────────────────────────────────────────────────────────

export interface Batch {
  id:              number
  batch_number:    number
  name:            string
  country:         string | null
  deployment_date: string | null
  status:          BatchStatus
  status_label?:   string
  is_active:       boolean
  description:     string | null
  created_at:      string
  updated_at:      string
  deleted_at?:     string | null

  // ✅ Eager-loaded relation — present when API includes it
  applicant_batches?: ApplicantBatchPivot[]
}

// ─── Batch Payload ────────────────────────────────────────────────────────────

export interface BatchPayload {
  batch_number:     number
  name:             string
  country?:         string | null
  deployment_date?: string | null
  status?:          BatchStatus
  is_active?:       boolean
  description?:     string | null
}

// ─── Batch Filters ────────────────────────────────────────────────────────────

export interface BatchFilters {
  search?:    string
  status?:    BatchStatus | ''
  country?:   string
  is_active?: boolean | ''
  page?:      number
  limit?:     number
  sort_by?:   string
  sort_dir?:  'asc' | 'desc'
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Pagination {
  total:        number
  current_page: number
  per_page?:    number
  limit?:       number
  offset?:      number
  from?:        number
  to?:          number
  last_page?:   number
}

// ─── Paginated Response ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data:        T[]
  meta?:       Pagination
  pagination?: Pagination
  message?:    string
}