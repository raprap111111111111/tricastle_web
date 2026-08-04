<!-- src/features/verification-mismatches/components/VerificationMismatchFilters.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ToggleButton from 'primevue/togglebutton'
import type { VerificationMismatchListParams } from '../types'

const emit = defineEmits<{
  (e: 'filter', filters: Partial<VerificationMismatchListParams>): void
  (e: 'reset'): void
}>()

const severity = ref<string | null>(null)
const status = ref<string | null>(null)
const mismatchType = ref<string | null>(null)
const unresolvedOnly = ref(false)
const criticalOnly = ref(false)

const severityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Critical', value: 'critical' },
]

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Correction Requested', value: 'correction_requested' },
  { label: 'Corrected', value: 'corrected' },
  { label: 'Waived', value: 'waived' },
  { label: 'Escalated', value: 'escalated' },
]

const typeOptions = [
  { label: 'Value Mismatch', value: 'value_mismatch' },
  { label: 'Missing in Document', value: 'missing_in_document' },
  { label: 'Missing in System', value: 'missing_in_system' },
  { label: 'Format Mismatch', value: 'format_mismatch' },
  { label: 'Date Mismatch', value: 'date_mismatch' },
]

function apply() {
  emit('filter', {
    severity: (severity.value as any) ?? undefined,
    status: (status.value as any) ?? undefined,
    mismatch_type: (mismatchType.value as any) ?? undefined,
    unresolved_only: unresolvedOnly.value || undefined,
    critical_only: criticalOnly.value || undefined,
  })
}

function reset() {
  severity.value = null
  status.value = null
  mismatchType.value = null
  unresolvedOnly.value = false
  criticalOnly.value = false
  emit('reset')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Select
      v-model="severity"
      :options="severityOptions"
      option-label="label"
      option-value="value"
      placeholder="Severity"
      show-clear
      class="min-w-40"
      size="small"
      @change="apply"
    />

    <Select
      v-model="status"
      :options="statusOptions"
      option-label="label"
      option-value="value"
      placeholder="Status"
      show-clear
      class="min-w-44"
      size="small"
      @change="apply"
    />

    <Select
      v-model="mismatchType"
      :options="typeOptions"
      option-label="label"
      option-value="value"
      placeholder="Type"
      show-clear
      class="min-w-44"
      size="small"
      @change="apply"
    />

    <ToggleButton
      v-model="unresolvedOnly"
      on-label="Unresolved Only"
      off-label="Unresolved Only"
      on-icon="pi pi-filter-fill"
      off-icon="pi pi-filter"
      size="small"
      @change="apply"
    />

    <ToggleButton
      v-model="criticalOnly"
      on-label="Critical Only"
      off-label="Critical Only"
      on-icon="pi pi-exclamation-circle"
      off-icon="pi pi-circle"
      size="small"
      @change="apply"
    />

    <Button
      label="Reset"
      icon="pi pi-refresh"
      severity="secondary"
      text
      size="small"
      @click="reset"
    />
  </div>
</template>