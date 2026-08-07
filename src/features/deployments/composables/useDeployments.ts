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

/**
 * 🎯 Composable for deployment actions with toast notifications.
 * Use this in components instead of calling the store directly.
 */
export function useDeployments() {
  const toast   = useToast()
  const confirm = useConfirm()
  const store   = useDeploymentStore()

  // ═══════════════════════════════════════════════════════
  // Deploy applicant
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  // Update deployment
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  // Cancel deployment (with confirmation)
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  // Bulk deploy
  // ═══════════════════════════════════════════════════════
  async function handleBulkDeploy(
    payload: BulkDeployPayload,
  ): Promise<boolean> {
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

  // ═══════════════════════════════════════════════════════
  // Confirm before cancel (uses PrimeVue confirm)
  // ═══════════════════════════════════════════════════════
  function confirmCancel(
    deployment: Deployment,
    onConfirm: () => void,
  ): void {
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
  }
}