// src/features/correction-approvals/composables/useCorrectionApprovalActions.ts
import { ref } from 'vue'
import { useCorrectionApprovalStore } from '../stores/correction-approval.store'
import type {
  CorrectionApproval,
  ApproveCorrectionApprovalPayload,
  RejectCorrectionApprovalPayload,
  EscalateCorrectionApprovalPayload,
} from '../types'
import { useToast } from 'primevue/usetoast'

export function useCorrectionApprovalActions(refresh: () => Promise<unknown>) {
  const store = useCorrectionApprovalStore()
  const toast = useToast()

  const actionTarget = ref<CorrectionApproval | null>(null)

  // Dialogs
  const approveDialog = ref(false)
  const rejectDialog = ref(false)
  const escalateDialog = ref(false)

  // Form fields
  const comments = ref('')
  const conditions = ref<string[]>([])
  const reason = ref('')

  function reset() {
    comments.value = ''
    conditions.value = []
    reason.value = ''
  }

  function openApprove(approval: CorrectionApproval) {
    actionTarget.value = approval
    reset()
    approveDialog.value = true
  }

  function openReject(approval: CorrectionApproval) {
    actionTarget.value = approval
    reset()
    rejectDialog.value = true
  }

  function openEscalate(approval: CorrectionApproval) {
    actionTarget.value = approval
    reset()
    escalateDialog.value = true
  }

  async function submitApprove() {
    if (!actionTarget.value) return false
    try {
      const payload: ApproveCorrectionApprovalPayload = {
        comments: comments.value || undefined,
        conditions: conditions.value.length ? conditions.value : undefined,
      }
      await store.approve(actionTarget.value.id, payload)
      toast.add({
        severity: 'success',
        summary: 'Approved',
        detail: 'Correction request approved successfully',
        life: 3000,
      })
      approveDialog.value = false
      await refresh()
      return true
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Approval failed',
        detail: e?.message ?? 'Something went wrong',
        life: 4000,
      })
      return false
    }
  }

  async function submitReject() {
    if (!actionTarget.value) return false
    if (!reason.value.trim()) {
      toast.add({
        severity: 'warn',
        summary: 'Reason required',
        detail: 'Please provide a reason for rejection',
        life: 3000,
      })
      return false
    }
    try {
      const payload: RejectCorrectionApprovalPayload = {
        comments: reason.value,
      }
      await store.reject(actionTarget.value.id, payload)
      toast.add({
        severity: 'success',
        summary: 'Rejected',
        detail: 'Correction request rejected',
        life: 3000,
      })
      rejectDialog.value = false
      await refresh()
      return true
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Rejection failed',
        detail: e?.message ?? 'Something went wrong',
        life: 4000,
      })
      return false
    }
  }

  async function submitEscalate() {
    if (!actionTarget.value) return false
    if (!reason.value.trim()) {
      toast.add({
        severity: 'warn',
        summary: 'Reason required',
        detail: 'Please provide a reason for escalation',
        life: 3000,
      })
      return false
    }
    try {
      const payload: EscalateCorrectionApprovalPayload = {
        comments: comments.value,
        escalation_reason: reason.value,
      }
      await store.escalate(actionTarget.value.id, payload)
      toast.add({
        severity: 'info',
        summary: 'Escalated',
        detail: 'Sent to admin for review',
        life: 3000,
      })
      escalateDialog.value = false
      await refresh()
      return true
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Escalation failed',
        detail: e?.message ?? 'Something went wrong',
        life: 4000,
      })
      return false
    }
  }

  async function confirmDelete(approval: CorrectionApproval) {
    if (!confirm(`Delete approval #${approval.id}? This cannot be undone.`)) return
    try {
      await store.deleteApproval(approval.id)
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Approval removed',
        life: 3000,
      })
      await refresh()
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Delete failed',
        detail: e?.message ?? 'Something went wrong',
        life: 4000,
      })
    }
  }

  return {
    actionTarget,
    approveDialog,
    rejectDialog,
    escalateDialog,
    comments,
    conditions,
    reason,
    openApprove,
    openReject,
    openEscalate,
    submitApprove,
    submitReject,
    submitEscalate,
    confirmDelete,
  }
}