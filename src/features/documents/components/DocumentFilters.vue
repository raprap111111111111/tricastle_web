<!-- src/features/documents/components/DocumentFilters.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Select from 'primevue/select'
import { AppSearchBar, AppButton } from '@shared/ui'
import { useDocumentTypeStore } from '@features/document-types/stores/documentType.store'

import type { DocumentFilters, DocumentStatus, DocumentPriority } from '../types'

const emit = defineEmits<{
  (e: 'filter', filters: Partial<DocumentFilters>): void
  (e: 'reset'): void
}>()

const typeStore = useDocumentTypeStore()

onMounted(() => typeStore.fetchTypes())

const search        = ref('')
const documentType  = ref<number | null>(null)
const status        = ref<DocumentStatus | null>(null)
const priority      = ref<DocumentPriority | null>(null)

const statusOptions = [
  { label: 'Uploaded',         value: 'uploaded' },
  { label: 'Pending',          value: 'pending_verification' },
  { label: 'Under Review',     value: 'under_review' },
  { label: 'Verified',         value: 'verified' },
  { label: 'Rejected',         value: 'rejected' },
  { label: 'Expired',          value: 'expired' },
  { label: 'Needs Correction', value: 'requires_correction' },
]

const priorityOptions = [
  { label: 'Low',    value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High',   value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

const typeOptions = computed(() =>
  typeStore.activeTypes.map((t) => ({ label: t.name, value: t.id })),
)

function apply() {
  emit('filter', {
    search:           search.value,
    document_type_id: documentType.value,
    status:           status.value,
    priority:         priority.value,
  })
}

function reset() {
  search.value       = ''
  documentType.value = null
  status.value       = null
  priority.value     = null
  emit('reset')
}
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center gap-3">
    <div class="flex-1 min-w-0">
      <AppSearchBar
        v-model="search"
        placeholder="Search by file name, applicant..."
        @search="apply"
      />
    </div>

    <Select
      v-model="documentType"
      :options="typeOptions"
      option-label="label"
      option-value="value"
      placeholder="All Types"
      show-clear
      class="w-full md:w-52"
      @change="apply"
    />

    <Select
      v-model="status"
      :options="statusOptions"
      option-label="label"
      option-value="value"
      placeholder="All Statuses"
      show-clear
      class="w-full md:w-48"
      @change="apply"
    />

    <Select
      v-model="priority"
      :options="priorityOptions"
      option-label="label"
      option-value="value"
      placeholder="All Priorities"
      show-clear
      class="w-full md:w-40"
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