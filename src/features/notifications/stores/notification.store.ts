// src/features/notifications/stores/notification.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi } from '../api/notification.api'
import type { Notification, NotificationFilters, Pagination } from '../types'

export const useNotificationStore = defineStore('notification', () => {
  // ─── State ─────────────────────────────────────────
  const notifications = ref<Notification[]>([])
  const pagination = ref<Pagination | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const unreadCount = ref(0)

  const filters = ref<NotificationFilters>({
    search: '',
    is_read: null,
    module: '',
    order_by: 'created_at',
    order_dir: 'desc',
    offset: 0,
    limit: 15,
  })

  // ─── Computed ──────────────────────────────────────
  const hasUnread = computed(() => unreadCount.value > 0)
  const unreadOnly = computed(() => notifications.value.filter((n) => !n.read_at))

  // ─── Helper: extract Laravel paginator from response ─────────
  // ─── Helper: extract Laravel paginator from response ─────────
  function extractPaginator(response: any) {
    // Your http.ts interceptor UNWRAPS the { success, message, data } envelope
    // So response.data = the paginator directly: { current_page, data: [], total }
    const paginator = response?.data ?? {}
    const records = paginator?.data ?? paginator?.records ?? []

    return { paginator, records }
  }

  // ─── Actions ───────────────────────────────────────
  async function fetchNotifications() {
    loading.value = true
    try {
      // Strip empty/null values from filters
      const cleanFilters: Record<string, any> = {}
      for (const [key, val] of Object.entries(filters.value)) {
        if (val !== '' && val !== null && val !== undefined) {
          cleanFilters[key] = val
        }
      }

      const response = await notificationApi.list(cleanFilters)
      const { paginator, records } = extractPaginator(response)

      console.log('📊 Fetched notifications:', records.length, 'of', paginator.total)

      notifications.value = records

      pagination.value = {
        total: paginator.total ?? 0,
        offset: paginator.offset ?? 0,
        limit: paginator.per_page ?? paginator.limit ?? 15,
        current_page: paginator.current_page ?? 1,
        last_page: paginator.last_page ?? 1,
        per_page: paginator.per_page ?? paginator.limit ?? 15,
        has_more: paginator.next_page_url != null
          || paginator.has_more
          || (paginator.current_page ?? 1) < (paginator.last_page ?? 1),
        from: paginator.from,
        to: paginator.to,
      }

      // Recount unread from current page
      unreadCount.value = notifications.value.filter((n) => !n.read_at).length
    } catch (e) {
      console.error('❌ Failed to fetch notifications:', e)
    } finally {
      loading.value = false
    }
  }

  /** 🔔 Fetch just the unread count — for bell badge */
  async function fetchUnreadCount() {
    try {
      const response = await notificationApi.list({
        is_read: false,
        limit: 1,
      })
      const { paginator } = extractPaginator(response)

      unreadCount.value = paginator.total ?? 0
      console.log('🔴 Unread count:', unreadCount.value)
    } catch (e) {
      console.error('❌ Failed to fetch unread count:', e)
    }
  }

  async function markAsRead(id: string) {
    submitting.value = true
    try {
      await notificationApi.markAsRead(id)
      const notif = notifications.value.find((n) => n.id === id)
      if (notif && !notif.read_at) {
        notif.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } finally {
      submitting.value = false
    }
  }

  async function markAllAsRead() {
    submitting.value = true
    try {
      await notificationApi.markAllAsRead()
      notifications.value.forEach((n) => {
        if (!n.read_at) n.read_at = new Date().toISOString()
      })
      unreadCount.value = 0
    } finally {
      submitting.value = false
    }
  }

  async function deleteNotification(id: string) {
    submitting.value = true
    try {
      await notificationApi.destroy(id)
      const idx = notifications.value.findIndex((n) => n.id === id)
      if (idx !== -1) {
        const wasUnread = !notifications.value[idx].read_at
        notifications.value.splice(idx, 1)
        if (wasUnread) unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } finally {
      submitting.value = false
    }
  }

  /** 📡 Called by PubNub when new notification arrives */
  function pushNotification(notification: Notification) {
    // Avoid duplicates
    if (notifications.value.some((n) => n.id === notification.id)) return

    notifications.value.unshift(notification)
    if (!notification.read_at) unreadCount.value++
  }

  // ─── Filter helpers ────────────────────────────────
  function setFilters(patch: Partial<NotificationFilters>) {
    filters.value = { ...filters.value, ...patch }
    if (!('offset' in patch)) filters.value.offset = 0
  }

  function resetFilters() {
    filters.value = {
      search: '',
      is_read: null,
      module: '',
      order_by: 'created_at',
      order_dir: 'desc',
      offset: 0,
      limit: 15,
    }
  }

  function setPage(page: number) {
    filters.value.offset = (page - 1) * (filters.value.limit ?? 15)
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.offset = 0
  }

  return {
    // state
    notifications,
    pagination,
    loading,
    submitting,
    unreadCount,
    filters,
    // computed
    hasUnread,
    unreadOnly,
    // actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    pushNotification,
    setFilters,
    resetFilters,
    setPage,
    setLimit,
  }
})