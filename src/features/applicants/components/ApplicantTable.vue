<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import Menu from 'primevue/menu'
import Popover from 'primevue/popover'
import ApplicantStatusBadge from './ApplicantStatusBadge.vue'
import ApplicantDeleteDialog from './ApplicantDeleteDialog.vue'
import RejectApplicantDialog from './RejectApplicantDialog.vue'
import DeployButton from '@features/deployments/components/DeployButton.vue'
import { useApplicantStore } from '../stores/applicant.store'
import type { Applicant, Pagination } from '../types'

const props = defineProps<{
  applicants: Applicant[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
  selectable?: boolean
  selectedIds?: number[]
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'delete', id: number): void
  (e: 'update:selectedIds', ids: number[]): void
}>()

const router  = useRouter()
const toast   = useToast()
const confirm = useConfirm()
const store   = useApplicantStore()

const deleteDialog       = ref(false)
const rejectDialog       = ref(false)
const selectedApplicant  = ref<Applicant | null>(null)

// ─── 🚀 Deployment popover ─────────────────────────────
const deploymentPopover = ref<InstanceType<typeof Popover> | null>(null)
const hoveredApplicant  = ref<Applicant | null>(null)

function showDeploymentPopover(event: Event, applicant: Applicant) {
  hoveredApplicant.value = applicant
  deploymentPopover.value?.show(event)
}

function hideDeploymentPopover() {
  deploymentPopover.value?.hide()
}

// Get deployments from applicant's batches (sorted most recent first)
function getApplicantDeployments(applicant: Applicant): any[] {
  if (!applicant.applicant_batches) return []
  return (applicant.applicant_batches as any[])
    .filter((ab) => ab.deployment_country || ab.deployed_at)
    .sort((a, b) => {
      const da = new Date(a.deployed_at ?? 0).getTime()
      const db = new Date(b.deployed_at ?? 0).getTime()
      return db - da
    })
}

// Latest deployment for badge display
function getLatestDeployment(applicant: Applicant): any | null {
  const deployments = getApplicantDeployments(applicant)
  return deployments[0] ?? null
}

// Count deployments
function deploymentCount(applicant: Applicant): number {
  return getApplicantDeployments(applicant).length
}

// Country flag emoji
function countryFlag(country?: string | null): string {
  const flags: Record<string, string> = {
    Japan: '🇯🇵',
    Korea: '🇰🇷',
    'South Korea': '🇰🇷',
    Taiwan: '🇹🇼',
    Singapore: '🇸🇬',
    'Saudi Arabia': '🇸🇦',
    UAE: '🇦🇪',
    Qatar: '🇶🇦',
    Kuwait: '🇰🇼',
    Canada: '🇨🇦',
    USA: '🇺🇸',
    'United States': '🇺🇸',
    Australia: '🇦🇺',
    'Hong Kong': '🇭🇰',
    Malaysia: '🇲🇾',
    Philippines: '🇵🇭',
  }
  return flags[country ?? ''] ?? '🌍'
}

function formatDeploymentDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

// ─── Selection support ─────────────────────────────
const selectedRows = computed<Applicant[]>({
  get() {
    if (!props.selectedIds) return []
    return props.applicants.filter((a) => props.selectedIds!.includes(a.id))
  },
  set(rows) {
    emit('update:selectedIds', rows.map((r) => r.id))
  },
})

// ─── Per-row loading tracker ─────────────────────────
const loadingIds = ref<Set<number>>(new Set())

function isRowLoading(id: number): boolean {
  return loadingIds.value.has(id)
}

function setRowLoading(id: number, loading: boolean) {
  const next = new Set(loadingIds.value)
  if (loading) {
    next.add(id)
  } else {
    next.delete(id)
  }
  loadingIds.value = next
}

// ─── Row menu ────────────────────────────────────────
const menuRefs = ref<Record<number, InstanceType<typeof Menu> | null>>({})
const activeApplicant = ref<Applicant | null>(null)

function toggleMenu(event: Event, applicant: Applicant) {
  activeApplicant.value = applicant
  menuRefs.value[applicant.id]?.toggle(event)
}

