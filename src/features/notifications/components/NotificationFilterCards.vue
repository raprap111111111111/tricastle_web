<script setup lang="ts">
import { computed } from 'vue'
import type { Notification } from '../types'

const props = withDefaults(
  defineProps<{
    notifications?: Notification[]
    activeKey?: string
  }>(),
  {
    notifications: () => [],
    activeKey: 'all',
  },
)

const emit = defineEmits<{
  (e: 'change', key: string, filter: Record<string, any>): void
}>()

const filters = computed(() => [
  {
    key: 'all',
    label: 'All',
    icon: 'pi-inbox',
    color: 'blueberry',
    filter: {},
    count: props.notifications.length,
  },
  {
    key: 'unread',
    label: 'Unread',
    icon: 'pi-envelope',
    color: 'apricot',
    filter: { unread: true },
    count: props.notifications.filter((n) => !n.read_at).length,
  },
  {
    key: 'approval',
    label: 'Approvals',
    icon: 'pi-verified',
    color: 'purple',
    filter: { type: 'approval' },
    count: props.notifications.filter((n) =>
      (n.type || '').toLowerCase().includes('approval'),
    ).length,
  },
  {
    key: 'document',
    label: 'Documents',
    icon: 'pi-file',
    color: 'indigo',
    filter: { type: 'document' },
    count: props.notifications.filter((n) =>
      (n.type || '').toLowerCase().includes('document'),
    ).length,
  },
])

const colorClasses: Record<
  string,
  { active: string; inactive: string; iconBg: string; iconText: string }
> = {
  blueberry: {
    active:
      'bg-gradient-to-br from-blueberry-600 to-blueberry-700 text-white ring-blueberry-600 shadow-lg shadow-blueberry-200/60',
    inactive:
      'bg-white text-blueberry-700 ring-appleCore-200 hover:ring-blueberry-300 hover:shadow-md',
    iconBg: 'bg-blueberry-50',
    iconText: 'text-blueberry-600',
  },
  apricot: {
    active:
      'bg-gradient-to-br from-apricot-500 to-apricot-600 text-white ring-apricot-500 shadow-lg shadow-apricot-200/60',
    inactive:
      'bg-white text-blueberry-700 ring-appleCore-200 hover:ring-apricot-300 hover:shadow-md',
    iconBg: 'bg-apricot-50',
    iconText: 'text-apricot-600',
  },
  purple: {
    active:
      'bg-gradient-to-br from-purple-600 to-purple-700 text-white ring-purple-600 shadow-lg shadow-purple-200/60',
    inactive:
      'bg-white text-blueberry-700 ring-appleCore-200 hover:ring-purple-300 hover:shadow-md',
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
  },
  indigo: {
    active:
      'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white ring-indigo-600 shadow-lg shadow-indigo-200/60',
    inactive:
      'bg-white text-blueberry-700 ring-appleCore-200 hover:ring-indigo-300 hover:shadow-md',
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-600',
  },
}

function onSelect(key: string, filter: Record<string, any>) {
  emit('change', key, filter)
}
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <button
      v-for="f in filters"
      :key="f.key"
      type="button"
      class="flex items-center gap-3 px-4 py-3.5 rounded-2xl ring-1 transition-all
             text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blueberry-400"
      :class="
        activeKey === f.key
          ? colorClasses[f.color].active
          : colorClasses[f.color].inactive
      "
      @click="onSelect(f.key, f.filter)"
    >
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
        :class="
          activeKey === f.key
            ? 'bg-white/20 backdrop-blur-sm'
            : colorClasses[f.color].iconBg
        "
      >
        <i
          class="pi text-base"
          :class="[
            f.icon,
            activeKey === f.key ? 'text-white' : colorClasses[f.color].iconText,
          ]"
        />
      </div>
      <div class="flex-1 min-w-0">
        <div
          class="text-[11px] font-medium uppercase tracking-wider opacity-80"
        >
          {{ f.label }}
        </div>
        <div class="text-xl font-bold leading-tight">{{ f.count }}</div>
      </div>
    </button>
  </div>
</template>