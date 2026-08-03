<!-- src/features/correction-requests/components/CorrectionRequestFilters.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ToggleButton from 'primevue/togglebutton'
import type { CorrectionRequestListParams } from '../types'

const emit = defineEmits<{
  (e: 'filter', value: Partial<CorrectionRequestListParams>): void
  (e: 'reset'): void
}>()

const filters = reactive<Partial<CorrectionRequestListParams>>({
  status: undefined,
  severity: undefined,
  requires_approval: undefined,
  overdue_only: undefined,
  active_only: undefined,
})

const statusOptions = [
  { label: 'All Status', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const severityOptions = [
  { label: 'All Severity', value: undefined },
  { label: 'Low', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Critical', value: 'critical' },
]

function apply() {
  emit('filter', { ...filters })
}

function reset() {
  Object.assign(filters, {
    status: undefined,
    severity: undefined,
    requires_approval: undefined,
    overdue_only: undefined,
    active_only: undefined,
  })
  emit('reset')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Select
      v-model="filters.status"
      :options="statusOptions"
      option-label="label"
      option-value="value"
      placeholder="Status"
      class="w-36 text-sm"
      @change="apply"
    />
    <Select
      v-model="filters.severity"
      :options="severityOptions"
      option-label="label"
      option-value="value"
      placeholder="Severity"
      class="w-36 text-sm"
      @change="apply"
    />
    <ToggleButton
      v-model="filters.overdue_only"
      on-label="Overdue"
      off-label="Overdue"
      on-icon="pi pi-clock"
      off-icon="pi pi-clock"
      size="small"
      @change="apply"
    />
    <ToggleButton
      v-model="filters.active_only"
      on-label="Active"
      off-label="Active"
      on-icon="pi pi-check"
      off-icon="pi pi-check"
      size="small"
      @change="apply"
    />
    <Button
      icon="pi pi-times"
      size="small"
      text
      severity="secondary"
      v-tooltip="'Clear filters'"
      @click="reset"
    />
  </div>
</template>