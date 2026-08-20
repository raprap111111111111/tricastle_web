<template>
  <ThemeProvider />
  <RouterView />
  <Toast position="top-right" />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import ThemeProvider from '@features/settings/theme/ThemeProvider.vue'

import { useAuthStore } from '@features/auth/stores/auth.store'
import { useNotificationStore } from '@features/notifications/stores/notification.store'
import { useNotificationRealtime } from '@shared/pubnub/useNotificationRealtime'

const authStore         = useAuthStore()
const notificationStore = useNotificationStore()

// 🔔 Global real-time listener — works app-wide (bell badge updates from any page)
useNotificationRealtime()

// 🎯 Fetch unread count whenever user logs in
watch(
  () => authStore.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      await notificationStore.fetchUnreadCount()
    } else {
      // Clear when logged out
      notificationStore.$reset?.()
    }
  },
  { immediate: true },
)
</script>