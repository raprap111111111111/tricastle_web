<!-- src/features/company-categories/components/CompanyCategoryTable.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import AppPagination from '@shared/ui/table/AppPagination.vue'
import CompanyCategoryDeleteDialog from './CompanyCategoryDeleteDialog.vue'
import type { CompanyCategory, Pagination } from '../types'

const props = defineProps<{
  categories: CompanyCategory[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'delete', id: number): void
  (e: 'toggle-status', id: number): void
}>()

const router = useRouter()
const deleteDialog = ref(false)
const selected = ref<CompanyCategory | null>(null)

function confirmDelete(cat: CompanyCategory) {
  selected.value = cat
  deleteDialog.value = true
}

function onDeleteConfirmed() {
  if (selected.value) {
    emit('delete', selected.value.id)
    deleteDialog.value = false
  }
}

function goToView(id: number) {
  router.push({ name: 'company-categories.show', params: { id } })
}

function goToEdit(id: number) {
  router.push({ name: 'company-categories.edit', params: { id } })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  goToView((event.data as CompanyCategory).id)
}
</script>

<template>
  <div class="flex flex-col relative">
    <DataTable
      :value="props.categories"
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
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <span class="font-medium text-blueberry-800">{{ data.name }}</span>
        </template>
      </Column>

      <Column field="slug" header="Slug" style="width: 200px">
        <template #body="{ data }">
          <span class="font-mono text-xs text-blueberry-500 bg-appleCore-50 px-2 py-0.5 rounded">
            {{ data.slug }}
          </span>
        </template>
      </Column>

      <Column field="description" header="Description">
        <template #body="{ data }">
          <p class="text-xs text-blueberry-500 truncate max-w-md">
            {{ data.description || '—' }}
          </p>
        </template>
      </Column>

      <Column field="is_active" header="Status" style="width: 100px">
        <template #body="{ data }">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset"
            :class="data.is_active
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-gray-50 text-gray-600 ring-gray-200'"
          >
            <i :class="data.is_active ? 'pi pi-check-circle' : 'pi pi-ban'" class="text-[10px]" />
            {{ data.is_active ? 'Active' : 'Inactive' }}
          </span>
        </template>
      </Column>

      <Column header="Actions" style="width: 180px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-eye" text rounded size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View'"
              @click="goToView(data.id)"
            />
            <Button
              :icon="data.is_active ? 'pi pi-ban' : 'pi pi-check-circle'"
              text rounded size="small"
              class="!text-blueberry-500 hover:!text-emerald-600 hover:!bg-emerald-50"
              v-tooltip.top="data.is_active ? 'Deactivate' : 'Activate'"
              @click="emit('toggle-status', data.id)"
            />
            <Button
              icon="pi pi-pencil" text rounded size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Edit'"
              @click="goToEdit(data.id)"
            />
            <Button
              icon="pi pi-trash" text rounded size="small"
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
          <p class="text-sm text-blueberry-500 font-medium">No categories yet</p>
          <p class="text-xs text-blueberry-400">Create one to classify companies</p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
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

    <CompanyCategoryDeleteDialog
      v-model:visible="deleteDialog"
      :category="selected"
      :loading="props.submitting"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>