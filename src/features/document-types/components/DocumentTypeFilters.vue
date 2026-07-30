<!-- src/features/document-types/components/DocumentTypeFilters.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Select from 'primevue/select'
import { AppSearchBar, AppButton } from '@shared/ui'
import type { DocumentTypeFilters, DocumentTypeCategory } from '../types'



const emit = defineEmits<{
  (e: 'filter', filters: Partial<DocumentTypeFilters>): void
  (e: 'reset'): void
}>()

const search       = ref('')
const category     = ref<DocumentTypeCategory | null>(null)
const isActive     = ref<boolean | null>(null)
const isRequired   = ref<boolean | null>(null)

const categoryOptions = [
  { label: 'Primary',    value: 'primary' },
  { label: 'Supporting', value: 'supporting' },
]

const boolOptions = [
  { label: 'Yes', value: true },
  { label: 'No',  value: false },
]

function apply() {
  emit('filter', {
    search:      search.value,
    category:    category.value,
    is_active:   isActive.value,
    is_required: isRequired.value,
  })
}

function reset() {
  search.value     = ''
  category.value   = null
  isActive.value   = null
  isRequired.value = null
  emit('reset')
}
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center gap-3">
    <div class="flex-1 min-w-0">
      <AppSearchBar
        v-model="search"
        placeholder="Search by name or code..."
        @search="apply"
      />
    </div>

    <Select
      v-model="category"
      :options="categoryOptions"
      option-label="label"
      option-value="value"
      placeholder="All Categories"
      show-clear
      class="w-full md:w-44"
      @change="apply"
    />

    <Select
      v-model="isActive"
      :options="boolOptions"
      option-label="label"
      option-value="value"
      placeholder="Active?"
      show-clear
      class="w-full md:w-36"
      @change="apply"
    />

    <Select
      v-model="isRequired"
      :options="boolOptions"
      option-label="label"
      option-value="value"
      placeholder="Required?"
      show-clear
      class="w-full md:w-36"
      @change="apply"
    />

    <AppButton
      icon="pi pi-filter-slash"
      variant="secondary"
      @click="reset"
    >
      Reset
    </AppButton>
  </div>
</template>