<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { Notification } from '../types'
import { useNotificationStore } from '../stores/notification.store'
import { useNotifications } from '../composables/useNotifications'
import { useNotificationRealtime } from '@shared/pubnub/useNotificationRealtime'
import NotificationItem from './NotificationItem.vue'

const router = useRouter()
const store = useNotificationStore()
const { notifications, unreadCount, loading, hasUnread } = storeToRefs(store)

const { handleMarkAllAsRead, handleDelete, handleNotificationClick } =
  useNotifications()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const activeTab = ref<'all' | 'unread'>('all')

const filteredNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return notifications.value.filter((n) => !n.read_at)
  }
  return notifications.value
})

const previewNotifications = computed(() =>
  filteredNotifications.value.slice(0, 6),
)

async function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await store.fetchNotifications()
  }
}

function close() {
  isOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    close()
  }
}

function goToAll() {
  close()
  router.push({ name: 'notifications' })
}

async function onItemClick(notification: Notification) {
  await handleNotificationClick(notification)
  close()
}

function onItemDelete(id: string) {
  handleDelete(id)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  store.fetchNotifications()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

useNotificationRealtime({
  onReload: () => store.fetchNotifications(),
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Bell Trigger -->
    <button
      type="button"
      class="relative flex items-center justify-center w-10 h-10 rounded-full
             hover:bg-appleCore-100 transition-colors group"
      @click.stop="toggle"
    >
      <i
        class="pi pi-bell text-xl text-blueberry-700 group-hover:text-blueberry-900"
      />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
               rounded-full bg-red-500 text-white text-[10px] font-bold
               flex items-center justify-center ring-2 ring-white animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-[400px] max-w-[95vw] bg-white rounded-2xl
               shadow-2xl ring-1 ring-appleCore-200 overflow-hidden z-50 origin-top-right"
      >
        <!-- Header -->
        <div
          class="px-5 py-4 bg-gradient-to-br from-blueberry-50 via-white to-apricot-50/50
                 border-b border-appleCore-100"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-serif font-semibold text-blueberry-800">
                Notifications
              </h3>
              <span
                v-if="unreadCount > 0"
                class="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold"
              >
                {{ unreadCount }} new
              </span>
            </div>
            <button
              v-if="hasUnread"
              class="text-xs font-semibold text-apricot-600 hover:text-apricot-700
                     hover:underline underline-offset-2 transition-colors"
              @click="handleMarkAllAsRead"
            >
              Mark all read
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex gap-1 mt-3 p-1 bg-white/60 rounded-lg w-fit">
            <button
              v-for="tab in [
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
              ]"
              :key="tab.key"
              class="px-3 py-1 text-xs font-medium rounded-md transition-all"
              :class="
                activeTab === tab.key
                  ? 'bg-blueberry-600 text-white shadow-sm'
                  : 'text-blueberry-600 hover:text-blueberry-800'
              "
              @click="activeTab = tab.key as 'all' | 'unread'"
            >
              {{ tab.label }}
              <span
                v-if="tab.key === 'unread' && unreadCount > 0 && activeTab !== 'unread'"
                class="ml-1 text-[10px] text-red-600 font-bold"
              >
                {{ unreadCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="max-h-[420px] overflow-y-auto">
          <div
            v-if="loading && previewNotifications.length === 0"
            class="flex flex-col items-center justify-center py-10 gap-2"
          >
            <i class="pi pi-spin pi-spinner text-xl text-apricot-500" />
            <p class="text-xs text-blueberry-500">Loading...</p>
          </div>

          <div
            v-else-if="previewNotifications.length === 0"
            class="flex flex-col items-center justify-center py-12 gap-2 px-6 text-center"
          >
            <div
              class="w-14 h-14 rounded-full bg-appleCore-50 flex items-center justify-center"
            >
              <i class="pi pi-bell-slash text-xl text-blueberry-300" />
            </div>
            <p class="text-sm font-medium text-blueberry-700">
              {{
                activeTab === 'unread'
                  ? "You're all caught up!"
                  : 'No notifications yet'
              }}
            </p>
            <p class="text-xs text-blueberry-400">
              We'll let you know when something arrives
            </p>
          </div>

          <div v-else class="divide-y divide-appleCore-100">
            <NotificationItem
              v-for="n in previewNotifications"
              :key="n.id"
              :notification="n"
              compact
              @click="onItemClick"
              @delete="onItemDelete"
            />
          </div>
        </div>

        <!-- Footer -->
        <div
          v-if="filteredNotifications.length > 0"
          class="px-4 py-2.5 border-t border-appleCore-100 bg-appleCore-50/40"
        >
          <button
            class="w-full text-center text-xs font-semibold text-blueberry-700
                   hover:text-blueberry-900 py-2 rounded-lg hover:bg-white
                   transition-colors flex items-center justify-center gap-1.5"
            @click="goToAll"
          >
            View all notifications
            <i class="pi pi-arrow-right text-[10px]" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>