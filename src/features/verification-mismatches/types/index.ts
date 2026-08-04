// src/features/verification-mismatches/types/index.ts

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
  created_at: string
  updated_at: string

  resolver?: { id: number; name: string; email: string } | null
  document_verification?: { id: number; status: string } | null
}

export interface VerificationMismatchListParams {
  search?: string
  offset?: number
  limit?: number
  order_by?: string
  order_dir?: 'asc' | 'desc'

  document_verification_id?: number
  severity?: MismatchSeverity
  mismatch_type?: MismatchType
  status?: MismatchStatus
  resolved_by?: number

  unresolved_only?: boolean
  resolved_only?: boolean
  critical_only?: boolean
  escalated_only?: boolean
}

export interface CreateVerificationMismatchPayload {
  document_verification_id: number
  field_name: string
  field_label: string
  source_value?: string | null
  entered_value?: string | null
  severity: MismatchSeverity
  mismatch_type: MismatchType
}

export interface UpdateVerificationMismatchPayload {
  field_label?: string
  source_value?: string | null
  entered_value?: string | null
  severity?: MismatchSeverity
  mismatch_type?: MismatchType
}

export interface ResolvePayload {
  resolution_notes: string
}

export interface WaivePayload {
  resolution_notes: string
}

export interface EscalatePayload {
  resolution_notes: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    current_page: number
    per_page: number
    from?: number
    to?: number
    last_page?: number
  }
}