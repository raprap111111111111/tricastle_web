<script setup lang="ts">
import { onMounted, onActivated, ref, computed } from 'vue'
import Paginator, { type PageState } from 'primevue/paginator'
import { AppCard, AppStatCard, AppButton } from '@shared/ui'
import type { Notification } from '../types'
import { useNotificationStore } from '../stores/notification.store'
import { useNotifications } from '../composables/useNotifications'
import { useNotificationRealtime } from '@shared/pubnub/useNotificationRealtime'
import NotificationList from '../components/NotificationList.vue'
import NotificationFilterCards from '../components/NotificationFilterCards.vue'

const store = useNotificationStore()
const { handleMarkAllAsRead, handleDelete, handleNotificationClick } =
  useNotifications()

const activeFilter = ref<string>('all')

async function load() {
  await store.fetchNotifications()
}

onMounted(load)
onActivated(load)

useNotificationRealtime({ onReload: load })

function onFilterChange(key: string, filter: Record<string, any>) {
  activeFilter.value = key
  store.setFilters(filter)
  store.fetchNotifications()
}

// ─── Wrapper handlers to match child emit signatures ───
async function onNotificationClick(notification: Notification) {
  await handleNotificationClick(notification)
}

async function onNotificationDelete(id: string) {
  await handleDelete(id)
}

// ─── Empty message ─────────────────────────────────
const emptyMessage = computed(() =>
  activeFilter.value === 'unread'
    ? "You're all caught up! No unread notifications."
    : 'Nothing to show yet — notifications will appear here.',
)

// ─── Pagination ─────────────────────────────────────
const currentLimit = computed(
  () =>
    (store.pagination as any)?.per_page ??
    (store.pagination as any)?.limit ??
    15,
)

const currentFirst = computed(() => {
  const p = store.pagination as any
  if (p?.current_page && currentLimit.value) {
    return (p.current_page - 1) * currentLimit.value
  }
  return p?.offset ?? 0
})

const totalRecords = computed(
  () => (store.pagination as any)?.total ?? store.notifications.length,
)

const readCount = computed(() =>
  Math.max(0, totalRecords.value - store.unreadCount),
)

const paginationFrom = computed(
  () => (store.pagination as any)?.from ?? currentFirst.value + 1,
)

const paginationTo = computed(
  () =>
    (store.pagination as any)?.to ??
    Math.min(currentFirst.value + currentLimit.value, totalRecords.value),
)

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    store.setLimit(event.rows)
  } else {
    store.setPage(event.page + 1)
  }
  store.fetchNotifications()
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1200px] mx-auto">
    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2 flex-wrap">
          <h1
            class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight"
          >
            Notifications
          </h1>
          <span
            v-if="store.hasUnread"
            class="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold"
          >
            {{ store.unreadCount }} unread
          </span>
          <!-- Live indicator -->
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50
                   text-green-700 rounded-full text-xs font-medium ring-1 ring-green-200"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full
                       bg-green-400 opacity-75"
              />
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-green-500"
              />
            </span>
            Live
          </span>
        </div>
        <p class="text-sm text-blueberry-500">
          Stay updated with real-time activity across the system
        </p>
      </div>

      <AppButton
        v-if="store.hasUnread"
        label="Mark all as read"
        icon="pi pi-check-circle"
        variant="secondary"
        @click="handleMarkAllAsRead"
      />
    </header>

    <!-- ─── Stats ──────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <AppStatCard
        label="Total"
        :value="totalRecords"
        icon="pi pi-inbox"
        variant="blueberry"
      />
      <AppStatCard
        label="Unread"
        :value="store.unreadCount"
        icon="pi pi-envelope"
        variant="apricot"
      />
      <AppStatCard
        label="Read"
        :value="readCount"
        icon="pi pi-check"
        variant="green"
      />
    </div>

    <!-- ─── Quick Filter Cards ─────────────────────── -->
    <NotificationFilterCards
      :notifications="store.notifications"
      :active-key="activeFilter"
      @change="onFilterChange"
    />

    <!-- ─── Notification List ─────────────────────── -->
    <AppCard padding="none" shadow="soft">
      <NotificationList
        :notifications="store.notifications"
        :loading="store.loading"
        :empty-message="emptyMessage"
        @click="onNotificationClick"
        @delete="onNotificationDelete"
      />

      <!-- Pagination -->
      <div
        v-if="totalRecords > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3
               border-t border-appleCore-100 bg-appleCore-50/30"
      >
        <div class="text-xs text-blueberry-500">
          Showing
          <span class="font-semibold text-blueberry-700">
            {{ paginationFrom }}
          </span>
          to
          <span class="font-semibold text-blueberry-700">
            {{ paginationTo }}
          </span>
          of
          <span class="font-semibold text-blueberry-700">
            {{ totalRecords }}
          </span>
        </div>

        <Paginator
          :rows="currentLimit"
          :total-records="totalRecords"
          :first="currentFirst"
          :rows-per-page-options="[15, 25, 50, 100]"
          template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
          class="!bg-transparent !p-0"
          @page="onPageChange"
        />
      </div>
    </AppCard>
  </div>
</template>