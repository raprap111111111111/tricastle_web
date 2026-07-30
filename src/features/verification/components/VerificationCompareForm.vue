<script setup lang="ts">
import { computed } from 'vue';
import ProgressBar from 'primevue/progressbar';
import VerificationFieldRow from './VerificationFieldRow.vue';
import { useMismatchDetection } from '../composables/useMismatchDetection';
import { DEFAULT_FIELDS } from '../constants/verification.constants';
import type { FieldDefinition } from '../types';

const props = defineProps<{
  sourceData: Record<string, any> | null | undefined;
  modelValue: Record<string, any>;
  fields?: FieldDefinition[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [v: Record<string, any>];
  'summary-change': [
    summary: {
      total_fields: number;
      matched_fields: number;
      mismatched_fields: number;
      missing_fields: number;
      match_percentage: number;
    },
  ];
}>();

const fields = computed(() => props.fields ?? DEFAULT_FIELDS);
const sourceRef = computed(() => props.sourceData);
const enteredRef = computed(() => props.modelValue);

const { rows, summary, detectedMismatches } = useMismatchDetection({
  fields: fields.value,
  sourceData: sourceRef,
  enteredData: enteredRef,
});

defineExpose({ summary, detectedMismatches });

function updateField(name: string, value: string) {
  emit('update:modelValue', { ...props.modelValue, [name]: value });
  emit('summary-change', summary.value);
}
</script>

<template>
  <div class="space-y-4">
    <div class="p-4 bg-white border rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-semibold">Match Progress</h3>
        <span class="text-sm font-bold">{{ summary.match_percentage }}%</span>
      </div>
      <ProgressBar :value="summary.match_percentage" />
      <div class="grid grid-cols-4 gap-4 mt-3 text-center text-sm">
        <div>
          <p class="text-gray-500">Total</p>
          <p class="font-semibold">{{ summary.total_fields }}</p>
        </div>
        <div>
          <p class="text-gray-500">Matched</p>
          <p class="font-semibold text-green-600">{{ summary.matched_fields }}</p>
        </div>
        <div>
          <p class="text-gray-500">Mismatched</p>
          <p class="font-semibold text-red-600">{{ summary.mismatched_fields }}</p>
        </div>
        <div>
          <p class="text-gray-500">Missing</p>
          <p class="font-semibold text-gray-500">{{ summary.missing_fields }}</p>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <VerificationFieldRow
        v-for="row in rows"
        :key="row.field.name"
        :row="row"
        :disabled="disabled"
        @update:value="updateField(row.field.name, $event)"
      />
    </div>
  </div>
</template>