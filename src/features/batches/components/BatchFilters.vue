<script setup lang="ts">
import { ref } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { AppSearchBar } from '@shared/ui'
import type { BatchFilters, BatchStatus } from '../types'

const emit = defineEmits<{
  (e: 'filter', value: Partial<BatchFilters>): void
  (e: 'reset'): void
}>()

const search  = ref('')
const status  = ref<BatchStatus | ''>('')

const statusOptions = [
  { label: 'All Status',    value: ''          },
  { label: 'Draft',         value: 'draft'     },
  { label: 'Ongoing',       value: 'ongoing'   },
  { label: 'Deployed',      value: 'deployed'  },
  { label: 'Completed',     value: 'completed' },
  { label: 'Cancelled',     value: 'cancelled' },
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
      placeholder="Search batch number or name..."
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
      class="w-56"
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