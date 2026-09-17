import http from '@shared/api/http'
import type {
  CompanyCategory,
  CompanyCategoryPayload,
  CompanyCategoryFilters,
  PaginatedResponse,
} from '../types'

const BASE = '/company-categories'

export const companyCategoryApi = {
  async list(filters: CompanyCategoryFilters = {}): Promise<PaginatedResponse<CompanyCategory>> {
    const res: any = await http.get(BASE, { params: filters })

    // 🎯 Safe unwrapping for both raw Axios responses and unwrapped Interceptor responses
    const payload = res?.data ?? res
    const records = Array.isArray(payload)
      ? payload
      : payload?.records ?? payload?.data ?? []

    return {
      data: Array.isArray(records) ? records : [],
      meta: payload?.meta ?? payload?.pagination ?? {
        total: payload?.total ?? (Array.isArray(records) ? records.length : 0),
        current_page: payload?.current_page ?? 1,
        per_page: payload?.per_page ?? payload?.limit ?? 15,
      },
    }
  },

  async get(id: number): Promise<CompanyCategory> {
    const res: any = await http.get(`${BASE}/${id}`)
    return res?.data?.data ?? res?.data ?? res
  },

  async create(payload: CompanyCategoryPayload): Promise<CompanyCategory> {
    const res: any = await http.post(BASE, payload)
    return res?.data?.data ?? res?.data ?? res
  },

  async update(id: number, payload: Partial<CompanyCategoryPayload>): Promise<CompanyCategory> {
    const res: any = await http.put(`${BASE}/${id}`, payload)
    return res?.data?.data ?? res?.data ?? res
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  async toggleStatus(id: number): Promise<CompanyCategory> {
    const res: any = await http.patch(`${BASE}/${id}/toggle-status`)
    return res?.data?.data ?? res?.data ?? res
  },
}