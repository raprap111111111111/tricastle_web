// src/shared/pubnub/useNotificationRealtime.ts

import { useToast } from 'primevue/usetoast'
import { usePubNub } from './usePubNub'
import { PubNubChannels } from './channels'
import { useNotificationStore } from '@features/notifications/stores/notification.store'
import { useAuthStore } from '@features/auth/stores/auth.store'

interface Options {
  onReload?: () => void | Promise<void>
}

/**
 * 🔔 Notification Real-time Handler
 *
 * Listens to:
 *  - Global notification channel
 *  - User-specific channel (only THIS user's notifications)
 *
 * Usage:
 *   useNotificationRealtime()                     // Just listen + auto-update bell
 *   useNotificationRealtime({ onReload: load })   // Also reload custom list
 */
export function useNotificationRealtime(options: Options = {}) {
  const toast     = useToast()
  const store     = useNotificationStore()
  const authStore = useAuthStore()
  const { onReload } = options

  // Subscribe to global + user-specific channels
  const channels: string[] = [PubNubChannels.NOTIFICATIONS]

  if (authStore.user?.id) {
    channels.push(PubNubChannels.forUser(authStore.user.id))
  }

  usePubNub(channels, (msg) => {
    console.log('🔔 Notification event:', msg)

    switch (msg.event) {
      case 'notification.created':
        handleNewNotification(msg.payload)
        break

      case 'notification.broadcast':
        handleBroadcast(msg.payload)
        break

      case 'notification.read':
        onReload?.()
        break

      case 'notification.deleted':
        onReload?.()
        break
    }
  })

  // ─── Handlers ────────────────────────────────────────
  function handleNewNotification(payload: any) {
    // Add to store immediately (bell badge updates)
    store.pushNotification(payload as any)

    // Map severity to PrimeVue toast severity
    const severity = mapSeverity(payload?.data?.severity)

    // Show toast pop-up
    toast.add({
      severity,
      summary: payload?.data?.title   ?? '🔔 New Notification',
      detail:  payload?.data?.message ?? '',
      life:    5000,
    })

    onReload?.()
  }

  function handleBroadcast(payload: any) {
    toast.add({
      severity: 'info',
      summary:  payload?.title   ?? '📢 System Announcement',
      detail:   payload?.message ?? '',
      life:     6000,
    })

    // Refresh unread count for bell
    store.fetchUnreadCount()
  }

  /** Map backend severity → PrimeVue toast severity */
  function mapSeverity(severity?: string): 'success' | 'info' | 'warn' | 'error' {
    switch (severity) {
      case 'success': return 'success'
      case 'warn':    return 'warn'
      case 'error':   return 'error'
      default:        return 'info'
    }
  }
}