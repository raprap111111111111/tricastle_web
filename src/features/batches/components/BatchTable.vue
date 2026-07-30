<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import BatchStatusBadge from './BatchStatusBadge.vue'
import BatchDeleteDialog from './BatchDeleteDialog.vue'
import type { Batch, Pagination } from '../types'

const props = defineProps<{
  batches: Batch[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'delete', id: number): void
  (e: 'activate', id: number): void       // ← NEW
  (e: 'deactivate', id: number): void     // ← NEW
}>()

const router = useRouter()
const deleteDialog = ref(false)
const selectedBatch = ref<Batch | null>(null)

const currentLimit = computed(
  () => props.pagination?.per_page ?? props.pagination?.limit ?? 10,
)

const currentFirst = computed(() => {
  if (props.pagination?.current_page && currentLimit.value) {
    return (props.pagination.current_page - 1) * currentLimit.value
  }
  return props.pagination?.offset ?? 0
})

function confirmDelete(batch: Batch) {
  selectedBatch.value = batch
  deleteDialog.value = true
}

function onDeleteConfirmed() {
  if (selectedBatch.value) {
    emit('delete', selectedBatch.value.id)
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
  router.push({ name: 'batches.show', params: { id } })
}

function goToEdit(id: number) {
  router.push({ name: 'batches.edit', params: { id } })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  goToView((event.data as Batch).id)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-CA')
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
        table: 'text-sm',
        header: '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
        headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow: 'cursor-pointer hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
      }"
    >
      <!-- Batch Number -->
      <Column field="batch_number" header="Batch #" sortable style="width: 120px">
        <template #body="{ data }">
          <span class="font-mono text-sm text-apricot-600 font-semibold">
            Batch {{ data.batch_number }}
          </span>
        </template>
      </Column>

      <!-- Batch Name -->
      <Column field="name" header="Batch Name" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span class="font-medium text-blueberry-800">{{ data.name }}</span>
            <span
              v-if="data.is_active"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold
                     bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              v-tooltip.top="'This is the active batch'"
            >
              <i class="pi pi-star-fill text-[8px]" />
              ACTIVE
            </span>
          </div>
        </template>
      </Column>

      <!-- Country -->
      <Column field="country" header="Country" style="width: 140px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-600">
            {{ data.country ?? '—' }}
          </span>
        </template>
      </Column>

      <!-- Status -->
      <Column field="status" header="Status" style="width: 160px">
        <template #body="{ data }">
          <BatchStatusBadge :status="data.status" />
        </template>
      </Column>

      <!-- Active -->
      <Column field="is_active" header="Active" style="width: 100px">
        <template #body="{ data }">
          <span
            v-if="data.is_active"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                   bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          >
            <i class="pi pi-check-circle text-[10px]" />
            Active
          </span>
          <span v-else class="text-xs text-blueberry-300">—</span>
        </template>
      </Column>

      <!-- Deployment Date -->
      <Column field="deployment_date" header="Departure to 🇯🇵" style="width: 160px">
        <template #body="{ data }">
          <span
            class="text-sm"
            :class="!data.deployment_date ? 'text-blueberry-300' : 'text-blueberry-600'"
          >
            {{ formatDate(data.deployment_date) }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 180px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <!-- View -->
            <Button
              icon="pi pi-eye"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View'"
              @click="goToView(data.id)"
            />

            <!-- Activate / Deactivate -->
            <Button
              v-if="!data.is_active"
              icon="pi pi-check-circle"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-emerald-600 hover:!bg-emerald-50"
              v-tooltip.top="'Activate Batch'"
              @click="emit('activate', data.id)"
            />
            <Button
              v-else
              icon="pi pi-times-circle"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-orange-600 hover:!bg-orange-50"
              v-tooltip.top="'Deactivate Batch'"
              @click="emit('deactivate', data.id)"
            />

            <!-- Edit -->
            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Edit'"
              @click="goToEdit(data.id)"
            />

            <!-- Delete -->
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
          <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-graduation-cap text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No batches yet</p>
          <p class="text-xs text-blueberry-400">
            Create a batch to start grouping approved trainees
          </p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading batches...</p>
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

    <BatchDeleteDialog
      v-model:visible="deleteDialog"
      :batch="selectedBatch"
      :loading="props.submitting"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>