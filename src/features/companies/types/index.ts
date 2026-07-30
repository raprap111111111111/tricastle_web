export interface CompanyCategory {
  id: number
  name: string
  code?: string | null
  description?: string | null
}

export interface Company {
  id: number
  code: string
  name: string
  name_japanese: string | null
  category_id: number
  category?: CompanyCategory | null

  address: string | null
  city: string | null
  prefecture: string | null
  postal_code: string | null
  country: string

  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null

  description: string | null
  is_active: boolean

  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CompanyPayload {
  code: string
  name: string
  name_japanese?: string | null
  category_id: number

  address?: string | null
  city?: string | null
  prefecture?: string | null
  postal_code?: string | null
  country?: string | null

  contact_person?: string | null
  contact_email?: string | null
  contact_phone?: string | null

  description?: string | null
  is_active?: boolean
}

export interface CompanyFilters {
  search?: string
  category_id?: number | null
  prefecture?: string
  city?: string
  country?: string
  is_active?: boolean | ''
  page?: number
  limit?: number
  offset?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
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