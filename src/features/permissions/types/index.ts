// ─────────────────────────────────────────────
// Permission Types
// ─────────────────────────────────────────────

export interface Permission {
  id: number
  name: string
  guard_name: string
  description: string | null
  module: string | null
  roles_count?: number
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────
// Request Payloads
// ─────────────────────────────────────────────

export interface CreatePermissionPayload {
  name: string
  description?: string | null
  module?: string | null
}

export interface UpdatePermissionPayload {
  name?: string
  description?: string | null
  module?: string | null
}

export interface ListPermissionsParams {
  search?: string
  module?: string
  guard_name?: string
  offset?: number
  limit?: number
  order_by?: string
  order_dir?: 'asc' | 'desc'
}

// ─────────────────────────────────────────────
// API Responses
// ─────────────────────────────────────────────

export interface PermissionResponse {
  success: boolean
  message: string
  data: Permission
}

export interface PermissionListResponse {
  success: boolean
  message: string
  data: {
    data: Permission[]
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface PermissionGroupedResponse {
  success: boolean
  message: string
  data: Record<string, Permission[]>
}

// ─────────────────────────────────────────────
// UI State Types
// ─────────────────────────────────────────────

export type PermissionDialogMode = 'create' | 'edit'

export interface PermissionFormState {
  name: string
  description: string
  module: string
}