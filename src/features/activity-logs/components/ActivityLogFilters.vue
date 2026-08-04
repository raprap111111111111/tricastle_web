<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import type { ActivityLogFilters, HttpMethod } from '../types'

const emit = defineEmits<{
  (e: 'filter', value: Partial<ActivityLogFilters>): void
  (e: 'reset'): void
}>()

const search = ref('')
const action = ref('')
const module = ref('')
const method = ref<HttpMethod | ''>('')
const dateFrom = ref<Date | null>(null)
const dateTo   = ref<Date | null>(null)

const actionOptions = [
  { label: 'All Actions', value: '' },
  { label: 'Created',   value: 'created' },
  { label: 'Updated',   value: 'updated' },
  { label: 'Deleted',   value: 'deleted' },
  { label: 'Verified',  value: 'verified' },
  { label: 'Rejected',  value: 'rejected' },
  { label: 'Activated', value: 'activated' },
  { label: 'Login',     value: 'login' },
  { label: 'Logout',    value: 'logout' },
]

const methodOptions = [
  { label: 'All Methods', value: '' },
  { label: 'GET',    value: 'GET' },
  { label: 'POST',   value: 'POST' },
  { label: 'PUT',    value: 'PUT' },
  { label: 'PATCH',  value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
]

function apply() {
  emit('filter', {
    search:    search.value,
    action:    action.value || undefined,
    module:    module.value || undefined,
    method:    method.value || undefined,
    date_from: dateFrom.value?.toISOString().slice(0, 10),
    date_to:   dateTo.value?.toISOString().slice(0, 10),
  })
}

function reset() {
  search.value = ''
  action.value = ''
  module.value = ''
  method.value = ''
  dateFrom.value = null
  dateTo.value = null
  emit('reset')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <InputText
      v-model="search"
      placeholder="Search description..."
      class="flex-1 min-w-[220px]"
      @keyup.enter="apply"
    />

    <Select
      v-model="action"
      :options="actionOptions"
      option-label="label"
      option-value="value"
      class="w-44"
      @change="apply"
    />

    <InputText
      v-model="module"
      placeholder="Module (e.g. Applicant)"
      class="w-52"
      @keyup.enter="apply"
    />

    <Select
      v-model="method"
      :options="methodOptions"
      option-label="label"
      option-value="value"
      class="w-36"
      @change="apply"
    />

    <DatePicker
      v-model="dateFrom"
      placeholder="From"
      date-format="yy-mm-dd"
      class="w-36"
      show-icon
      @date-select="apply"
    />

    <DatePicker
      v-model="dateTo"
      placeholder="To"
      date-format="yy-mm-dd"
      class="w-36"
      show-icon
      @date-select="apply"
    />

    <Button
      icon="pi pi-search"
      class="!bg-apricot-500 !border-apricot-500 !text-white"
      @click="apply"
    />

    <Button
      icon="pi pi-refresh"
      severity="secondary"
      text
      rounded
      v-tooltip.top="'Reset'"
      @click="reset"
    />
  </div>
</template>