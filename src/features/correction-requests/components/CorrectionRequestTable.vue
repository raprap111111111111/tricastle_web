<!-- src/features/correction-requests/components/CorrectionRequestTable.vue -->
<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Skeleton from 'primevue/skeleton'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { CorrectionRequest } from '../types'
import CorrectionRequestStatusBadge from './CorrectionRequestStatusBadge.vue'
import CorrectionRequestSeverityBadge from './CorrectionRequestSeverityBadge.vue'
import CorrectionRequestActionMenu from './CorrectionRequestActionMenu.vue'

defineProps<{
  records: CorrectionRequest[]
  total: number
  loading: boolean
  rows: number
  offset: number
}>()

const emit = defineEmits<{
  (e: 'page', event: { page: number; rows: number }): void
  (e: 'sort', event: { field: string; order: 1 | -1 }): void
  (e: 'view', record: CorrectionRequest): void
  (e: 'edit', record: CorrectionRequest): void
  (e: 'approve', record: CorrectionRequest): void
  (e: 'reject', record: CorrectionRequest): void
  (e: 'complete', record: CorrectionRequest): void
  (e: 'cancel', record: CorrectionRequest): void
  (e: 'delete', record: CorrectionRequest): void
}>()

function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function onSort(event: DataTableSortEvent) {
  if (!event.sortField) return
  emit('sort', {
    field: String(event.sortField),
    order: event.sortOrder === 1 ? 1 : -1,
  })
}
</script>

<template>
  <DataTable
    :value="loading ? Array(rows).fill({}) : records"
    :total-records="total"
    :rows="rows"
    :first="offset"
    lazy
    paginator
    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    :rows-per-page-options="[10, 25, 50]"
    current-page-report-template="{first} to {last} of {totalRecords}"
    removable-sort
    class="text-sm"
    @page="$emit('page', { page: $event.page, rows: $event.rows })"
    @sort="onSort"
  >
    <!-- Code -->
    <Column field="request_code" header="Code" sortable>
      <template #body="{ data }">
        <Skeleton v-if="loading" height="1rem" />
        <span
          v-else
          class="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400 cursor-pointer hover:underline"
          @click="$emit('view', data)"
        >
          {{ data.request_code }}
        </span>
      </template>
    </Column>

    <!-- Severity -->
    <Column field="severity" header="Severity" sortable>
      <template #body="{ data }">
        <Skeleton v-if="loading" height="1rem" width="5rem" />
        <CorrectionRequestSeverityBadge v-else :severity="data.severity" />
      </template>
    </Column>

    <!-- Status -->
    <Column field="status" header="Status" sortable>
      <template #body="{ data }">
        <Skeleton v-if="loading" height="1rem" width="6rem" />
        <CorrectionRequestStatusBadge v-else :status="data.status" />
      </template>
    </Column>

    <!-- Description -->
    <Column field="description" header="Description">
      <template #body="{ data }">
        <Skeleton v-if="loading" height="1rem" />
        <span
          v-else
          class="line-clamp-1 text-surface-600 dark:text-surface-300 text-xs"
          :title="data.description"
        >
          {{ data.description }}
        </span>
      </template>
    </Column>

    <!-- Flags -->
    <Column header="Flags">
      <template #body="{ data }">
        <Skeleton v-if="loading" height="1rem" width="4rem" />
        <div v-else class="flex items-center gap-1.5">
          <span
            v-if="data.requires_approval"
            v-tooltip.top="'Requires Approval'"
            class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30"
          >
            <i class="pi pi-shield text-[10px] text-amber-600 dark:text-amber-400" />
          </span>
          <span
            v-if="data.requires_new_document"
            v-tooltip.top="'Requires New Document'"
            class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30"
          >
            <i class="pi pi-file text-[10px] text-blue-600 dark:text-blue-400" />
          </span>
          <span
            v-if="!data.requires_approval && !data.requires_new_document"
            class="text-xs text-surface-300 dark:text-surface-600"
          >
            —
          </span>
        </div>
      </template>
    </Column>

    <!-- Due Date -->
    <Column field="due_date" header="Due" sortable>
      <template #body="{ data }">
        <Skeleton v-if="loading" height="1rem" width="5rem" />
        <span
          v-else
          class="text-xs"
          :class="
            data.due_date && new Date(data.due_date) < new Date()
              ? 'text-red-500 font-medium'
              : 'text-surface-500'
          "
        >
          {{ fmt(data.due_date) }}
        </span>
      </template>
    </Column>

    <!-- Created -->
    <Column field="created_at" header="Created" sortable>
      <template #body="{ data }">
        <Skeleton v-if="loading" height="1rem" width="5rem" />
        <span v-else class="text-xs text-surface-400">
          {{ fmt(data.created_at) }}
        </span>
      </template>
    </Column>

    <!-- Actions -->
    <Column header="" style="width: 48px">
      <template #body="{ data }">
        <Skeleton v-if="loading" shape="circle" size="2rem" />
        <CorrectionRequestActionMenu
          v-else
          :record="data"
          @view="$emit('view', $event)"
          @edit="$emit('edit', $event)"
          @approve="$emit('approve', $event)"
          @reject="$emit('reject', $event)"
          @complete="$emit('complete', $event)"
          @cancel="$emit('cancel', $event)"
          @delete="$emit('delete', $event)"
        />
      </template>
    </Column>
  </DataTable>
</template>