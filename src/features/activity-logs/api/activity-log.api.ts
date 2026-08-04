import http from '@shared/api/http'
import type {
  ActivityLog,
  ActivityLogFilters,
  PaginatedActivityLogs,
} from '../types'

const BASE = '/activity-logs'

export const activityLogApi = {
  async list(filters?: ActivityLogFilters): Promise<PaginatedActivityLogs> {
    const res = await http.get<PaginatedActivityLogs>(BASE, { params: filters })
    return res.data
  },

  async get(id: number): Promise<ActivityLog> {
    const res = await http.get<ActivityLog>(`${BASE}/${id}`)
    return res.data
  },
}