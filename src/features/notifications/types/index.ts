// src/features/notifications/types/index.ts

export type NotificationSeverity = 'info' | 'success' | 'warn' | 'error'

export type NotificationModule =
  | 'system'
  | 'applicant'
  | 'batch'
  | 'document'
  | 'company'
  | 'user'

export interface NotificationData {
  title?: string
  message?: string
  module?: NotificationModule
  action_url?: string
  action_label?: string
  severity?: NotificationSeverity
  meta?: Record<string, any>
  [key: string]: any
}

export interface Notification {
  id: string
  type: string
  notifiable_type: string
  notifiable_id: number
  data: NotificationData
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationFilters {
  search?: string
  is_read?: boolean | null
  module?: NotificationModule | ''
  order_by?: string
  order_dir?: 'asc' | 'desc'
  offset?: number
  limit?: number
}

export interface Pagination {
  total: number
  offset: number
  limit: number
  current_page: number
  last_page: number
  per_page: number
  has_more: boolean
  from?: number
  to?: number
}