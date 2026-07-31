<!-- src/features/document-versions/components/DocumentVersionFilters.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import type { DocumentVersionListParams } from '../types'

const emit = defineEmits<{
  filter: [filters: Partial<DocumentVersionListParams>]
  reset: []
}>()

const search       = ref('')
const isCurrent    = ref<'' | boolean>('')
const sortBy       = ref<'version_number' | 'created_at'>('created_at')
const sortDir      = ref<'asc' | 'desc'>('desc')

const currentOptions = [
  { label: 'All',     value: '' },
  { label: 'Current', value: true },
  { label: 'Older',   value: false },
]

const sortByOptions = [
  { label: 'Uploaded date',   value: 'created_at' },
  { label: 'Version number',  value: 'version_number' },
]

const sortDirOptions = [
  { label: 'Newest first', value: 'desc' },
  { label: 'Oldest first', value: 'asc' },
]

function apply() {
  emit('filter', {
    sort_by:  sortBy.value,
    sort_dir: sortDir.value,
  })
}

function reset() {
  search.value    = ''
  isCurrent.value = ''
  sortBy.value    = 'created_at'
  sortDir.value   = 'desc'
  emit('reset')
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
    <div class="md:col-span-2">
      <InputText
        v-model="search"
        placeholder="Search file name..."
        class="w-full"
        @keyup.enter="apply"
      />
    </div>

    <Select
      v-model="isCurrent"
      :options="currentOptions"
      option-label="label"
      option-value="value"
      placeholder="All versions"
      class="w-full"
    />

    <Select
      v-model="sortBy"
      :options="sortByOptions"
      option-label="label"
      option-value="value"
      placeholder="Sort by"
      class="w-full"
    />

    <Select
      v-model="sortDir"
      :options="sortDirOptions"
      option-label="label"
      option-value="value"
      placeholder="Order"
      class="w-full"
    />

    <div class="flex gap-2">
      <Button label="Filter" icon="pi pi-filter" @click="apply" />
      <Button label="Reset" icon="pi pi-times" severity="secondary" outlined @click="reset" />
    </div>
  </div>
</template>