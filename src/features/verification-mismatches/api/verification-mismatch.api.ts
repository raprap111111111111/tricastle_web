// src/features/verification-mismatches/api/verification-mismatch.api.ts
import http from '@/shared/api/http'
import type {
  VerificationMismatch,
  VerificationMismatchListParams,
  CreateVerificationMismatchPayload,
  UpdateVerificationMismatchPayload,
  ResolvePayload,
  WaivePayload,
  EscalatePayload,
  PaginatedResponse,
} from '../types'

const BASE = '/verification-mismatches'

export const verificationMismatchApi = {
  getAll(params?: VerificationMismatchListParams) {
    return http.get<{ data: PaginatedResponse<VerificationMismatch> }>(BASE, {
      params,
    })
  },

  getOne(id: number) {
    return http.get<{ data: VerificationMismatch }>(`${BASE}/${id}`)
  },

  create(payload: CreateVerificationMismatchPayload) {
    return http.post<{ data: VerificationMismatch }>(BASE, payload)
  },

  update(id: number, payload: UpdateVerificationMismatchPayload) {
    return http.put<{ data: VerificationMismatch }>(`${BASE}/${id}`, payload)
  },

  delete(id: number) {
    return http.delete(`${BASE}/${id}`)
  },

  resolve(id: number, payload: ResolvePayload) {
    return http.patch<{ data: VerificationMismatch }>(
      `${BASE}/${id}/resolve`,
      payload,
    )
  },

  waive(id: number, payload: WaivePayload) {
    return http.patch<{ data: VerificationMismatch }>(
      `${BASE}/${id}/waive`,
      payload,
    )
  },

  escalate(id: number, payload: EscalatePayload) {
    return http.patch<{ data: VerificationMismatch }>(
      `${BASE}/${id}/escalate`,
      payload,
    )
  },

  // Nested: get by verification
  getByVerification(verificationId: number) {
    return http.get<{ data: VerificationMismatch[] }>(
      `/document-verifications/${verificationId}/mismatches`,
    )
  },
}