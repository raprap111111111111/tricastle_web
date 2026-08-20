<script setup lang="ts">
import { AppStatCard } from '@shared/ui'
import type { DeploymentStats } from '../types'

defineProps<{
  stats: DeploymentStats
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <AppStatCard
      label="Total Deployed"
      :value="stats.total_deployed"
      icon="pi pi-send"
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
      icon="pi pi-calendar-plus"
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