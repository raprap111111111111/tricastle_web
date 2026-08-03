// src/features/correction-requests/api/correction-request.api.ts

import http from '@/shared/api/http'
import type {
  CorrectionRequest,
  CreateCorrectionRequestPayload,
  UpdateCorrectionRequestPayload,
  ApprovePayload,
  RejectPayload,
  CompletePayload,
  CancelPayload,
  CorrectionRequestListParams,
  PaginatedResponse,
} from '../types'

const BASE = '/correction-requests'

export const correctionRequestApi = {
  getAll(params?: CorrectionRequestListParams) {
    return http.get<{ data: PaginatedResponse<CorrectionRequest> }>(BASE, { params })
  },

  getOne(id: number) {
    return http.get<{ data: CorrectionRequest }>(`${BASE}/${id}`)
  },

  create(payload: CreateCorrectionRequestPayload) {
    return http.post<{ data: CorrectionRequest }>(BASE, payload)
  },

  update(id: number, payload: UpdateCorrectionRequestPayload) {
    return http.put<{ data: CorrectionRequest }>(`${BASE}/${id}`, payload)
  },

  delete(id: number) {
    return http.delete(`${BASE}/${id}`)
  },

  approve(id: number, payload: ApprovePayload) {
    return http.patch<{ data: CorrectionRequest }>(`${BASE}/${id}/approve`, payload)
  },

  reject(id: number, payload: RejectPayload) {
    return http.patch<{ data: CorrectionRequest }>(`${BASE}/${id}/reject`, payload)
  },

  complete(id: number, payload: CompletePayload) {
    return http.patch<{ data: CorrectionRequest }>(`${BASE}/${id}/complete`, payload)
  },

  cancel(id: number, payload: CancelPayload) {
    return http.patch<{ data: CorrectionRequest }>(`${BASE}/${id}/cancel`, payload)
  },
}