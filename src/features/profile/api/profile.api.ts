import http from '@shared/api/http'
import type { User } from '@/features/users/schemas/user.schema'
import type { UpdateProfilePayload, ChangePasswordPayload } from '../types'

const BASE = '/auth'

/**
 * Build FormData for file uploads (avatar).
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

export const profileApi = {
  updateProfile(payload: UpdateProfilePayload) {
    // Laravel form spoofing for PUT with files
    const form = toFormData(payload, 'PUT')
    return http.post<{ data: User }>(`${BASE}/profile`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  changePassword(payload: ChangePasswordPayload) {
    return http.put(`${BASE}/change-password`, payload)
  },
}