export type VerificationStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'requires_correction'
  | 'approved'
  | 'rejected'

export type MismatchSeverity = 'low' | 'moderate' | 'critical'

export type MismatchType =
  | 'value_mismatch'
  | 'missing_in_document'
  | 'missing_in_system'
  | 'format_mismatch'
  | 'date_mismatch'

export type MismatchStatus =
  | 'open'
  | 'correction_requested'
  | 'corrected'
  | 'waived'
  | 'escalated'

export type WorkflowStep =
  | 'uploaded'
  | 'ocr_extraction'
  | 'staff_review'
  | 'mismatch_detection'
  | 'correction_requested'
  | 'supervisor_approval'
  | 'admin_approval'
  | 'final_verified'
  | 'rejected'

export interface UserRef {
  id: number
  name: string
  email?: string
}

export interface VerificationMismatch {
  id: number
  document_verification_id: number
  field_name: string
  field_label: string
  source_value: string | null
  entered_value: string | null
  severity: MismatchSeverity
  mismatch_type: MismatchType
  status: MismatchStatus
  resolution_notes: string | null
  resolved_by: number | null
  resolved_at: string | null
  resolver?: UserRef | null
  created_at: string
  updated_at: string
}

export interface VerificationWorkflowStep {
  id: number
  document_verification_id: number
  step: WorkflowStep
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed'
  performed_by: number | null
  performer?: UserRef | null
  data: Record<string, any> | null
  notes: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface DocumentVerification {
  id: number
  applicant_document_id: number
  verified_by: number | null
  reviewed_by: number | null
  status: VerificationStatus
  verification_data: Record<string, any> | null
  source_data: Record<string, any> | null
  match_percentage: number
  total_fields: number
  matched_fields: number
  mismatched_fields: number
  missing_fields: number
  notes: string | null
  rejection_reason: string | null
  started_at: string | null
  completed_at: string | null
  time_spent_seconds: number | null
  created_at: string
  updated_at: string

  verifier?: UserRef | null
  reviewer?: UserRef | null
  mismatches?: VerificationMismatch[]
  workflow_steps?: VerificationWorkflowStep[]
  document?: {
    id: number
    file_url?: string
    file_name?: string
    mime_type?: string
  } | null
}

// ─── DTOs ─────────────────────────────────────────────
export interface CreateVerificationDto {
  applicant_document_id: number
  source_data?: Record<string, any>
  notes?: string
}

export interface UpdateVerificationDto {
  verification_data?: Record<string, any>
  notes?: string
}

export interface CompleteVerificationDto {
  verification_data: Record<string, any>
  match_percentage: number
  total_fields: number
  matched_fields: number
  mismatched_fields: number
  missing_fields: number
  mismatches?: Partial<VerificationMismatch>[]
  notes?: string
  time_spent_seconds?: number
}

export interface RejectVerificationDto {
  rejection_reason: string
  notes?: string
}

export interface ResolveMismatchDto {
  resolution_notes: string
  entered_value?: string
}

export interface WaiveMismatchDto {
  resolution_notes: string
}

export interface EscalateMismatchDto {
  resolution_notes: string
}

// ─── Filters & Pagination ─────────────────────────────
export interface VerificationFilters {
  search?: string
  status?: VerificationStatus | ''
  verified_by?: number | null
  reviewed_by?: number | null
  applicant_document_id?: number | null
  pending_only?: boolean
  in_progress_only?: boolean
  min_match_percentage?: number
  max_match_percentage?: number
  page?: number
  limit?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

export interface Pagination {
  total: number
  current_page: number
  per_page: number
  from?: number
  to?: number
  last_page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: Pagination
  pagination?: Pagination
}

// ─── UI helpers ───────────────────────────────────────
export interface FieldDefinition {
  name: string
  label: string
  type?: 'text' | 'date' | 'number' | 'email'
  required?: boolean
}

export interface CompareRow {
  field: FieldDefinition
  source_value: string | null
  entered_value: string
  is_match: boolean
  is_missing: boolean
}