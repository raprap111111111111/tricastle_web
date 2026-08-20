// src/shared/pubnub/useDocumentRealtime.ts

import { useToast } from 'primevue/usetoast'
import { usePubNub } from './usePubNub'
import { PubNubChannels } from './channels'

interface Options {
  onReload?: () => void | Promise<void>
  scope?: 'batches' | 'folder' | 'document' | 'all'
  applicantId?: number
  batchId?: number
  documentId?: number
}

/**
 * 🔔 Global Document Real-time Notifications
 *
 * Usage:
 *   useDocumentRealtime({ onReload: load })            // Listen to ALL documents
 *   useDocumentRealtime({ onReload: load, applicantId: 5 })  // For one applicant
 *   useDocumentRealtime({ onReload: load, batchId: 3 })      // For one batch
 */
export function useDocumentRealtime(options: Options = {}) {
  const toast = useToast()
  const { onReload, applicantId, batchId, documentId } = options

  // Build channel list based on scope
  const channels: string[] = []

  // Always listen to global documents channel
  channels.push('tricastle.documents')

  // Listen to scoped channels
  if (applicantId) channels.push(`tricastle.applicant.${applicantId}.documents`)
  if (batchId)     channels.push(`tricastle.batch.${batchId}.documents`)
  if (documentId)  channels.push(`tricastle.document.${documentId}`)

  usePubNub(channels, (msg) => {
    console.log('📄 Document event:', msg)

    switch (msg.event) {
      case 'document.uploaded':
        toast.add({
          severity: 'success',
          summary: '📤 New Document Uploaded',
          detail: `${msg.payload.file_name} uploaded for ${msg.payload.applicant_name}`,
          life: 4000,
        })
        onReload?.()
        break

      case 'document.status_changed':
        toast.add({
          severity: 'info',
          summary: '🔄 Status Updated',
          detail: `${msg.payload.file_name} → ${msg.payload.new_status.replace(/_/g, ' ')}`,
          life: 4000,
        })
        onReload?.()
        break

      case 'document.verified':
        toast.add({
          severity: 'success',
          summary: '✅ Document Verified',
          detail: `${msg.payload.file_name} approved`,
          life: 4000,
        })
        onReload?.()
        break

      case 'document.rejected':
        toast.add({
          severity: 'warn',
          summary: '❌ Document Rejected',
          detail: `${msg.payload.file_name} — ${msg.payload.reason}`,
          life: 5000,
        })
        onReload?.()
        break

      case 'document.deleted':
        toast.add({
          severity: 'warn',
          summary: '🗑️ Document Deleted',
          detail: `${msg.payload.file_name} was removed`,
          life: 3000,
        })
        onReload?.()
        break

      case 'document.version_uploaded':
        toast.add({
          severity: 'success',
          summary: '📎 New Version',
          detail: `${msg.payload.file_name} · v${msg.payload.version}`,
          life: 4000,
        })
        onReload?.()
        break
    }
  })
}