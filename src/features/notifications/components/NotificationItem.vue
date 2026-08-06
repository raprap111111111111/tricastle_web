<script setup lang="ts">
import { computed } from 'vue'
import type { Notification } from '../types'

const props = withDefaults(
  defineProps<{
    notification: Notification
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const emit = defineEmits<{
  (e: 'click', notification: Notification): void
  (e: 'delete', id: string): void
}>()

const isUnread = computed(() => !props.notification.read_at)

const title = computed(
  () =>
    (props.notification as any).title ||
    (props.notification.data as any)?.title ||
    'Notification',
)

const message = computed(
  () =>
    (props.notification as any).message ||
    (props.notification as any).body ||
    (props.notification.data as any)?.message ||
    '',
)

const type = computed(() => props.notification.type || 'info')

const typeConfig = computed(() => {
  const configs: Record<string, { icon: string; bg: string; text: string; ring: string }> = {
    info: {
      icon: 'pi-info-circle',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      ring: 'ring-blue-100',
    },
    success: {
      icon: 'pi-check-circle',
      bg: 'bg-green-50',
      text: 'text-green-600',
      ring: 'ring-green-100',
    },
    warning: {
      icon: 'pi-exclamation-triangle',
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      ring: 'ring-yellow-100',
    },
    error: {
      icon: 'pi-times-circle',
      bg: 'bg-red-50',
      text: 'text-red-600',
      ring: 'ring-red-100',
    },
    approval: {
      icon: 'pi-verified',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      ring: 'ring-purple-100',
    },
    document: {
      icon: 'pi-file',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      ring: 'ring-indigo-100',
    },
    user: {
      icon: 'pi-user',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      ring: 'ring-teal-100',
    },
  }

  // Match partial keys (e.g. "App\\Notifications\\ApprovalRequest" → approval)
  const key = Object.keys(configs).find((k) =>
    type.value.toLowerCase().includes(k),
  )
  return configs[key || 'info']
})

const iconClass = computed(
  () => (props.notification as any).icon || typeConfig.value.icon,
)

const timeAgo = computed(() => {
  if (!props.notification.created_at) return ''
  const date = new Date(props.notification.created_at)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
})

function onClick() {
  emit('click', props.notification)
}

function onDelete(e: Event) {
  e.stopPropagation()
  emit('delete', String(props.notification.id))
}
</script>

<template>
  <div
    class="group relative flex gap-3 px-5 cursor-pointer
           hover:bg-appleCore-50/60 transition-all duration-150"
    :class="[
      compact ? 'py-3' : 'py-4',
      isUnread && 'bg-gradient-to-r from-apricot-50/40 to-transparent',
    ]"
    @click="onClick"
  >
    <!-- Unread bar indicator -->
    <div
      v-if="isUnread"
      class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-apricot-500"
    />

    <!-- Icon -->
    <div
      class="flex-shrink-0 rounded-xl flex items-center justify-center ring-1"
      :class="[
        typeConfig.bg,
        typeConfig.ring,
        compact ? 'w-9 h-9' : 'w-11 h-11',
      ]"
    >
      <i
        class="pi"
        :class="[iconClass, typeConfig.text, compact ? 'text-sm' : 'text-base']"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <p
          class="font-semibold text-blueberry-800 truncate text-sm"
        >
          {{ title }}
        </p>
        <span
          class="text-[10px] text-blueberry-400 whitespace-nowrap flex-shrink-0 mt-0.5 font-medium"
        >
          {{ timeAgo }}
        </span>
      </div>

      <p
        v-if="message"
        class="text-blueberry-600 mt-0.5 text-xs"
        :class="compact ? 'line-clamp-1' : 'line-clamp-2'"
      >
        {{ message }}
      </p>

      <div v-if="isUnread && !compact" class="mt-1.5 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-apricot-500 animate-pulse" />
        <span
          class="text-[10px] font-bold text-apricot-600 uppercase tracking-wider"
        >
          New
        </span>
      </div>
    </div>

    <!-- Delete button -->
    <button
      type="button"
      title="Delete notification"
      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
             text-blueberry-400 hover:text-red-600 hover:bg-red-50
             opacity-0 group-hover:opacity-100 transition-all self-center"
      @click="onDelete"
    >
      <i class="pi pi-trash text-xs" />
    </button>
  </div>
</template>