import http from '@/shared/api/http'
import type {
  DocumentVerification,
  CreateVerificationDto,
  UpdateVerificationDto,
  CompleteVerificationDto,
  RejectVerificationDto,
  VerificationFilters,
  PaginatedResponse,
} from '../types'

const BASE = '/document-verifications'

export const documentVerificationApi = {
  async list(
    filters: VerificationFilters = {},
  ): Promise<PaginatedResponse<DocumentVerification>> {
    const { data } = await http.get(BASE, { params: filters })

    return {
      data: data.records ?? data.data ?? [],
      meta: data.meta ?? data.pagination ?? {
        total: data.total ?? 0,
        current_page: data.current_page ?? data.page ?? 1,
        per_page: data.per_page ?? data.limit ?? 10,
        from: data.from,
        to: data.to,
        last_page: data.last_page,
      },
    }
  },

  async get(id: number): Promise<DocumentVerification> {
    const { data } = await http.get(`${BASE}/${id}`)
    return data.data ?? data
  },

  async create(payload: CreateVerificationDto): Promise<DocumentVerification> {
    const { data } = await http.post(BASE, payload)
    return data.data ?? data
  },

  async update(id: number, payload: UpdateVerificationDto): Promise<DocumentVerification> {
    const { data } = await http.put(`${BASE}/${id}`, payload)
    return data.data ?? data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  async start(id: number): Promise<DocumentVerification> {
    const { data } = await http.patch(`${BASE}/${id}/start`)
    return data.data ?? data
  },

  async complete(id: number, payload: CompleteVerificationDto): Promise<DocumentVerification> {
    const { data } = await http.patch(`${BASE}/${id}/complete`, payload)
    return data.data ?? data
  },

  async approve(id: number, notes?: string): Promise<DocumentVerification> {
    const { data } = await http.patch(`${BASE}/${id}/approve`, { notes })
    return data.data ?? data
  },

  async reject(id: number, payload: RejectVerificationDto): Promise<DocumentVerification> {
    const { data } = await http.patch(`${BASE}/${id}/reject`, payload)
    return data.data ?? data
  },
}