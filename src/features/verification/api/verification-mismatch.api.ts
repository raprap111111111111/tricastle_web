import http from '@/shared/api/http'
import type {
  VerificationMismatch,
  ResolveMismatchDto,
  WaiveMismatchDto,
  EscalateMismatchDto,
  PaginatedResponse,
} from '../types'

const BASE = '/verification-mismatches'

export interface MismatchFilters {
  search?: string
  document_verification_id?: number
  severity?: string
  mismatch_type?: string
  status?: string
  resolved_by?: number
  unresolved_only?: boolean
  page?: number
  limit?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

export const verificationMismatchApi = {
  async list(filters: MismatchFilters = {}): Promise<PaginatedResponse<VerificationMismatch>> {
    const { data } = await http.get(BASE, { params: filters })
    return {
      data: data.records ?? data.data ?? [],
      meta: data.meta ?? data.pagination ?? {
        total: data.total ?? 0,
        current_page: data.current_page ?? data.page ?? 1,
        per_page: data.per_page ?? data.limit ?? 10,
      },
    }
  },

  async resolve(id: number, payload: ResolveMismatchDto): Promise<VerificationMismatch> {
    const { data } = await http.patch(`${BASE}/${id}/resolve`, payload)
    return data.data ?? data
  },

  async waive(id: number, payload: WaiveMismatchDto): Promise<VerificationMismatch> {
    const { data } = await http.patch(`${BASE}/${id}/waive`, payload)
    return data.data ?? data
  },

  async escalate(id: number, payload: EscalateMismatchDto): Promise<VerificationMismatch> {
    const { data } = await http.patch(`${BASE}/${id}/escalate`, payload)
    return data.data ?? data
  },
}