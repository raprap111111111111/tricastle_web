<!-- src/app/App.vue -->
<script setup lang="ts">
import { watch, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useAuthStore } from '@features/auth/stores/auth.store'
import { useNotificationStore } from '@features/notifications/stores/notification.store'

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

/**
 * Portal detection:
 * Pauses staff notification polling while viewing applicant portal pages
 */
const isPortalRoute = computed(() => {
  return route.path.startsWith('/portal') || route.meta.layout === 'portal'
})

let pollTimer: ReturnType<typeof setInterval> | null = null

function startNotificationPolling() {
  stopNotificationPolling()
  // Run staff polling ONLY when logged in as staff and NOT on a portal route
  if (!authStore.isAuthenticated || isPortalRoute.value) return

  notificationStore.fetchUnreadCount()
  pollTimer = setInterval(() => {
    if (authStore.isAuthenticated && !isPortalRoute.value) {
      notificationStore.fetchUnreadCount()
    }
  }, 60_000)
}

function stopNotificationPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function safeResetNotifications() {
  try {
    if (typeof notificationStore.$reset === 'function') {
      notificationStore.$reset()
    } else {
      notificationStore.notifications = []
      notificationStore.unreadCount = 0
    }
  } catch {
    // Prevent app shell crashes
  }
}

// Watch staff authentication & route changes
watch(
  [() => authStore.isAuthenticated, isPortalRoute],
  ([isAuth, isPortal]) => {
    if (isPortal) {
      stopNotificationPolling()
      return
    }

    if (isAuth) {
      startNotificationPolling()
    } else {
      stopNotificationPolling()
      safeResetNotifications()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  stopNotificationPolling()
})
</script>

<template>
  <Toast position="top-right" />
  <ConfirmDialog />
  <router-view />
</template>