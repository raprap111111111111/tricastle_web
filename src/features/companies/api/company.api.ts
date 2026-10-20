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

    // 🔍 DEBUG: Watch the exact parameters sent to Laravel
    console.log('[companyApi.list] Outgoing Request Params:', params)

    const { data } = await http.get(BASE, { params })

    // 🔍 DEBUG: Watch the exact response returning from Laravel
    console.log('[companyApi.list] Raw Backend Response:', data)

    const records = data.records ?? data.data ?? []
    const total = data.total ?? data.meta?.total ?? records.length
    const limit = data.limit ?? data.per_page ?? filters.limit ?? 15
    const currentPage = data.current_page ?? data.page ?? filters.page ?? 1
    
    // 🎯 FIX: Correctly calculate total pages instead of defaulting to 1
    const calculatedLastPage = Math.max(1, Math.ceil(total / limit))
    const hasMore = data.has_more ?? data.meta?.has_more ?? (currentPage < calculatedLastPage)

    // 🔍 DEBUG: Check the math for pagination looping
    console.log('[companyApi.list] Normalized Pagination Math:', {
      recordsFetched: records.length,
      total,
      limit,
      currentPage,
      calculatedLastPage,
      hasMore
    })

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

  /**
   * Fetches ALL companies across all pages.
   */
  async listAll(filters: CompanyFilters = {}): Promise<Company[]> {
    let allRecords: Company[] = []
    let page = 1
    let hasMore = true

    console.log('[companyApi.listAll] Starting to fetch ALL companies...')

    while (hasMore) {
      console.log(`[companyApi.listAll] Fetching Page ${page}...`)
      
      const response = await this.list({
        ...filters,
        page,
        limit: 100, // 🎯 Changed to 100 because your backend MAX_LIMIT is 100!
      })

      allRecords = allRecords.concat(response.data)

      hasMore = response.meta?.has_more ?? (page < (response.meta?.last_page ?? 1))

      console.log(`[companyApi.listAll] Page ${page} complete. Total gathered so far: ${allRecords.length}. hasMore: ${hasMore}`)

      if (response.data.length === 0) break
      page++
    }

    console.log('[companyApi.listAll] Finished! Final Total Companies:', allRecords.length)
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