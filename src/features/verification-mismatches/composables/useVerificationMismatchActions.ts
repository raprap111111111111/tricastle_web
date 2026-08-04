// src/features/verification-mismatches/composables/useVerificationMismatchActions.ts
import { ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useVerificationMismatchStore } from '../stores/verification-mismatch.store'
import type { VerificationMismatch } from '../types'

export function useVerificationMismatchActions(onSuccess?: () => void) {
  const store = useVerificationMismatchStore()
  const confirm = useConfirm()
  const toast = useToast()

  const actionTarget = ref<VerificationMismatch | null>(null)
  const actionNotes = ref('')

  const resolveDialog = ref(false)
  const waiveDialog = ref(false)
  const escalateDialog = ref(false)

  function openResolve(record: VerificationMismatch) {
    actionTarget.value = record
    actionNotes.value = ''
    resolveDialog.value = true
  }

  function openWaive(record: VerificationMismatch) {
    actionTarget.value = record
    actionNotes.value = ''
    waiveDialog.value = true
  }

  function openEscalate(record: VerificationMismatch) {
    actionTarget.value = record
    actionNotes.value = ''
    escalateDialog.value = true
  }

  async function submitResolve() {
    if (!actionTarget.value) return
    try {
      await store.resolve(actionTarget.value.id, {
        resolution_notes: actionNotes.value,
      })
      toast.add({
        severity: 'success',
        summary: 'Resolved',
        detail: 'Mismatch marked as corrected',
        life: 3000,
      })
      resolveDialog.value = false
      onSuccess?.()
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.response?.data?.message ?? 'Failed to resolve',
        life: 5000,
      })
    }
  }

  async function submitWaive() {
    if (!actionTarget.value) return
    try {
      await store.waive(actionTarget.value.id, {
        resolution_notes: actionNotes.value,
      })
      toast.add({
        severity: 'success',
        summary: 'Waived',
        detail: 'Mismatch has been waived',
        life: 3000,
      })
      waiveDialog.value = false
      onSuccess?.()
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.response?.data?.message ?? 'Failed to waive',
        life: 5000,
      })
    }
  }

  async function submitEscalate() {
    if (!actionTarget.value) return
    try {
      await store.escalate(actionTarget.value.id, {
        resolution_notes: actionNotes.value,
      })
      toast.add({
        severity: 'warn',
        summary: 'Escalated',
        detail: 'Mismatch escalated to supervisor',
        life: 3000,
      })
      escalateDialog.value = false
      onSuccess?.()
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.response?.data?.message ?? 'Failed to escalate',
        life: 5000,
      })
    }
  }

  function confirmDelete(record: VerificationMismatch) {
    confirm.require({
      message: `Delete mismatch for "${record.field_label}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          await store.remove(record.id)
          toast.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Mismatch deleted',
            life: 3000,
          })
          onSuccess?.()
        } catch (err: any) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.response?.data?.message ?? 'Failed to delete',
            life: 5000,
          })
        }
      },
    })
  }

  return {
    actionTarget,
    actionNotes,
    resolveDialog,
    waiveDialog,
    escalateDialog,
    openResolve,
    openWaive,
    openEscalate,
    submitResolve,
    submitWaive,
    submitEscalate,
    confirmDelete,
  }
}