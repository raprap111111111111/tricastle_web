import http from '@shared/api/http'
import type {
  ApiResponse,
  BulkGenerateMoaPayload,
  BulkGenerateMoaResult,
  ChangeCompanyPayload,
  CreateInternshipPayload,
  GenerateMoaPayload,
  Internship,
  InternshipDocument,
  InternshipFilters,
  PaginatedResponse,
  UpdateInternshipPayload,
} from '../types'

const BASE = '/internships'

export const internshipApi = {
  list(params: InternshipFilters = {}) {
    return http.get<ApiResponse<PaginatedResponse<Internship>>>(BASE, { params })
  },
  show(id: number) {
    return http.get<ApiResponse<Internship>>(`${BASE}/${id}`)
  },
  create(payload: CreateInternshipPayload) {
    return http.post<ApiResponse<Internship>>(BASE, payload)
  },
  update(id: number, payload: UpdateInternshipPayload) {
    return http.put<ApiResponse<Internship>>(`${BASE}/${id}`, payload)
  },
  destroy(id: number) {
    return http.delete<ApiResponse<null>>(`${BASE}/${id}`)
  },
  changeCompany(id: number, payload: ChangeCompanyPayload) {
    return http.post<ApiResponse<Internship>>(`${BASE}/${id}/change-company`, payload)
  },
  generateMoa(id: number, payload: GenerateMoaPayload = {}) {
    return http.post<ApiResponse<InternshipDocument>>(
      `${BASE}/${id}/generate-moa`,
      payload,
    )
  },
  bulkGenerateMoa(payload: BulkGenerateMoaPayload) {
    return http.post<ApiResponse<BulkGenerateMoaResult>>(
      `${BASE}/moa/bulk-generate`,
      payload,
    )
  },
  // Convenience: internships of a specific applicant
  byApplicant(applicantId: number) {
    return http.get<ApiResponse<PaginatedResponse<Internship>>>(BASE, {
      params: { applicant_id: applicantId, only_current: 0 },
    })
  },
  /**
   * 🎯 NEW: Returns the direct download URL for the MOA Word Document (.docx)
   * Use this to opening in a new tab for immediate download without JSON processing
   */
  getDirectDownloadUrl(id: number): string {
    const defaultBase = (http.defaults.baseURL || '/api/v1').replace(/\/$/, '')
    return `${defaultBase}${BASE}/${id}/download-moa`
  },
}