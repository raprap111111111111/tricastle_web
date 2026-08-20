import { computed } from 'vue'
import { useActivityLogStore } from '../stores/activity-log.store'
import type { ActivityLogStats } from '../types'

export function useActivityLogs() {
  const store = useActivityLogStore()

  const stats = computed<ActivityLogStats>(() => {
    const now = new Date()
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let today = 0, thisWeek = 0, thisMonth = 0

    for (const log of store.logs) {
      const d = new Date(log.created_at)
      if (d >= startOfDay)   today++
      if (d >= startOfWeek)  thisWeek++
      if (d >= startOfMonth) thisMonth++
    }

    return {
      total:      store.pagination?.total ?? 0,
      today,
      this_week:  thisWeek,
      this_month: thisMonth,
    }
  })

  return { stats }
}