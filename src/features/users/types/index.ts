// src/features/users/types/index.ts

export interface User {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  full_name: string
  initials: string

  email: string
  email_verified_at: string | null
  phone: string | null
  mobile: string | null

  avatar: string | null
  bio: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | null

  employee_code: string | null
  department: string | null
  position: string | null
  hired_date: string | null
  supervisor_id: number | null
  supervisor?: { id: number; full_name: string; email: string } | null

  address: string | null
  city: string | null
  province: string | null
  country: string | null
  postal_code: string | null

  is_active: boolean
  last_login_at: string | null
  last_login_ip: string | null
  login_count: number

  two_factor_enabled: boolean
  is_locked: boolean

  locale: string
  timezone: string
  theme: 'light' | 'dark'

  roles?: string[]
  permissions?: string[]

  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Pagination {
  total: number
  offset: number
  limit: number
  per_page: number
  current_page: number
  last_page: number
  from?: number
  to?: number
}

export interface UserListResponse {
  records: User[]
  total: number
  offset: number
  limit: number
  current_page: number
  last_page: number
  per_page: number
}

export interface UserFilters {
  search?: string
  is_active?: boolean | null
  department?: string | null
  gender?: 'male' | 'female' | 'other' | null
  role?: string | null
  exclude_role?: string | null

  offset: number
  limit: number
  order_by?: string
  order_dir?: 'asc' | 'desc'
}

export interface CreateUserPayload {
  first_name: string
  middle_name?: string
  last_name: string
  suffix?: string
  email: string
  phone?: string
  mobile?: string
  password: string
  password_confirmation: string
  employee_code?: string
  department?: string
  position?: string
  role?: string
  avatar?: File | null
  is_active?: boolean
}

export type UpdateUserPayload = Partial<CreateUserPayload>

// ─── Constants ─────────────────────────────────────────
export const GENDER_OPTIONS = [
  { label: 'Male',   value: 'male'   },
  { label: 'Female', value: 'female' },
  { label: 'Other',  value: 'other'  },
]

export const ROLE_OPTIONS = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Admin',       value: 'admin'       },
  { label: 'Manager',     value: 'manager'     },
  { label: 'Staff',       value: 'staff'       },
]

export const ORDER_BY_OPTIONS = [
  { label: 'Created Date',   value: 'created_at'    },
  { label: 'Last Name',      value: 'last_name'     },
  { label: 'Email',          value: 'email'         },
  { label: 'Department',     value: 'department'    },
  { label: 'Employee Code',  value: 'employee_code' },
  { label: 'Last Login',     value: 'last_login_at' },
]

export const ACTIVE_OPTIONS = [
  { label: 'All',      value: null  },
  { label: 'Active',   value: true  },
  { label: 'Inactive', value: false },
]