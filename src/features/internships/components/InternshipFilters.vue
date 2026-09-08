<script setup lang="ts">
import { reactive } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import type { InternshipFilters as IFilters } from '../types'

const emit = defineEmits<{
  (e: 'filter', v: Partial<IFilters>): void
  (e: 'reset'): void
}>()

const state = reactive<IFilters>({
  search: '',
  status: '',
  program_type: '',
  only_current: false,
})

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Transferred', value: 'transferred' },
  { label: 'Cancelled', value: 'cancelled' },
]

const typeOptions = [
  { label: 'All Types', value: '' },
  { label: 'TITP', value: 'titp' },
  { label: 'SSW', value: 'ssw' },
  { label: 'SSW Transfer', value: 'ssw_transfer' },
]

function apply() { emit('filter', { ...state }) }
function reset() {
  state.search = ''
  state.status = ''
  state.program_type = ''
  state.only_current = false
  emit('reset')
}
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <div class="flex-1 min-w-[220px]">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Search</label>
      <InputText v-model="state.search" placeholder="Applicant, job, place..." class="w-full" />
    </div>
    <div class="w-48">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Status</label>
      <Select v-model="state.status" :options="statusOptions" option-label="label" option-value="value" class="w-full" />
    </div>
    <div class="w-48">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Type</label>
      <Select v-model="state.program_type" :options="typeOptions" option-label="label" option-value="value" class="w-full" />
    </div>
    <label class="flex items-center gap-2 text-sm text-blueberry-700">
      <input type="checkbox" v-model="state.only_current" class="accent-apricot-500" />
      Only current
    </label>
    <div class="flex items-center gap-2 ml-auto">
      <Button label="Reset" severity="secondary" text @click="reset" />
      <Button label="Apply" icon="pi pi-search" class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white" @click="apply" />
    </div>
  </div>
</template>