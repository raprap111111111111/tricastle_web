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
    const params: Record<string, any> = {}

    for (const [key, val] of Object.entries(filters)) {
      if (val === '' || val === null || val === undefined) continue

      if (key === 'is_active') {
        params[key] =
          val === true || val === 1 || val === '1' || val === 'true' ? 1 : 0
      } else {
        params[key] = val
      }
    }

    const { data } = await http.get(BASE, { params })

    const records = data.records ?? data.data ?? []
    const total = data.total ?? data.meta?.total ?? records.length
    const limit = data.limit ?? data.per_page ?? filters.limit ?? 15
    const currentPage = data.current_page ?? data.page ?? filters.page ?? 1
    
    const calculatedLastPage = Math.max(1, Math.ceil(total / limit))
    const hasMore = data.has_more ?? data.meta?.has_more ?? (currentPage < calculatedLastPage)

    return {
      data: records,
      meta: {
        total,
        current_page: currentPage,
        per_page:     limit,
        limit,
        offset:       data.offset ?? (currentPage - 1) * limit,
        from:         data.from ?? null,
        to:           data.to ?? null,
        last_page:    calculatedLastPage,
        has_more:     hasMore,
      },
    }
  },

  async listAll(filters: CompanyFilters = {}): Promise<Company[]> {
    let allRecords: Company[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await this.list({
        ...filters,
        page,
        limit: 100,
      })

      allRecords = allRecords.concat(response.data)

      hasMore = response.meta?.has_more ?? (page < (response.meta?.last_page ?? 1))

      if (response.data.length === 0) break
      page++
    }

    return allRecords
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