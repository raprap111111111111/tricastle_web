import type { Applicant } from '@features/applicants/types'
import type { Company } from '@features/companies/types'

// ─── Enums ────────────────────────────────────────────────────────────────

export type InternshipProgramType = 'intern' | 'titp' | 'ssw' | 'ssw_transfer'

export type InternshipStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'completed'
  | 'transferred'
  | 'cancelled'
  | 'returned_early'

export type CompensationType = 'allowance' | 'salary'

// ─── Guarantor ────────────────────────────────────────────────────────────

export interface ApplicantGuarantor {
  id?: number
  applicant_id?: number
  sequence: number
  full_name: string
  age?: number | null
  civil_status?: string | null
  nationality?: string | null
  address?: string | null
  residence_cert_no?: string | null
  residence_cert_issued_at?: string | null
  residence_cert_place?: string | null
  relationship?: string | null
}

export interface SyncGuarantorsPayload {
  guarantors: Omit<ApplicantGuarantor, 'id' | 'applicant_id'>[]
}

// ─── Internship Program ───────────────────────────────────────────────────

export interface InternshipProgram {
  id: number
  code: string
  name: string
  program_type: InternshipProgramType
  document_template?: string | null
  allows_company_transfer: boolean
  contract_years: number
  default_job_description?: string | null
  stipend_amount: number
  meal_allowance_amount: number
  compensation_currency: string
  compensation_type?: CompensationType | null
  is_active: boolean
}

// ─── Internship ───────────────────────────────────────────────────────────

export interface InternshipDocument {
  id: number
  document_type: string
  document_no: string
  status: string
  download_url: string | null
  generated_by?: number | null
  created_at: string
}

export interface Internship {
  id: number
  applicant_id: number
  batch_id: number | null
  internship_program_id: number | null

  program_type: InternshipProgramType
  status: InternshipStatus
  status_label?: string | null
  is_current: boolean

  job_description: string | null
  place_of_internship: string | null
  municipality: string | null

  agreement_date: string | null
  contract_start: string | null
  contract_end: string | null
  contract_years: number | null

  stipend_amount: number | null
  meal_allowance_amount: number | null

  work_days: string | null
  day_off: string | null
  time_start: string | null
  time_end: string | null
  lunch_break: string | null

  change_reason: string | null
  changed_at: string | null
  can_change_company: boolean
  previous_internship_id: number | null

  applicant?: Pick<Applicant, 'id' | 'applicant_code' | 'full_name' | 'passport_number'>
  program?: InternshipProgram | null
  batch?: { id: number; batch_number: string | number; name: string } | null

  dispatching_company?: Pick<Company, 'id' | 'code' | 'name'> | null
  accepting_company?: Pick<Company, 'id' | 'code' | 'name'> | null
  receiving_company?: Pick<Company, 'id' | 'code' | 'name'> | null

  documents?: InternshipDocument[]

  created_at: string
  updated_at: string
}

// ─── Payloads ─────────────────────────────────────────────────────────────

export interface CreateInternshipPayload {
  applicant_id: number
  batch_id?: number | null
  internship_program_id?: number | null
  program_type?: InternshipProgramType
  dispatching_company_id?: number | null
  accepting_company_id?: number | null
  receiving_company_id?: number | null
  job_description?: string | null
  place_of_internship?: string | null
  municipality?: string | null
  agreement_date?: string | null
  contract_start?: string | null
  contract_end?: string | null
  contract_years?: number | null
  stipend_amount?: number | null
  meal_allowance_amount?: number | null
  work_days?: string | null
  day_off?: string | null
  time_start?: string | null
  time_end?: string | null
  lunch_break?: string | null
  guarantors?: Omit<ApplicantGuarantor, 'id' | 'applicant_id'>[]
}

export type UpdateInternshipPayload = Partial<
  Omit<CreateInternshipPayload, 'applicant_id' | 'guarantors'>
> & {
  status?: InternshipStatus
}

export interface ChangeCompanyPayload {
  receiving_company_id: number
  contract_start: string
  change_reason: string
  accepting_company_id?: number | null
  batch_id?: number | null
  internship_program_id?: number | null
  contract_end?: string | null
  contract_years?: number | null
  job_description?: string | null
  place_of_internship?: string | null
  stipend_amount?: number | null
  meal_allowance_amount?: number | null
}

export interface GenerateMoaPayload {
  agreement_date?: string | null
  municipality?: string | null
  contract_start?: string | null
  contract_end?: string | null
  contract_years?: number | null
  job_description?: string | null
  place_of_internship?: string | null
  stipend_amount?: number | null
  meal_allowance_amount?: number | null
}

export interface BulkGenerateMoaPayload extends GenerateMoaPayload {
  internship_ids?: number[]
  batch_id?: number | null
  only_current?: boolean
}

export interface BulkGenerateMoaResult {
  type: 'single' | 'zip'
  download_url: string
  documents: InternshipDocument[]
}

// ─── Filters / Pagination ─────────────────────────────────────────────────

export interface InternshipFilters {
  search?: string
  status?: InternshipStatus | ''
  program_type?: InternshipProgramType | ''
  applicant_id?: number | null
  batch_id?: number | null
  internship_program_id?: number | null
  receiving_company_id?: number | null
  accepting_company_id?: number | null
  dispatching_company_id?: number | null
  only_current?: boolean
  contract_start_from?: string
  contract_start_to?: string

  page?: number | null
  offset?: number
  limit?: number
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
  order_by?: string
  order_dir?: 'asc' | 'desc'
}

export interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  offset: number
  limit: number
  has_more: boolean
  from?: number | null
  to?: number | null
}

export interface PaginatedResponse<T> {
  data?: T[]
  records?: T[]
  total?: number
  meta?: Pagination
  pagination?: Pagination
  message?: string
}

export interface ApiResponse<T> {
  success?: boolean
  message?: string
  data: T
}