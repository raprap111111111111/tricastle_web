import http from '@shared/api/http'
import type {
  ApplicantTattoo,
  CreateTattooPayload,
  UpdateTattooPayload,
} from '../types'

const BASE = '/applicant-tattoos'

export const tattooApi = {
  async listByApplicant(applicantId: number): Promise<ApplicantTattoo[]> {
    const res = await http.get<ApplicantTattoo[]>(`${BASE}/by-applicant/${applicantId}`)
    return res.data
  },

  async get(id: number): Promise<ApplicantTattoo> {
    const res = await http.get<ApplicantTattoo>(`${BASE}/${id}`)
    return res.data
  },

  async create(payload: CreateTattooPayload): Promise<ApplicantTattoo> {
    const res = await http.post<ApplicantTattoo>(BASE, payload)
    return res.data
  },

  async update(id: number, payload: UpdateTattooPayload): Promise<ApplicantTattoo> {
    const res = await http.put<ApplicantTattoo>(`${BASE}/${id}`, payload)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  async toggleVisibility(id: number): Promise<ApplicantTattoo> {
    const res = await http.patch<ApplicantTattoo>(`${BASE}/${id}/toggle-visibility`)
    return res.data
  },
}