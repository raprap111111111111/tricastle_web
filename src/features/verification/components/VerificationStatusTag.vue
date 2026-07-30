<script setup lang="ts">
import { computed } from 'vue'
import type { VerificationStatus } from '../types'

const props = defineProps<{ status: VerificationStatus }>()

const config = computed(() => {
  const map: Record<VerificationStatus, { label: string; classes: string; icon: string }> = {
    pending: {
      label: 'Pending',
      classes: 'bg-gray-50 text-gray-700 ring-gray-200',
      icon: 'pi-clock',
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-blue-50 text-blue-700 ring-blue-200',
      icon: 'pi-spin pi-spinner',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      icon: 'pi-check',
    },
    requires_correction: {
      label: 'Correction',
      classes: 'bg-amber-50 text-amber-700 ring-amber-200',
      icon: 'pi-exclamation-triangle',
    },
    approved: {
      label: 'Approved',
      classes: 'bg-green-50 text-green-700 ring-green-200',
      icon: 'pi-verified',
    },
    rejected: {
      label: 'Rejected',
      classes: 'bg-red-50 text-red-700 ring-red-200',
      icon: 'pi-times',
    },
  }
  return map[props.status] ?? map.pending
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