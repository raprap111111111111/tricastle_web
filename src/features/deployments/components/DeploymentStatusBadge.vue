<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  cancelledAt?: string | null
}>()

const config = computed(() => {
  // If cancelled, show that instead
  if (props.cancelledAt) {
    return {
      label: 'Cancelled',
      icon: 'pi pi-times-circle',
      class: 'bg-red-50 text-red-700 ring-red-200',
    }
  }

  const map: Record<string, { label: string; icon: string; class: string }> = {
    deployed: {
      label: 'Deployed',
      icon: 'pi pi-check-circle',
      class: 'bg-green-50 text-green-700 ring-green-200',
    },
    accepted: {
      label: 'Accepted',
      icon: 'pi pi-verified',
      class: 'bg-blue-50 text-blue-700 ring-blue-200',
    },
    pending: {
      label: 'Pending',
      icon: 'pi pi-clock',
      class: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
    },
    cancelled: {
      label: 'Cancelled',
      icon: 'pi pi-times-circle',
      class: 'bg-red-50 text-red-700 ring-red-200',
    },
  }

  return map[props.status] ?? {
    label: props.status.replace(/_/g, ' '),
    icon: 'pi pi-circle',
    class: 'bg-blueberry-50 text-blueberry-700 ring-blueberry-200',
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold ring-1 capitalize"
    :class="config.class"
  >
    <i :class="config.icon" class="text-[10px]" />
    {{ config.label }}
  </span>
</template>