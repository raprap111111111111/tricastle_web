<!-- src/features/verification-mismatches/components/VerificationMismatchStatusBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { MismatchStatus } from '../types'

const props = defineProps<{ status: MismatchStatus }>()

const config = computed(() => {
  const map: Record<MismatchStatus, { label: string; classes: string }> = {
    open: { label: 'Open', classes: 'bg-gray-100 text-gray-700 border-gray-200' },
    correction_requested: {
      label: 'Correction Requested',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    corrected: {
      label: 'Corrected',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    waived: {
      label: 'Waived',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    escalated: {
      label: 'Escalated',
      classes: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  }
  return map[props.status] ?? map.open
})
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold"
    :class="config.classes"
  >
    {{ config.label }}
  </span>
</template>