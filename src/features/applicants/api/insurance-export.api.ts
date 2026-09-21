import http from '@shared/api/http'
import type {
  InsuranceExportPayload,
  InsuranceExportResponse,
} from '../types/insurance-export.types'

export async function exportApplicantInsurance(
  payload: InsuranceExportPayload,
): Promise<InsuranceExportResponse> {
  const response = await http.post<InsuranceExportResponse>(
    '/applicants/export-insurance',
    payload,
  )

  return response.data
}