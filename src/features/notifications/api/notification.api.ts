// src/features/notifications/api/notification.api.ts
import http from '@shared/api/http'
import type { NotificationFilters } from '../types'

export const notificationApi = {
  list(filters: NotificationFilters = {}) {
    // 🎯 Convert booleans to strings so backend receives them correctly
    const params: Record<string, any> = {}
    for (const [key, val] of Object.entries(filters)) {
      if (val === null || val === undefined || val === '') continue
      // Convert boolean → string
      if (typeof val === 'boolean') {
        params[key] = val ? 'true' : 'false'
      } else {
        params[key] = val
      }
    }
    return http.get('/notifications', { params })
  },

  show(id: string) {
    return http.get(`/notifications/${id}`)
  },

  markAsRead(id: string) {
    return http.patch(`/notifications/${id}/read`)
  },

  markAllAsRead() {
    return http.patch('/notifications/read-all')
  },

  destroy(id: string) {
    return http.delete(`/notifications/${id}`)
  },
}