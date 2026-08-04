// src/shared/pubnub/useBatchRealtime.ts

import { useToast } from 'primevue/usetoast'
import { usePubNub } from './usePubNub'
import { PubNubChannels } from './channels'

interface Options {
  onReload?: () => void | Promise<void>
  batchId?: number
}

/**
 * 🔔 Batch Real-time Notifications
 *
 * Usage:
 *   useBatchRealtime({ onReload: load })              // Listen to ALL batches
 *   useBatchRealtime({ onReload: load, batchId: 5 })  // For one specific batch
 */
export function useBatchRealtime(options: Options = {}) {
  const toast = useToast()
  const { onReload, batchId } = options

  const channels: string[] = [PubNubChannels.BATCHES]
  if (batchId) channels.push(PubNubChannels.forBatch(batchId))

  usePubNub(channels, (msg) => {
    console.log('🎓 Batch event:', msg)

    switch (msg.event) {
      case 'batch.created':
        toast.add({
          severity: 'success',
          summary: '🎓 New Batch Created',
          detail: `${msg.payload.name} (#${msg.payload.batch_number})`,
          life: 4000,
        })
        onReload?.()
        break

      case 'batch.updated':
        toast.add({
          severity: 'info',
          summary: '✏️ Batch Updated',
          detail: `${msg.payload.name} was modified`,
          life: 3000,
        })
        onReload?.()
        break

      case 'batch.activated':
        toast.add({
          severity: 'success',
          summary: '⭐ Batch Activated',
          detail: `${msg.payload.name} is now the active batch`,
          life: 5000,
        })
        onReload?.()
        break

      case 'batch.deactivated':
        toast.add({
          severity: 'warn',
          summary: '⏸️ Batch Deactivated',
          detail: `${msg.payload.name} is no longer active`,
          life: 4000,
        })
        onReload?.()
        break

      case 'batch.status_changed':
        toast.add({
          severity: 'info',
          summary: '🔄 Batch Status Changed',
          detail: `${msg.payload.name} → ${msg.payload.new_status}`,
          life: 4000,
        })
        onReload?.()
        break

      case 'batch.deleted':
        toast.add({
          severity: 'warn',
          summary: '🗑️ Batch Deleted',
          detail: `${msg.payload.name} was removed`,
          life: 3000,
        })
        onReload?.()
        break

      case 'batch.applicant_assigned':
        toast.add({
          severity: 'info',
          summary: '👤 New Assignment',
          detail: `${msg.payload.name} added to batch`,
          life: 3000,
        })
        onReload?.()
        break
    }
  })
}