// src/features/correction-requests/composables/useCorrectionRequestActions.ts

import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useCorrectionRequestStore } from '../stores/correction-request.store'
import type { CorrectionRequest } from '../types'

export function useCorrectionRequestActions(onDone?: () => void) {
  const store = useCorrectionRequestStore()
  const toast = useToast()
  const confirm = useConfirm()

  // Action dialogs state
  const approveDialog = ref(false)
  const rejectDialog = ref(false)
  const completeDialog = ref(false)
  const cancelDialog = ref(false)
  const actionTarget = ref<CorrectionRequest | null>(null)

  const actionNotes = ref('')
  const actionReason = ref('')

  function openApprove(record: CorrectionRequest) {
    actionTarget.value = record
    actionNotes.value = ''
    approveDialog.value = true
  }

  function openReject(record: CorrectionRequest) {
    actionTarget.value = record
    actionReason.value = ''
    rejectDialog.value = true
  }

  function openComplete(record: CorrectionRequest) {
    actionTarget.value = record
    actionNotes.value = ''
    completeDialog.value = true
  }

  function openCancel(record: CorrectionRequest) {
    actionTarget.value = record
    actionReason.value = ''
    cancelDialog.value = true
  }

  async function submitApprove() {
    if (!actionTarget.value) return
    try {
      await store.approve(actionTarget.value.id, { notes: actionNotes.value })
      toast.add({ severity: 'success', summary: 'Approved', life: 3000 })
      approveDialog.value = false
      onDone?.()
    } catch {
      toast.add({ severity: 'error', summary: 'Failed to approve', life: 3000 })
    }
  }

  async function submitReject() {
    if (!actionTarget.value || !actionReason.value.trim()) return
    try {
      await store.reject(actionTarget.value.id, { reason: actionReason.value })
      toast.add({ severity: 'warn', summary: 'Rejected', life: 3000 })
      rejectDialog.value = false
      onDone?.()
    } catch {
      toast.add({ severity: 'error', summary: 'Failed to reject', life: 3000 })
    }
  }

  async function submitComplete() {
    if (!actionTarget.value) return
    try {
      await store.complete(actionTarget.value.id, { notes: actionNotes.value })
      toast.add({ severity: 'success', summary: 'Completed', life: 3000 })
      completeDialog.value = false
      onDone?.()
    } catch {
      toast.add({ severity: 'error', summary: 'Failed to complete', life: 3000 })
    }
  }

  async function submitCancel() {
    if (!actionTarget.value || !actionReason.value.trim()) return
    try {
      await store.cancel(actionTarget.value.id, { reason: actionReason.value })
      toast.add({ severity: 'warn', summary: 'Cancelled', life: 3000 })
      cancelDialog.value = false
      onDone?.()
    } catch {
      toast.add({ severity: 'error', summary: 'Failed to cancel', life: 3000 })
    }
  }

  function confirmDelete(record: CorrectionRequest) {
    confirm.require({
      message: `Delete correction request ${record.request_code}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          await store.remove(record.id)
          toast.add({ severity: 'success', summary: 'Deleted', life: 3000 })
          onDone?.()
        } catch {
          toast.add({ severity: 'error', summary: 'Failed to delete', life: 3000 })
        }
      },
    })
  }

  return {
    approveDialog,
    rejectDialog,
    completeDialog,
    cancelDialog,
    actionTarget,
    actionNotes,
    actionReason,
    openApprove,
    openReject,
    openComplete,
    openCancel,
    submitApprove,
    submitReject,
    submitComplete,
    submitCancel,
    confirmDelete,
  }
}