import { useToast } from 'primevue/usetoast'
import { useBatchStore } from '../stores/batch.store'
import type { BatchPayload, BatchStatus } from '../types'

export function useBatches() {
  const store = useBatchStore()
  const toast = useToast()

  async function handleCreate(payload: BatchPayload) {
    try {
      const created = await store.createBatch(payload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: created.is_active
          ? `Batch created and set as active.`
          : 'Batch created successfully.',
        life: 3000,
      })
      return created
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to create batch.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleUpdate(id: number, payload: Partial<BatchPayload>) {
    try {
      const updated = await store.updateBatch(id, payload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Batch updated successfully.',
        life: 3000,
      })
      return updated
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to update batch.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleDelete(id: number) {
    try {
      await store.deleteBatch(id)
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Batch deleted successfully.',
        life: 3000,
      })
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to delete batch.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleStatusUpdate(id: number, status: BatchStatus) {
    try {
      const updated = await store.updateStatus(id, status)
      toast.add({
        severity: 'success',
        summary: 'Status Updated',
        detail: `Batch is now ${status}.`,
        life: 3000,
      })
      return updated
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to update status.',
        life: 4000,
      })
      throw e
    }
  }

  // ─── NEW: Activate / Deactivate ─────────────────────────
  async function handleActivate(id: number) {
    try {
      const activated = await store.activateBatch(id)
      toast.add({
        severity: 'success',
        summary: 'Batch Activated',
        detail: `Batch #${activated.batch_number} is now the active batch. Other batches have been deactivated.`,
        life: 4000,
      })
      return activated
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to activate batch.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleDeactivate(id: number) {
    try {
      const deactivated = await store.deactivateBatch(id)
      toast.add({
        severity: 'success',
        summary: 'Batch Deactivated',
        detail: `Batch #${deactivated.batch_number} is no longer active.`,
        life: 3000,
      })
      return deactivated
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to deactivate batch.',
        life: 4000,
      })
      throw e
    }
  }

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleStatusUpdate,
    handleActivate,
    handleDeactivate,
  }
}