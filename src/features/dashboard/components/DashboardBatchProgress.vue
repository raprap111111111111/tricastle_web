<script setup lang="ts">
import type { ActiveBatch } from '../types'

const props = defineProps<{
  batches?: ActiveBatch[]
  loading?: boolean
}>()

function percent(b: ActiveBatch) {
  if (!b.target_count) return 0
  return Math.round((b.verified_count / b.target_count) * 100)
}

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null
  const target = new Date(dateStr).getTime()
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24))
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  preparing:   { label: 'Preparing',   color: 'text-yellow-700', bg: 'bg-yellow-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-700',   bg: 'bg-blue-100' },
  ready:       { label: 'Ready',       color: 'text-green-700',  bg: 'bg-green-100' },
  deployed:    { label: 'Deployed',    color: 'text-purple-700', bg: 'bg-purple-100' },
}
</script>

<template>
  <div class="space-y-3 min-h-[200px]">
    <!-- Loading -->
    <div
      v-if="loading && !batches?.length"
      class="flex items-center justify-center py-12"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!batches?.length"
      class="flex flex-col items-center justify-center py-10 text-center gap-2"
    >
      <div class="w-14 h-14 rounded-full bg-appleCore-50 flex items-center justify-center">
        <i class="pi pi-users text-xl text-blueberry-300" />
      </div>
      <p class="text-sm font-semibold text-blueberry-600">No active batches</p>
      <p class="text-xs text-blueberry-400">Create a batch to start tracking</p>
    </div>

    <!-- Batches -->
    <div
      v-for="b in batches"
      :key="b.id"
      class="p-3 rounded-xl bg-white ring-1 ring-appleCore-200 hover:ring-blueberry-300 transition-all"
    >
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-blueberry-800 truncate">{{ b.name }}</p>
          <p class="text-[11px] text-blueberry-500 font-mono">{{ b.batch_number }}</p>
        </div>
        <span
          class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          :class="[statusConfig[b.status]?.bg, statusConfig[b.status]?.color]"
        >
          {{ statusConfig[b.status]?.label ?? b.status }}
        </span>
      </div>

      <div class="mb-2">
        <div class="flex items-center justify-between text-[11px] mb-1">
          <span class="font-medium text-blueberry-600">
            {{ b.verified_count }} / {{ b.target_count }} verified
          </span>
          <span class="font-bold text-blueberry-800">{{ percent(b) }}%</span>
        </div>
        <div class="h-2 bg-appleCore-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="{
              'bg-gradient-to-r from-apricot-400 to-apricot-500': percent(b) < 60,
              'bg-gradient-to-r from-blue-400 to-blue-500':       percent(b) >= 60 && percent(b) < 100,
              'bg-gradient-to-r from-green-400 to-green-500':     percent(b) >= 100,
            }"
            :style="{ width: `${Math.min(percent(b), 100)}%` }"
          />
        </div>
      </div>

      <div v-if="b.deployment_date" class="flex items-center gap-1.5 text-[11px] text-blueberry-500">
        <i class="pi pi-calendar text-[10px]" />
        <span v-if="daysUntil(b.deployment_date)! > 0">
          Deploys in <strong class="text-blueberry-700">{{ daysUntil(b.deployment_date) }} days</strong>
        </span>
        <span v-else-if="daysUntil(b.deployment_date) === 0" class="text-green-600 font-semibold">
          🎌 Deploying today!
        </span>
        <span v-else class="text-purple-600 font-semibold">✈️ Deployed</span>
      </div>
    </div>
  </div>
</template>