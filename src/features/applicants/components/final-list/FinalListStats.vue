<!-- src/features/applicants/components/final-list/FinalListStats.vue -->
<script setup lang="ts">
import { AppStatCard } from '@shared/ui'
import type { FinalListStats } from '../../types'

defineProps<{
  stats: FinalListStats
}>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <AppStatCard
      label="Total Final List"
      :value="stats.total"
      icon="pi pi-check-circle"
      variant="green"
    />
    <AppStatCard
      label="This Month"
      :value="stats.this_month"
      icon="pi pi-calendar"
      variant="blueberry"
    />
    <AppStatCard
      label="This Week"
      :value="stats.this_week"
      icon="pi pi-calendar-clock"
      variant="apricot"
    />
    <AppStatCard
      label="Today"
      :value="stats.today"
      icon="pi pi-clock"
      variant="citrus"
    />
  </div>
</template>