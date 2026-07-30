<script setup lang="ts">
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import type { CompareRow } from '../types';

defineProps<{ row: CompareRow; disabled?: boolean }>();
defineEmits<{ 'update:value': [v: string] }>();
</script>

<template>
  <div
    :class="[
      'grid grid-cols-12 gap-3 items-center p-3 border rounded-md transition',
      row.is_match
        ? 'border-green-200 bg-green-50/50'
        : row.is_missing
        ? 'border-gray-200 bg-gray-50'
        : 'border-red-200 bg-red-50/50',
    ]"
  >
    <div class="col-span-3">
      <p class="text-sm font-medium">
        {{ row.field.label }}
        <span v-if="row.field.required" class="text-red-500">*</span>
      </p>
      <p class="text-xs text-gray-400">{{ row.field.name }}</p>
    </div>

    <div class="col-span-4">
      <p class="text-xs text-gray-500 mb-1">From Document</p>
      <div
        class="px-3 py-2 bg-white border rounded font-mono text-sm min-h-[38px]"
      >
        {{ row.source_value || '—' }}
      </div>
    </div>

    <div class="col-span-4">
      <p class="text-xs text-gray-500 mb-1">Entered Value</p>
      <DatePicker
        v-if="row.field.type === 'date'"
        :model-value="row.entered_value ? new Date(row.entered_value) : null"
        :disabled="disabled"
        date-format="yy-mm-dd"
        show-icon
        class="w-full"
        @update:model-value="
          $emit(
            'update:value',
            $event ? new Date($event as Date).toISOString().split('T')[0] : '',
          )
        "
      />
      <InputText
        v-else
        :model-value="row.entered_value"
        :disabled="disabled"
        class="w-full"
        @update:model-value="$emit('update:value', ($event as string) ?? '')"
      />
    </div>

    <div class="col-span-1 flex justify-end">
      <i
        v-if="row.is_match"
        class="pi pi-check-circle text-green-500 text-xl"
        title="Match"
      />
      <i
        v-else-if="row.is_missing"
        class="pi pi-minus-circle text-gray-400 text-xl"
        title="Missing"
      />
      <i
        v-else
        class="pi pi-times-circle text-red-500 text-xl"
        title="Mismatch"
      />
    </div>
  </div>
</template>