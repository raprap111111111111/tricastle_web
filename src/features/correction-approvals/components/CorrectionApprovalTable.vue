<!-- src/features/correction-approvals/components/CorrectionApprovalTable.vue -->
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

import CorrectionApprovalStatusBadge from './CorrectionApprovalStatusBadge.vue'
import CorrectionApprovalLevelBadge from './CorrectionApprovalLevelBadge.vue'
import CorrectionApprovalActionMenu from './CorrectionApprovalActionMenu.vue'
import type { CorrectionApproval } from '../types'

const props = defineProps<{
  records: CorrectionApproval[]
  total: number
  loading: boolean
  submitting: boolean
  rows: number
  offset: number
}>()

const emit = defineEmits<{
  (e: 'page', event: { page: number; rows: number }): void
  (e: 'sort', event: { field: string; order: 1 | -1 }): void
  (e: 'view', record: CorrectionApproval): void
  (e: 'approve', record: CorrectionApproval): void
  (e: 'reject', record: CorrectionApproval): void
  (e: 'escalate', record: CorrectionApproval): void
  (e: 'delete', record: CorrectionApproval): void
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

function goToDetail(record: CorrectionApproval) {
  router.push({
    name: 'correction-approvals.show',
    params: { id: record.id },
  })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button, .p-menu')) return
  goToDetail(event.data as CorrectionApproval)
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

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
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
      <Column field="id" header="ID" sortable style="width: 80px">
        <template #body="{ data }">
          <span class="font-mono text-xs text-apricot-600 font-semibold">
            #{{ data.id }}
          </span>
        </template>
      </Column>

      <!-- Correction Request -->
      <Column field="correction_request_id" header="Request" style="width: 160px">
        <template #body="{ data }">
          <div class="flex flex-col items-start text-left">
            <span class="font-mono text-xs font-semibold text-blueberry-800">
              {{ data.correction_request?.request_code ?? `#${data.correction_request_id}` }}
            </span>
            <span
              v-if="data.correction_request?.description"
              class="text-xs text-blueberry-400 mt-0.5 line-clamp-1 max-w-40"
            >
              {{ data.correction_request.description }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Approver -->
      <Column field="approver_id" header="Approver" style="width: 180px">
        <template #body="{ data }">
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-full bg-apricot-100 text-apricot-600 flex items-center justify-center flex-shrink-0"
            >
              <i class="pi pi-user text-xs" />
            </div>
            <div class="flex flex-col items-start text-left min-w-0">
              <span class="text-sm font-medium text-blueberry-800 truncate">
                {{ data.approver?.name ?? 'Unassigned' }}
              </span>
              <span v-if="data.approver?.email" class="text-xs text-blueberry-400 truncate max-w-40">
                {{ data.approver.email }}
              </span>
            </div>
          </div>
        </template>
      </Column>

      <!-- Decision -->
      <Column field="decision" header="Decision" sortable style="width: 130px">
        <template #body="{ data }">
          <CorrectionApprovalStatusBadge :decision="data.decision" />
        </template>
      </Column>

      <!-- Level -->
      <Column field="approval_level" header="Level" sortable style="width: 150px">
        <template #body="{ data }">
          <CorrectionApprovalLevelBadge :level="data.approval_level" />
        </template>
      </Column>

      <!-- Conditions -->
      <Column header="Conditions" style="width: 220px">
        <template #body="{ data }">
          <div v-if="data.conditions && data.conditions.length" class="flex flex-wrap gap-1">
            <span
              v-for="(c, i) in data.conditions.slice(0, 2)"
              :key="i"
              class="text-xs px-2 py-0.5 rounded bg-blueberry-50 text-blueberry-700"
            >
              {{ c }}
            </span>
            <span
              v-if="data.conditions.length > 2"
              class="text-xs px-2 py-0.5 rounded bg-appleCore-100 text-blueberry-500"
            >
              +{{ data.conditions.length - 2 }}
            </span>
          </div>
          <span v-else class="text-xs text-blueberry-300">—</span>
        </template>
      </Column>

      <!-- Decided -->
      <Column field="decided_at" header="Decided At" sortable style="width: 160px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-500 tabular-nums">
            {{ formatDateTime(data.decided_at) }}
          </span>
        </template>
      </Column>

      <!-- Created -->
      <Column field="created_at" header="Created" sortable style="width: 130px">
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
            <Button
              v-if="data.decision === 'pending'"
              icon="pi pi-check"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-emerald-600 hover:!bg-emerald-50"
              v-tooltip.top="'Approve'"
              @click="$emit('approve', data)"
            />
            <Button
              v-if="data.decision === 'pending'"
              icon="pi pi-times"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-red-500 hover:!bg-red-50"
              v-tooltip.top="'Reject'"
              @click="$emit('reject', data)"
            />
            <CorrectionApprovalActionMenu
              :record="data"
              @view="$emit('view', $event)"
              @approve="$emit('approve', $event)"
              @reject="$emit('reject', $event)"
              @escalate="$emit('escalate', $event)"
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
            No pending approvals
          </p>
          <p class="text-xs text-blueberry-400">
            Approval requests will appear here
          </p>
        </div>
      </template>

      <!-- Loading state -->
      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading approvals...</p>
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
        <span class="font-semibold text-blueberry-700">{{ currentFirst + 1 }}</span>
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