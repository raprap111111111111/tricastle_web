// src/features/dashboard/stores/dashboard.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { DashboardApi } from '../api/dashboard.api'
import type {
  ActiveBatch,
  ActivityItem,
  AttentionData,
  DashboardStats,
  DashboardStatsFilters,
  PipelineData,
  QuickStatsData,
  StatusBreakdown,
  TrendData,
  TrendRange,
  BirthdaysData, // NEW
} from '../types'

export const useDashboardStore = defineStore('dashboard', () => {
  // ─── State ─────────────────────────────
  const stats = ref<DashboardStats | null>(null)
  const activities = ref<ActivityItem[]>([])
  const trends = ref<TrendData | null>(null)
  const statusBreakdown = ref<StatusBreakdown | null>(null)
  const pipeline = ref<PipelineData | null>(null)
  const activeBatches = ref<ActiveBatch[]>([])
  const quickStats = ref<QuickStatsData | null>(null)
  const attention = ref<AttentionData | null>(null)
  const birthdays = ref<BirthdaysData | null>(null) // NEW

  const trendRange = ref<TrendRange>('14d')

  const loadingStats = ref(false)
  const loadingActivities = ref(false)
  const loadingTrends = ref(false)
  const loadingStatus = ref(false)
  const loadingPipeline = ref(false)
  const loadingBatches = ref(false)
  const loadingQuickStats = ref(false)
  const loadingAttention = ref(false)
  const loadingBirthdays = ref(false) // NEW

  const error = ref<string | null>(null)
  const lastFetchedAt = ref<string | null>(null)

  // ─── Getters ───────────────────────────
  const statList = computed(() => {
    if (!stats.value) return []
    return [
      stats.value.total_applicants,
      stats.value.pending_documents,
      stats.value.verified_today,
      stats.value.corrections,
    ]
  })

  const isLoading = computed(
    () =>
      loadingStats.value ||
      loadingActivities.value ||
      loadingTrends.value ||
      loadingStatus.value ||
      loadingPipeline.value ||
      loadingBatches.value ||
      loadingQuickStats.value ||
      loadingAttention.value ||
      loadingBirthdays.value // NEW
  )

  const attentionItems = computed(() => {
    if (!attention.value) return []
    return [
      {
        id: 1,
        type: 'expiring' as const,
        title: 'Documents expiring soon',
        count: attention.value.expiring_documents ?? 0,
      },
      {
        id: 2,
        type: 'correction' as const,
        title: 'Corrections pending review',
        count: attention.value.pending_corrections ?? 0,
      },
      {
        id: 3,
        type: 'mismatch' as const,
        title: 'Verification mismatches',
        count: attention.value.verification_mismatches ?? 0,
      },
      {
        id: 4,
        type: 'incomplete' as const,
        title: 'Incomplete applications',
        count: attention.value.incomplete_applications ?? 0,
      },
    ]
  })

  const quickStatsList = computed(() => {
    if (!quickStats.value) return []
    return [
      {
        label: 'This Month',
        value: quickStats.value.this_month ?? 0,
        icon: 'pi-calendar',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        label: 'Success Rate',
        value: `${quickStats.value.success_rate ?? 0}%`,
        icon: 'pi-check-circle',
        color: 'text-green-600',
        bg: 'bg-green-50',
      },
      {
        label: 'Avg. Process',
        value: `${quickStats.value.avg_processing_days ?? 0}d`,
        icon: 'pi-clock',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
      },
      {
        label: 'Active Batches',
        value: quickStats.value.active_batches ?? 0,
        icon: 'pi-users',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
      },
    ]
  })

  // ─── Actions ───────────────────────────
  async function fetchStats(filters: DashboardStatsFilters = {}) {
    loadingStats.value = true
    error.value = null
    try {
      const { data } = await DashboardApi.stats(filters)
      stats.value = data.data ?? data
      lastFetchedAt.value = new Date().toISOString()
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Failed to load stats'
    } finally {
      loadingStats.value = false
    }
  }

  async function fetchActivities(limit = 10) {
    loadingActivities.value = true
    try {
      const { data } = await DashboardApi.activities(limit)
      activities.value = data.data ?? data
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Failed to load activities'
    } finally {
      loadingActivities.value = false
    }
  }

  async function fetchTrends(range: TrendRange = trendRange.value) {
    loadingTrends.value = true
    trendRange.value = range
    try {
      const { data } = await DashboardApi.trends(range)
      trends.value = data.data ?? data
    } catch {
      trends.value = null
    } finally {
      loadingTrends.value = false
    }
  }

  async function fetchStatusBreakdown() {
    loadingStatus.value = true
    try {
      const { data } = await DashboardApi.statusBreakdown()
      statusBreakdown.value = data.data ?? data
    } catch {
      statusBreakdown.value = null
    } finally {
      loadingStatus.value = false
    }
  }

  async function fetchPipeline() {
    loadingPipeline.value = true
    try {
      const { data } = await DashboardApi.pipeline()
      pipeline.value = data.data ?? data
    } catch {
      pipeline.value = null
    } finally {
      loadingPipeline.value = false
    }
  }

  async function fetchActiveBatches() {
    loadingBatches.value = true
    try {
      const { data } = await DashboardApi.activeBatches()
      activeBatches.value = data.data ?? data ?? []
    } catch {
      activeBatches.value = []
    } finally {
      loadingBatches.value = false
    }
  }

  async function fetchQuickStats() {
    loadingQuickStats.value = true
    try {
      const { data } = await DashboardApi.quickStats()
      quickStats.value = data.data ?? data
    } catch {
      quickStats.value = null
    } finally {
      loadingQuickStats.value = false
    }
  }

  async function fetchAttention() {
    loadingAttention.value = true
    try {
      const { data } = await DashboardApi.attention()
      attention.value = data.data ?? data
    } catch {
      attention.value = null
    } finally {
      loadingAttention.value = false
    }
  }

  // NEW: Fetch Birthdays
  async function fetchBirthdays() {
    loadingBirthdays.value = true
    try {
      const { data } = await DashboardApi.birthdays()
      birthdays.value = data.data ?? data
    } catch {
      birthdays.value = null
    } finally {
      loadingBirthdays.value = false
    }
  }

  async function refresh() {
    await Promise.all([
      fetchStats(),
      fetchActivities(),
      fetchTrends(),
      fetchStatusBreakdown(),
      fetchPipeline(),
      fetchActiveBatches(),
      fetchQuickStats(),
      fetchAttention(),
      fetchBirthdays(), // NEW
    ])
  }

  function reset() {
    stats.value = null
    activities.value = []
    trends.value = null
    statusBreakdown.value = null
    pipeline.value = null
    activeBatches.value = []
    quickStats.value = null
    attention.value = null
    birthdays.value = null // NEW
    error.value = null
    lastFetchedAt.value = null
  }

  return {
    // state
    stats,
    activities,
    trends,
    statusBreakdown,
    pipeline,
    activeBatches,
    quickStats,
    attention,
    birthdays,
    trendRange,
    
    // loading flags
    loadingStats,
    loadingActivities,
    loadingTrends,
    loadingStatus,
    loadingPipeline,
    loadingBatches,
    loadingQuickStats,
    loadingAttention,
    loadingBirthdays,
    
    error,
    lastFetchedAt,
    
    // getters
    statList,
    isLoading,
    attentionItems,
    quickStatsList,
    
    // actions
    fetchStats,
    fetchActivities,
    fetchTrends,
    fetchStatusBreakdown,
    fetchPipeline,
    fetchActiveBatches,
    fetchQuickStats,
    fetchAttention,
    fetchBirthdays,
    refresh,
    reset,
  }
})