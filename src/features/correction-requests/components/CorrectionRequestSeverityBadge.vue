<!-- src/features/correction-requests/components/CorrectionRequestSeverityBadge.vue -->
<script setup lang="ts">
import type { CorrectionSeverity } from '../types'

defineProps<{ severity: CorrectionSeverity }>()

const config: Record<
  CorrectionSeverity,
  { label: string; icon: string; class: string }
> = {
  low: {
    label: 'Low',
    icon: 'pi-arrow-down',
    class:
      'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300',
  },
  moderate: {
    label: 'Moderate',
    icon: 'pi-minus',
    class:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  critical: {
    label: 'Critical',
    icon: 'pi-arrow-up',
    class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      config[severity]?.class,
    ]"
  >
    <i :class="['pi text-[10px]', config[severity]?.icon]" />
    {{ config[severity]?.label ?? severity }}
  </span>
</template>