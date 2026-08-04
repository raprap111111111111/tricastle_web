import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activityLogApi } from '../api/activity-log.api'
import type {
  ActivityLog,
  ActivityLogFilters,
  Pagination,
} from '../types'

export const useActivityLogStore = defineStore('activity-logs', () => {
  const logs        = ref<ActivityLog[]>([])
  const log         = ref<ActivityLog | null>(null)
  const loading     = ref(false)
  const error       = ref<string | null>(null)
  const pagination  = ref<Pagination | null>(null)

  const filters = ref<ActivityLogFilters>({
    offset: 0,
    limit: 15,
    search: '',
    order_by: 'created_at',
    order_dir: 'desc',
  })

  function cleanParams(obj: Record<string, any>) {
    const cleaned: Record<string, any> = {}
    for (const key in obj) {
      const val = obj[key]
      if (val !== '' && val !== null && val !== undefined) {
        cleaned[key] = val
      }
    }
    return cleaned
  }

  async function fetchLogs() {
    loading.value = true
    error.value = null
    try {
      const params = cleanParams(filters.value)
      const payload: any = await activityLogApi.list(params)

      logs.value = payload?.records ?? []
      pagination.value = {
        current_page: payload?.current_page ?? 1,
        last_page:    payload?.last_page ?? 1,
        per_page:     payload?.per_page ?? payload?.limit ?? 15,
        total:        payload?.total ?? 0,
        offset:       payload?.offset ?? 0,
        limit:        payload?.limit ?? 15,
        has_more:     payload?.has_more ?? false,
      }
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load activity logs'
      logs.value = []
      pagination.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchLog(id: number) {
    loading.value = true
    error.value = null
    try {
      log.value = await activityLogApi.get(id)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load activity log'
    } finally {
      loading.value = false
    }
  }

  function setFilters(patch: Partial<ActivityLogFilters>) {
    filters.value = { ...filters.value, ...patch, offset: 0 }
  }

  function setPage(page: number) {
    const limit = filters.value.limit ?? 15
    filters.value.offset = (page - 1) * limit
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.offset = 0
  }

  function resetFilters() {
    filters.value = {
      offset: 0,
      limit: 15,
      search: '',
      order_by: 'created_at',
      order_dir: 'desc',
    }
  }

  function clearLog() {
    log.value = null
  }

  return {
    // State
    logs, log, loading, error, pagination, filters,

    // Actions
    fetchLogs, fetchLog,
    setFilters, setPage, setLimit, resetFilters, clearLog,
  }
})