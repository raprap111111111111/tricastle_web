<!-- src/features/documents/components/DocumentTable.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import DocumentStatusBadge from './DocumentStatusBadge.vue'
import DocumentDeleteDialog from './DocumentDeleteDialog.vue'
import type { ApplicantDocument, Pagination } from '../types'

const props = defineProps<{
  documents: ApplicantDocument[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'delete', id: number): void
}>()

const router          = useRouter()
const deleteDialog    = ref(false)
const selectedDoc     = ref<ApplicantDocument | null>(null)

const currentLimit = computed(
  () => (props.pagination as any)?.per_page ?? props.pagination?.limit ?? 10,
)

const currentFirst = computed(() => {
  const p: any = props.pagination
  if (p?.current_page && currentLimit.value) {
    return (p.current_page - 1) * currentLimit.value
  }
  return p?.offset ?? ((p?.page ?? 1) - 1) * currentLimit.value
})

// ─── Handlers ──────────────────────────────────────────
function confirmDelete(doc: ApplicantDocument) {
  selectedDoc.value  = doc
  deleteDialog.value = true
}

function onDeleteConfirmed() {
  if (selectedDoc.value) {
    emit('delete', selectedDoc.value.id)
    deleteDialog.value = false
  }
}

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    emit('limit-change', event.rows)
    return
  }
  emit('page-change', event.page + 1)
}

function goToView(id: number) {
  router.push({ name: 'documents.view', params: { id } })
}

function goToEdit(id: number) {
  router.push({ name: 'documents.edit', params: { id } })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  goToView((event.data as ApplicantDocument).id)
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

function priorityColor(p: string): string {
  const map: Record<string, string> = {
    low:    'text-blueberry-400',
    normal: 'text-blueberry-600',
    high:   'text-apricot-600',
    urgent: 'text-red-500',
  }
  return map[p] ?? 'text-blueberry-500'
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.documents"
      :loading="props.loading"
      class="!border-none"
      size="small"
      :row-hover="true"
      @row-click="onRowClick"
      :pt="{
        table: 'text-sm',
        header: '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
        headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow: 'cursor-pointer hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
      }"
    >
      <!-- Document (file + type) -->
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
                {{ data.file_name }}
              </p>
              <p class="text-xs text-blueberry-400 mt-0.5 tabular-nums">
                {{ data.document_type?.name ?? '—' }} · {{ formatSize(data.file_size) }}
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

      <!-- Applicant -->
      <Column header="Applicant" style="width: 220px">
        <template #body="{ data }">
          <div v-if="data.applicant" class="flex flex-col">
            <span class="text-sm font-medium text-blueberry-800">
              {{ data.applicant.first_name }} {{ data.applicant.last_name }}
            </span>
            <span class="text-xs text-apricot-600 font-mono mt-0.5">
              {{ data.applicant.applicant_code }}
            </span>
          </div>
          <span v-else class="text-blueberry-300 text-sm">—</span>
        </template>
      </Column>

      <!-- Status -->
      <Column field="status" header="Status" style="width: 150px">
        <template #body="{ data }">
          <DocumentStatusBadge :status="data.status" />
        </template>
      </Column>

      <!-- Priority -->
      <Column field="priority" header="Priority" style="width: 110px">
        <template #body="{ data }">
          <span
            class="text-sm font-medium capitalize"
            :class="priorityColor(data.priority)"
          >
            {{ data.priority }}
          </span>
        </template>
      </Column>

      <!-- Expiry -->
      <Column field="expiry_date" header="Expiry" sortable style="width: 130px">
        <template #body="{ data }">
          <span
            class="text-sm tabular-nums"
            :class="
              data.is_expired
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

      <!-- Uploaded -->
      <Column field="created_at" header="Uploaded" sortable style="width: 130px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-500 tabular-nums">
            {{ formatDate(data.created_at) }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 140px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-eye"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View'"
              @click="goToView(data.id)"
            />
            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Edit'"
              @click="goToEdit(data.id)"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-red-500 hover:!bg-red-50"
              v-tooltip.top="'Delete'"
              @click="confirmDelete(data)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div
            class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center"
          >
            <i class="pi pi-file text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No documents found</p>
          <p class="text-xs text-blueberry-400">Upload one to get started</p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading documents...</p>
        </div>
      </template>
    </DataTable>

    <!-- Pagination Footer -->
    <div
      v-if="props.pagination && props.pagination.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3
             px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30"
    >
      <div class="text-xs text-blueberry-500">
        Showing
        <span class="font-semibold text-blueberry-700">
          {{ (props.pagination as any).from ?? currentFirst + 1 }}
        </span>
        to
        <span class="font-semibold text-blueberry-700">
          {{
            (props.pagination as any).to
              ?? Math.min(currentFirst + currentLimit, props.pagination.total)
          }}
        </span>
        of
        <span class="font-semibold text-blueberry-700">{{ props.pagination.total }}</span>
        entries
      </div>

      <Paginator
        :rows="currentLimit"
        :total-records="props.pagination.total"
        :first="currentFirst"
        :rows-per-page-options="[10, 25, 50, 100]"
        template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
        class="!bg-transparent !p-0"
        @page="onPageChange"
      />
    </div>

    <!-- Delete Dialog -->
    <DocumentDeleteDialog
      v-model:visible="deleteDialog"
      :document="selectedDoc"
      :loading="props.submitting"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>