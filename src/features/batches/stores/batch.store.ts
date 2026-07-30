import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { batchApi } from '../api/batch.api'
import type {
  Batch,
  BatchFilters,
  BatchPayload,
  BatchStatus,
  Pagination,
} from '../types'

export const useBatchStore = defineStore('batch', () => {
  const batches      = ref<Batch[]>([])
  const batch        = ref<Batch | null>(null)
  const activeBatch  = ref<Batch | null>(null)   // ← NEW
  const pagination   = ref<Pagination | null>(null)
  const loading      = ref(false)
  const submitting   = ref(false)

  const filters = ref<BatchFilters>({
    search: '',
    status: '',
    country: '',
    page: 1,
    limit: 10,
    sort_by: 'batch_number',
    sort_dir: 'asc',
  })

  // ─── Computed ─────────────────────────────────────────
  const hasActiveBatch = computed(() => activeBatch.value !== null)

  // ─── Filter helpers ───────────────────────────────────
  function setFilters(patch: Partial<BatchFilters>) {
    filters.value = { ...filters.value, ...patch, page: 1 }
  }

  function setPage(page: number) {
    filters.value.page = page
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.page = 1
  }

  function resetFilters() {
    filters.value = {
      search: '',
      status: '',
      country: '',
      page: 1,
      limit: 10,
      sort_by: 'batch_number',
      sort_dir: 'asc',
    }
  }

  function clearBatch() {
    batch.value = null
  }

  // ─── Fetch ────────────────────────────────────────────
  async function fetchBatches() {
    loading.value = true
    try {
      const res = await batchApi.list(filters.value)
      batches.value = res.data
      pagination.value = res.meta ?? res.pagination ?? null
    } finally {
      loading.value = false
    }
  }

  async function fetchBatch(id: number) {
    loading.value = true
    try {
      batch.value = await batchApi.get(id)
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveBatch() {
    try {
      activeBatch.value = await batchApi.getActive()
    } catch {
      activeBatch.value = null
    }
  }

  // ─── CRUD ─────────────────────────────────────────────
  async function createBatch(payload: BatchPayload) {
    submitting.value = true
    try {
      const created = await batchApi.create(payload)
      // If this batch is active, refresh activeBatch
      if (created.is_active) activeBatch.value = created
      return created
    } finally {
      submitting.value = false
    }
  }

  async function updateBatch(id: number, payload: Partial<BatchPayload>) {
    submitting.value = true
    try {
      const updated = await batchApi.update(id, payload)
      batch.value = updated
      const idx = batches.value.findIndex((b) => b.id === id)
      if (idx !== -1) batches.value[idx] = updated
      if (updated.is_active) activeBatch.value = updated
      return updated
    } finally {
      submitting.value = false
    }
  }

  async function deleteBatch(id: number) {
    submitting.value = true
    try {
      await batchApi.remove(id)
      batches.value = batches.value.filter((b) => b.id !== id)
      if (activeBatch.value?.id === id) activeBatch.value = null
    } finally {
      submitting.value = false
    }
  }

  async function updateStatus(id: number, status: BatchStatus) {
    submitting.value = true
    try {
      const updated = await batchApi.updateStatus(id, status)
      const idx = batches.value.findIndex((b) => b.id === id)
      if (idx !== -1) batches.value[idx] = updated
      if (batch.value?.id === id) batch.value = updated
      return updated
    } finally {
      submitting.value = false
    }
  }

  // ─── Active / Deactivate ──────────────────────────────
  async function activateBatch(id: number) {
    submitting.value = true
    try {
      const activated = await batchApi.activate(id)

      // Update local state — deactivate all others
      batches.value = batches.value.map((b) => ({
        ...b,
        is_active: b.id === id,
      }))

      activeBatch.value = activated
      if (batch.value?.id === id) batch.value = activated

      return activated
    } finally {
      submitting.value = false
    }
  }

  async function deactivateBatch(id: number) {
    submitting.value = true
    try {
      const deactivated = await batchApi.deactivate(id)

      const idx = batches.value.findIndex((b) => b.id === id)
      if (idx !== -1) batches.value[idx] = deactivated
      if (batch.value?.id === id) batch.value = deactivated
      if (activeBatch.value?.id === id) activeBatch.value = null

      return deactivated
    } finally {
      submitting.value = false
    }
  }

  return {
    // state
    batches, batch, activeBatch, pagination, loading, submitting, filters,
    // computed
    hasActiveBatch,
    // filter
    setFilters, setPage, setLimit, resetFilters, clearBatch,
    // fetch
    fetchBatches, fetchBatch, fetchActiveBatch,
    // CRUD
    createBatch, updateBatch, deleteBatch, updateStatus,
    // active
    activateBatch, deactivateBatch,
  }
})