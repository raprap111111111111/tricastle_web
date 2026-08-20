<!-- src/features/verification-mismatches/components/VerificationMismatchSeverityBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { MismatchSeverity } from '../types'

const props = defineProps<{ severity: MismatchSeverity }>()

const config = computed(() => {
  const map: Record<MismatchSeverity, { label: string; classes: string; icon: string }> = {
    low: {
      label: 'Low',
      classes: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: 'pi pi-info-circle',
    },
    moderate: {
      label: 'Moderate',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'pi pi-exclamation-triangle',
    },
    critical: {
      label: 'Critical',
      classes: 'bg-red-50 text-red-700 border-red-200',
      icon: 'pi pi-times-circle',
    },
  }
  return map[props.severity] ?? map.low
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold"
    :class="config.classes"
  >
    <i :class="[config.icon, 'text-[10px]']" />
    {{ config.label }}
  </span>
</template>