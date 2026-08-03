<!-- src/features/document-expiry-alerts/components/DocumentExpiryAlertTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import DocumentExpiryAlertBadge from './DocumentExpiryAlertBadge.vue'
import type { DocumentExpiryAlert } from '../types'

const props = defineProps<{
  alerts: DocumentExpiryAlert[]
  total: number
  loading: boolean
  currentPage: number
  limit: number
}>()

const emit = defineEmits<{
  (e: 'view', id: number): void
  (e: 'view-applicant', id: number): void
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
}>()

const router = useRouter()

// ─── Pagination helpers ────────────────────────────────
const currentFirst = computed(() => (props.currentPage - 1) * props.limit)

// ─── Handlers ──────────────────────────────────────────
function goToView(id: number) {
  emit('view', id)
}

function goToApplicant(id: number) {
  emit('view-applicant', id)
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  goToView((event.data as DocumentExpiryAlert).id)
}

function onPageChange(event: PageState) {
  if (event.rows !== props.limit) {
    emit('limit-change', event.rows)
    return
  }
  emit('page-change', event.page + 1)
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

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDaysRemaining(days: number): { text: string; classes: string } {
  if (days < 0) {
    return {
      text:    `${Math.abs(days)}d overdue`,
      classes: 'text-gray-700 bg-gray-100',
    }
  }
  if (days === 0) {
    return { text: 'Today', classes: 'text-red-700 bg-red-50' }
  }
  if (days <= 30) {
    return {
      text:    `${days} day${days !== 1 ? 's' : ''}`,
      classes: 'text-red-700 bg-red-50',
    }
  }
  if (days <= 60) {
    return { text: `${days} days`, classes: 'text-amber-700 bg-amber-50' }
  }
  return { text: `${days} days`, classes: 'text-blue-700 bg-blue-50' }
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    verified:              'text-green-600',
    pending_verification:  'text-blue-600',
    rejected:              'text-red-500',
    approved:              'text-green-600',
  }
  return map[status] ?? 'text-blueberry-500'
}

function getApplicantName(alert: DocumentExpiryAlert): string {
  if (!alert.applicant) return '—'
  if (alert.applicant.full_name) return alert.applicant.full_name
  return `${alert.applicant.first_name ?? ''} ${alert.applicant.last_name ?? ''}`.trim() || '—'
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.alerts"
      :loading="props.loading"
      class="!border-none"
      size="small"
      :row-hover="true"
      @row-click="onRowClick"
      :pt="{
        table:      'text-sm',
        header:     '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
        headerRow:  '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow:    'cursor-pointer hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
      }"
    >
      <!-- ═════ Document (file + type) ═════ -->
      <Column header="Document" sortable sort-field="file_name">
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-apricot-50 text-apricot-600
                     flex items-center justify-center flex-shrink-0"
            >
              <i class="pi pi-file text-sm" />
            </div>
            <div class="min-w-0">
              <p class="font-medium text-blueberry-800 truncate">
                {{ data.document_type?.name ?? '—' }}
              </p>
              <p class="text-xs text-blueberry-400 mt-0.5 tabular-nums">
                {{ data.file_name }} · {{ formatSize(data.file_size) }}
                <span
                  v-if="data.version > 1"
                  class="ml-1 text-apricot-600 font-semibold"
                >
                  v{{ data.version }}
                </span>
              </p>
            </div>
          </div>
        </template>
      </Column>

      <!-- ═════ Applicant ═════ -->
      <Column header="Applicant" style="width: 220px">
        <template #body="{ data }">
          <div v-if="data.applicant" class="flex flex-col">
            <span class="text-sm font-medium text-blueberry-800">
              {{ getApplicantName(data) }}
            </span>
            <span class="text-xs text-apricot-600 font-mono mt-0.5">
              {{ data.applicant.applicant_code ?? '—' }}
            </span>
          </div>
          <span v-else class="text-blueberry-300 text-sm">—</span>
        </template>
      </Column>

      <!-- ═════ Urgency ═════ -->
      <Column field="alert_type" header="Urgency" style="width: 140px">
        <template #body="{ data }">
          <DocumentExpiryAlertBadge :type="data.alert_type" show-icon />
        </template>
      </Column>

      <!-- ═════ Expiry Date ═════ -->
      <Column field="expiry_date" header="Expiry" sortable style="width: 130px">
        <template #body="{ data }">
          <span
            class="text-sm tabular-nums"
            :class="
              data.days_until_expiry < 0
                ? 'text-red-600 font-semibold'
                : !data.expiry_date
                  ? 'text-blueberry-300'
                  : 'text-blueberry-600'
            "
          >
            {{ formatDate(data.expiry_date) }}
          </span>
        </template>
      </Column>

      <!-- ═════ Time Remaining ═════ -->
      <Column field="days_until_expiry" header="Remaining" sortable style="width: 130px">
        <template #body="{ data }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums',
              formatDaysRemaining(data.days_until_expiry).classes,
            ]"
          >
            {{ formatDaysRemaining(data.days_until_expiry).text }}
          </span>
        </template>
      </Column>

      <!-- ═════ Status ═════ -->
      <Column field="status" header="Status" style="width: 150px">
        <template #body="{ data }">
          <span
            class="text-sm font-medium capitalize"
            :class="statusColor(data.status)"
          >
            {{ data.status?.replace(/_/g, ' ') }}
          </span>
        </template>
      </Column>

      <!-- ═════ Actions ═════ -->
      <Column header="Actions" style="width: 120px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-file"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'View Document'"
              @click="goToView(data.id)"
            />
            <Button
              icon="pi pi-user"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View Applicant'"
              @click="goToApplicant(data.applicant_id)"
            />
            <Button
              icon="pi pi-chevron-right"
              text
              rounded
              size="small"
              class="!text-blueberry-400 hover:!text-blueberry-600"
              @click="goToView(data.id)"
            />
          </div>
        </template>
      </Column>

      <!-- ═════ Empty ═════ -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <i class="pi pi-check-circle text-2xl text-green-500" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">All caught up!</p>
          <p class="text-xs text-blueberry-400">
            No documents are expiring within 90 days
          </p>
        </div>
      </template>

      <!-- ═════ Loading ═════ -->
      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading expiring documents...</p>
        </div>
      </template>
    </DataTable>

    <!-- ═════ Pagination Footer ═════ -->
    <div
      v-if="props.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3
             px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30"
    >
      <div class="text-xs text-blueberry-500">
        Showing
        <span class="font-semibold text-blueberry-700">
          {{ currentFirst + 1 }}
        </span>
        to
        <span class="font-semibold text-blueberry-700">
          {{ Math.min(currentFirst + limit, props.total) }}
        </span>
        of
        <span class="font-semibold text-blueberry-700">{{ props.total }}</span>
        documents
      </div>

      <Paginator
        :rows="limit"
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