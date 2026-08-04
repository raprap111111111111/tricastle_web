// src/features/correction-approvals/api/correction-approval.api.ts
import http from '@/shared/api/http'
import type {
  CorrectionApproval,
  CreateCorrectionApprovalPayload,
  UpdateCorrectionApprovalPayload,
  ApproveCorrectionApprovalPayload,
  RejectCorrectionApprovalPayload,
  EscalateCorrectionApprovalPayload,
  CorrectionApprovalListParams,
  PaginatedResponse,
} from '../types'

const BASE = '/correction-approvals'

export const correctionApprovalApi = {
  // ─── List with pagination ────────────────────────────
  async list(
    params: CorrectionApprovalListParams = {},
  ): Promise<PaginatedResponse<CorrectionApproval>> {
    const { data } = await http.get(BASE, { params })

    return {
      data: data.data?.records ?? data.data?.data ?? data.records ?? data.data ?? [],
      meta: data.data?.meta ?? data.meta ?? data.pagination ?? {
        total: data.total ?? 0,
        current_page: data.current_page ?? data.page ?? 1,
        per_page: data.per_page ?? data.limit ?? 10,
        from: data.from,
        to: data.to,
        last_page: data.last_page,
      },
    }
  },

  // ─── Get one ─────────────────────────────────────────
  async get(id: number): Promise<CorrectionApproval> {
    const { data } = await http.get(`${BASE}/${id}`)
    return data.data ?? data
  },

  // ─── Create ──────────────────────────────────────────
  async create(payload: CreateCorrectionApprovalPayload): Promise<CorrectionApproval> {
    const { data } = await http.post(BASE, payload)
    return data.data ?? data
  },

  // ─── Update ──────────────────────────────────────────
  async update(
    id: number,
    payload: UpdateCorrectionApprovalPayload,
  ): Promise<CorrectionApproval> {
    const { data } = await http.put(`${BASE}/${id}`, payload)
    return data.data ?? data
  },

  // ─── Delete ──────────────────────────────────────────
  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  // ─── Approve ─────────────────────────────────────────
  async approve(
    id: number,
    payload: ApproveCorrectionApprovalPayload,
  ): Promise<CorrectionApproval> {
    const { data } = await http.patch(`${BASE}/${id}/approve`, payload)
    return data.data ?? data
  },

  // ─── Reject ──────────────────────────────────────────
  async reject(
    id: number,
    payload: RejectCorrectionApprovalPayload,
  ): Promise<CorrectionApproval> {
    const { data } = await http.patch(`${BASE}/${id}/reject`, payload)
    return data.data ?? data
  },

  // ─── Escalate ────────────────────────────────────────
  async escalate(
    id: number,
    payload: EscalateCorrectionApprovalPayload,
  ): Promise<CorrectionApproval> {
    const { data } = await http.patch(`${BASE}/${id}/escalate`, payload)
    return data.data ?? data
  },
}