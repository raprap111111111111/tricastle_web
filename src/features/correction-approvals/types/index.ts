// src/features/correction-approvals/types/index.ts
export type ApprovalDecision = 'pending' | 'approved' | 'rejected' | 'escalated'
export type ApprovalLevel = 1 | 2 // 1=supervisor, 2=admin

export interface CorrectionApproval {
  id: number
  correction_request_id: number
  approver_id: number
  decision: ApprovalDecision
  comments: string | null
  conditions: string[] | null
  approval_level: ApprovalLevel
  decided_at: string | null
  created_at: string
  updated_at: string

  // Optional relations
  approver?: {
    id: number
    name: string
    email: string
  }
  correction_request?: {
    id: number
    request_code: string
    description: string
    status: string
  }
}

export interface CorrectionApprovalListParams {
  search?: string
  offset?: number
  limit?: number
  order_by?: string
  order_dir?: 'asc' | 'desc'
  correction_request_id?: number
  approver_id?: number
  decision?: ApprovalDecision
  approval_level?: ApprovalLevel
  pending_only?: boolean
  decided_only?: boolean
  supervisor_level?: boolean
  admin_level?: boolean
  level?: number
}

export interface CreateCorrectionApprovalPayload {
  correction_request_id: number
  approver_id: number
  approval_level: ApprovalLevel
  comments?: string
  conditions?: string[]
}

export interface UpdateCorrectionApprovalPayload {
  comments?: string
  conditions?: string[]
}

export interface ApproveCorrectionApprovalPayload {
  comments?: string
  conditions?: string[]
}

export interface RejectCorrectionApprovalPayload {
  comments: string // required on reject
}

export interface EscalateCorrectionApprovalPayload {
  comments: string
  escalation_reason: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    current_page: number
    per_page: number
    from: number
    to: number
    last_page: number
  }
}