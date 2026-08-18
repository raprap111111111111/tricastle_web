<!-- src/features/applicants/components/final-list/FinalListStats.vue -->
<script setup lang="ts">
import { AppStatCard } from '@shared/ui'

defineProps<{
  total:      number
  month:      number
  week:       number
  japanReady: number
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <AppStatCard label="Total Final List" :value="total" icon="pi pi-check-circle" variant="green" />
    <AppStatCard label="This Month"       :value="month" icon="pi pi-calendar"      variant="blueberry" />
    <AppStatCard label="This Week"        :value="week"  icon="pi pi-calendar-plus" variant="apricot" />
    <AppStatCard label="Japan Ready"      :value="japanReady" icon="pi pi-send"     variant="citrus" />
  </div>
</template>