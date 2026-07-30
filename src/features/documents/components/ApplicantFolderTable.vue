<!-- src/features/documents/components/ApplicantFolderTable.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import type { ApplicantFolderSummary, FolderPagination } from '../types/folders'

const props = defineProps<{
  folders:    ApplicantFolderSummary[]
  pagination: FolderPagination | null
  loading:    boolean
}>()

const emit = defineEmits<{
  (e: 'page-change',  page:  number): void
  (e: 'limit-change', limit: number): void
}>()

const router = useRouter()

// ─── Pagination helpers ─────────────────────────────────────────────────────
const currentLimit = computed(
  () => props.pagination?.per_page ?? props.pagination?.limit ?? 12,
)

const currentFirst = computed(() => {
  if (props.pagination?.current_page && currentLimit.value) {
    return (props.pagination.current_page - 1) * currentLimit.value
  }
  return props.pagination?.offset ?? 0
})

// ─── Handlers ───────────────────────────────────────────────────────────────
function openFolder(applicantId: number) {
  router.push({
    name:   'documents.folder',
    params: { applicantId },
  })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  openFolder((event.data as ApplicantFolderSummary).applicant_id)
}

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    emit('limit-change', event.rows)
    return
  }
  emit('page-change', event.page + 1)
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return (
    name
      .split(' ')
      .map((p) => p.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.folders"
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
      <!-- Folder icon / avatar -->
      <Column header="" style="width: 60px">
        <template #body="{ data }">
          <div
            class="w-10 h-10 rounded-xl bg-apricot-50 text-apricot-600
                   flex items-center justify-center flex-shrink-0
                   font-serif font-bold text-sm"
          >
            {{ initials(data.applicant_name) }}
          </div>
        </template>
      </Column>

      <!-- Applicant code -->
      <Column field="applicant_code" header="Code" sortable style="width: 160px">
        <template #body="{ data }">
          <span class="font-mono text-xs text-apricot-600 font-semibold">
            {{ data.applicant_code }}
          </span>
        </template>
      </Column>

      <!-- Applicant name + email -->
      <Column header="Applicant" sortable sort-field="applicant_name">
        <template #body="{ data }">
          <div class="flex flex-col items-start text-left">
            <span class="font-medium text-blueberry-800">
              {{ data.applicant_name }}
            </span>
            <span v-if="data.applicant_email" class="text-xs text-blueberry-400 mt-0.5">
              {{ data.applicant_email }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Types count -->
      <Column field="total_types" header="Types" sortable style="width: 110px">
        <template #body="{ data }">
          <div class="flex items-center gap-1.5 text-blueberry-600">
            <i class="pi pi-tag text-[10px] text-blueberry-400" />
            <span class="text-sm font-medium">{{ data.total_types }}</span>
          </div>
        </template>
      </Column>

      <!-- Documents count -->
      <Column field="total_documents" header="Files" sortable style="width: 110px">
        <template #body="{ data }">
          <div class="flex items-center gap-1.5 text-blueberry-600">
            <i class="pi pi-file text-[10px] text-blueberry-400" />
            <span class="text-sm font-medium">{{ data.total_documents }}</span>
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

      <!-- Actions -->
      <Column header="Actions" style="width: 90px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-folder-open"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Open Folder'"
              @click="openFolder(data.applicant_id)"
            />
          </div>
        </template>
      </Column>

      <!-- Empty -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-folder-open text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No document folders found</p>
          <p class="text-xs text-blueberry-400">Try adjusting your search</p>
        </div>
      </template>

      <!-- Loading -->
      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading folders...</p>
        </div>
      </template>
    </DataTable>

    <!-- Pagination footer -->
    <div
      v-if="props.pagination && props.pagination.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3
             px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30"
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
        folders
      </div>

      <Paginator
        :rows="currentLimit"
        :total-records="props.pagination.total"
        :first="currentFirst"
        :rows-per-page-options="[12, 25, 50, 100]"
        template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
        class="!bg-transparent !p-0"
        @page="onPageChange"
      />
    </div>
  </div>
</template>