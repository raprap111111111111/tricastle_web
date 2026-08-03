<!-- src/features/document-expiry-alerts/components/DocumentExpiryAlertBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { AlertType } from '../types'

const props = defineProps<{
  type: AlertType
  showIcon?: boolean
}>()

const config: Record<AlertType, { label: string; classes: string; icon: string }> = {
  '30_days': {
    label:   '≤ 30 Days',
    classes: 'bg-red-50 text-red-700 border-red-200',
    icon:    'pi pi-exclamation-triangle',
  },
  '60_days': {
    label:   '≤ 60 Days',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    icon:    'pi pi-clock',
  },
  '90_days': {
    label:   '≤ 90 Days',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
    icon:    'pi pi-info-circle',
  },
  expired: {
    label:   'Expired',
    classes: 'bg-appleCore-100 text-blueberry-700 border-appleCore-200',
    icon:    'pi pi-times-circle',
  },
}

const current = computed(() => config[props.type])
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold uppercase tracking-wide whitespace-nowrap',
      current.classes,
    ]"
  >
    <i v-if="showIcon" :class="[current.icon, 'text-[10px]']" />
    <span class="leading-none">{{ current.label }}</span>
  </span>
</template>