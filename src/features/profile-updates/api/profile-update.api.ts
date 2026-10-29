// src/features/profile-updates/api/profile-update.api.ts

import http from '@shared/api/http'
import type { 
  ProfileUpdateFilters, 
  PaginatedProfileUpdates 
} from '../types'

const BASE = '/profile-update-requests'

export const profileUpdateApi = {
  async list(filters?: ProfileUpdateFilters): Promise<PaginatedProfileUpdates> {
    const res = await http.get<PaginatedProfileUpdates>(BASE, { params: filters })
    return res.data
  },

  async approve(id: number): Promise<{ message: string }> {
    const res = await http.post<{ message: string }>(`${BASE}/${id}/approve`)
    return res.data
  },

  async decline(id: number, reason: string): Promise<{ message: string }> {
    const res = await http.post<{ message: string }>(`${BASE}/${id}/decline`, {
      decline_reason: reason,
    })
    return res.data
  },
}