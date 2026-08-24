// src/features/dashboard/api/dashboard.api.ts
import http from '@shared/api/http'
import type { DashboardStatsFilters, TrendRange } from '../types'

const BASE = '/dashboard'

export const DashboardApi = {
  stats(filters: DashboardStatsFilters = {}) {
    return http.get(`${BASE}/stats`, { params: filters })
  },

  activities(limit = 10) {
    return http.get(`${BASE}/activities`, { params: { limit } })
  },

  trends(range: TrendRange = '14d') {
    return http.get(`${BASE}/trends`, { params: { range } })
  },

  statusBreakdown() {
    return http.get(`${BASE}/status-breakdown`)
  },

  pipeline() {
    return http.get(`${BASE}/pipeline`)
  },

  activeBatches() {
    return http.get(`${BASE}/active-batches`)
  },

  quickStats() {
    return http.get(`${BASE}/quick-stats`)
  },

  attention() {
    return http.get(`${BASE}/attention`)
  },

  // NEW: Fetch upcoming birthdays
  birthdays() {
    return http.get(`${BASE}/birthdays`)
  },
}