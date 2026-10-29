// src/features/notifications/stores/notification.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi } from '../api/notification.api'
import type {
  Notification,
  NotificationFilters,
} from '../types'

export interface NotificationPagination {
  total: number
  offset: number
  limit: number
  current_page: number
  last_page: number
  has_more: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const notifications = ref<Notification[]>([])
  const pagination = ref<NotificationPagination | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const unreadCount = ref(0)

  const filters = ref<{
    offset: number
    limit: number
    order_by?: string
    order_dir?: 'asc' | 'desc'
    search?: string
    is_read?: boolean | null
  }>({
    offset: 0,
    limit: 15,
    order_by: 'created_at',
    order_dir: 'desc',
    is_read: null,
  })

  // ─── Getters ────────────────────────────────────────────────────────────────
  const hasUnread = computed(() => unreadCount.value > 0)

  const unreadBadge = computed(() => {
    if (unreadCount.value <= 0) return ''
    return unreadCount.value > 99 ? '99+' : String(unreadCount.value)
  })

  // ─── Actions ────────────────────────────────────────────────────────────────
  async function fetchNotifications() {
    loading.value = true
    try {
      const activeFilters: NotificationFilters = {
        offset: filters.value.offset,
        limit: filters.value.limit,
        order_by: filters.value.order_by,
        order_dir: filters.value.order_dir,
        search: filters.value.search || undefined,
        is_read: filters.value.is_read ?? undefined,
      }

      const res = await notificationApi.list(activeFilters)
      const data = res.data?.data ?? res.data ?? {}

      notifications.value = (data.records ?? data.data ?? []) as Notification[]
      
      pagination.value = {
        total: data.total ?? 0,
        offset: data.offset ?? 0,
        limit: data.limit ?? 15,
        current_page: data.current_page ?? 1,
        last_page: data.last_page ?? 1,
        has_more: data.has_more ?? false,
      }

      if (typeof data.unread_count === 'number') {
        unreadCount.value = data.unread_count
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      notifications.value = []
      pagination.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await notificationApi.list({ is_read: false, limit: 1 })
      const data = res.data?.data ?? res.data ?? {}
      unreadCount.value = data.total ?? data.unread_count ?? 0
    } catch {
      unreadCount.value = 0
    }
  }

  async function markAsRead(id: number | string) {
    try {
      const idStr = String(id)
      await notificationApi.markAsRead(idStr)
      const index = notifications.value.findIndex((n: Notification) => String(n.id) === idStr)
      if (index !== -1) {
        const wasUnread = !notifications.value[index].read_at
        notifications.value[index] = {
          ...notifications.value[index],
          read_at: new Date().toISOString(),
        }
        if (wasUnread && unreadCount.value > 0) {
          unreadCount.value--
        }
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  async function markAllAsRead() {
    submitting.value = true
    try {
      await notificationApi.markAllAsRead()
      notifications.value = notifications.value.map((n: Notification) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      }))
      unreadCount.value = 0
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    } finally {
      submitting.value = false
    }
  }

  async function removeNotification(id: number | string) {
    try {
      const idStr = String(id)
      const target = notifications.value.find((n: Notification) => String(n.id) === idStr)
      await notificationApi.destroy(idStr)
      notifications.value = notifications.value.filter((n: Notification) => String(n.id) !== idStr)
      if (target && !target.read_at && unreadCount.value > 0) {
        unreadCount.value--
      }
      if (pagination.value) {
        pagination.value.total = Math.max(0, pagination.value.total - 1)
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  function setPage(page: number) {
    const limit = filters.value.limit ?? 15
    filters.value.offset = (page - 1) * limit
    fetchNotifications()
  }

  function resetFilters() {
    filters.value = {
      offset: 0,
      limit: 15,
      order_by: 'created_at',
      order_dir: 'desc',
      is_read: null,
    }
  }

  // ✅ Explicit $reset implementation for Pinia Setup Stores
  function $reset() {
    notifications.value = []
    pagination.value = null
    loading.value = false
    submitting.value = false
    unreadCount.value = 0
    resetFilters()
  }

  return {
    notifications,
    pagination,
    loading,
    submitting,
    unreadCount,
    filters,
    hasUnread,
    unreadBadge,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    setPage,
    resetFilters,
    $reset,
  }
})