import http from '@/shared/api/http'
import type {
  Batch,
  BatchPayload,
  BatchFilters,
  BatchStatus,
  PaginatedResponse,
} from '../types'

const BASE = '/batches'

export const batchApi = {
  async list(filters: BatchFilters = {}): Promise<PaginatedResponse<Batch>> {
    const { data } = await http.get(BASE, { params: filters })

    return {
      data: data.records ?? data.data ?? [],
      meta: data.meta ?? data.pagination ?? {
        total:        data.total ?? 0,
        current_page: data.current_page ?? data.page ?? 1,
        per_page:     data.per_page ?? data.limit ?? 10,
        from:         data.from,
        to:           data.to,
        last_page:    data.last_page,
      },
    }
  },

  async get(id: number): Promise<Batch> {
    const { data } = await http.get(`${BASE}/${id}`)
    return data.data ?? data
  },

  async create(payload: BatchPayload): Promise<Batch> {
    const { data } = await http.post(BASE, payload)
    return data.data ?? data
  },

  async update(id: number, payload: Partial<BatchPayload>): Promise<Batch> {
    const { data } = await http.put(`${BASE}/${id}`, payload)
    return data.data ?? data
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  async updateStatus(id: number, status: BatchStatus): Promise<Batch> {
    const { data } = await http.patch(`${BASE}/${id}/status`, { status })
    return data.data ?? data
  },

  // ─── NEW: Active batch endpoints ────────────────────────

  /**
   * Get the currently active batch (used for auto-assignment).
   */
  async getActive(): Promise<Batch | null> {
    const { data } = await http.get(`${BASE}/active`)
    return data.data ?? null
  },

  /**
   * Activate a batch (auto-deactivates all others).
   */
  async activate(id: number): Promise<Batch> {
    const { data } = await http.patch(`${BASE}/${id}/activate`)
    return data.data ?? data
  },

  /**
   * Deactivate a batch.
   */
  async deactivate(id: number): Promise<Batch> {
    const { data } = await http.patch(`${BASE}/${id}/deactivate`)
    return data.data ?? data
  },
}