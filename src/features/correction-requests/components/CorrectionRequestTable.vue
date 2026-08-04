<!-- src/features/correction-requests/components/CorrectionRequestTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, {
  type DataTableRowClickEvent,
  type DataTableSortEvent,
} from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'

import CorrectionRequestStatusBadge from './CorrectionRequestStatusBadge.vue'
import CorrectionRequestSeverityBadge from './CorrectionRequestSeverityBadge.vue'
import CorrectionRequestActionMenu from './CorrectionRequestActionMenu.vue'
import type { CorrectionRequest } from '../types'

const props = defineProps<{
  records: CorrectionRequest[]
  total: number
  loading: boolean
  submitting: boolean
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

const router = useRouter()

// ─── Pagination helpers ────────────────────────────────
const currentLimit = computed(() => props.rows || 10)
const currentFirst = computed(() => props.offset || 0)

function onPageChange(event: PageState) {
  emit('page', { page: event.page, rows: event.rows })
}

// ─── Sort ──────────────────────────────────────────────
function onSort(event: DataTableSortEvent) {
  if (!event.sortField) return
  emit('sort', {
    field: String(event.sortField),
    order: event.sortOrder === 1 ? 1 : -1,
  })
}

// ─── Navigation ────────────────────────────────────────
function goToDetail(record: CorrectionRequest) {
  router.push({
    name: 'correction-requests.show',
    params: { id: record.id },
  })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button, .p-menu')) return
  goToDetail(event.data as CorrectionRequest)
}

// ─── Formatters ────────────────────────────────────────
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

function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
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
      <!-- Code -->
      <Column
        field="request_code"
        header="Code"
        sortable
        style="width: 160px"
      >
        <template #body="{ data }">
          <span class="font-mono text-xs text-apricot-600 font-semibold">
            {{ data.request_code }}
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
          <CorrectionRequestSeverityBadge :severity="data.severity" />
        </template>
      </Column>

      <!-- Status -->
      <Column
        field="status"
        header="Status"
        sortable
        style="width: 140px"
      >
        <template #body="{ data }">
          <CorrectionRequestStatusBadge :status="data.status" />
        </template>
      </Column>

      <!-- Description -->
      <Column field="description" header="Description">
        <template #body="{ data }">
          <div class="flex flex-col items-start text-left">
            <span
              class="font-medium text-blueberry-800 line-clamp-1"
              :title="data.description"
            >
              {{ data.description }}
            </span>
            <span
              v-if="data.reason"
              class="text-xs text-blueberry-400 mt-0.5 line-clamp-1"
            >
              {{ data.reason }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Flags -->
      <Column header="Flags" style="width: 110px">
        <template #body="{ data }">
          <div class="flex items-center gap-1.5">
            <span
              v-if="data.requires_approval"
              v-tooltip.top="'Requires Approval'"
              class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50"
            >
              <i class="pi pi-shield text-[11px] text-amber-600" />
            </span>
            <span
              v-if="data.requires_new_document"
              v-tooltip.top="'Requires New Document'"
              class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50"
            >
              <i class="pi pi-file text-[11px] text-blue-600" />
            </span>
            <span
              v-if="!data.requires_approval && !data.requires_new_document"
              class="text-xs text-blueberry-300"
            >
              —
            </span>
          </div>
        </template>
      </Column>

      <!-- Due Date -->
      <Column
        field="due_date"
        header="Due Date"
        sortable
        style="width: 140px"
      >
        <template #body="{ data }">
          <span
            class="text-sm"
            :class="
              isOverdue(data.due_date)
                ? 'text-red-500 font-semibold'
                : 'text-blueberry-600'
            "
          >
            {{ formatDate(data.due_date) }}
          </span>
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
      <Column header="Actions" style="width: 120px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-eye"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View'"
              @click="goToDetail(data)"
            />
            <CorrectionRequestActionMenu
              :record="data"
              @view="$emit('view', $event)"
              @edit="$emit('edit', $event)"
              @approve="$emit('approve', $event)"
              @reject="$emit('reject', $event)"
              @complete="$emit('complete', $event)"
              @cancel="$emit('cancel', $event)"
              @delete="$emit('delete', $event)"
            />
          </div>
        </template>
      </Column>

      <!-- Empty state -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div
            class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center"
          >
            <i class="pi pi-inbox text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">
            No correction requests found
          </p>
          <p class="text-xs text-blueberry-400">
            Try adjusting your filters or create a new request
          </p>
        </div>
      </template>

      <!-- Loading state -->
      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">
            Loading correction requests...
          </p>
        </div>
      </template>
    </DataTable>

    <!-- ─── Pagination Footer ─── -->
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