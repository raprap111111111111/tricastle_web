import http from '@shared/api/http'
import type {
  ApplicantEducation,
  CreateEducationPayload,
  UpdateEducationPayload,
} from '../types'

const BASE = '/applicant-educations'

export const educationApi = {
  async listByApplicant(applicantId: number): Promise<ApplicantEducation[]> {
    const res = await http.get<ApplicantEducation[]>(`${BASE}/by-applicant/${applicantId}`)
    return res.data
  },

  async get(id: number): Promise<ApplicantEducation> {
    const res = await http.get<ApplicantEducation>(`${BASE}/${id}`)
    return res.data
  },

  async create(payload: CreateEducationPayload): Promise<ApplicantEducation> {
    const res = await http.post<ApplicantEducation>(BASE, payload)
    return res.data
  },

  async update(id: number, payload: UpdateEducationPayload): Promise<ApplicantEducation> {
    const res = await http.put<ApplicantEducation>(`${BASE}/${id}`, payload)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },
}