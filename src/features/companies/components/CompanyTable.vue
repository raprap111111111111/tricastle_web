<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import CompanyStatusBadge from './CompanyStatusBadge.vue'
import CompanyDeleteDialog from './CompanyDeleteDialog.vue'
import type { Company, Pagination } from '../types'

const props = defineProps<{
  companies: Company[]
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
const selectedCompany = ref<Company | null>(null)

const currentLimit = computed(
  () => props.pagination?.per_page ?? props.pagination?.limit ?? 15,
)

const currentFirst = computed(() => {
  if (props.pagination?.current_page && currentLimit.value) {
    return (props.pagination.current_page - 1) * currentLimit.value
  }
  return props.pagination?.offset ?? 0
})

function confirmDelete(company: Company) {
  selectedCompany.value = company
  deleteDialog.value = true
}

function onDeleteConfirmed() {
  if (selectedCompany.value) {
    emit('delete', selectedCompany.value.id)
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
  router.push({ name: 'companies.show', params: { id } })
}

function goToEdit(id: number) {
  router.push({ name: 'companies.edit', params: { id } })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  goToView((event.data as Company).id)
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.companies"
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
      <!-- Code -->
      <Column field="code" header="Code" sortable style="width: 140px">
        <template #body="{ data }">
          <span class="font-mono text-sm text-apricot-600 font-semibold">
            {{ data.code }}
          </span>
        </template>
      </Column>

      <!-- Name -->
      <Column field="name" header="Company Name" sortable>
        <template #body="{ data }">
          <div>
            <p class="font-medium text-blueberry-800">{{ data.name }}</p>
            <p v-if="data.name_japanese" class="text-xs text-blueberry-500">
              {{ data.name_japanese }}
            </p>
          </div>
        </template>
      </Column>

      <!-- Category -->
      <Column field="category" header="Category" style="width: 140px">
        <template #body="{ data }">
          <span
            v-if="data.category"
            class="inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 ring-1 ring-blue-200"
          >
            {{ data.category.name }}
          </span>
          <span v-else class="text-blueberry-300">—</span>
        </template>
      </Column>

      <!-- Location -->
      <Column header="Location" style="width: 200px">
        <template #body="{ data }">
          <div class="text-xs text-blueberry-600">
            <p v-if="data.prefecture">{{ data.prefecture }}</p>
            <p v-if="data.city" class="text-blueberry-500">{{ data.city }}</p>
            <p v-if="!data.prefecture && !data.city" class="text-blueberry-300">—</p>
          </div>
        </template>
      </Column>

      <!-- Contact -->
      <Column header="Contact" style="width: 200px">
        <template #body="{ data }">
          <div class="text-xs text-blueberry-600">
            <p v-if="data.contact_person" class="font-medium">
              {{ data.contact_person }}
            </p>
            <p v-if="data.contact_email" class="text-blueberry-500 truncate">
              {{ data.contact_email }}
            </p>
          </div>
        </template>
      </Column>

      <!-- Status -->
      <Column field="is_active" header="Status" style="width: 100px">
        <template #body="{ data }">
          <CompanyStatusBadge :is-active="data.is_active" />
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 180px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-eye"
              text rounded size="small"
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
              icon="pi pi-pencil"
              text rounded size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Edit'"
              @click="goToEdit(data.id)"
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
            <i class="pi pi-building text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No companies yet</p>
          <p class="text-xs text-blueberry-400">
            Add a company to start tracking employers
          </p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading companies...</p>
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

    <CompanyDeleteDialog
      v-model:visible="deleteDialog"
      :company="selectedCompany"
      :loading="props.submitting"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>