<script setup lang="ts">
import { onMounted, onActivated } from 'vue'
import { AppCard, AppStatCard } from '@shared/ui'
import { useActivityLogStore } from '../stores/activity-log.store'
import { useActivityLogs } from '../composables/useActivityLogs'
import { useActivityLogRealtime } from '@shared/pubnub/useActivityLogRealtime'
import ActivityLogTable from '../components/ActivityLogTable.vue'
import ActivityLogFilters from '../components/ActivityLogFilters.vue'
import type { ActivityLogFilters as IFilters } from '../types'

const store = useActivityLogStore()
const { stats } = useActivityLogs()

async function load() {
  await store.fetchLogs()
}

onMounted(load)
onActivated(load)

// 📡 Real-time
useActivityLogRealtime({ onReload: load })

function onFilter(f: Partial<IFilters>) {
  store.setFilters(f)
  store.fetchLogs()
}

function onReset() {
  store.resetFilters()
  store.fetchLogs()
}

function onPageChange(page: number) {
  store.setPage(page)
  store.fetchLogs()
}

function onLimitChange(limit: number) {
  store.setLimit(limit)
  store.fetchLogs()
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
    <header class="flex flex-col gap-1">
      <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
        Activity Logs
      </h1>
      <p class="text-sm text-blueberry-500">
        Track every action performed across the system
      </p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total Actions"  :value="stats.total"      icon="pi pi-history"    variant="blueberry" />
      <AppStatCard label="Today"          :value="stats.today"      icon="pi pi-clock"      variant="apricot" />
      <AppStatCard label="This Week"      :value="stats.this_week"  icon="pi pi-calendar"   variant="citrus" />
      <AppStatCard label="This Month"     :value="stats.this_month" icon="pi pi-chart-line" variant="green" />
    </div>

    <AppCard :padding="'small'" :shadow="'none'" class="!bg-transparent !border-appleCore-200/60">
      <ActivityLogFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <AppCard :padding="'none'" :shadow="'soft'">
      <ActivityLogTable
        :logs="store.logs"
        :pagination="store.pagination"
        :loading="store.loading"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
      />
    </AppCard>
  </div>
</template>