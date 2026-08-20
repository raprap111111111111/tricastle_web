<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { AppPageHeader, AppButton, AppCard } from '@shared/ui'
import { useDashboard } from '../composables/useDashboard'
import { useDashboardRealtime } from '@shared/pubnub/useDashboardRealtime'
import type { TrendRange } from '../types'

import DashboardStatsGrid from '../components/DashboardStatsGrid.vue'
import DashboardActivityFeed from '../components/DashboardActivityFeed.vue'
import DashboardTrendChart from '../components/DashboardTrendChart.vue'
import DashboardStatusDonut from '../components/DashboardStatusDonut.vue'
import DashboardBatchProgress from '../components/DashboardBatchProgress.vue'
import DashboardPipeline from '../components/DashboardPipeline.vue'
import DashboardQuickStats from '../components/DashboardQuickStats.vue'
import DashboardAttentionCard from '../components/DashboardAttentionCard.vue'

const toast = useToast()

const { store, refresh } = useDashboard({
  autoRefresh: true,
  intervalMs: 60_000,
})

useDashboardRealtime({ onReload: refresh })

const lastUpdatedLabel = computed(() => {
  if (!store.lastFetchedAt) return 'Never'
  const date = new Date(store.lastFetchedAt)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return date.toLocaleTimeString()
})

const trendRanges: TrendRange[] = ['7d', '14d', '30d']

async function changeTrendRange(range: TrendRange) {
  await store.fetchTrends(range)
}

async function handleRefresh() {
  try {
    await refresh()
    toast.add({
      severity: 'success',
      summary: 'Dashboard refreshed',
      life: 2000,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Failed to refresh',
      detail: 'Please try again',
      life: 3000,
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <AppPageHeader
      title="Dashboard"
      description="Welcome back to Tricastle Bacolod"
    >
      <AppButton
        icon="pi pi-refresh"
        label="Refresh"
        variant="neutral"
        outlined
        :loading="store.isLoading"
        @click="handleRefresh"
      />
      <AppButton
        icon="pi pi-plus"
        label="Quick Action"
        variant="accent"
      />
    </AppPageHeader>

    <!-- ─── Main Stats Cards ───────────────────── -->
    <DashboardStatsGrid
      :stats="store.statList"
      :loading="store.loadingStats"
    />

    <!-- ─── Quick Stats Row ────────────────────── -->
    <DashboardQuickStats
      :stats="store.quickStatsList"
      :loading="store.loadingQuickStats"
    />

    <!-- ─── Charts Row ─────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Trend Chart (spans 2) -->
      <AppCard class="lg:col-span-2" padding="normal" shadow="soft">
        <template #header>
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-base font-serif font-semibold text-blueberry-800">
                Applicant & Document Trends
              </h3>
              <p class="text-xs text-blueberry-500 mt-0.5">
                Last {{ store.trendRange.toUpperCase() }} activity
              </p>
            </div>
            <div class="flex gap-1">
              <button
                v-for="range in trendRanges"
                :key="range"
                class="text-[11px] font-semibold px-2 py-1 rounded-md transition-colors"
                :class="range === store.trendRange
                  ? 'bg-blueberry-600 text-white'
                  : 'text-blueberry-500 hover:bg-appleCore-50'"
                @click="changeTrendRange(range)"
              >
                {{ range.toUpperCase() }}
              </button>
            </div>
          </div>
        </template>
        <DashboardTrendChart
          :labels="store.trends?.labels"
          :applicants="store.trends?.applicants"
          :documents="store.trends?.documents"
          :loading="store.loadingTrends"
        />
      </AppCard>

      <!-- Status Donut -->
      <AppCard padding="normal" shadow="soft">
        <template #header>
          <div class="mb-4">
            <h3 class="text-base font-serif font-semibold text-blueberry-800">
              Applicant Status
            </h3>
            <p class="text-xs text-blueberry-500 mt-0.5">Current breakdown</p>
          </div>
        </template>
        <DashboardStatusDonut
          :data="store.statusBreakdown"
          :loading="store.loadingStatus"
        />
      </AppCard>
    </div>

    <!-- ─── Pipeline & Batches Row ─────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pipeline -->
      <AppCard padding="normal" shadow="soft">
        <template #header>
          <div class="mb-4">
            <h3 class="text-base font-serif font-semibold text-blueberry-800">
              🎌 Deployment Pipeline
            </h3>
            <p class="text-xs text-blueberry-500 mt-0.5">Conversion funnel to Japan</p>
          </div>
        </template>
        <DashboardPipeline
          :data="store.pipeline"
          :loading="store.loadingPipeline"
        />
      </AppCard>

      <!-- Active Batches -->
      <AppCard padding="normal" shadow="soft">
        <template #header>
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-base font-serif font-semibold text-blueberry-800">
                Active Batches
              </h3>
              <p class="text-xs text-blueberry-500 mt-0.5">Progress tracking</p>
            </div>
            <router-link
              :to="{ name: 'batches.index' }"
              class="text-xs font-semibold text-apricot-600 hover:text-apricot-700"
            >
              View all →
            </router-link>
          </div>
        </template>
        <DashboardBatchProgress
          :batches="store.activeBatches"
          :loading="store.loadingBatches"
        />
      </AppCard>
    </div>

    <!-- ─── Attention + Recent Activity Row ────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Attention Required -->
      <AppCard padding="normal" shadow="soft">
        <template #header>
          <div class="mb-4">
            <h3 class="text-base font-serif font-semibold text-blueberry-800">
              ⚠️ Needs Attention
            </h3>
            <p class="text-xs text-blueberry-500 mt-0.5">Items requiring action</p>
          </div>
        </template>
        <DashboardAttentionCard
          :items="store.attentionItems"
          :loading="store.loadingAttention"
        />
      </AppCard>

      <!-- Recent Activity (spans 2) -->
      <AppCard class="lg:col-span-2" padding="none" shadow="soft">
        <div class="flex items-start justify-between gap-3 px-4 py-3 border-b border-appleCore-100">
          <div>
            <h3 class="text-base font-serif font-semibold text-blueberry-800">
              Recent Activity
            </h3>
            <p class="text-[11px] text-blueberry-500 mt-0.5">
              Latest actions · updated {{ lastUpdatedLabel }}
            </p>
          </div>
          <span
            class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700
                   rounded-full text-[10px] font-medium ring-1 ring-green-200"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            Live
          </span>
        </div>

        <div class="max-h-[320px] overflow-y-auto">
          <DashboardActivityFeed
            :activities="store.activities"
            :loading="store.loadingActivities"
            @refresh="handleRefresh"
          />
        </div>
      </AppCard>
    </div>
  </div>
</template>