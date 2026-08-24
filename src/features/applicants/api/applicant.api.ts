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
  // ─── CRUD ──────────────────────────────────────────────────────────────────
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

  // ─── Status Transitions ────────────────────────────────────────────────────
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

  // ─── Duplicate Detection ───────────────────────────────────────────────────
  async checkDuplicates(payload: DuplicateCheckPayload): Promise<DuplicateCheckResult> {
    const res = await http.post<{ data: DuplicateCheckResult }>(
      `${BASE}/check-duplicates`,
      payload,
    )
    return (res.data as any).data ?? res.data
  },

  // ─── Document / Biodata Upload ─────────────────────────────────────────────
  async uploadBiodata(
    applicantId:    number,
    file:           File,
    documentTypeId: number,
    notes?:         string,
  ): Promise<{ id: number; file_name: string; original_name: string }> {
    const form = new FormData()
    form.append('applicant_id',     String(applicantId))
    form.append('document_type_id', String(documentTypeId))
    form.append('file',             file)
    form.append('priority',         'normal')
    form.append('status',           'verified')
    form.append('source',           'upload')
    if (notes?.trim()) form.append('notes', notes.trim())

    const res = await http.post('/applicant-documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return (res.data as any).data ?? res.data
  },
}