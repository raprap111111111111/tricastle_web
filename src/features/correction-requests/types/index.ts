// src/features/correction-requests/types/index.ts

export type CorrectionSeverity = 'low' | 'moderate' | 'critical'

export type CorrectionStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'

export interface CorrectionRequest {
  id: number
  request_code: string
  document_verification_id: number
  applicant_document_id: number
  requested_by: number
  severity: CorrectionSeverity
  status: CorrectionStatus
  description: string
  fields_to_correct: string[] | null
  correction_data: Record<string, unknown> | null
  justification: string | null
  requires_approval: boolean
  requires_new_document: boolean
  due_date: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null

  // Relations (from resource)
  requester?: {
    id: number
    name: string
    email: string
  }
  document_verification?: {
    id: number
    status: string
  }
  applicant_document?: {
    id: number
    document_type: string
    file_path: string
  }
}

// ── API Payloads ─────────────────────────────────────────

export interface CreateCorrectionRequestPayload {
  document_verification_id: number
  applicant_document_id: number
  severity: CorrectionSeverity
  description: string
  fields_to_correct?: string[]
  correction_data?: Record<string, unknown>
  justification?: string
  requires_approval?: boolean
  requires_new_document?: boolean
  due_date?: string
}

export interface UpdateCorrectionRequestPayload
  extends Partial<CreateCorrectionRequestPayload> {}

export interface ApprovePayload {
  notes?: string
}

export interface RejectPayload {
  reason: string
}

export interface CompletePayload {
  notes?: string
}

export interface CancelPayload {
  reason: string
}

// ── List Params ──────────────────────────────────────────

export interface CorrectionRequestListParams {
  search?: string
  offset?: number
  limit?: number
  order_by?: string
  order_dir?: 'asc' | 'desc'
  status?: CorrectionStatus
  severity?: CorrectionSeverity
  requested_by?: number
  document_verification_id?: number
  applicant_document_id?: number
  requires_approval?: boolean
  requires_new_document?: boolean
  overdue_only?: boolean
  due_soon?: boolean
  due_within_days?: number
  critical_only?: boolean
  active_only?: boolean
}

// ── API Response ─────────────────────────────────────────

export interface PaginatedResponse<T> {
  records: T[]
  total: number
  offset: number
  limit: number
}