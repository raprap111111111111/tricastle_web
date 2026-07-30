<script setup lang="ts">
import { computed } from 'vue'
import type { BatchStatus } from '../types'

const props = defineProps<{ status: BatchStatus }>()

const config = computed(() => {
  const map: Record<BatchStatus, { label: string; classes: string; icon: string }> = {
    draft: {
      label: 'Draft',
      classes: 'bg-gray-50 text-gray-700 ring-gray-200',
      icon: 'pi-pencil',
    },
    ongoing: {
      label: 'Ongoing',
      classes: 'bg-blue-50 text-blue-700 ring-blue-200',
      icon: 'pi-graduation-cap',
    },
    deployed: {
      label: 'Deployed 🇯🇵',
      classes: 'bg-purple-50 text-purple-700 ring-purple-200',
      icon: 'pi-send',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-green-50 text-green-700 ring-green-200',
      icon: 'pi-check-circle',
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-red-50 text-red-700 ring-red-200',
      icon: 'pi-times',
    },
  }
  return map[props.status] ?? map.draft
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset"
    :class="config.classes"
  >
    <i :class="['pi', config.icon, 'text-[10px]']" />
    {{ config.label }}
  </span>
</template>