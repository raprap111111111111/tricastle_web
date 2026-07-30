<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import type { CompanyCategoryFilters as IFilters } from '../types'

const emit = defineEmits<{
  filter: [filters: Partial<IFilters>]
  reset: []
}>()

const search = ref('')
const isActive = ref<'' | boolean>('')

const statusOptions = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: true },
  { label: 'Inactive', value: false },
]

function apply() {
  emit('filter', { search: search.value, is_active: isActive.value })
}
function reset() {
  search.value = ''
  isActive.value = ''
  emit('reset')
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
    <div class="md:col-span-2">
      <InputText
        v-model="search"
        placeholder="Search category name..."
        class="w-full"
        @keyup.enter="apply"
      />
    </div>
    <Select
      v-model="isActive"
      :options="statusOptions"
      option-label="label"
      option-value="value"
      placeholder="Status"
      class="w-full"
    />
    <div class="flex gap-2">
      <Button label="Filter" icon="pi pi-filter" @click="apply" />
      <Button label="Reset" icon="pi pi-times" severity="secondary" outlined @click="reset" />
    </div>
  </div>
</template>