import http from '@shared/api/http'
import type {
  Company,
  CompanyPayload,
  CompanyFilters,
  PaginatedResponse,
} from '../types'

const BASE = '/companies'

export const companyApi = {
  async list(filters: CompanyFilters = {}): Promise<PaginatedResponse<Company>> {
    const { data } = await http.get(BASE, { params: filters })

    return {
      data: data.records ?? data.data ?? [],
      meta: data.meta ?? data.pagination ?? {
        total:        data.total ?? 0,
        current_page: data.current_page ?? 1,
        per_page:     data.per_page ?? data.limit ?? 15,
        from:         data.from,
        to:           data.to,
        last_page:    data.last_page,
      },
    }
  },

  async get(id: number): Promise<Company> {
    const { data } = await http.get(`${BASE}/${id}`)
    return data.data ?? data
  },

  async create(payload: CompanyPayload): Promise<Company> {
    const { data } = await http.post(BASE, payload)
    return data.data ?? data
  },

  async update(id: number, payload: Partial<CompanyPayload>): Promise<Company> {
    const { data } = await http.put(`${BASE}/${id}`, payload)
    return data.data ?? data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  async toggleStatus(id: number): Promise<Company> {
    const { data } = await http.patch(`${BASE}/${id}/toggle-status`)
    return data.data ?? data
  },
}