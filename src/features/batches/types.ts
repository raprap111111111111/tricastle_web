export type BatchStatus =
  | 'draft'
  | 'ongoing'
  | 'deployed'
  | 'completed'
  | 'cancelled'

export interface Batch {
  id: number
  batch_number: number
  name: string
  country: string | null
  deployment_date: string | null
  status: BatchStatus
  status_label?: string
  is_active: boolean          // ← NEW
  description: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface BatchPayload {
  batch_number: number
  name: string
  country?: string | null
  deployment_date?: string | null
  status?: BatchStatus
  is_active?: boolean         // ← NEW
  description?: string | null
}

export interface BatchFilters {
  search?: string
  status?: BatchStatus | ''
  country?: string
  is_active?: boolean | ''    // ← NEW
  page?: number
  limit?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

export interface Pagination {
  total: number
  current_page: number
  per_page?: number
  limit?: number
  offset?: number
  from?: number
  to?: number
  last_page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: Pagination
  pagination?: Pagination
  message?: string
}