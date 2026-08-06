<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import { useNotificationStore } from '../stores/notification.store'
import { useNotifications } from '../composables/useNotifications'
import NotificationItem from './NotificationItem.vue'

const router = useRouter()
const store  = useNotificationStore()
const {
  handleMarkAllAsRead,
  handleDelete,
  handleNotificationClick,
} = useNotifications()

const overlay = ref<InstanceType<typeof OverlayPanel> | null>(null)

onMounted(async () => {
  await store.fetchUnreadCount()
})

async function toggle(event: Event) {
  overlay.value?.toggle(event)

  // Load fresh notifications when opening (if empty)
  if (store.notifications.length === 0) {
    store.setFilters({ limit: 8 })
    await store.fetchNotifications()
  }
}

function onItemClick(notification: any) {
  handleNotificationClick(notification)
  overlay.value?.hide()
}

function goToAll() {
  overlay.value?.hide()
  router.push({ name: 'notifications.index' })
}
</script>

<template>
  <div class="relative">
    <Button
      icon="pi pi-bell"
      text
      rounded
      severity="secondary"
      class="relative"
      v-tooltip.bottom="'Notifications'"
      aria-label="Notifications"
      @click="toggle"
    />

    <!-- Unread badge -->
    <span
      v-if="store.hasUnread"
      class="absolute top-1 right-1 min-w-[18px] h-[18px] px-1
             rounded-full bg-red-500 text-white text-[10px] font-bold
             flex items-center justify-center ring-2 ring-white
             pointer-events-none animate-pulse"
    >
      {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
    </span>

    <!-- Dropdown -->
    <OverlayPanel
      ref="overlay"
      :pt="{
        root:    '!w-[380px] !max-w-[95vw] !p-0 !overflow-hidden !rounded-2xl !shadow-xl',
        content: '!p-0',
      }"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-3
               border-b border-appleCore-100 bg-white"
      >
        <div class="flex items-center gap-2">
          <h3 class="text-base font-serif font-semibold text-blueberry-800">
            Notifications
          </h3>
          <span
            v-if="store.hasUnread"
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-apricot-100
                   text-apricot-700 font-bold"
          >
            {{ store.unreadCount }} new
          </span>
        </div>

        <Button
          v-if="store.hasUnread"
          label="Mark all read"
          text
          size="small"
          class="!text-xs !text-apricot-600 hover:!text-apricot-700 !p-0"
          @click="handleMarkAllAsRead"
        />
      </div>

      <!-- List -->
      <div class="max-h-[420px] overflow-y-auto bg-white">
        <div
          v-if="store.loading"
          class="flex flex-col items-center justify-center py-10 gap-2"
        >
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-xs text-blueberry-500">Loading...</p>
        </div>

        <div
          v-else-if="store.notifications.length === 0"
          class="flex flex-col items-center justify-center py-10 gap-2 text-center px-4"
        >
          <div class="w-14 h-14 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-bell text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-600 font-medium">You're all caught up!</p>
          <p class="text-xs text-blueberry-400">No new notifications</p>
        </div>

        <NotificationItem
          v-for="n in store.notifications.slice(0, 8)"
          :key="n.id"
          :notification="n"
          compact
          @click="onItemClick"
          @delete="handleDelete"
        />
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/40 text-center">
        <Button
          label="View all notifications"
          text
          size="small"
          class="!text-xs !text-apricot-600 hover:!text-apricot-700 !font-medium"
          @click="goToAll"
        />
      </div>
    </OverlayPanel>
  </div>
</template>