// src/features/applicants/api/applicant.api.ts

import http from '@shared/api/http'
import type {
  Applicant,
  ApplicantFilters,
  ApplicantStatus,
  CreateApplicantPayload,
  DuplicateCheckPayload,
  DuplicateCheckResult,
  PaginatedApplicants,
  UpdateApplicantPayload,
} from '../types'

const BASE = '/applicants'

export const applicantApi = {
  // ─── CRUD ──────────────────────────────────────────────
  async list(filters?: ApplicantFilters): Promise<PaginatedApplicants> {
    const res = await http.get<PaginatedApplicants>(BASE, { params: filters })
    return res.data
  },

  async get(id: number): Promise<Applicant> {
    const res = await http.get<Applicant>(`${BASE}/${id}`)
    return res.data
  },

  async create(payload: CreateApplicantPayload): Promise<Applicant> {
    const res = await http.post<Applicant>(BASE, payload)
    return res.data
  },

  async update(id: number, payload: UpdateApplicantPayload): Promise<Applicant> {
    const res = await http.put<Applicant>(`${BASE}/${id}`, payload)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  // ─── Status Transitions ────────────────────────────────
  async moveToFinalList(id: number): Promise<Applicant> {
    const res = await http.patch<Applicant>(`${BASE}/${id}/move-to-final-list`)
    return res.data
  },

  async reject(id: number, reason: string): Promise<Applicant> {
    const res = await http.patch<Applicant>(`${BASE}/${id}/reject`, {
      rejection_reason: reason,
    })
    return res.data
  },

  async updateStatus(
    id: number,
    status: ApplicantStatus,
    rejectionReason?: string,
  ): Promise<Applicant> {
    const payload: Record<string, unknown> = { status }
    if (rejectionReason) payload.rejection_reason = rejectionReason

    const res = await http.patch<Applicant>(`${BASE}/${id}/status`, payload)
    return res.data
  },

  // ─── Duplicate detection ───────────────────────────────
  async checkDuplicates(payload: DuplicateCheckPayload): Promise<DuplicateCheckResult> {
    const res = await http.post<{ data: DuplicateCheckResult }>(
      `${BASE}/check-duplicates`,
      payload,
    )
    return (res.data as any).data ?? res.data
  },
}