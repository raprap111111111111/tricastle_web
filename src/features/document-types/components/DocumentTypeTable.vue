<!-- src/features/document-types/components/DocumentTypeTable.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'
import AppPagination from '@shared/ui/table/AppPagination.vue'
import DocumentTypeCategoryBadge from './DocumentTypeCategoryBadge.vue'
import DocumentTypeDeleteDialog from './DocumentTypeDeleteDialog.vue'
import type { DocumentType, Pagination } from '../types'

const props = defineProps<{
  types: DocumentType[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'delete', id: number): void
  (e: 'toggle', payload: { id: number; is_active: boolean; name: string }): void
}>()

const router = useRouter()
const deleteDialog = ref(false)
const selectedType = ref<DocumentType | null>(null)

// ─── Handlers ─────────────────────────────────────────
function confirmDelete(t: DocumentType) {
  selectedType.value = t
  deleteDialog.value = true
}

function onDeleteConfirmed() {
  if (selectedType.value) {
    emit('delete', selectedType.value.id)
    deleteDialog.value = false
  }
}

function goToView(id: number) {
  router.push({ name: 'document-types.view', params: { id } })
}

function goToEdit(id: number) {
  router.push({ name: 'document-types.edit', params: { id } })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button, .p-toggleswitch')) return
  goToView((event.data as DocumentType).id)
}

function onToggle(t: DocumentType) {
  emit('toggle', { id: t.id, is_active: t.is_active, name: t.name })
}
</script>

<template>
  <div class="flex flex-col relative">
    <DataTable
      :value="props.types"
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
      <!-- Name + Description -->
      <Column header="Document Type" sortable sort-field="name">
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-apricot-50 text-apricot-600
                     flex items-center justify-center flex-shrink-0"
            >
              <i class="pi pi-tag text-sm" />
            </div>
            <div class="min-w-0">
              <p class="font-medium text-blueberry-800 truncate">{{ data.name }}</p>
              <p v-if="data.description" class="text-xs text-blueberry-400 mt-0.5 truncate">
                {{ data.description }}
              </p>
            </div>
          </div>
        </template>
      </Column>

      <!-- Code -->
      <Column field="code" header="Code" sortable style="width: 160px">
        <template #body="{ data }">
          <span class="font-mono text-xs text-apricot-600 font-semibold bg-apricot-50 px-2 py-0.5 rounded">
            {{ data.code }}
          </span>
        </template>
      </Column>

      <!-- Category -->
      <Column field="category" header="Category" sortable style="width: 130px">
        <template #body="{ data }">
          <DocumentTypeCategoryBadge :category="data.category" />
        </template>
      </Column>

      <!-- Required -->
      <Column field="is_required" header="Required" style="width: 100px">
        <template #body="{ data }">
          <span v-if="data.is_required" class="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
            <i class="pi pi-asterisk text-[8px]" /> Required
          </span>
          <span v-else class="text-xs text-blueberry-400">Optional</span>
        </template>
      </Column>

      <!-- Validity -->
      <Column header="Validity" sortable sort-field="validity_days" style="width: 120px">
        <template #body="{ data }">
          <span v-if="data.validity_days" class="text-sm text-blueberry-700 tabular-nums">
            {{ data.validity_days }} days
          </span>
          <span v-else class="text-blueberry-300 text-sm">No expiry</span>
        </template>
      </Column>

      <!-- Sort Order -->
      <Column field="sort_order" header="Order" sortable style="width: 90px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-500 tabular-nums">
            {{ data.sort_order }}
          </span>
        </template>
      </Column>

      <!-- Active toggle -->
      <Column header="Active" style="width: 120px">
        <template #body="{ data }">
          <div class="flex items-center gap-2" @click.stop>
            <ToggleSwitch
              :model-value="data.is_active"
              @change="onToggle(data)"
              :pt="{
                root: {
                  class: [
                    '!rounded-full',
                    data.is_active
                      ? '!bg-green-500 hover:!bg-green-600'
                      : '!bg-blueberry-200 hover:!bg-blueberry-300',
                  ],
                },
                slider: {
                  class: [
                    '!rounded-full',
                    data.is_active
                      ? '!bg-green-500 !border-green-500'
                      : '!bg-blueberry-200 !border-blueberry-200',
                  ],
                },
              }"
            />
            <span
              class="text-xs font-medium transition-colors"
              :class="data.is_active ? 'text-green-600' : 'text-blueberry-400'"
            >
              {{ data.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
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
          <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-tag text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No document types found</p>
          <p class="text-xs text-blueberry-400">Create one to categorize applicant documents</p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading document types...</p>
        </div>
      </template>
    </DataTable>

    <!-- 🎯 UNIFIED CUSTOM PAGINATION BAR -->
    <AppPagination
      v-if="props.pagination && props.pagination.total > 0"
      :pagination="props.pagination"
      @page-change="(page) => emit('page-change', page)"
      @limit-change="(limit) => emit('limit-change', limit)"
    />

    <DocumentTypeDeleteDialog
      v-model:visible="deleteDialog"
      :type="selectedType"
      :loading="props.submitting"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>