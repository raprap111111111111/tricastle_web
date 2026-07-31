<!-- src/features/document-versions/components/DocumentVersionTable.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import DocumentVersionDeleteDialog from './DocumentVersionDeleteDialog.vue'
import type { DocumentVersion, DocumentVersionPagination } from '../types/index.ts'

const props = defineProps<{
  versions:   DocumentVersion[]
  pagination: DocumentVersionPagination | null
  loading:    boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change',  page: number):  void
  (e: 'limit-change', limit: number): void
  (e: 'delete',       id: number):    void
}>()

const router = useRouter()
const deleteDialog   = ref(false)
const selectedVersion = ref<DocumentVersion | null>(null)

const currentLimit = computed(
  () => props.pagination?.per_page ?? 15,
)

const currentFirst = computed(() => {
  if (props.pagination?.current_page && currentLimit.value) {
    return (props.pagination.current_page - 1) * currentLimit.value
  }
  return 0
})

function confirmDelete(v: DocumentVersion) {
  selectedVersion.value = v
  deleteDialog.value    = true
}

function onDeleteConfirmed() {
  if (selectedVersion.value) {
    emit('delete', selectedVersion.value.id)
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

function goToDetail(id: number) {
  router.push({ name: 'document-versions.detail', params: { id } })
}

function goToDocumentHistory(applicantDocumentId: number) {
  router.push({
    name:   'document-versions.list',
    params: { applicantDocumentId },
  })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  goToDetail((event.data as DocumentVersion).id)
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1_024)         return `${bytes} B`
  if (bytes < 1_024 * 1_024) return `${(bytes / 1_024).toFixed(1)} KB`
  return `${(bytes / 1_024 / 1_024).toFixed(1)} MB`
}

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString() : '—'
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.versions"
      :loading="props.loading"
      class="!border-none"
      size="small"
      :row-hover="true"
      @row-click="onRowClick"
      :pt="{
        table:     'text-sm',
        header:    '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
        headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow:   'cursor-pointer hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
      }"
    >
      <!-- Version -->
      <Column field="version_number" header="Version" sortable style="width: 120px">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs bg-blueberry-100 text-blueberry-700 px-2 py-0.5 rounded font-bold">
              v{{ data.version_number }}
            </span>
            <span
              v-if="data.is_current"
              class="text-[9px] font-bold uppercase tracking-wide
                     px-1.5 py-0.5 rounded bg-green-50 text-green-700"
            >
              Current
            </span>
          </div>
        </template>
      </Column>

      <!-- File name -->
      <Column field="file_name" header="File Name" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-2 min-w-0">
            <i class="pi pi-file text-apricot-500 text-xs flex-shrink-0" />
            <p class="font-medium text-blueberry-800 truncate">
              {{ data.file_name }}
            </p>
          </div>
          <p v-if="data.change_reason" class="text-[11px] text-blueberry-400 italic truncate mt-0.5">
            "{{ data.change_reason }}"
          </p>
        </template>
      </Column>

      <!-- Applicant (optional field) -->
      <Column header="Applicant" style="width: 180px">
        <template #body="{ data }">
          <p v-if="data.applicant_name" class="text-xs text-blueberry-700 truncate">
            {{ data.applicant_name }}
          </p>
          <p v-else class="text-xs text-blueberry-300">—</p>
        </template>
      </Column>

      <!-- Document type (optional field) -->
      <Column header="Document Type" style="width: 160px">
        <template #body="{ data }">
          <span
            v-if="data.document_type_name"
            class="inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 ring-1 ring-blue-200"
          >
            {{ data.document_type_name }}
          </span>
          <span v-else class="text-blueberry-300 text-xs">—</span>
        </template>
      </Column>

      <!-- File size -->
      <Column field="file_size" header="Size" sortable style="width: 100px">
        <template #body="{ data }">
          <span class="text-xs text-blueberry-600 tabular-nums">
            {{ formatSize(data.file_size) }}
          </span>
        </template>
      </Column>

      <!-- Uploaded -->
      <Column field="created_at" header="Uploaded" sortable style="width: 140px">
        <template #body="{ data }">
          <div class="text-xs text-blueberry-600">
            <p>{{ formatDate(data.created_at) }}</p>
            <p v-if="data.uploader" class="text-blueberry-400 truncate">
              by {{ data.uploader.name }}
            </p>
          </div>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 140px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-eye"
              text rounded size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View version'"
              @click="goToDetail(data.id)"
            />
            <Button
              icon="pi pi-history"
              text rounded size="small"
              class="!text-blueberry-500 hover:!text-purple-600 hover:!bg-purple-50"
              v-tooltip.top="'Document history'"
              @click="goToDocumentHistory(data.applicant_document_id)"
            />
            <Button
              icon="pi pi-trash"
              text rounded size="small"
              class="!text-blueberry-500 hover:!text-red-500 hover:!bg-red-50"
              v-tooltip.top="'Delete'"
              @click="confirmDelete(data)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-history text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No document versions yet</p>
          <p class="text-xs text-blueberry-400">
            Upload a new version of any document to see it here
          </p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading versions...</p>
        </div>
      </template>
    </DataTable>

    <!-- Pagination -->
    <div
      v-if="props.pagination && props.pagination.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30"
    >
      <div class="text-xs text-blueberry-500">
        Showing
        <span class="font-semibold text-blueberry-700">
          {{ props.pagination.from ?? currentFirst + 1 }}
        </span>
        to
        <span class="font-semibold text-blueberry-700">
          {{ props.pagination.to ?? Math.min(currentFirst + currentLimit, props.pagination.total) }}
        </span>
        of
        <span class="font-semibold text-blueberry-700">{{ props.pagination.total }}</span>
      </div>

      <Paginator
        :rows="currentLimit"
        :total-records="props.pagination.total"
        :first="currentFirst"
        :rows-per-page-options="[15, 25, 50, 100]"
        template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
        class="!bg-transparent !p-0"
        @page="onPageChange"
      />
    </div>

    <DocumentVersionDeleteDialog
      v-model:visible="deleteDialog"
      :version="selectedVersion"
      :loading="props.submitting"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>