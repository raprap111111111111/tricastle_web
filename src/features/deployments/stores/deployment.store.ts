// src/features/deployments/stores/deployment.store.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { deploymentApi } from '../api/deployment.api'
import type {
  Deployment,
  DeployApplicantPayload,
  UpdateDeploymentPayload,
  CancelDeploymentPayload,
  BulkDeployPayload,
  BulkDeployResult,
  DeploymentFilters,
  DeploymentStats,
  Pagination,
} from '../types'

export const useDeploymentStore = defineStore('deployment', () => {
  // ─── State ────────────────────────────────────────────
  const deployments = ref<Deployment[]>([])
  const deployment  = ref<Deployment | null>(null)
  const pagination  = ref<Pagination | null>(null)

  const stats = ref<DeploymentStats>({
    total_deployed: 0,
    today: 0,
    this_week: 0,
    this_month: 0,
    by_country: {},
  })

  const countries = ref<string[]>([])

  const loading    = ref(false)
  const submitting = ref(false)
  const error      = ref<string | null>(null)

  const filters = ref<DeploymentFilters>({
    offset: 0,
    limit: 10,
    search: '',
    country: '',
    order_by: 'deployed_at',
    order_dir: 'desc',
  })

  // ─── Computed ─────────────────────────────────────────
  const hasDeployments = computed(() => deployments.value.length > 0)

  // ─── Helpers ──────────────────────────────────────────
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

  function clearError() {
    error.value = null
  }

  function replaceInList(updated: Deployment) {
    const idx = deployments.value.findIndex((d) => d.id === updated.id)
    if (idx !== -1) deployments.value.splice(idx, 1, updated)
    if (deployment.value?.id === updated.id) deployment.value = updated
  }

  function removeFromList(id: number) {
    deployments.value = deployments.value.filter((d) => d.id !== id)
  }

  // ═══════════════════════════════════════════════════════
  // Fetch
  // ═══════════════════════════════════════════════════════

  async function fetchDeployments() {
    loading.value = true
    clearError()
    try {
      const params  = cleanParams(filters.value)
      const payload = await deploymentApi.list(params)

      deployments.value = payload?.records ?? []
      pagination.value = {
        current_page: payload?.current_page ?? 1,
        last_page:    payload?.last_page ?? 1,
        per_page:     payload?.per_page ?? payload?.limit ?? 10,
        total:        payload?.total ?? 0,
        offset:       payload?.offset ?? 0,
        limit:        payload?.limit ?? 10,
        has_more:     payload?.has_more ?? false,
      }
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load deployments'
      deployments.value = []
      pagination.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchDeployment(id: number) {
    loading.value = true
    clearError()
    try {
      deployment.value = await deploymentApi.get(id)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load deployment'
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      stats.value = await deploymentApi.stats()
    } catch (e: any) {
      console.error('Failed to fetch deployment stats:', e)
    }
  }

  async function fetchCountries() {
    try {
      countries.value = await deploymentApi.countries()
    } catch (e: any) {
      console.error('Failed to fetch countries:', e)
      countries.value = []
    }
  }

  // ═══════════════════════════════════════════════════════
  // Deployment Actions
  // ═══════════════════════════════════════════════════════

  async function deploy(id: number, payload: DeployApplicantPayload): Promise<Deployment> {
    submitting.value = true
    clearError()
    try {
      const updated = await deploymentApi.deploy(id, payload)
      const exists  = deployments.value.find((d) => d.id === updated.id)
      if (exists) {
        replaceInList(updated)
      } else {
        deployments.value.unshift(updated)
      }
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to deploy applicant'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function updateDeployment(id: number, payload: UpdateDeploymentPayload): Promise<Deployment> {
    submitting.value = true
    clearError()
    try {
      const updated = await deploymentApi.update(id, payload)
      replaceInList(updated)
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to update deployment'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function cancelDeployment(id: number, payload: CancelDeploymentPayload): Promise<Deployment> {
    submitting.value = true
    clearError()
    try {
      const updated = await deploymentApi.cancel(id, payload)
      removeFromList(id)
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to cancel deployment'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function bulkDeploy(payload: BulkDeployPayload): Promise<BulkDeployResult> {
    submitting.value = true
    clearError()
    try {
      const result = await deploymentApi.bulkDeploy(payload)
      await fetchDeployments()
      return result
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to bulk deploy'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // 🏠 Mark returned home
  async function markReturned(applicantBatchId: number, reason: string): Promise<any> {
    submitting.value = true
    clearError()
    try {
      const updated = await deploymentApi.markReturned(applicantBatchId, {
        return_reason: reason,
      })
      removeFromList(applicantBatchId)
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to mark as returned'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ✅ Mark completed
  async function markCompleted(applicantBatchId: number, notes?: string | null): Promise<any> {
    submitting.value = true
    clearError()
    try {
      const updated = await deploymentApi.markCompleted(applicantBatchId, {
        completion_notes: notes ?? null,
      })
      removeFromList(applicantBatchId)
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to mark as completed'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ═══════════════════════════════════════════════════════
  // Filter management
  // ═══════════════════════════════════════════════════════

  function setFilters(newFilters: Partial<DeploymentFilters>) {
    filters.value = { ...filters.value, ...newFilters, offset: 0 }
  }

  function setPage(page: number) {
    const limit = filters.value.limit ?? 10
    filters.value.offset = (page - 1) * limit
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.offset = 0
  }

  function resetFilters() {
    filters.value = {
      offset: 0,
      limit: 10,
      search: '',
      country: '',
      order_by: 'deployed_at',
      order_dir: 'desc',
    }
  }

  function clearDeployment() {
    deployment.value = null
  }

  return {
    // State
    deployments,
    deployment,
    pagination,
    stats,
    countries,
    loading,
    submitting,
    error,
    filters,

    // Computed
    hasDeployments,

    // Actions
    fetchDeployments,
    fetchDeployment,
    fetchStats,
    fetchCountries,

    deploy,
    updateDeployment,
    cancelDeployment,
    bulkDeploy,
    markReturned,
    markCompleted,

    // Utilities
    setFilters,
    setPage,
    setLimit,
    resetFilters,
    clearDeployment,
    clearError,
    replaceInList,
    removeFromList,
  }
})