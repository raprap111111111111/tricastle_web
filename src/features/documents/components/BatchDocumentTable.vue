<!-- src/features/documents/components/BatchDocumentTable.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import type { DocumentBatch } from '../types/folders'

const props = defineProps<{
  batches: DocumentBatch[]
  loading: boolean
}>()

const router = useRouter()

function goToFolders(id: number) {
  router.push({
    name:   'documents.folders',
    params: { batchId: id },
  })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  goToFolders((event.data as DocumentBatch).id)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-CA')
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.batches"
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
      <!-- Folder icon -->
      <Column header="" style="width: 60px">
        <template #body>
          <div
            class="w-10 h-10 rounded-xl bg-apricot-50 text-apricot-500
                   flex items-center justify-center flex-shrink-0"
          >
            <i class="pi pi-folder text-base" />
          </div>
        </template>
      </Column>

      <!-- Batch name -->
      <Column field="name" header="Batch" sortable>
        <template #body="{ data }">
          <div class="flex flex-col items-start">
            <span class="font-serif font-semibold text-blueberry-800 text-base">
              {{ data.name }}
            </span>
            <span
              v-if="data.code"
              class="font-mono text-[11px] text-apricot-600 font-semibold mt-0.5"
            >
              {{ data.code }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Applicants -->
      <Column
        field="applicants_with_docs_count"
        header="Applicants"
        sortable
        style="width: 160px"
      >
        <template #body="{ data }">
          <div class="flex items-center gap-1.5 text-blueberry-600">
            <i class="pi pi-users text-[10px] text-blueberry-400" />
            <span class="text-sm font-medium tabular-nums">
              {{ data.applicants_with_docs_count }}
              <span class="text-xs text-blueberry-400 font-normal">
                with documents
              </span>
            </span>
          </div>
        </template>
      </Column>

      <!-- Status -->
      <Column header="Status" style="width: 140px">
        <template #body="{ data }">
          <span
            v-if="data.has_pending"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                   text-[10px] font-bold uppercase tracking-wide
                   text-amber-700 bg-amber-50"
          >
            <i class="pi pi-clock text-[9px]" />
            Pending
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                   text-[10px] font-bold uppercase tracking-wide
                   text-green-700 bg-green-50"
          >
            <i class="pi pi-check text-[9px]" />
            Complete
          </span>
        </template>
      </Column>

      <!-- Created -->
      <Column field="created_at" header="Created" sortable style="width: 140px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-500 tabular-nums">
            {{ formatDate(data.created_at) }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 100px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-folder-open"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Open batch folders'"
              @click="goToFolders(data.id)"
            />
            <Button
              icon="pi pi-chevron-right"
              text
              rounded
              size="small"
              class="!text-blueberry-400 hover:!text-blueberry-600"
              @click="goToFolders(data.id)"
            />
          </div>
        </template>
      </Column>

      <!-- Empty -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-inbox text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No batches with documents</p>
          <p class="text-xs text-blueberry-400">
            Batches will appear here once applicants upload documents
          </p>
        </div>
      </template>

      <!-- Loading -->
      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading batches...</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>