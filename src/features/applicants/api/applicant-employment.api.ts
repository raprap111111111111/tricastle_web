import http from '@shared/api/http'
import type {
  ApplicantEmployment,
  CreateEmploymentPayload,
  UpdateEmploymentPayload,
} from '../types'

const BASE = '/applicant-employments'

export const employmentApi = {
  async listByApplicant(applicantId: number): Promise<ApplicantEmployment[]> {
    const res = await http.get<ApplicantEmployment[]>(`${BASE}/by-applicant/${applicantId}`)
    return res.data
  },

  async get(id: number): Promise<ApplicantEmployment> {
    const res = await http.get<ApplicantEmployment>(`${BASE}/${id}`)
    return res.data
  },

  async create(payload: CreateEmploymentPayload): Promise<ApplicantEmployment> {
    const res = await http.post<ApplicantEmployment>(BASE, payload)
    return res.data
  },

  async update(id: number, payload: UpdateEmploymentPayload): Promise<ApplicantEmployment> {
    const res = await http.put<ApplicantEmployment>(`${BASE}/${id}`, payload)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  async markAsCurrent(id: number): Promise<ApplicantEmployment> {
    const res = await http.patch<ApplicantEmployment>(`${BASE}/${id}/mark-as-current`)
    return res.data
  },
}