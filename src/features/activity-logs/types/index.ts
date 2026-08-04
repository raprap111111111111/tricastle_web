// ─── Enums ───────────────────────────────────────────
export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'verified'
  | 'rejected'
  | 'activated'
  | 'deactivated'
  | 'assigned'
  | 'moved_to_final_list'
  | 'uploaded'
  | 'downloaded'
  | 'login'
  | 'logout'
  | string

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// ─── Relations ───────────────────────────────────────
export interface UserRef {
  id: number
  full_name?: string
  name?: string
  email?: string
  avatar?: string | null
}

// ─── Main Model ──────────────────────────────────────
export interface ActivityLog {
  id: number
  user_id: number | null
  user?: UserRef | null

  action: ActivityAction
  module: string
  subject_type: string | null
  subject_id: number | null
  description: string

  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  metadata: Record<string, any> | null

  ip_address: string | null
  user_agent: string | null
  url: string | null
  method: HttpMethod | null

  created_at: string
  updated_at: string
}

// ─── Filters ─────────────────────────────────────────
export interface ActivityLogFilters {
  search?: string
  offset?: number
  limit?: number
  order_by?: string
  order_dir?: 'asc' | 'desc'

  user_id?: number | null
  action?: string
  module?: string
  subject_type?: string
  subject_id?: number | null
  method?: HttpMethod | ''

  date_from?: string
  date_to?: string
  recent_days?: number | null

  today?: boolean
  this_week?: boolean
  this_month?: boolean
}

// ─── Pagination ──────────────────────────────────────
export interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  offset: number
  limit: number
  has_more: boolean
  from?: number | null
  to?: number | null
}

export interface PaginatedResponse<T> {
  records: T[]
  total: number
  offset: number
  limit: number
  current_page: number
  last_page: number
  per_page: number
  has_more: boolean
}

export type PaginatedActivityLogs = PaginatedResponse<ActivityLog>

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ─── Stats ───────────────────────────────────────────
export interface ActivityLogStats {
  total: number
  today: number
  this_week: number
  this_month: number
}