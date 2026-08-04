// src/features/applicants/services/applicant.service.ts

import http from '@shared/api/http'
import type { Applicant, ApiResponse, ApplicantStatus } from '../types'

// ═══════════════════════════════════════════════════════
// Status Actions
// ═══════════════════════════════════════════════════════

export async function moveToFinalList(id: number): Promise<Applicant> {
  const { data } = await http.patch<ApiResponse<Applicant>>(
    `/applicants/${id}/move-to-final-list`,
  )
  return data.data
}

export async function rejectApplicant(
  id: number,
  reason: string,
): Promise<Applicant> {
  const { data } = await http.patch<ApiResponse<Applicant>>(
    `/applicants/${id}/reject`,
    { rejection_reason: reason },
  )
  return data.data
}

export async function updateApplicantStatus(
  id: number,
  status: ApplicantStatus,
  rejectionReason?: string,
): Promise<Applicant> {
  const payload: Record<string, unknown> = { status }
  if (rejectionReason) payload.rejection_reason = rejectionReason

  const { data } = await http.patch<ApiResponse<Applicant>>(
    `/applicants/${id}/status`,
    payload,
  )
  return data.data
}