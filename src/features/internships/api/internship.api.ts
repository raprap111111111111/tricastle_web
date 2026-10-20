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

/** When responseType is blob, 4xx/5xx JSON must not be saved as .docx */
async function parseBlobError(err: unknown): Promise<never> {
  const ax = err as { response?: { data?: Blob; status?: number }; message?: string }
  const data = ax?.response?.data
  if (data instanceof Blob) {
    try {
      const text = await data.text()
      const json = JSON.parse(text) as { message?: string }
      throw new Error(json.message || `Request failed (${ax.response?.status ?? '?'})`)
    } catch (e) {
      if (e instanceof Error && e.message && !e.message.startsWith('Unexpected')) throw e
      throw new Error(ax?.message || 'Download failed')
    }
  }
  throw err instanceof Error ? err : new Error(String(ax?.message ?? 'Download failed'))
}

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
  byApplicant(applicantId: number) {
    return http.get<ApiResponse<PaginatedResponse<Internship>>>(BASE, {
      params: { applicant_id: applicantId, only_current: 0 },
    })
  },

  getDirectDownloadUrl(id: number): string {
    const defaultBase = (http.defaults.baseURL || '/api/v1').replace(/\/$/, '')
    return `${defaultBase}${BASE}/${id}/download-moa`
  },

  /** Binary .docx download — use this from the composable, not bare axios */
  async downloadMoa(
    id: number,
    params: GenerateMoaPayload = {},
  ): Promise<{ blob: Blob; filename: string }> {
    try {
      const response = await http.get<Blob>(`${BASE}/${id}/download-moa`, {
        params: {
          ...params,
          municipality: params.municipality?.trim() || 'Murcia',
        },
        responseType: 'blob',
      })

      const blob = response.data as unknown as Blob
      // Guard: server returned JSON error with 200 + blob (rare) or wrong content-type
      if (blob.type?.includes('application/json')) {
        const text = await blob.text()
        const json = JSON.parse(text) as { message?: string }
        throw new Error(json.message || 'MOA download failed')
      }

      let filename = `MOA_${id}.docx`
      const disposition = response.headers?.['content-disposition'] as string | undefined
      if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)"?/i)
        if (match?.[1]) filename = decodeURIComponent(match[1].trim())
      }

      return { blob, filename }
    } catch (err) {
      throw await parseBlobError(err)
    }
  },
}