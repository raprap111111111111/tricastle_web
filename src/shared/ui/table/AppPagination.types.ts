// src/shared/ui/table/AppPagination.types.ts

export interface PaginationInfo {
  current_page: number
  last_page: number
  per_page: number
  total: number
  offset?: number | null
  limit?: number | null
  has_more?: boolean | null
  from?: number | null
  to?: number | null
}