<!-- src/features/correction-approvals/components/CorrectionApprovalLevelBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { ApprovalLevel } from '../types'

const props = defineProps<{ level: ApprovalLevel }>()

const config = computed(() => {
  if (props.level === 1) {
    return {
      label: 'Supervisor',
      classes: 'bg-blueberry-50 text-blueberry-700 ring-1 ring-blueberry-200',
    }
  }
  return {
    label: 'Admin',
    classes: 'bg-apricot-50 text-apricot-700 ring-1 ring-apricot-200',
  }
})
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
    :class="config.classes"
  >
    Level {{ level }} · {{ config.label }}
  </span>
</template>