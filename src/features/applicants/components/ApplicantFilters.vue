<script setup lang="ts">
import { ref } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { AppSearchBar } from '@shared/ui'
import type { ApplicantFilters, ApplicantStatus } from '../types'

const emit = defineEmits<{
  (e: 'filter', value: Partial<ApplicantFilters>): void
  (e: 'reset'): void
}>()

const search = ref('')
const status = ref<ApplicantStatus | ''>('')

// Only in-progress statuses — final_list & rejected are on separate pages
const statusOptions = [
  { label: 'All (In Progress)', value: '' },
  { label: 'Pending',           value: 'pending' },
  { label: 'Under Review',      value: 'under_review' },
  { label: 'Verified',          value: 'verified' },
  { label: 'Incomplete',        value: 'incomplete' },
]

function onSearch(value: string) {
  emit('filter', { search: value })
}

function onStatusChange() {
  emit('filter', { status: status.value })
}

function reset() {
  search.value = ''
  status.value = ''
  emit('reset')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <AppSearchBar
      v-model="search"
      placeholder="Search name, email, or code..."
      button-label=""
      class="flex-1 min-w-[260px]"
      @search="onSearch"
    />

    <Select
      v-model="status"
      :options="statusOptions"
      option-label="label"
      option-value="value"
      placeholder="All Status"
      class="w-48"
      @change="onStatusChange"
    />

    <Button
      icon="pi pi-refresh"
      severity="secondary"
      text
      rounded
      v-tooltip.top="'Reset filters'"
      @click="reset"
    />
  </div>
</template>