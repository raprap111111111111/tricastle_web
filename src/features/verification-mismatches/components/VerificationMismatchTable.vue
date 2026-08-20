<!-- src/features/verification-mismatches/components/VerificationMismatchTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, {
  type DataTableRowClickEvent,
  type DataTableSortEvent,
} from 'primevue/datatable'
import Column from 'primevue/column'
import Paginator, { type PageState } from 'primevue/paginator'

import VerificationMismatchStatusBadge from './VerificationMismatchStatusBadge.vue'
import VerificationMismatchSeverityBadge from './VerificationMismatchSeverityBadge.vue'
import VerificationMismatchActionMenu from './VerificationMismatchActionMenu.vue'
import type { VerificationMismatch } from '../types'

const props = defineProps<{
  records: VerificationMismatch[]
  total: number
  loading: boolean
  rows: number
  offset: number
}>()

const emit = defineEmits<{
  (e: 'page', event: { page: number; rows: number }): void
  (e: 'sort', event: { field: string; order: 1 | -1 }): void
  (e: 'view', record: VerificationMismatch): void
  (e: 'resolve', record: VerificationMismatch): void
  (e: 'waive', record: VerificationMismatch): void
  (e: 'escalate', record: VerificationMismatch): void
  (e: 'delete', record: VerificationMismatch): void
}>()

const router = useRouter()

const currentLimit = computed(() => props.rows || 10)
const currentFirst = computed(() => props.offset || 0)

function onPageChange(event: PageState) {
  emit('page', { page: event.page, rows: event.rows })
}

function onSort(event: DataTableSortEvent) {
  if (!event.sortField) return
  emit('sort', {
    field: String(event.sortField),
    order: event.sortOrder === 1 ? 1 : -1,
  })
}

function goToDetail(record: VerificationMismatch) {
  router.push({ name: 'mismatches.show', params: { id: record.id } })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button, .p-menu')) return
  goToDetail(event.data as VerificationMismatch)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-CA')
  } catch {
    return '—'
  }
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    value_mismatch: 'Value',
    missing_in_document: 'Missing (Doc)',
    missing_in_system: 'Missing (Sys)',
    format_mismatch: 'Format',
    date_mismatch: 'Date',
  }
  return map[t] ?? t
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.records"
      :loading="props.loading"
      class="!border-none"
      size="small"
      :row-hover="true"
      removable-sort
      @row-click="onRowClick"
      @sort="onSort"
      :pt="{
        table: 'text-sm',
        header:
          '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
        headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow:
          'cursor-pointer hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
      }"
    >
      <!-- ID -->
      <Column header="ID" style="width: 80px">
        <template #body="{ data }">
          <span class="font-mono text-xs text-apricot-600 font-semibold">
            #{{ data.id }}
          </span>
        </template>
      </Column>

      <!-- Field -->
      <Column header="Field" sortable sort-field="field_name">
        <template #body="{ data }">
          <div class="flex flex-col items-start">
            <span class="font-medium text-blueberry-800">
              {{ data.field_label }}
            </span>
            <span class="text-xs text-blueberry-400 mt-0.5 font-mono">
              {{ data.field_name }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Values -->
      <Column header="Source → Entered">
        <template #body="{ data }">
          <div class="flex items-center gap-2 text-xs">
            <span
              class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium truncate max-w-32"
              :title="data.source_value ?? '—'"
            >
              {{ data.source_value ?? '—' }}
            </span>
            <i class="pi pi-arrow-right text-blueberry-300" />
            <span
              class="px-2 py-0.5 rounded bg-red-50 text-red-700 font-medium truncate max-w-32"
              :title="data.entered_value ?? '—'"
            >
              {{ data.entered_value ?? '—' }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Type -->
      <Column
        field="mismatch_type"
        header="Type"
        sortable
        style="width: 130px"
      >
        <template #body="{ data }">
          <span class="text-xs text-blueberry-600 capitalize">
            {{ typeLabel(data.mismatch_type) }}
          </span>
        </template>
      </Column>

      <!-- Severity -->
      <Column
        field="severity"
        header="Severity"
        sortable
        style="width: 120px"
      >
        <template #body="{ data }">
          <VerificationMismatchSeverityBadge :severity="data.severity" />
        </template>
      </Column>

      <!-- Status -->
      <Column field="status" header="Status" sortable style="width: 180px">
        <template #body="{ data }">
          <VerificationMismatchStatusBadge :status="data.status" />
        </template>
      </Column>

      <!-- Created -->
      <Column
        field="created_at"
        header="Created"
        sortable
        style="width: 130px"
      >
        <template #body="{ data }">
          <span class="text-sm text-blueberry-500 tabular-nums">
            {{ formatDate(data.created_at) }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 60px">
        <template #body="{ data }">
          <VerificationMismatchActionMenu
            :record="data"
            @view="$emit('view', $event)"
            @resolve="$emit('resolve', $event)"
            @waive="$emit('waive', $event)"
            @escalate="$emit('escalate', $event)"
            @delete="$emit('delete', $event)"
          />
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div
            class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center"
          >
            <i class="pi pi-check-circle text-2xl text-emerald-400" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">
            No mismatches found
          </p>
          <p class="text-xs text-blueberry-400">
            All verifications are looking clean!
          </p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading mismatches...</p>
        </div>
      </template>
    </DataTable>

    <!-- Pagination -->
    <div
      v-if="props.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30"
    >
      <div class="text-xs text-blueberry-500">
        Showing
        <span class="font-semibold text-blueberry-700">
          {{ currentFirst + 1 }}
        </span>
        to
        <span class="font-semibold text-blueberry-700">
          {{ Math.min(currentFirst + currentLimit, props.total) }}
        </span>
        of
        <span class="font-semibold text-blueberry-700">{{ props.total }}</span>
        entries
      </div>

      <Paginator
        :rows="currentLimit"
        :total-records="props.total"
        :first="currentFirst"
        :rows-per-page-options="[10, 25, 50, 100]"
        template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
        class="!bg-transparent !p-0"
        @page="onPageChange"
      />
    </div>
  </div>
</template>