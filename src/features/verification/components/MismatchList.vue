<script setup lang="ts">
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import SeverityTag from './SeverityTag.vue';
import type { VerificationMismatch } from '../types';
import {
  MISMATCH_STATUS_SEVERITY,
  MISMATCH_STATUS_LABELS,
  MISMATCH_TYPE_LABELS,
} from '../constants/verification.constants';

defineProps<{ mismatches: VerificationMismatch[] }>();
defineEmits<{
  resolve: [m: VerificationMismatch];
  waive: [m: VerificationMismatch];
  escalate: [m: VerificationMismatch];
}>();
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="!mismatches.length"
      class="p-8 text-center border rounded-lg bg-green-50 border-green-200"
    >
      <i class="pi pi-check-circle text-4xl text-green-500 mb-2" />
      <p class="text-green-800 font-medium">No mismatches detected</p>
    </div>

    <div
      v-for="m in mismatches"
      :key="m.id"
      class="p-4 bg-white border rounded-lg space-y-3"
    >
      <div class="flex items-start justify-between">
        <div>
          <h4 class="font-semibold">{{ m.field_label }}</h4>
          <p class="text-xs text-gray-500">{{ m.field_name }}</p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <SeverityTag :severity="m.severity" />
          <Tag
            :value="MISMATCH_STATUS_LABELS[m.status]"
            :severity="MISMATCH_STATUS_SEVERITY[m.status]"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="p-2 bg-gray-50 border rounded">
          <p class="text-xs text-gray-500 mb-1">Source</p>
          <p class="font-mono">{{ m.source_value || '—' }}</p>
        </div>
        <div class="p-2 bg-gray-50 border rounded">
          <p class="text-xs text-gray-500 mb-1">Entered</p>
          <p class="font-mono">{{ m.entered_value || '—' }}</p>
        </div>
      </div>

      <p class="text-xs text-gray-600">
        Type: {{ MISMATCH_TYPE_LABELS[m.mismatch_type] }}
      </p>

      <div
        v-if="m.resolution_notes"
        class="text-sm p-2 bg-blue-50 border border-blue-200 rounded"
      >
        <strong>Notes:</strong> {{ m.resolution_notes }}
      </div>

      <div v-if="m.status === 'open'" class="flex gap-2 pt-2 border-t">
        <Button
          label="Resolve"
          icon="pi pi-check"
          size="small"
          severity="success"
          @click="$emit('resolve', m)"
        />
        <Button
          label="Waive"
          icon="pi pi-minus-circle"
          size="small"
          severity="secondary"
          @click="$emit('waive', m)"
        />
        <Button
          label="Escalate"
          icon="pi pi-arrow-up"
          size="small"
          severity="warn"
          @click="$emit('escalate', m)"
        />
      </div>
    </div>
  </div>
</template>