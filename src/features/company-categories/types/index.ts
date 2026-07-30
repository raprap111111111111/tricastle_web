export interface CompanyCategory {
  id: number
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CompanyCategoryPayload {
  name: string
  slug?: string | null
  description?: string | null
  is_active?: boolean
}

export interface CompanyCategoryFilters {
  search?: string
  is_active?: boolean | ''
  slug?: string
  page?: number
  limit?: number
  offset?: number
  order_by?: string
  order_dir?: 'asc' | 'desc'
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
  has_more?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  records?: T[]
  meta?: Pagination
  pagination?: Pagination
  message?: string
}