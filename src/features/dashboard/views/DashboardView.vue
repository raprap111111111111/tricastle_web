<template>
  <div class="space-y-6">
    <AppPageHeader
      title="Dashboard"
      description="Welcome back to Tricastle Bacolod"
    >
      <AppButton icon="pi pi-refresh" label="Refresh" variant="neutral" outlined />
      <AppButton icon="pi pi-plus" label="Quick Action" variant="accent" />
    </AppPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <AppStatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :icon="stat.icon"
        :variant="stat.variant"
        :trend="stat.trend"
        trend-label="vs last week"
      />
    </div>

    <AppCard title="Recent Activity" subtitle="Latest actions across the system">
      <AppEmptyState
        icon="pi pi-inbox"
        title="No activity yet"
        description="Activity will appear here as things happen."
      >
        <AppButton icon="pi pi-refresh" label="Refresh" variant="accent" />
      </AppEmptyState>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import {
  AppPageHeader,
  AppButton,
  AppStatCard,
  AppCard,
  AppEmptyState,
} from '@shared/ui'

const stats = [
  { label: 'Total Applicants', value: '128', icon: 'pi pi-users',    variant: 'apricot',   trend: 12 },
  { label: 'Pending Docs',     value: '46',  icon: 'pi pi-file',     variant: 'blueberry', trend: -3 },
  { label: 'Verified Today',   value: '12',  icon: 'pi pi-verified', variant: 'citrus',    trend: 25 },
  { label: 'Corrections',      value: '8',   icon: 'pi pi-pencil',   variant: 'appleCore', trend: 0 },
] as const
</script>