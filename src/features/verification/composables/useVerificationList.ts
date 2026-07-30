import { useToast } from 'primevue/usetoast'
import { useVerificationStore } from '../stores/verification.store'
import { useMismatchStore } from '../stores/mismatch.store'
import type {
  CompleteVerificationDto,
  RejectVerificationDto,
  ResolveMismatchDto,
} from '../types'

export function useVerifications() {
  const store = useVerificationStore()
  const mismatchStore = useMismatchStore()
  const toast = useToast()

  async function handleStart(id: number) {
    try {
      const res = await store.startVerification(id)
      toast.add({
        severity: 'success',
        summary: 'Verification Started',
        detail: 'You can now review and enter data.',
        life: 3000,
      })
      return res
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to start verification.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleComplete(id: number, payload: CompleteVerificationDto) {
    try {
      const res = await store.completeVerification(id, payload)
      toast.add({
        severity: 'success',
        summary: 'Verification Completed',
        detail: `${res.matched_fields}/${res.total_fields} fields matched (${res.match_percentage}%)`,
        life: 3000,
      })
      return res
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to complete.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleApprove(id: number, notes?: string) {
    try {
      const res = await store.approveVerification(id, notes)
      toast.add({
        severity: 'success',
        summary: 'Approved',
        detail: 'Verification has been approved.',
        life: 3000,
      })
      return res
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to approve.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleReject(id: number, payload: RejectVerificationDto) {
    try {
      const res = await store.rejectVerification(id, payload)
      toast.add({
        severity: 'warn',
        summary: 'Rejected',
        detail: 'Verification has been rejected.',
        life: 3000,
      })
      return res
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to reject.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleResolveMismatch(id: number, payload: ResolveMismatchDto) {
    try {
      const res = await mismatchStore.resolve(id, payload)
      toast.add({ severity: 'success', summary: 'Resolved', life: 3000 })
      return res
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to resolve.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleWaiveMismatch(id: number, resolution_notes: string) {
    try {
      const res = await mismatchStore.waive(id, { resolution_notes })
      toast.add({ severity: 'info', summary: 'Waived', life: 3000 })
      return res
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to waive.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleEscalateMismatch(id: number, resolution_notes: string) {
    try {
      const res = await mismatchStore.escalate(id, { resolution_notes })
      toast.add({ severity: 'warn', summary: 'Escalated', life: 3000 })
      return res
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to escalate.',
        life: 4000,
      })
      throw e
    }
  }

  return {
    handleStart,
    handleComplete,
    handleApprove,
    handleReject,
    handleResolveMismatch,
    handleWaiveMismatch,
    handleEscalateMismatch,
  }
}