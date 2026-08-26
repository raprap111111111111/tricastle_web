// src/features/batches/stores/batch.store.ts

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
  const batches     = ref<Batch[]>([])
  const batch       = ref<Batch | null>(null)
  const activeBatch = ref<Batch | null>(null)
  const pagination  = ref<Pagination | null>(null)
  const loading     = ref(false)
  const submitting  = ref(false)

  const filters = ref<BatchFilters>({
    search: '',
    status: '',
    country: '',
    page: 1,
    limit: 10,
    sort_by: 'batch_number',
    sort_dir: 'asc',
  })

  const hasActiveBatch = computed(() => activeBatch.value !== null)

  // ─── Helpers ───────────────────────────────────────────
  function cleanParams(obj: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    for (const key in obj) {
      const val = obj[key]
      if (val !== '' && val !== null && val !== undefined) {
        cleaned[key] = val
      }
    }
    return cleaned
  }

  function mapPagination(payload: any, fallbackPage = 1, fallbackLimit = 10): Pagination {
    const meta =
      payload?.meta ??
      payload?.pagination ??
      payload?.data?.meta ??
      payload

    const page   = Number(meta?.current_page ?? payload?.current_page ?? fallbackPage) || 1
    const limit  = Number(meta?.per_page ?? meta?.limit ?? payload?.per_page ?? payload?.limit ?? fallbackLimit) || 10
    const total  = Number(meta?.total ?? payload?.total ?? 0) || 0
    const last   = Number(meta?.last_page ?? payload?.last_page ?? Math.max(1, Math.ceil(total / limit) || 1)) || 1
    const offset = Number(meta?.offset ?? payload?.offset ?? (page - 1) * limit) || 0

    return {
      current_page: page,
      last_page: last,
      per_page: limit,
      total,
      offset,
      limit,
      from: meta?.from ?? payload?.from ?? (total === 0 ? 0 : offset + 1),
      to: meta?.to ?? payload?.to ?? Math.min(offset + limit, total),
    } as Pagination
  }

  function extractList(payload: any): Batch[] {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.records)) return payload.records
    if (Array.isArray(payload?.data?.records)) return payload.data.records
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
  }

  // ─── Filter helpers ───────────────────────────────────
  function setFilters(patch: Partial<BatchFilters>) {
    filters.value = {
      ...filters.value,
      ...patch,
      page: 1,
    }
  }

  function setPage(page: number) {
    filters.value.page = Math.max(1, page)
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
      const page  = filters.value.page ?? 1
      const limit = filters.value.limit ?? 10

      const params = cleanParams({
        ...filters.value,
        page,
        limit,
        offset: (page - 1) * limit,
      })

      const res: any = await batchApi.list(params)

      batches.value = extractList(res)
      pagination.value = mapPagination(res, page, limit)

      filters.value.page = pagination.value.current_page
      filters.value.limit = pagination.value.per_page ?? limit
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
    batches,
    batch,
    activeBatch,
    pagination,
    loading,
    submitting,
    filters,
    // computed
    hasActiveBatch,
    // filter
    setFilters,
    setPage,
    setLimit,
    resetFilters,
    clearBatch,
    // fetch
    fetchBatches,
    fetchBatch,
    fetchActiveBatch,
    // CRUD
    createBatch,
    updateBatch,
    deleteBatch,
    updateStatus,
    // active
    activateBatch,
    deactivateBatch,
  }
})