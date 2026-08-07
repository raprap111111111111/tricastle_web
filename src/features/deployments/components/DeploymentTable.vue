<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import DeploymentStatusBadge from './DeploymentStatusBadge.vue'
import type { Deployment, Pagination } from '../types'

const props = defineProps<{
  deployments: Deployment[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'edit', deployment: Deployment): void
  (e: 'cancel', deployment: Deployment): void
  (e: 'view', deployment: Deployment): void
}>()

const router = useRouter()

// ─── Per-row loading tracker ──────────────────────────
const loadingIds = ref<Set<number>>(new Set())

function isRowLoading(id: number): boolean {
  return loadingIds.value.has(id)
}

// ─── Pagination ───────────────────────────────────────
const currentLimit = computed(
  () => props.pagination?.per_page ?? props.pagination?.limit ?? 10,
)

const currentFirst = computed(() => {
  if (props.pagination?.current_page && currentLimit.value) {
    return (props.pagination.current_page - 1) * currentLimit.value
  }
  return props.pagination?.offset ?? 0
})

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    emit('limit-change', event.rows)
    return
  }
  emit('page-change', event.page + 1)
}

// ─── Row actions ──────────────────────────────────────
function goToApplicant(applicantId: number) {
  router.push({ name: 'applicants.show', params: { id: applicantId } })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button, .p-menu')) return

  const deployment = event.data as Deployment
  if (deployment.applicant_id) {
    goToApplicant(deployment.applicant_id)
  }
}

// ─── Formatters ───────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return '—'
  }
}

function formatSalary(amount: number | null, currency: string | null): string {
  if (!amount) return '—'
  const symbol = currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : currency === 'PHP' ? '₱' : ''
  return `${symbol}${Number(amount).toLocaleString()} ${currency ?? ''}`.trim()
}

function contractPeriod(d: Deployment): string {
  if (d.contract_duration_months) {
    return `${d.contract_duration_months} mo${d.contract_duration_months > 1 ? 's' : ''}`
  }
  if (d.contract_start_date && d.contract_end_date) {
    return `${formatDate(d.contract_start_date)} - ${formatDate(d.contract_end_date)}`
  }
  return '—'
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.deployments"
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
      <!-- Applicant Code -->
      <Column field="applicant.applicant_code" header="Code" style="width: 140px">
        <template #body="{ data }">
          <span class="font-mono text-xs text-apricot-600 font-semibold">
            {{ data.applicant?.applicant_code ?? '—' }}
          </span>
        </template>
      </Column>

      <!-- Applicant Name + Email -->
      <Column header="Applicant" sortable sort-field="applicant.last_name">
        <template #body="{ data }">
          <div class="flex flex-col items-start text-left">
            <span class="font-medium text-blueberry-800">
              {{ data.applicant?.full_name ?? '—' }}
            </span>
            <span class="text-xs text-blueberry-400 mt-0.5">{{ data.applicant?.email ?? '' }}</span>
          </div>
        </template>
      </Column>

      <!-- Country + Company -->
      <Column header="Destination" style="min-width: 220px">
        <template #body="{ data }">
          <div class="flex flex-col items-start text-left">
            <span class="text-sm font-medium text-blueberry-800 flex items-center gap-1.5">
              <i class="pi pi-globe text-apricot-500 text-xs" />
              {{ data.deployment_country ?? '—' }}
            </span>
            <span class="text-xs text-blueberry-500 mt-0.5">
              {{ data.deployment_company ?? '' }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Position -->
      <Column header="Position" style="width: 140px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-600">
            {{ data.deployment_position ?? '—' }}
          </span>
        </template>
      </Column>

      <!-- Deployed Date -->
      <Column field="deployed_at" header="Deployed" sortable style="width: 130px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-700">
            {{ formatDate(data.deployed_at) }}
          </span>
        </template>
      </Column>

      <!-- Contract -->
      <Column header="Contract" style="width: 120px">
        <template #body="{ data }">
          <span class="text-xs text-blueberry-600">
            {{ contractPeriod(data) }}
          </span>
        </template>
      </Column>

      <!-- Salary -->
      <Column header="Salary" style="width: 140px">
        <template #body="{ data }">
          <span class="text-sm font-medium text-blueberry-700 tabular-nums">
            {{ formatSalary(data.monthly_salary, data.salary_currency) }}
          </span>
        </template>
      </Column>

      <!-- Status -->
      <Column header="Status" style="width: 120px">
        <template #body="{ data }">
          <DeploymentStatusBadge
            :status="data.status"
            :cancelled-at="data.cancelled_at"
          />
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 150px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-eye"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View Applicant'"
              :disabled="isRowLoading(data.id)"
              @click="data.applicant_id && goToApplicant(data.applicant_id)"
            />

            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Edit Deployment'"
              :disabled="isRowLoading(data.id)"
              @click="emit('edit', data)"
            />

            <Button
              icon="pi pi-times-circle"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-red-500 hover:!bg-red-50"
              v-tooltip.top="'Cancel Deployment'"
              :disabled="isRowLoading(data.id)"
              @click="emit('cancel', data)"
            />
          </div>
        </template>
      </Column>

      <!-- Empty -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-send text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No deployments yet</p>
          <p class="text-xs text-blueberry-400">Deploy applicants from Final List to see them here</p>
        </div>
      </template>

      <!-- Loading -->
      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading deployments...</p>
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
  </div>
</template>