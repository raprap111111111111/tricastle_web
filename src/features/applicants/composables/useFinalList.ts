// src/features/applicants/composables/useFinalList.ts

import { computed, ref } from 'vue'
import { useApplicantStore } from '../stores/applicant.store'
import { useBatchStore } from '@features/batches/stores/batch.store'
import { groupApplicantsByDate } from '../utils/final-list.utils'
import type { FinalListGroupBy, FinalListStats, BatchSummary } from '../types'

// ─── Shared state (module-scope, persists across views) ─────
const groupBy         = ref<FinalListGroupBy>('month')
const searchQuery     = ref('')
const selectedBatchId = ref<number | null>(null)

export function useFinalList() {
  const store      = useApplicantStore()
  const batchStore = useBatchStore()

  // ─── Load ONLY final_list applicants + ALL batches ──
  async function loadFinalList() {
    store.resetFilters()
    store.setFilters({
      status: 'final_list',
      exclude_statuses: '',
      limit: 1000,
      offset: 0,
    })

    // Load applicants + all batches in parallel
    await Promise.all([
      store.fetchApplicants(),
      loadAllBatches(),
    ])
  }

  // ─── Load ALL batches for filter dropdown ────────────
  async function loadAllBatches() {
    // Set filters to fetch all batches (no pagination limit)
    batchStore.setFilters({
      search: '',
      status: '',
      country: '',
      limit: 1000,
    })
    await batchStore.fetchBatches()
  }

  // ─── ALL batches from batch store (with applicant counts) ──
  const availableBatches = computed<BatchSummary[]>(() => {
    // Build a count map: batch_id => applicant_count
    const applicantCountByBatch = new Map<number, number>()

    store.applicants.forEach((a) => {
      a.applicant_batches?.forEach((ab) => {
        applicantCountByBatch.set(
          ab.batch_id,
          (applicantCountByBatch.get(ab.batch_id) ?? 0) + 1,
        )
      })
    })

    // Map ALL batches (even empty ones)
    return batchStore.batches
      .map((b: any) => ({
        id:                b.id,
        name:              b.name,
        batch_number:      b.batch_number,
        country:           b.country,
        status:            b.status,
        is_active:         b.is_active,
        applicant_count:   applicantCountByBatch.get(b.id) ?? 0,
      }))
      .sort((a, b) => {
        // 1. Active batches first
        if (a.is_active && !b.is_active) return -1
        if (!a.is_active && b.is_active) return 1
        // 2. Batches with applicants next
        if (a.applicant_count > 0 && b.applicant_count === 0) return -1
        if (a.applicant_count === 0 && b.applicant_count > 0) return 1
        // 3. Alphabetical
        return a.name.localeCompare(b.name)
      })
  })

  // ─── Filtered applicants (search + batch) ───────────
  const filteredApplicants = computed(() => {
    let base = store.applicants.map((a) => ({
      ...a,
      final_listed_at: a.final_listed_at ?? a.updated_at,
    }))

    // Batch filter
    if (selectedBatchId.value) {
      base = base.filter((a) =>
        a.applicant_batches?.some(
          (ab) => ab.batch_id === selectedBatchId.value,
        ),
      )
    }

    // Search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      base = base.filter((a) => {
        const fullName = `${a.first_name} ${a.middle_name ?? ''} ${a.last_name}`.toLowerCase()
        return (
          fullName.includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.applicant_code?.toLowerCase().includes(q)
        )
      })
    }

    return base
  })

  const folders = computed(() =>
    groupApplicantsByDate(filteredApplicants.value, groupBy.value),
  )

  const stats = computed<FinalListStats>(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    let total = 0, thisMonth = 0, thisWeek = 0, today = 0

    for (const a of filteredApplicants.value) {
      total++
      const dateStr = a.final_listed_at ?? a.updated_at
      if (!dateStr) continue
      const d = new Date(dateStr)
      if (d >= startOfMonth) thisMonth++
      if (d >= startOfWeek) thisWeek++
      if (d >= startOfDay) today++
    }

    return {
      total,
      this_month: thisMonth,
      this_week: thisWeek,
      today,
      ready_for_batch: total,
    }
  })

  function resetFilters() {
    searchQuery.value = ''
    selectedBatchId.value = null
  }

  return {
    folders,
    filteredApplicants,
    stats,

    // State
    groupBy,
    searchQuery,
    selectedBatchId,
    availableBatches,

    loading: computed(() => store.loading || batchStore.loading),

    // Actions
    loadFinalList,
    resetFilters,
  }
}