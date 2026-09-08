import http from '@shared/api/http'
import type { ApiResponse } from '../types'
import type { ApplicantGuarantor, SyncGuarantorsPayload } from '../types'

export const guarantorApi = {
  list(applicantId: number) {
    return http.get<ApiResponse<ApplicantGuarantor[]>>(
      `/applicants/${applicantId}/guarantors`,
    )
  },
  sync(applicantId: number, payload: SyncGuarantorsPayload) {
    return http.post<ApiResponse<ApplicantGuarantor[]>>(
      `/applicants/${applicantId}/guarantors/sync`,
      payload,
    )
  },
}