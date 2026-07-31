<!-- src/features/document-expiry-alerts/components/DocumentExpiryAlertFilters.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Select from 'primevue/select';
import Button from 'primevue/button';
import type { DocumentExpiryAlertFilters } from '../types';

const props = defineProps<{
  modelValue: DocumentExpiryAlertFilters;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: DocumentExpiryAlertFilters];
  search: [];
  reset: [];
}>();

const local = ref<DocumentExpiryAlertFilters>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (val) => { local.value = { ...val }; },
  { deep: true }
);

const alertTypeOptions = [
  { label: 'All Types', value: '' },
  { label: '≤ 30 Days', value: '30_days' },
  { label: '≤ 60 Days', value: '60_days' },
  { label: '≤ 90 Days', value: '90_days' },
  { label: 'Expired',   value: 'expired' },
];

const limitOptions = [
  { label: '10 per page',  value: 10  },
  { label: '25 per page',  value: 25  },
  { label: '50 per page',  value: 50  },
  { label: '100 per page', value: 100 },
];

const orderByOptions = [
  { label: 'Expiry Date',  value: 'expiry_date' },
  { label: 'Date Created', value: 'created_at'  },
];

function onSearch() {
  emit('update:modelValue', { ...local.value, offset: 0 });
  emit('search');
}

function onReset() {
  local.value = {
    search:           '',
    offset:           0,
    limit:            10,
    order_by:         'expiry_date',
    order_dir:        'asc',
    alert_type:       '',
    applicant_id:     null,
    document_type_id: null,
  };
  emit('update:modelValue', { ...local.value });
  emit('reset');
}

function onChange() {
  emit('update:modelValue', { ...local.value, offset: 0 });
  emit('search');
}

function toggleOrderDir() {
  local.value.order_dir = local.value.order_dir === 'asc' ? 'desc' : 'asc';
  onChange();
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

      <!-- Search -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Search</label>
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="local.search"
            placeholder="Search by document or applicant..."
            class="w-full"
            @keyup.enter="onSearch"
          />
        </IconField>
      </div>

      <!-- Alert Type -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Urgency</label>
        <Select
          v-model="local.alert_type"
          :options="alertTypeOptions"
          option-label="label"
          option-value="value"
          placeholder="All Types"
          class="w-full"
          @change="onChange"
        />
      </div>

      <!-- Per Page -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Per Page</label>
        <Select
          v-model="local.limit"
          :options="limitOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          @change="onChange"
        />
      </div>
    </div>

    <!-- Actions Row -->
    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
      <div class="flex gap-2">
        <Button
          label="Search"
          icon="pi pi-search"
          size="small"
          :loading="loading"
          @click="onSearch"
        />
        <Button
          label="Reset"
          icon="pi pi-refresh"
          size="small"
          severity="secondary"
          outlined
          @click="onReset"
        />
      </div>

      <div class="flex items-center gap-2">
        <Select
          v-model="local.order_by"
          :options="orderByOptions"
          option-label="label"
          option-value="value"
          class="w-40"
          size="small"
          @change="onChange"
        />
        <Button
          :icon="local.order_dir === 'asc' ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down'"
          size="small"
          severity="secondary"
          outlined
          v-tooltip.top="local.order_dir === 'asc' ? 'Ascending' : 'Descending'"
          @click="toggleOrderDir"
        />
      </div>
    </div>
  </div>
</template>