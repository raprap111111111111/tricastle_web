<script setup lang="ts">
import { computed } from 'vue'
import type { Notification } from '../types'
import NotificationItem from './NotificationItem.vue'

const props = withDefaults(
  defineProps<{
    notifications?: Notification[]
    loading?: boolean
    emptyMessage?: string
    compact?: boolean
  }>(),
  {
    notifications: () => [],
    loading: false,
    emptyMessage: 'You have no notifications at the moment',
    compact: false,
  },
)

const emit = defineEmits<{
  (e: 'click', notification: Notification): void
  (e: 'delete', id: string): void
}>()

const hasItems = computed(() => props.notifications.length > 0)

const groupedNotifications = computed(() => {
  const groups: Record<string, Notification[]> = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  props.notifications.forEach((n) => {
    const date = n.created_at ? new Date(n.created_at) : new Date()
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    )
    let key: string

    if (dateOnly.getTime() === today.getTime()) key = 'Today'
    else if (dateOnly.getTime() === yesterday.getTime()) key = 'Yesterday'
    else if (today.getTime() - dateOnly.getTime() < 7 * 24 * 60 * 60 * 1000)
      key = 'This Week'
    else key = 'Earlier'

    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  })

  return groups
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Loading -->
    <div
      v-if="loading && !hasItems"
      class="flex flex-col items-center justify-center py-16 gap-3"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
      <p class="text-sm text-blueberry-500">Loading notifications...</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!hasItems"
      class="flex flex-col items-center justify-center py-20 gap-3 px-6 text-center"
    >
      <div
        class="w-20 h-20 rounded-full bg-appleCore-50 flex items-center justify-center"
      >
        <i class="pi pi-bell text-3xl text-blueberry-300" />
      </div>
      <p class="text-base font-semibold text-blueberry-700">All caught up</p>
      <p class="text-sm text-blueberry-400 max-w-xs">
        {{ emptyMessage }}
      </p>
    </div>

    <!-- Grouped List -->
    <template v-else>
      <div
        v-for="(group, label) in groupedNotifications"
        :key="label"
        class="flex flex-col"
      >
        <div
          class="px-5 py-2 text-[11px] font-bold uppercase tracking-wider
                 text-blueberry-500 bg-appleCore-50/60 border-y border-appleCore-100"
        >
          {{ label }}
          <span class="ml-1 text-blueberry-400 font-medium">
            ({{ group.length }})
          </span>
        </div>
        <div class="divide-y divide-appleCore-100">
          <NotificationItem
            v-for="n in group"
            :key="n.id"
            :notification="n"
            :compact="compact"
            @click="(notif) => emit('click', notif)"
            @delete="(id) => emit('delete', id)"
          />
        </div>
      </div>
    </template>
  </div>
</template>