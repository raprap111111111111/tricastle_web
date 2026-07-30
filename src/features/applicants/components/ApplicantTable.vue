<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import ApplicantStatusBadge from './ApplicantStatusBadge.vue'
import ApplicantDeleteDialog from './ApplicantDeleteDialog.vue'
import type { Applicant, Pagination } from '../types'

const props = defineProps<{
  applicants: Applicant[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'delete', id: number): void
}>()

const router = useRouter()
const deleteDialog      = ref(false)
const selectedApplicant = ref<Applicant | null>(null)

const currentLimit = computed(
  () => props.pagination?.per_page ?? props.pagination?.limit ?? 10,
)

const currentFirst = computed(() => {
  if (props.pagination?.current_page && currentLimit.value) {
    return (props.pagination.current_page - 1) * currentLimit.value
  }
  return props.pagination?.offset ?? 0
})

// ─── Handlers ──────────────────────────────────────────
function confirmDelete(applicant: Applicant) {
  selectedApplicant.value = applicant
  deleteDialog.value = true
}

function onDeleteConfirmed() {
  if (selectedApplicant.value) {
    emit('delete', selectedApplicant.value.id)
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
  router.push({ name: 'applicants.show', params: { id } })
}

function goToEdit(id: number) {
  router.push({ name: 'applicants.edit', params: { id } })
}

// Row click → navigate to view
function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  // Safety: ignore clicks bubbling from buttons/links inside the row
  if (target?.closest('button, a, .p-button')) return
  goToView((event.data as Applicant).id)
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

function gradeColor(grade: string) {
  const map: Record<string, string> = {
    A: 'text-green-600',
    B: 'text-blue-600',
    C: 'text-yellow-600',
    D: 'text-orange-600',
    F: 'text-red-500',
  }
  return map[grade] ?? 'text-blueberry-400'
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.applicants"
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
      <Column field="applicant_code" header="Code" sortable style="width: 150px">
        <template #body="{ data }">
          <span class="font-mono text-xs text-apricot-600 font-semibold">
            {{ data.applicant_code }}
          </span>
        </template>
      </Column>

      <!-- Applicant name -->
      <Column header="Applicant" sortable sort-field="last_name">
        <template #body="{ data }">
          <div class="flex flex-col items-start text-left">
            <span class="font-medium text-blueberry-800">
              {{ data.first_name }}
              {{ data.middle_name ? data.middle_name + ' ' : '' }}
              {{ data.last_name }}
              {{ data.suffix ?? '' }}
            </span>
            <span class="text-xs text-blueberry-400 mt-0.5">{{ data.email }}</span>
          </div>
        </template>
      </Column>

      <Column field="gender" header="Gender" style="width: 100px">
        <template #body="{ data }">
          <span class="text-sm capitalize text-blueberry-600">
            {{ data.gender ?? '—' }}
          </span>
        </template>
      </Column>

      <Column field="nationality" header="Nationality" style="width: 130px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-600">{{ data.nationality ?? '—' }}</span>
        </template>
      </Column>

      <Column field="status" header="Status" style="width: 140px">
        <template #body="{ data }">
          <ApplicantStatusBadge :status="data.status" />
        </template>
      </Column>

      <Column header="Score" style="width: 110px">
        <template #body="{ data }">
          <div class="flex items-baseline gap-1.5">
            <span class="text-sm font-medium text-blueberry-700">
              {{ data.quality_score }}%
            </span>
            <span class="text-xs font-bold" :class="gradeColor(data.quality_grade)">
              {{ data.quality_grade }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="passport_expiry" header="Passport Expiry" style="width: 150px">
        <template #body="{ data }">
          <span
            class="text-sm"
            :class="!data.passport_expiry ? 'text-blueberry-300' : 'text-blueberry-600'"
          >
            {{ formatDate(data.passport_expiry) }}
          </span>
        </template>
      </Column>

      <!-- Actions (View, Edit, Delete) — stopPropagation so row click doesn't fire -->
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
            <i class="pi pi-inbox text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No applicants found</p>
          <p class="text-xs text-blueberry-400">Try adjusting your filters</p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading applicants...</p>
        </div>
      </template>
    </DataTable>

    <!-- Pagination Footer -->
    <div
      v-if="props.pagination && props.pagination.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30"
    >
      <div class="text-xs text-blueberry-500">
        Showing
        <span class="font-semibold text-blueberry-700">{{ props.pagination.from ?? currentFirst + 1 }}</span>
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

    <ApplicantDeleteDialog
      v-model:visible="deleteDialog"
      :applicant="selectedApplicant"
      :loading="props.submitting"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>