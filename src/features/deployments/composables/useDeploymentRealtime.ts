// src/features/deployments/composables/useDeploymentRealtime.ts

import { useToast } from 'primevue/usetoast'
import { usePubNub } from '@shared/pubnub/usePubNub'
import { PubNubChannels } from '@shared/pubnub/channels'

interface Options {
  onReload?: () => void | Promise<void>
  applicantId?: number
}

/**
 * 🔔 Deployment Real-time Notifications (PubNub)
 *
 * Usage:
 *   useDeploymentRealtime({ onReload: load })                     // Listen to ALL deployments
 *   useDeploymentRealtime({ onReload: load, applicantId: 42 })    // For one applicant
 */
export function useDeploymentRealtime(options: Options = {}) {
  const toast = useToast()
  const { onReload, applicantId } = options

  // Deployment events flow through the applicants channel
  const channels: string[] = [PubNubChannels.APPLICANTS]
  if (applicantId) channels.push(PubNubChannels.forApplicant(applicantId))

  usePubNub(channels, (msg) => {
    // Only react to deployment events
    if (!msg.event?.startsWith('deployment.')) return

    console.log('🚀 Deployment event:', msg)

    switch (msg.event) {
      case 'deployment.created':
      case 'deployment.deployed':
        toast.add({
          severity: 'success',
          summary: '🚀 New Deployment',
          detail: `${msg.payload.applicant_name ?? 'Someone'} deployed to ${msg.payload.country}`,
          life: 5000,
        })
        onReload?.()
        break

      case 'deployment.updated':
        toast.add({
          severity: 'info',
          summary: '✏️ Deployment Updated',
          detail: `${msg.payload.applicant_name ?? 'A deployment'} was modified`,
          life: 3500,
        })
        onReload?.()
        break

      case 'deployment.cancelled':
        toast.add({
          severity: 'warn',
          summary: '❌ Deployment Cancelled',
          detail: `${msg.payload.applicant_name ?? 'A deployment'} was cancelled`,
          life: 4000,
        })
        onReload?.()
        break

      case 'deployment.bulk_deployed':
        toast.add({
          severity: 'success',
          summary: '🚀 Bulk Deployment',
          detail: `${msg.payload.count ?? 'Multiple'} applicants deployed to ${msg.payload.country ?? 'a destination'}`,
          life: 5000,
        })
        onReload?.()
        break
    }
  })
}