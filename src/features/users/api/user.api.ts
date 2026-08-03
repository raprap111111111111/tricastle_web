// src/features/users/api/user.api.ts

import http from '@shared/api/http'
import type {
  User,
  UserFilters,
  UserListResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types'

const BASE = '/users'

function buildParams(filters: Partial<UserFilters>): Record<string, any> {
  const params: Record<string, any> = {}

  if (filters.search)             params.search       = filters.search
  if (filters.department)         params.department   = filters.department
  if (filters.gender)             params.gender       = filters.gender
  if (filters.role)               params.role         = filters.role
  if (filters.exclude_role)       params.exclude_role = filters.exclude_role
  if (filters.offset != null)     params.offset       = filters.offset
  if (filters.limit  != null)     params.limit        = filters.limit
  if (filters.order_by)           params.order_by     = filters.order_by
  if (filters.order_dir)          params.order_dir    = filters.order_dir
  if (filters.is_active != null)  params.is_active    = filters.is_active ? 1 : 0

  return params
}

/**
 * Build FormData for file uploads (avatar).
 * Handles booleans, files, and primitive values correctly.
 */
function toFormData(payload: Record<string, any>, method?: string): FormData {
  const form = new FormData()
  if (method) form.append('_method', method)

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    if (value instanceof File) {
      form.append(key, value)
    } else if (typeof value === 'boolean') {
      form.append(key, value ? '1' : '0')
    } else {
      form.append(key, String(value))
    }
  })

  return form
}

export const userApi = {
  getAll(filters: Partial<UserFilters>) {
    return http.get<UserListResponse>(BASE, { params: buildParams(filters) })
  },

  getOne(id: number) {
    return http.get<User>(`${BASE}/${id}`)
  },

  create(payload: CreateUserPayload) {
    // Always send as FormData in case avatar is included
    const form = toFormData(payload)
    return http.post<User>(BASE, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  update(id: number, payload: UpdateUserPayload) {
    // Laravel form spoofing — PUT via POST with FormData
    const form = toFormData(payload, 'PUT')
    return http.post<User>(`${BASE}/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  delete(id: number) {
    return http.delete<null>(`${BASE}/${id}`)
  },

  toggleActive(id: number) {
    return http.post<User>(`${BASE}/${id}/toggle-active`)
  },

  assignRoles(id: number, roles: string[]) {
    return http.post<User>(`${BASE}/${id}/assign-roles`, { roles })
  },
}