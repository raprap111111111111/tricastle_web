<script setup lang="ts">
import { onMounted, onActivated, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Paginator, { type PageState } from 'primevue/paginator'
import { AppCard, AppStatCard } from '@shared/ui'
import { useApplicantStore } from '../stores/applicant.store.ts'
import ApplicantStatusBadge from '../components/ApplicantStatusBadge.vue'
import type { Applicant } from '../types/index.ts'

const route   = useRoute()
const router  = useRouter()
const toast   = useToast()
const confirm = useConfirm()
const store   = useApplicantStore()

// ─── Per-row loading ────────────────────────────────────
const loadingIds = ref<Set<number>>(new Set())

function isRowLoading(id: number): boolean {
  return loadingIds.value.has(id)
}

function setRowLoading(id: number, loading: boolean) {
  const next = new Set(loadingIds.value)
  loading ? next.add(id) : next.delete(id)
  loadingIds.value = next
}

// ─── Load only REJECTED applicants ─────────────────────
async function loadRejected() {
  store.setFilters({
    search: '',
    status: 'rejected',              // ✅ ONLY rejected
    gender: '',
    civil_status: '',
    nationality: '',
    quality_grade: '',
    assigned_staff_id: '',
    exclude_statuses: '',            // ✅ Clear exclusion
    batch_id: '',
    batch_status: '',
    offset: 0,
    limit: 10,
  } as any)

  await store.fetchApplicants()
}

onMounted(loadRejected)
onActivated(loadRejected)

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/rejected') loadRejected()
  },
)

// ─── Search ─────────────────────────────────────────────
const searchQuery = ref('')

function onSearch() {
  store.setFilters({
    status: 'rejected',
    search: searchQuery.value,
    offset: 0,
  })
  store.fetchApplicants()
}

// ─── Pagination ─────────────────────────────────────────
const currentLimit = computed(
  () => store.pagination?.per_page ?? store.pagination?.limit ?? 10,
)

const currentFirst = computed(() => {
  if (store.pagination?.current_page && currentLimit.value) {
    return (store.pagination.current_page - 1) * currentLimit.value
  }
  return store.pagination?.offset ?? 0
})

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    store.setLimit(event.rows)
  } else {
    store.setPage(event.page + 1)
  }
  store.fetchApplicants()
}

// ─── Actions ────────────────────────────────────────────
function goToView(id: number) {
  router.push({ name: 'applicants.show', params: { id } })
}

/** Restore rejected applicant back to pending */
function handleRestore(applicant: Applicant) {
  confirm.require({
    header: 'Restore Applicant',
    message: `Restore ${applicant.first_name} ${applicant.last_name} back to Pending status?`,
    icon: 'pi pi-refresh',
    acceptLabel: 'Yes, Restore',
    rejectLabel: 'Cancel',
    acceptClass: '!bg-blue-600 !border-blue-600',
    accept: async () => {
      setRowLoading(applicant.id, true)
      try {
        await store.updateStatus(applicant.id, 'pending')
        
        // Remove from Rejected list
        const idx = store.applicants.findIndex((a) => a.id === applicant.id)
        if (idx !== -1) store.applicants.splice(idx, 1)

        toast.add({
          severity: 'success',
          summary: 'Restored',
          detail: `${applicant.applicant_code} is back in the review queue`,
          life: 4000,
        })
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Failed',
          detail: e?.response?.data?.message ?? 'Could not restore applicant',
          life: 4000,
        })
      } finally {
        setRowLoading(applicant.id, false)
      }
    },
  })
}

// ─── Formatters ─────────────────────────────────────────
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

