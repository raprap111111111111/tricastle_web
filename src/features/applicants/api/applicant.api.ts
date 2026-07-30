import http from '@shared/api/http'
import type {
  Applicant,
  ApplicantFilters,
  CreateApplicantPayload,
  DuplicateCheckPayload,
  DuplicateCheckResult,
  PaginatedApplicants,
  UpdateApplicantPayload,
} from '../types'

const BASE = '/applicants'

export const applicantApi = {
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

  // ─── NEW: Duplicate detection ───────────────────────────
  async checkDuplicates(payload: DuplicateCheckPayload): Promise<DuplicateCheckResult> {
    const res = await http.post<{ data: DuplicateCheckResult }>(
      `${BASE}/check-duplicates`,
      payload,
    )
    return (res.data as any).data ?? res.data
  },
}