const menuItems = computed(() => {
  const a = activeApplicant.value
  if (!a) return []

  const items: any[] = [
    { label: 'View Details', icon: 'pi pi-eye',    command: () => goToView(a.id) },
    { label: 'Edit',         icon: 'pi pi-pencil', command: () => goToEdit(a.id) },
    { separator: true },
  ]

  if (a.status !== 'final_list' && a.status !== 'rejected') {
    items.push({
      label: 'Move to Final List',
      icon: 'pi pi-check-circle',
      class: '!text-green-600',
      command: () => handleMoveToFinalList(a),
    })
  }

  if (a.status !== 'rejected') {
    items.push({
      label: 'Reject',
      icon: 'pi pi-times-circle',
      class: '!text-red-600',
      command: () => openRejectDialog(a),
    })
  }

  items.push(
    { separator: true },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      class: '!text-red-600',
      command: () => confirmDelete(a),
    },
  )

  return items
})

// ─── Pagination ──────────────────────────────────────
const currentLimit = computed(
  () => props.pagination?.per_page ?? props.pagination?.limit ?? 10,
)

const currentFirst = computed(() => {
  if (props.pagination?.current_page && currentLimit.value) {
    return (props.pagination.current_page - 1) * currentLimit.value
  }
  return props.pagination?.offset ?? 0
})

// ─── Handlers ────────────────────────────────────────
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

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button, .p-menu, .p-checkbox, .p-popover')) return
  goToView((event.data as Applicant).id)
}

function removeFromList(id: number) {
  const idx = store.applicants.findIndex((a) => a.id === id)
  if (idx !== -1) store.applicants.splice(idx, 1)
}

function onDeployed(applicantId: number) {
  removeFromList(applicantId)
  toast.add({
    severity: 'success',
    summary: '🚀 Deployed',
    detail: 'Applicant is now in the Deployments page',
    life: 4000,
  })
}

// ─── Status Actions ──────────────────────────────────
function handleMoveToFinalList(applicant: Applicant) {
  confirm.require({
    header: 'Move to Final List',
    message: `Move ${applicant.first_name} ${applicant.last_name} to the Final List?`,
    icon: 'pi pi-check-circle',
    acceptLabel: 'Yes, Move',
    rejectLabel: 'Cancel',
    acceptClass: '!bg-green-600 !border-green-600',
    accept: async () => {
      setRowLoading(applicant.id, true)
      try {
        const updated = await store.moveToFinalList(applicant.id)
        const batchName = updated.applicant_batches?.[0]?.batch?.name
        removeFromList(applicant.id)

        toast.add({
          severity: batchName ? 'success' : 'warn',
          summary: 'Moved to Final List',
          detail: batchName
            ? `${applicant.applicant_code} auto-assigned to batch: ${batchName}`
            : `${applicant.applicant_code} is in Final List (no active batch)`,
          life: 4000,
        })
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Failed',
          detail: e?.response?.data?.message ?? 'Could not update status',
          life: 4000,
        })
      } finally {
        setRowLoading(applicant.id, false)
      }
    },
  })
}

function openRejectDialog(applicant: Applicant) {
  selectedApplicant.value = applicant
  rejectDialog.value = true
}

async function onRejectConfirmed(reason: string) {
  if (!selectedApplicant.value) return

  const id   = selectedApplicant.value.id
  const code = selectedApplicant.value.applicant_code

  setRowLoading(id, true)
  try {
    await store.rejectApplicant(id, reason)
    removeFromList(id)

    toast.add({
      severity: 'success',
      summary: 'Applicant Rejected',
      detail: `${code} has been rejected.`,
      life: 3000,
    })
    rejectDialog.value = false
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Failed',
      detail: e?.response?.data?.message ?? 'Could not reject applicant',
      life: 4000,
    })
  } finally {
    setRowLoading(id, false)
  }
}

