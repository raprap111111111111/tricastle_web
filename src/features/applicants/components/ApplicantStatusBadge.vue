<script setup lang="ts">
import type { ApplicantStatus } from '../types'

const props = defineProps<{ status: ApplicantStatus }>()

const config: Record<ApplicantStatus, { label: string; class: string }> = {
  pending:      { label: 'Pending',      class: 'bg-yellow-100 text-yellow-800' },
  under_review: { label: 'Under Review', class: 'bg-blue-100 text-blue-800' },
  verified:     { label: 'Verified',     class: 'bg-green-100 text-green-800' },
  rejected:     { label: 'Rejected',     class: 'bg-red-100 text-red-800' },
  incomplete:   { label: 'Incomplete',   class: 'bg-gray-100 text-gray-800' },
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      config[props.status]?.class ?? 'bg-gray-100 text-gray-800',
    ]"
  >
    {{ config[props.status]?.label ?? props.status }}
  </span>
</template>