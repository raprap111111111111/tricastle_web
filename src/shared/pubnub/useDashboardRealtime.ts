import { usePubNub } from './usePubNub'
import { PubNubChannels } from './channels'

interface Options {
  onReload?: () => void | Promise<void>
}

/**
 * 🔔 Dashboard Real-time Refresh
 *
 * Listens to applicant/batch/document channels and triggers
 * a reload when any relevant event fires.
 *
 * Usage:
 *   useDashboardRealtime({ onReload: refresh })
 */
export function useDashboardRealtime(options: Options = {}) {
  const { onReload } = options

  const channels: string[] = [
    PubNubChannels.APPLICANTS,
    PubNubChannels.BATCHES,
    PubNubChannels.DOCUMENTS,
  ]

  const relevantEvents = new Set([
    'applicant.created',
    'applicant.updated',
    'applicant.verified',
    'applicant.rejected',
    'applicant.status_changed',
    'applicant.deleted',
    'batch.created',
    'batch.updated',
    'batch.status_changed',
    'batch.deleted',
    'document.created',
    'document.verified',
    'document.rejected',
    'document.status_changed',
  ])

  usePubNub(channels, (msg) => {
    if (relevantEvents.has(msg.event)) {
      console.log('📊 Dashboard reload triggered by:', msg.event)
      onReload?.()
    }
  })
}