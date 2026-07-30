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

const statusOptions = [
  { label: 'All Status',   value: '' },
  { label: 'Pending',      value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Verified',     value: 'verified' },
  { label: 'Rejected',     value: 'rejected' },
  { label: 'Incomplete',   value: 'incomplete' },
]

// Search only fires on Enter or Search button click
function onSearch(value: string) {
  emit('filter', { search: value })
}

// Status fires immediately (cheap, small option list)
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
    <!-- Search (reusable, click/Enter only) -->
    <AppSearchBar
      v-model="search"
      placeholder="Search name, email, or code..."
      button-label=""
      class="flex-1 min-w-[260px]"
      @search="onSearch"
    />

    <!-- Status filter -->
    <Select
      v-model="status"
      :options="statusOptions"
      option-label="label"
      option-value="value"
      placeholder="All Status"
      class="w-48"
      @change="onStatusChange"
    />

    <!-- Reset -->
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