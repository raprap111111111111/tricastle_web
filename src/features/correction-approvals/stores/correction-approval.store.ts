// src/features/correction-approvals/stores/correction-approval.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { correctionApprovalApi } from '../api/correction-approval.api'
import type {
  CorrectionApproval,
  CorrectionApprovalListParams,
  CreateCorrectionApprovalPayload,
  UpdateCorrectionApprovalPayload,
  ApproveCorrectionApprovalPayload,
  RejectCorrectionApprovalPayload,
  EscalateCorrectionApprovalPayload,
} from '../types'

export const useCorrectionApprovalStore = defineStore('correction-approval', () => {
  // ─── State ──────────────────────────────────────────
  const records = ref<CorrectionApproval[]>([])
  const current = ref<CorrectionApproval | null>(null)
  const total = ref(0)

  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
    last_page: 1,
  })

  // ─── Getters ────────────────────────────────────────
  const pendingCount = computed(
    () => records.value.filter((r) => r.decision === 'pending').length,
  )
  const approvedCount = computed(
    () => records.value.filter((r) => r.decision === 'approved').length,
  )
  const rejectedCount = computed(
    () => records.value.filter((r) => r.decision === 'rejected').length,
  )
  const escalatedCount = computed(
    () => records.value.filter((r) => r.decision === 'escalated').length,
  )

  // ─── Actions ────────────────────────────────────────
  async function fetchApprovals(params: CorrectionApprovalListParams = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await correctionApprovalApi.list(params)
      records.value = res.data
      total.value = res.meta.total
      pagination.value = {
        current_page: res.meta.current_page,
        per_page: res.meta.per_page,
        total: res.meta.total,
        from: res.meta.from,
        to: res.meta.to,
        last_page: res.meta.last_page,
      }
      return res
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to load approvals'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchApproval(id: number) {
    loading.value = true
    error.value = null
    try {
      const approval = await correctionApprovalApi.get(id)
      current.value = approval
      return approval
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to load approval'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createApproval(payload: CreateCorrectionApprovalPayload) {
    submitting.value = true
    error.value = null
    try {
      const created = await correctionApprovalApi.create(payload)
      records.value.unshift(created)
      total.value += 1
      return created
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to create approval'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function updateApproval(
    id: number,
    payload: UpdateCorrectionApprovalPayload,
  ) {
    submitting.value = true
    error.value = null
    try {
      const updated = await correctionApprovalApi.update(id, payload)
      const idx = records.value.findIndex((r) => r.id === id)
      if (idx !== -1) records.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to update approval'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function deleteApproval(id: number) {
    submitting.value = true
    error.value = null
    try {
      await correctionApprovalApi.remove(id)
      records.value = records.value.filter((r) => r.id !== id)
      total.value = Math.max(0, total.value - 1)
      if (current.value?.id === id) current.value = null
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to delete approval'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function approve(id: number, payload: ApproveCorrectionApprovalPayload) {
    submitting.value = true
    error.value = null
    try {
      const updated = await correctionApprovalApi.approve(id, payload)
      const idx = records.value.findIndex((r) => r.id === id)
      if (idx !== -1) records.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to approve'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function reject(id: number, payload: RejectCorrectionApprovalPayload) {
    submitting.value = true
    error.value = null
    try {
      const updated = await correctionApprovalApi.reject(id, payload)
      const idx = records.value.findIndex((r) => r.id === id)
      if (idx !== -1) records.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to reject'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function escalate(
    id: number,
    payload: EscalateCorrectionApprovalPayload,
  ) {
    submitting.value = true
    error.value = null
    try {
      const updated = await correctionApprovalApi.escalate(id, payload)
      const idx = records.value.findIndex((r) => r.id === id)
      if (idx !== -1) records.value[idx] = updated
      if (current.value?.id === id) current.value = updated
      return updated
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to escalate'
      throw err
    } finally {
      submitting.value = false
    }
  }

  function setCurrent(approval: CorrectionApproval | null) {
    current.value = approval
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    records,
    current,
    total,
    loading,
    submitting,
    error,
    pagination,
    // Getters
    pendingCount,
    approvedCount,
    rejectedCount,
    escalatedCount,
    // Actions
    fetchApprovals,
    fetchApproval,
    createApproval,
    updateApproval,
    deleteApproval,
    approve,
    reject,
    escalate,
    setCurrent,
    clearError,
  }
})