<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityItem } from '../types'

const props = defineProps<{
  activity: ActivityItem
}>()

const typeConfig = computed(() => {
  const configs: Record<
    string,
    { bg: string; text: string; ring: string }
  > = {
    applicant: { bg: 'bg-apricot-50',   text: 'text-apricot-600',   ring: 'ring-apricot-100' },
    user:      { bg: 'bg-apricot-50',   text: 'text-apricot-600',   ring: 'ring-apricot-100' },
    document:  { bg: 'bg-indigo-50',    text: 'text-indigo-600',    ring: 'ring-indigo-100' },
    verified:  { bg: 'bg-green-50',     text: 'text-green-600',     ring: 'ring-green-100' },
    approval:  { bg: 'bg-purple-50',    text: 'text-purple-600',    ring: 'ring-purple-100' },
    correction:{ bg: 'bg-yellow-50',    text: 'text-yellow-600',    ring: 'ring-yellow-100' },
    batch:     { bg: 'bg-blueberry-50', text: 'text-blueberry-600', ring: 'ring-blueberry-100' },
    info:      { bg: 'bg-blue-50',      text: 'text-blue-600',      ring: 'ring-blue-100' },
  }
  const key = Object.keys(configs).find((k) =>
    props.activity.type.toLowerCase().includes(k),
  )
  return configs[key || 'info']
})

const timeAgo = computed(() => {
  if (!props.activity.created_at) return ''
  const date = new Date(props.activity.created_at)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
})
</script>

<template>
  <div class="flex items-start gap-3 px-5 py-4 hover:bg-appleCore-50/50 transition-colors">
    <div
      class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ring-1"
      :class="[typeConfig.bg, typeConfig.ring]"
    >
      <i class="pi" :class="[activity.icon, typeConfig.text, 'text-sm']" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <p class="text-sm font-semibold text-blueberry-800 truncate">
          {{ activity.title }}
        </p>
        <span
          class="text-[10px] text-blueberry-400 whitespace-nowrap flex-shrink-0 mt-0.5 font-medium"
        >
          {{ timeAgo }}
        </span>
      </div>

      <p v-if="activity.description" class="text-xs text-blueberry-600 mt-0.5 line-clamp-2">
        {{ activity.description }}
      </p>

      <p v-if="activity.actor" class="text-[11px] text-blueberry-400 mt-1">
        by <span class="font-medium">{{ activity.actor }}</span>
      </p>
    </div>
  </div>
</template>