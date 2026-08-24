<!-- src/features/activity-logs/components/ActivityLogTable.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import AppPagination from '@shared/ui/table/AppPagination.vue'
import ActivityLogActionBadge from './ActivityLogActionBadge.vue'
import type { ActivityLog, Pagination } from '../types'

const props = defineProps<{
  logs: ActivityLog[]
  pagination: Pagination | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
}>()

const router = useRouter()

function onRowClick(event: DataTableRowClickEvent) {
  router.push({
    name: 'activity-logs.show',
    params: { id: (event.data as ActivityLog).id },
  })
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const s = Math.floor((now - then) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return formatDateTime(dateStr)
}
</script>

<template>
  <div class="flex flex-col relative">
    <DataTable
      :value="logs"
      :loading="loading"
      class="!border-none"
      size="small"
      :row-hover="true"
      @row-click="onRowClick"
      :pt="{
        table: 'text-sm',
        header: '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
        bodyRow: 'cursor-pointer hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
      }"
    >
      <Column header="When" style="width: 160px">
        <template #body="{ data }">
          <div class="flex flex-col">
            <span class="text-sm text-blueberry-800 font-medium">{{ timeAgo(data.created_at) }}</span>
            <span class="text-[10px] text-blueberry-400 tabular-nums">{{ formatDateTime(data.created_at) }}</span>
          </div>
        </template>
      </Column>

      <Column header="User" style="width: 200px">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full bg-apricot-100 text-apricot-700
                     flex items-center justify-center text-xs font-bold"
            >
              {{ (data.user?.full_name ?? data.user?.name ?? 'S')[0] }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm text-blueberry-800 font-medium truncate">
                {{ data.user?.full_name ?? data.user?.name ?? 'System' }}
              </span>
              <span class="text-[10px] text-blueberry-400 truncate">
                {{ data.user?.email ?? '' }}
              </span>
            </div>
          </div>
        </template>
      </Column>

      <Column header="Action" style="width: 140px">
        <template #body="{ data }">
          <ActivityLogActionBadge :action="data.action" />
        </template>
      </Column>

      <Column field="module" header="Module" style="width: 140px">
        <template #body="{ data }">
          <span class="text-sm font-medium text-blueberry-700">{{ data.module }}</span>
        </template>
      </Column>

      <Column header="Description">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-600">{{ data.description }}</span>
        </template>
      </Column>

      <Column field="method" header="Method" style="width: 80px">
        <template #body="{ data }">
          <span
            v-if="data.method"
            class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
            :class="{
              'bg-blue-50 text-blue-700':    data.method === 'GET',
              'bg-green-50 text-green-700':  data.method === 'POST',
              'bg-yellow-50 text-yellow-700': ['PUT', 'PATCH'].includes(data.method),
              'bg-red-50 text-red-700':      data.method === 'DELETE',
            }"
          >
            {{ data.method }}
          </span>
          <span v-else class="text-blueberry-300">—</span>
        </template>
      </Column>

      <Column field="ip_address" header="IP" style="width: 120px">
        <template #body="{ data }">
          <span class="font-mono text-xs text-blueberry-500">{{ data.ip_address ?? '—' }}</span>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-history text-2xl text-blueberry-300" />
          <p class="text-sm text-blueberry-500 font-medium">No activity logs</p>
          <p class="text-xs text-blueberry-400">Actions will appear here as they happen</p>
        </div>
      </template>
    </DataTable>

    <!-- 🎯 UNIFIED CUSTOM PAGINATION BAR -->
    <AppPagination
      v-if="props.pagination && props.pagination.total > 0"
      :pagination="props.pagination"
      @page-change="(page) => emit('page-change', page)"
      @limit-change="(limit) => emit('limit-change', limit)"
    />
  </div>
</template>