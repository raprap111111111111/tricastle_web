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
    const { data } = await http.get(BASE, { params: filters })

    return {
      data: data.records ?? data.data ?? [],
      meta: data.meta ?? data.pagination ?? {
        total:        data.total ?? 0,
        current_page: data.current_page ?? 1,
        per_page:     data.per_page ?? data.limit ?? 15,
      },
    }
  },

  async get(id: number): Promise<CompanyCategory> {
    const { data } = await http.get(`${BASE}/${id}`)
    return data.data ?? data
  },

  async create(payload: CompanyCategoryPayload): Promise<CompanyCategory> {
    const { data } = await http.post(BASE, payload)
    return data.data ?? data
  },

  async update(id: number, payload: Partial<CompanyCategoryPayload>): Promise<CompanyCategory> {
    const { data } = await http.put(`${BASE}/${id}`, payload)
    return data.data ?? data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  async toggleStatus(id: number): Promise<CompanyCategory> {
    const { data } = await http.patch(`${BASE}/${id}/toggle-status`)
    return data.data ?? data
  },
}