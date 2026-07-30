<!-- src/features/documents/components/DocumentStatusBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentStatus } from '../types'

const props = defineProps<{ status: DocumentStatus }>()

const config = computed(() => {
  const map: Record<DocumentStatus, { label: string; cls: string; icon: string }> = {
    uploaded: {
      label: 'Uploaded',
      cls: 'bg-blueberry-50 text-blueberry-700 ring-blueberry-200',
      icon: 'pi-cloud-upload',
    },
    pending_verification: {
      label: 'Pending',
      cls: 'bg-apricot-50 text-apricot-700 ring-apricot-200',
      icon: 'pi-hourglass',
    },
    under_review: {
      label: 'Under Review',
      cls: 'bg-citrus-50 text-citrus-700 ring-citrus-200',
      icon: 'pi-eye',
    },
    verified: {
      label: 'Verified',
      cls: 'bg-green-50 text-green-700 ring-green-200',
      icon: 'pi-verified',
    },
    rejected: {
      label: 'Rejected',
      cls: 'bg-red-50 text-red-700 ring-red-200',
      icon: 'pi-times-circle',
    },
    expired: {
      label: 'Expired',
      cls: 'bg-gray-100 text-gray-700 ring-gray-200',
      icon: 'pi-calendar-times',
    },
    requires_correction: {
      label: 'Needs Correction',
      cls: 'bg-orange-50 text-orange-700 ring-orange-200',
      icon: 'pi-pencil',
    },
  }
  return map[props.status]
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl
           text-xs font-semibold ring-1 ring-inset"
    :class="config.cls"
  >
    <i :class="`pi ${config.icon} text-[10px]`" />
    {{ config.label }}
  </span>
</template>