<script setup lang="ts">
import { AppButton } from '@shared/ui'
import type { ActivityItem } from '../types'
import DashboardActivityItem from './DashboardActivityItem.vue'

defineProps<{
  activities: ActivityItem[]
  loading?: boolean
}>()

defineEmits<{
  (e: 'refresh'): void
}>()
</script>

<template>
  <div class="flex flex-col">
    <!-- Loading -->
    <div
      v-if="loading && activities.length === 0"
      class="flex flex-col items-center justify-center py-16 gap-3"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
      <p class="text-sm text-blueberry-500">Loading activity...</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="activities.length === 0"
      class="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center"
    >
      <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
        <i class="pi pi-inbox text-2xl text-blueberry-300" />
      </div>
      <p class="text-base font-semibold text-blueberry-700">No activity yet</p>
      <p class="text-sm text-blueberry-400">
        Activity will appear here as things happen.
      </p>
      <AppButton
        icon="pi pi-refresh"
        label="Refresh"
        variant="accent"
        @click="$emit('refresh')"
      />
    </div>

    <!-- List -->
    <div v-else class="divide-y divide-appleCore-100">
      <DashboardActivityItem
        v-for="a in activities"
        :key="a.id"
        :activity="a"
      />
    </div>
  </div>
</template>