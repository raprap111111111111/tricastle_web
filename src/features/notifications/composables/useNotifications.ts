// src/features/notifications/composables/useNotifications.ts
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification.store'
import type { Notification } from '../types'

export function useNotifications() {
  const store  = useNotificationStore()
  const toast  = useToast()
  const router = useRouter()

  async function handleMarkAsRead(id: string) {
    try {
      await store.markAsRead(id)
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary:  'Failed',
        detail:   e?.response?.data?.message ?? 'Could not mark as read',
        life:     3000,
      })
    }
  }

  async function handleMarkAllAsRead() {
    if (!store.hasUnread) return

    try {
      await store.markAllAsRead()
      toast.add({
        severity: 'success',
        summary:  'All notifications marked as read',
        life:     2500,
      })
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary:  'Failed',
        detail:   e?.response?.data?.message ?? 'Could not mark all as read',
        life:     3000,
      })
    }
  }

  async function handleDelete(id: string) {
    try {
      await store.deleteNotification(id)
      toast.add({
        severity: 'success',
        summary:  'Deleted',
        life:     2000,
      })
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary:  'Failed',
        detail:   e?.response?.data?.message ?? 'Could not delete',
        life:     3000,
      })
    }
  }

  /** Click handler — mark as read + navigate if action_url exists */
  async function handleNotificationClick(notification: Notification) {
    if (!notification.read_at) {
      await handleMarkAsRead(notification.id)
    }

    const url = notification.data?.action_url
    if (url) router.push(url)
  }

  return {
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleNotificationClick,
  }
}