// ─── Formatters ──────────────────────────────────────
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
      v-model:selection="selectedRows"
      :selection-mode="selectable ? 'multiple' : undefined"
      :data-key="'id'"
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
      <!-- 🎯 Selection checkbox column -->
      <Column
        v-if="selectable"
        selection-mode="multiple"
        header-style="width: 40px"
        :exportable="false"
      />

      <Column field="applicant_code" header="Code" sortable style="width: 150px">
        <template #body="{ data }">
          <span class="font-mono text-xs text-apricot-600 font-semibold">
            {{ data.applicant_code }}
          </span>
        </template>
      </Column>

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

      <!-- 🚀 Deployment Column (replaces Gender) -->
      <Column header="Deployment" style="width: 190px">
        <template #body="{ data }">
          <div
            v-if="getLatestDeployment(data)"
            class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg
                   bg-green-50 ring-1 ring-green-200 cursor-pointer
                   hover:bg-green-100 hover:ring-green-300 transition-all group"
            @mouseenter="showDeploymentPopover($event, data)"
            @mouseleave="hideDeploymentPopover"
            @click.stop
          >
            <span class="text-sm">{{ countryFlag(getLatestDeployment(data)?.deployment_country) }}</span>
            <div class="flex flex-col items-start min-w-0">
              <span class="text-xs font-semibold text-green-700 truncate max-w-[100px]">
                {{ getLatestDeployment(data)?.deployment_country ?? '—' }}
              </span>
              <span class="text-[10px] text-green-600 truncate max-w-[100px]">
                {{ getLatestDeployment(data)?.deployment_company ?? '' }}
              </span>
            </div>
            <span
              v-if="deploymentCount(data) > 1"
              class="text-[9px] font-bold text-white bg-green-600 rounded-full
                     w-4 h-4 flex items-center justify-center flex-shrink-0"
              v-tooltip.top="`${deploymentCount(data)} total deployments`"
            >
              {{ deploymentCount(data) }}
            </span>
            <i class="pi pi-info-circle text-[9px] text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <span v-else class="text-xs text-blueberry-300 italic">
            Not deployed
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

      <Column header="Actions" style="width: 220px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-eye"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View'"
              :disabled="isRowLoading(data.id)"
              @click="goToView(data.id)"
            />

            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Edit'"
              :disabled="isRowLoading(data.id)"
              @click="goToEdit(data.id)"
            />

            <Button
              v-if="data.status !== 'final_list' && data.status !== 'rejected'"
              icon="pi pi-check-circle"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-green-600 hover:!bg-green-50"
              v-tooltip.top="'Move to Final List'"
              :loading="isRowLoading(data.id)"
              @click="handleMoveToFinalList(data)"
            />

            <!-- 🚀 DEPLOY BUTTON -->
            <DeployButton
              v-if="data.status === 'final_list' && data.applicant_batches?.[0]?.id"
              :applicant-batch-id="data.applicant_batches[0].id"
              :applicant-name="`${data.first_name} ${data.last_name}`"
              :applicant-code="data.applicant_code"
              @deployed="onDeployed(data.id)"
            />

            <Button
              v-if="data.status !== 'rejected'"
              icon="pi pi-times-circle"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-red-500 hover:!bg-red-50"
              v-tooltip.top="'Reject'"
              :disabled="isRowLoading(data.id)"
              @click="openRejectDialog(data)"
            />

            <Button
              icon="pi pi-ellipsis-v"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blueberry-800 hover:!bg-appleCore-100"
              v-tooltip.top="'More'"
              :disabled="isRowLoading(data.id)"
              @click="toggleMenu($event, data)"
            />
            <Menu
              :ref="(el: any) => (menuRefs[data.id] = el)"
              :model="menuItems"
              :popup="true"
              :append-to="'body'"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-inbox text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No applicants in review</p>
          <p class="text-xs text-blueberry-400">All applicants have been processed</p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading applicants...</p>
        </div>
      </template>
    </DataTable>

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

    <ApplicantDeleteDialog
      v-model:visible="deleteDialog"
      :applicant="selectedApplicant"
      :loading="selectedApplicant ? isRowLoading(selectedApplicant.id) : false"
      @confirm="onDeleteConfirmed"
    />

    <RejectApplicantDialog
      v-model:visible="rejectDialog"
      :applicant="selectedApplicant"
      :loading="selectedApplicant ? isRowLoading(selectedApplicant.id) : false"
      @confirm="onRejectConfirmed"
    />

    <!-- 🚀 Deployment History Popover -->
    <Popover
      ref="deploymentPopover"
      :pt="{
        root: { class: '!p-0 !border !border-appleCore-200 !rounded-xl !shadow-xl' },
        content: { class: '!p-0' },
      }"
    >
      <div v-if="hoveredApplicant" class="w-[380px] max-h-[400px] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-appleCore-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-send text-white text-xs" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-blueberry-800">Deployment History</p>
              <p class="text-[11px] text-blueberry-500 truncate">
                {{ hoveredApplicant.first_name }} {{ hoveredApplicant.last_name }} —
                <span class="font-mono text-apricot-600">{{ hoveredApplicant.applicant_code }}</span>
              </p>
            </div>
            <span class="text-xs font-bold text-green-700 bg-white px-2 py-1 rounded-full ring-1 ring-green-200">
              {{ deploymentCount(hoveredApplicant) }}
            </span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="deploymentCount(hoveredApplicant) > 0" class="relative">
            <!-- Vertical line -->
            <div class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-appleCore-100" />

            <div class="space-y-3">
              <div
                v-for="deployment in getApplicantDeployments(hoveredApplicant)"
                :key="deployment.id"
                class="relative flex gap-3"
              >
                <!-- Dot -->
                <div class="relative z-10 flex-shrink-0">
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center ring-4"
                    :class="deployment.cancelled_at
                      ? 'bg-red-500 ring-red-100'
                      : 'bg-green-500 ring-green-100'"
                  >
                    <i
                      class="pi text-white text-[9px]"
                      :class="deployment.cancelled_at ? 'pi-times' : 'pi-check'"
                    />
                  </div>
                </div>

                <!-- Card -->
                <div class="flex-1 border border-appleCore-100 rounded-lg p-2.5 bg-white">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="text-sm">{{ countryFlag(deployment.deployment_country) }}</span>
                        <p class="text-xs font-semibold text-blueberry-800 truncate">
                          {{ deployment.deployment_country ?? '—' }}
                        </p>
                      </div>
                      <p class="text-[11px] text-blueberry-600 truncate mt-0.5">
                        {{ deployment.deployment_company ?? '—' }}
                        <span v-if="deployment.deployment_position" class="text-blueberry-400">
                          · {{ deployment.deployment_position }}
                        </span>
                      </p>
                    </div>
                    <span
                      class="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      :class="deployment.cancelled_at
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'"
                    >
                      {{ deployment.cancelled_at ? 'CANCELLED' : 'DEPLOYED' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3 mt-1.5 text-[10px] text-blueberry-500 flex-wrap">
                    <span v-if="deployment.deployed_at" class="flex items-center gap-0.5">
                      <i class="pi pi-calendar text-[8px]" />
                      {{ formatDeploymentDate(deployment.deployed_at) }}
                    </span>
                    <span v-if="deployment.monthly_salary" class="flex items-center gap-0.5">
                      <i class="pi pi-dollar text-[8px]" />
                      {{ deployment.salary_currency ?? 'USD' }} {{ deployment.monthly_salary.toLocaleString() }}
                    </span>
                    <span v-if="deployment.contract_duration_months" class="flex items-center gap-0.5">
                      <i class="pi pi-clock text-[8px]" />
                      {{ deployment.contract_duration_months }}mo
                    </span>
                  </div>

                  <p
                    v-if="deployment.cancelled_at && deployment.cancellation_reason"
                    class="mt-1.5 text-[10px] text-red-600 italic"
                  >
                    "{{ deployment.cancellation_reason }}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-6">
            <i class="pi pi-inbox text-2xl text-blueberry-300 mb-2 block" />
            <p class="text-xs text-blueberry-500">No deployments yet</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-2 border-t border-appleCore-100 bg-appleCore-50/50">
          <button
            type="button"
            class="text-[11px] text-apricot-600 hover:text-apricot-700 font-medium
                   flex items-center gap-1 mx-auto"
            @click="hoveredApplicant && (goToView(hoveredApplicant.id), hideDeploymentPopover())"
          >
            <i class="pi pi-external-link text-[9px]" />
            View full applicant profile
          </button>
        </div>
      </div>
    </Popover>
  </div>
</template>