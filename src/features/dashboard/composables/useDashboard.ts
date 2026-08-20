import { onActivated, onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard.store'

interface Options {
  autoRefresh?: boolean
  intervalMs?: number
}

export function useDashboard(options: Options = {}) {
  const store = useDashboardStore()
  const { autoRefresh = false, intervalMs = 60_000 } = options

  let timer: ReturnType<typeof setInterval> | null = null

  async function refresh() {
    await store.refresh()
  }

  function startPolling() {
    if (autoRefresh && !timer) {
      timer = setInterval(refresh, intervalMs)
    }
  }

  function stopPolling() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onMounted(async () => {
    await refresh()
    startPolling()
  })

  onActivated(refresh)

  onUnmounted(stopPolling)

  return {
    store,
    refresh,
    startPolling,
    stopPolling,
  }
}