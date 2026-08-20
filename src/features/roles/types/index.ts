// src/features/roles/types/index.ts

// ─────────────────────────────────────────────
// Role Types
// ─────────────────────────────────────────────

export interface Permission {
  id: number
  name: string
  guard_name: string
  module?: string | null
  description?: string | null
}

export interface Role {
  id: number
  name: string
  guard_name: string
  description: string | null
  is_system: boolean
  permissions_count: number
  users_count: number
  permissions?: Permission[]
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────
// Request Payloads
// ─────────────────────────────────────────────

export interface CreateRolePayload {
  name: string
  description?: string | null
  permissions?: string[]
}

export interface UpdateRolePayload {
  name?: string
  description?: string | null
}

export interface SyncPermissionsPayload {
  permissions: string[]
}

// ─────────────────────────────────────────────
// ✅ NEW — Filters
// ─────────────────────────────────────────────

export interface RoleFilters {
  search?:     string
  is_system?:  boolean | null
  guard_name?: string | null
  offset?:     number
  limit?:      number
  order_by?:   string
  order_dir?:  'asc' | 'desc'
}

// ─────────────────────────────────────────────
// ✅ NEW — Pagination Meta
// ─────────────────────────────────────────────

export interface Pagination {
  total:        number
  offset:       number
  limit:        number
  per_page:     number
  current_page: number
  last_page:    number
  from:         number
  to:           number
}

// ─────────────────────────────────────────────
// API Responses
// ─────────────────────────────────────────────

export interface RoleResponse {
  success: boolean
  message: string
  data:    Role
}

export interface RoleListResponse {
  success: boolean
  message: string
  data:    Role[] | {
    records?:      Role[]
    data?:         Role[]
    total?:        number
    offset?:       number
    limit?:        number
    per_page?:     number
    current_page?: number
    last_page?:    number
  }
}

export interface RolePermissionsResponse {
  success: boolean
  message: string
  data: {
    role:        string
    total:       number
    permissions: Permission[]
  }
}

// ─────────────────────────────────────────────
// UI State Types
// ─────────────────────────────────────────────

export type RoleDialogMode = 'create' | 'edit'

export interface RoleFormState {
  name:        string
  description: string
  permissions: string[]
}