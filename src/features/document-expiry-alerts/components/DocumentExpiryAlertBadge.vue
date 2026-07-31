<!-- src/features/document-expiry-alerts/components/DocumentExpiryAlertBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import type { AlertType } from '../types';

const props = defineProps<{
  type: AlertType;
  showIcon?: boolean;
}>();

const config: Record<AlertType, { label: string; classes: string; icon: string }> = {
  '30_days': {
    label:   '≤ 30 Days',
    classes: 'bg-red-100 text-red-700 border border-red-200',
    icon:    'pi pi-exclamation-triangle',
  },
  '60_days': {
    label:   '≤ 60 Days',
    classes: 'bg-orange-100 text-orange-700 border border-orange-200',
    icon:    'pi pi-exclamation-circle',
  },
  '90_days': {
    label:   '≤ 90 Days',
    classes: 'bg-blue-100 text-blue-700 border border-blue-200',
    icon:    'pi pi-info-circle',
  },
  expired: {
    label:   'Expired',
    classes: 'bg-gray-100 text-gray-700 border border-gray-300',
    icon:    'pi pi-times-circle',
  },
};

const current = computed(() => config[props.type]);
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      current.classes,
    ]"
  >
    <i v-if="showIcon" :class="current.icon" class="text-xs" />
    {{ current.label }}
  </span>
</template>