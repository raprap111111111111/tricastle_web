<!-- src/features/deployments/components/DeploymentTable.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import AppPagination from '@shared/ui/table/AppPagination.vue'
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
  (e: 'mark-returned', deployment: Deployment): void
  (e: 'mark-completed', deployment: Deployment): void
}>()

const router = useRouter()

// ─── Per-row loading tracker ──────────────────────────
const loadingIds = ref<Set<number>>(new Set())

function isRowLoading(id: number): boolean {
  return loadingIds.value.has(id)
}

// ─── Helper: is this deployment currently active? ─────
function isActivelyDeployed(deployment: Deployment): boolean {
  const d = deployment as any
  return d.status === 'deployed'
    && !d.cancelled_at
    && !d.returned_at
    && !d.completed_at
}

// ─── Status change menu ──────────────────────────────
const menuRefs = ref<Record<number, InstanceType<typeof Menu> | null>>({})
const activeDeployment = ref<Deployment | null>(null)

function toggleStatusMenu(event: Event, deployment: Deployment) {
  activeDeployment.value = deployment
  menuRefs.value[deployment.id]?.toggle(event)
}

const statusMenuItems = computed(() => {
  const d = activeDeployment.value
  if (!d) return []

  return [
    {
      label: 'Mark as Returned Home',
      icon: 'pi pi-home',
      class: '!text-orange-600',
      command: () => emit('mark-returned', d),
    },
    {
      label: 'Mark as Completed',
      icon: 'pi pi-check-circle',
      class: '!text-blue-600',
      command: () => emit('mark-completed', d),
    },
    { separator: true },
    {
      label: 'Cancel Deployment',
      icon: 'pi pi-times-circle',
      class: '!text-red-600',
      command: () => emit('cancel', d),
    },
  ]
})

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
  <div class="flex flex-col relative">
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
          <DeploymentStatusBadge :status="data.status" :cancelled-at="data.cancelled_at" />
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 100px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <!-- View -->
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

            <!-- Edit -->
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
          </div>
        </template>
      </Column>

      <!-- Update Status Column -->
      <Column header="Update Status" style="width: 140px">
        <template #body="{ data }">
          <div @click.stop>
            <!-- Show dropdown only if actively deployed -->
            <Button
              v-if="isActivelyDeployed(data)"
              size="small"
              outlined
              severity="secondary"
              :disabled="isRowLoading(data.id)"
              class="!text-xs !py-1 !px-2.5 !gap-1.5 hover:!bg-appleCore-50 hover:!border-apricot-300 hover:!text-apricot-600 transition-all"
              @click="toggleStatusMenu($event, data)"
            >
              <template #default>
                <i class="pi pi-refresh text-[10px]" />
                <span class="text-xs font-medium">Change</span>
                <i class="pi pi-chevron-down text-[8px]" />
              </template>
            </Button>

            <!-- Otherwise show final status label -->
            <span v-else class="inline-flex items-center gap-1 text-[10px] text-blueberry-400 italic">
              <i class="pi pi-lock text-[9px]" />
              Locked
            </span>

            <Menu
              :ref="(el: any) => (menuRefs[data.id] = el)"
              :model="statusMenuItems"
              :popup="true"
              :append-to="'body'"
              :pt="{
                root: { class: '!min-w-[240px] !rounded-xl !shadow-lg !border !border-appleCore-200 !overflow-hidden' },
              }"
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

    <!-- 🎯 UNIFIED CUSTOM PAGINATION BAR -->
    <AppPagination
      v-if="props.pagination && props.pagination.total > 0"
      :pagination="props.pagination"
      @page-change="(page) => emit('page-change', page)"
      @limit-change="(limit) => emit('limit-change', limit)"
    />
  </div>
</template>