import { ref } from 'vue'
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="router.push({ name: 'applicants.index' })"
        />
        <div>
          <h1 class="text-3xl font-serif font-semibold text-red-700 tracking-tight">
            Rejected Applicants
          </h1>
          <p class="text-sm text-blueberry-500 mt-1">
            Applicants that were rejected. You can restore them if needed.
          </p>
        </div>
      </div>

      <Button
        label="Refresh"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="store.loading"
        @click="loadRejected"
      />
    </header>

    <!-- ─── Stats ──────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AppStatCard
        label="Total Rejected"
        :value="store.pagination?.total ?? 0"
        icon="pi pi-times-circle"
        variant="apricot"
      />
      <div
        class="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-xl"
      >
        <i class="pi pi-info-circle text-red-500 text-2xl" />
        <div>
          <p class="text-sm font-semibold text-red-800">Rejection Reasons</p>
          <p class="text-xs text-red-600 mt-0.5">
            Hover over each row to see the rejection reason
          </p>
        </div>
      </div>
    </div>

    <!-- ─── Search ─────────────────────────────────── -->
    <div class="flex gap-2">
      <div class="relative flex-1">
        <i
          class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2
                 text-blueberry-400 text-sm z-10"
        />
        <InputText
          v-model="searchQuery"
          placeholder="Search by name, email, or code..."
          class="w-full !pl-10"
          @keyup.enter="onSearch"
        />
      </div>
      <Button
        label="Search"
        icon="pi pi-search"
        @click="onSearch"
      />
    </div>

    <!-- ─── Table ──────────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <DataTable
        :value="store.applicants"
        :loading="store.loading"
        class="!border-none"
        size="small"
        :pt="{
          header: '!bg-red-50/50 !text-red-700 !font-semibold !text-xs !uppercase !tracking-wider',
          headerRow: '!bg-red-50/50 !border-b !border-red-100',
          bodyRow: 'hover:!bg-red-50/40 !border-b !border-appleCore-100/60 transition-colors',
        }"
      >
        <Column field="applicant_code" header="Code" style="width: 150px">
          <template #body="{ data }">
            <span class="font-mono text-xs text-red-600 font-semibold">
              {{ data.applicant_code }}
            </span>
          </template>
        </Column>

        <Column header="Applicant">
          <template #body="{ data }">
            <div class="flex flex-col items-start">
              <span class="font-medium text-blueberry-800">
                {{ data.first_name }} {{ data.last_name }}
              </span>
              <span class="text-xs text-blueberry-400">{{ data.email }}</span>
            </div>
          </template>
        </Column>

        <Column header="Rejection Reason">
          <template #body="{ data }">
            <span
              class="text-xs text-red-700 italic"
              v-tooltip.top="data.rejection_reason || 'No reason provided'"
            >
              {{ 
                data.rejection_reason
                  ? (data.rejection_reason.length > 40
                      ? data.rejection_reason.slice(0, 40) + '...'
                      : data.rejection_reason)
                  : '—'
              }}
            </span>
          </template>
        </Column>

        <Column field="rejected_at" header="Rejected On" style="width: 150px">
          <template #body="{ data }">
            <span class="text-sm text-blueberry-600">
              {{ formatDate(data.rejected_at) }}
            </span>
          </template>
        </Column>

        <Column field="status" header="Status" style="width: 120px">
          <template #body="{ data }">
            <ApplicantStatusBadge :status="data.status" />
          </template>
        </Column>

        <Column header="Actions" style="width: 140px">
          <template #body="{ data }">
            <div class="flex items-center gap-1">
              <Button
                icon="pi pi-eye"
                text
                rounded
                size="small"
                class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
                v-tooltip.top="'View Details'"
                :disabled="isRowLoading(data.id)"
                @click="goToView(data.id)"
              />
              <Button
                icon="pi pi-refresh"
                text
                rounded
                size="small"
                class="!text-blueberry-500 hover:!text-green-600 hover:!bg-green-50"
                v-tooltip.top="'Restore to Pending'"
                :loading="isRowLoading(data.id)"
                @click="handleRestore(data)"
              />
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <i class="pi pi-check-circle text-2xl text-green-500" />
            </div>
            <p class="text-sm text-blueberry-600 font-medium">No rejected applicants</p>
            <p class="text-xs text-blueberry-400">Great — nobody has been rejected!</p>
          </div>
        </template>
      </DataTable>

      <!-- Pagination -->
      <div
        v-if="store.pagination && store.pagination.total > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30"
      >
        <div class="text-xs text-blueberry-500">
          Showing
          <span class="font-semibold text-blueberry-700">
            {{ store.pagination.from ?? currentFirst + 1 }}
          </span>
          to
          <span class="font-semibold text-blueberry-700">
            {{ store.pagination.to ?? Math.min(currentFirst + currentLimit, store.pagination.total) }}
          </span>
          of
          <span class="font-semibold text-blueberry-700">{{ store.pagination.total }}</span>
          entries
        </div>

        <Paginator
          :rows="currentLimit"
          :total-records="store.pagination.total"
          :first="currentFirst"
          :rows-per-page-options="[10, 25, 50, 100]"
          template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
          class="!bg-transparent !p-0"
          @page="onPageChange"
        />
      </div>
    </AppCard>
  </div>
</template>