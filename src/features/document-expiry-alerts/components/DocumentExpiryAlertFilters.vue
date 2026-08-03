<!-- src/features/document-expiry-alerts/components/DocumentExpiryAlertFilters.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Select from 'primevue/select';
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
  { label: '10',  value: 10  },
  { label: '25',  value: 25  },
  { label: '50',  value: 50  },
  { label: '100', value: 100 },
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
  <div class="space-y-4">

    <!-- ═════ Main Search Bar (matches Document Batches style) ═════ -->
    <div class="flex items-center gap-3">
      <!-- Search input -->
      <div class="flex-1 relative">
        <IconField class="w-full">
          <InputIcon class="pi pi-search text-gray-400 !left-5" />
          <InputText
            v-model="local.search"
            placeholder="Search by document name or applicant..."
            class="w-full !py-4 !pl-14 !pr-6 !rounded-2xl !border-gray-200 !bg-white !text-base"
            @keyup.enter="onSearch"
          />
        </IconField>
      </div>

      <!-- Orange Search button (icon only, square) -->
      <button
        type="button"
        :disabled="loading"
        class="w-14 h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
        @click="onSearch"
      >
        <i
          v-if="!loading"
          class="pi pi-search text-white text-lg"
        />
        <i
          v-else
          class="pi pi-spin pi-spinner text-white text-lg"
        />
      </button>

      <!-- White Reset button (icon only, square, outlined) -->
      <button
        type="button"
        class="w-14 h-14 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-colors shadow-sm"
        v-tooltip.top="'Reset filters'"
        @click="onReset"
      >
        <i class="pi pi-refresh text-gray-500 text-lg" />
      </button>
    </div>

    <!-- ═════ Filter Row ═════ -->
    <div class="bg-white rounded-2xl border border-gray-200 p-5">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

        <!-- Urgency -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <i class="pi pi-filter text-xs mr-1" /> Urgency
          </label>
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

        <!-- Sort By -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <i class="pi pi-sort-alt text-xs mr-1" /> Sort By
          </label>
          <div class="flex gap-2">
            <Select
              v-model="local.order_by"
              :options="orderByOptions"
              option-label="label"
              option-value="value"
              class="flex-1"
              @change="onChange"
            />
            <button
              type="button"
              class="w-11 h-11 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors flex-shrink-0"
              v-tooltip.top="local.order_dir === 'asc' ? 'Ascending' : 'Descending'"
              @click="toggleOrderDir"
            >
              <i
                :class="[
                  local.order_dir === 'asc' ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down',
                  'text-gray-600',
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Per Page -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <i class="pi pi-list text-xs mr-1" /> Per Page
          </label>
          <Select
            v-model="local.limit"
            :options="limitOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            @change="onChange"
          />
        </div>

        <!-- Active filters indicator -->
        <div>
          <div
            v-if="local.alert_type || local.search"
            class="flex items-center gap-2 px-4 py-2.5 bg-orange-50 rounded-xl border border-orange-100"
          >
            <i class="pi pi-filter-fill text-orange-500 text-sm" />
            <span class="text-xs font-semibold text-orange-700 flex-1">Filters active</span>
            <button
              class="text-xs text-orange-600 hover:text-orange-800 font-bold underline"
              @click="onReset"
            >
              Clear
            </button>
          </div>
          <div
            v-else
            class="text-xs text-gray-400 px-4 py-3"
          >
            No active filters
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ═════ Input styling ═════ */
:deep(.p-inputtext) {
  border-radius: 1rem !important;
  border-color: #e5e7eb !important;
  padding: 1rem 1.5rem 1rem 3.5rem !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
}
:deep(.p-inputtext:hover) {
  border-color: #d1d5db !important;
}
:deep(.p-inputtext:focus) {
  border-color: #f97316 !important;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
  outline: none !important;
}

/* ═════ Icon inside input ═════ */
:deep(.p-iconfield .p-inputicon) {
  left: 1.25rem !important;
  color: #9ca3af !important;
  z-index: 1;
}

/* ═════ Select dropdowns ═════ */
:deep(.p-select) {
  border-radius: 0.75rem !important;
  border-color: #e5e7eb !important;
  height: 2.75rem !important;
  transition: all 0.2s ease !important;
}
:deep(.p-select:hover) {
  border-color: #d1d5db !important;
}
:deep(.p-select.p-focus) {
  border-color: #f97316 !important;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
}
:deep(.p-select-label) {
  padding: 0.625rem 0.875rem !important;
  font-size: 0.875rem !important;
}
</style>