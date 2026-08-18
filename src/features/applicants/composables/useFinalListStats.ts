// src/features/applicants/composables/useFinalListStats.ts

import { computed, type Ref } from 'vue'

export function useFinalListStats(applicants: Ref<any[]>) {
  const totalFinalList = computed(() => applicants.value.length)

  const thisMonthCount = computed(() => {
    const now = new Date()
    return applicants.value.filter((a) => {
      const d = new Date(a.final_listed_at ?? a.updated_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  })

  const thisWeekCount = computed(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    return applicants.value.filter((a) =>
      new Date(a.final_listed_at ?? a.updated_at) >= startOfWeek,
    ).length
  })

  const japanReadyCount = computed(
    () => applicants.value.filter((a) => a.deployment?.japan_deployment_ready).length,
  )

  return { totalFinalList, thisMonthCount, thisWeekCount, japanReadyCount }
}