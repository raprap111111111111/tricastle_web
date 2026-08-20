// src/features/deployments/composables/useDeployments.ts

import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useDeploymentStore } from '../stores/deployment.store'
import type {
  Deployment,
  DeployApplicantPayload,
  UpdateDeploymentPayload,
  BulkDeployPayload,
} from '../types'

export function useDeployments() {
  const toast = useToast()
  const confirm = useConfirm()
  const store = useDeploymentStore()

  async function handleDeploy(
    applicantBatchId: number,
    payload: DeployApplicantPayload,
    applicantName?: string,
  ): Promise<Deployment | null> {
    try {
      const deployed = await store.deploy(applicantBatchId, payload)

      toast.add({
        severity: 'success',
        summary: '🚀 Deployed Successfully',
        detail: applicantName
          ? `${applicantName} deployed to ${payload.deployment_country} (${payload.deployment_company})`
          : `Applicant deployed to ${payload.deployment_country}`,
        life: 5000,
      })

      return deployed
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Deployment Failed',
        detail: e?.response?.data?.message ?? 'Could not deploy applicant',
        life: 4000,
      })
      return null
    }
  }

  async function handleUpdate(
    deploymentId: number,
    payload: UpdateDeploymentPayload,
    applicantName?: string,
  ): Promise<Deployment | null> {
    try {
      const updated = await store.updateDeployment(deploymentId, payload)

      toast.add({
        severity: 'success',
        summary: '✏️ Deployment Updated',
        detail: applicantName
          ? `${applicantName}'s deployment info updated`
          : 'Deployment updated successfully',
        life: 3500,
      })

      return updated
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: e?.response?.data?.message ?? 'Could not update deployment',
        life: 4000,
      })
      return null
    }
  }

  async function handleCancel(
    deploymentId: number,
    reason: string,
    applicantName?: string,
  ): Promise<Deployment | null> {
    try {
      const cancelled = await store.cancelDeployment(deploymentId, {
        cancellation_reason: reason,
      })

      toast.add({
        severity: 'warn',
        summary: '❌ Deployment Cancelled',
        detail: applicantName
          ? `${applicantName}'s deployment was cancelled`
          : 'Deployment cancelled successfully',
        life: 4000,
      })

      return cancelled
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Cancellation Failed',
        detail: e?.response?.data?.message ?? 'Could not cancel deployment',
        life: 4000,
      })
      return null
    }
  }

  async function handleBulkDeploy(payload: BulkDeployPayload): Promise<boolean> {
    try {
      const result = await store.bulkDeploy(payload)

      if (result.failed_count === 0) {
        toast.add({
          severity: 'success',
          summary: '🚀 Bulk Deploy Successful',
          detail: `Successfully deployed ${result.success_count} applicant${result.success_count > 1 ? 's' : ''} to ${payload.deployment_country}`,
          life: 5000,
        })
      } else {
        toast.add({
          severity: 'warn',
          summary: '⚠️ Partial Success',
          detail: `${result.success_count} deployed, ${result.failed_count} failed. Check console for details.`,
          life: 6000,
        })
        console.warn('Bulk deploy failures:', result.failed)
      }

      return result.success_count > 0
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Bulk Deploy Failed',
        detail: e?.response?.data?.message ?? 'Could not process bulk deployment',
        life: 4000,
      })
      return false
    }
  }

  // 🏠 Mark returned home
  async function handleMarkReturned(
    applicantBatchId: number,
    reason: string,
    applicantName?: string,
  ): Promise<boolean> {
    console.log('🏠 [Return] Sending:', { applicantBatchId, reason })

    try {
      const result = await store.markReturned(applicantBatchId, reason)
      console.log('✅ [Return] Success:', result)

      toast.add({
        severity: 'warn',
        summary: '🏠 Marked as Returned',
        detail: applicantName
          ? `${applicantName} has been marked as returned home`
          : 'Applicant marked as returned home',
        life: 4000,
      })
      return true
    } catch (e: any) {
      console.error('❌ [Return] Full error:', e)
      console.error('❌ [Return] Status:', e?.response?.status)
      console.error('❌ [Return] Response data:', e?.response?.data)
      console.error('❌ [Return] Request URL:', e?.config?.url)

      const detailMsg = e?.response?.data?.message
        ?? e?.response?.data?.error
        ?? e?.message
        ?? 'Could not mark as returned'

      toast.add({
        severity: 'error',
        summary: `Failed (${e?.response?.status ?? '?'})`,
        detail: detailMsg,
        life: 8000,
      })
      return false
    }
  }

  // ✅ Mark completed
  async function handleMarkCompleted(
    applicantBatchId: number,
    notes?: string | null,
    applicantName?: string,
  ): Promise<boolean> {
    console.log('✅ [Complete] Sending:', { applicantBatchId, notes })

    try {
      const result = await store.markCompleted(applicantBatchId, notes)
      console.log('✅ [Complete] Success:', result)

      toast.add({
        severity: 'success',
        summary: '✅ Contract Completed',
        detail: applicantName
          ? `${applicantName}'s contract successfully marked as completed`
          : 'Contract marked as completed',
        life: 4000,
      })
      return true
    } catch (e: any) {
      console.error('❌ [Complete] Full error:', e)
      console.error('❌ [Complete] Status:', e?.response?.status)
      console.error('❌ [Complete] Response data:', e?.response?.data)
      console.error('❌ [Complete] Request URL:', e?.config?.url)

      const detailMsg = e?.response?.data?.message
        ?? e?.response?.data?.error
        ?? e?.message
        ?? 'Could not mark as completed'

      toast.add({
        severity: 'error',
        summary: `Failed (${e?.response?.status ?? '?'})`,
        detail: detailMsg,
        life: 8000,
      })
      return false
    }
  }

  function confirmCancel(deployment: Deployment, onConfirm: () => void): void {
    const name = deployment.applicant?.full_name ?? 'this applicant'
    confirm.require({
      header: 'Cancel Deployment?',
      message: `Are you sure you want to cancel ${name}'s deployment to ${deployment.deployment_country}? This will revert their status.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Cancel Deployment',
      rejectLabel: 'Keep Deployed',
      acceptClass: '!bg-red-600 !border-red-600',
      accept: onConfirm,
    })
  }

  return {
    handleDeploy,
    handleUpdate,
    handleCancel,
    handleBulkDeploy,
    confirmCancel,
    handleMarkReturned,
    handleMarkCompleted,
  }
}