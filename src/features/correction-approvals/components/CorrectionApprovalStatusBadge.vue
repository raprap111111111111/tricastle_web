<!-- src/features/correction-approvals/components/CorrectionApprovalStatusBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { ApprovalDecision } from '../types'

const props = defineProps<{ decision: ApprovalDecision }>()

const config = computed(() => {
  const map: Record<ApprovalDecision, { label: string; classes: string; icon: string }> = {
    pending: {
      label: 'Pending',
      classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      icon: 'pi pi-clock',
    },
    approved: {
      label: 'Approved',
      classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      icon: 'pi pi-verified',
    },
    rejected: {
      label: 'Rejected',
      classes: 'bg-red-50 text-red-700 ring-1 ring-red-200',
      icon: 'pi pi-times-circle',
    },
    escalated: {
      label: 'Escalated',
      classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      icon: 'pi pi-arrow-up-right',
    },
  }
  return map[props.decision] ?? map.pending
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold"
    :class="config.classes"
  >
    <i :class="[config.icon, 'text-[10px]']" />
    {{ config.label }}
  </span>
</template>