// src/features/companies/api/company.api.ts
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
    // ⚡ Sanitize query parameters for backend validation compatibility
    const params: Record<string, any> = {}

    for (const [key, val] of Object.entries(filters)) {
      if (val === '' || val === null || val === undefined) continue

      if (key === 'is_active') {
        // Convert boolean/strings to integer (1 / 0) for Laravel boolean validation rule
        params[key] =
          val === true || val === 1 || val === '1' || val === 'true' ? 1 : 0
      } else {
        params[key] = val
      }
    }

    const { data } = await http.get(BASE, { params })

    return {
      data: data.records ?? data.data ?? [],
      meta: data.meta ?? data.pagination ?? {
        total:        data.total ?? 0,
        current_page: data.current_page ?? 1,
        per_page:     data.per_page ?? data.limit ?? 15,
        limit:        data.limit ?? data.per_page ?? 15,
        offset:       data.offset ?? 0,
        from:         data.from,
        to:           data.to,
        last_page:    data.last_page ?? 1,
        has_more:     data.has_more ?? false,
      },
    }
  },

  /**
   * Fetches ALL companies in batches of 100 to safely stay within API limits.
   */
  async listAll(filters: CompanyFilters = {}): Promise<Company[]> {
    let allRecords: Company[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await this.list({
        ...filters,
        page,
        limit: 100, // Safe batch size
      })

      allRecords = allRecords.concat(response.data)

      const meta = response.meta
      if (meta && meta.last_page) {
        hasMore = page < meta.last_page
      } else {
        hasMore = false
      }

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