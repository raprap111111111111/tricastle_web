<!-- src/features/correction-requests/components/CorrectionRequestStatusBadge.vue -->
<script setup lang="ts">
import type { CorrectionStatus } from '../types'

const props = defineProps<{ status: CorrectionStatus }>()

const config: Record<CorrectionStatus, { label: string; class: string }> = {
  pending:      { label: 'Pending',      class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  under_review: { label: 'Under Review', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  approved:     { label: 'Approved',     class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  rejected:     { label: 'Rejected',     class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  completed:    { label: 'Completed',    class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  cancelled:    { label: 'Cancelled',    class: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400' },
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      config[status]?.class,
    ]"
  >
    {{ config[status]?.label ?? status }}
  </span>
</template>