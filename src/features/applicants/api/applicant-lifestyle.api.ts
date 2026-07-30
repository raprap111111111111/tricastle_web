import http from '@shared/api/http'
import type { ApplicantLifestyle, UpsertLifestylePayload } from '../types'

const BASE = '/applicant-lifestyles'

export const lifestyleApi = {
  async getByApplicant(applicantId: number): Promise<ApplicantLifestyle> {
    const res = await http.get<ApplicantLifestyle>(`${BASE}/by-applicant/${applicantId}`)
    return res.data
  },

  async upsert(payload: UpsertLifestylePayload): Promise<ApplicantLifestyle> {
    const res = await http.post<ApplicantLifestyle>(BASE, payload)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },
}