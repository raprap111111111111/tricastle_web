<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useApplicants } from '../composables/useApplicants'
import { useApplicantStore } from '../stores/applicant.store'
import { usePubNub } from '@shared/pubnub/usePubNub'
import { PubNubChannels } from '@shared/pubnub/channels'
import ApplicantTable from '../components/ApplicantTable.vue'
import ApplicantFilters from '../components/ApplicantFilters.vue'
import type { ApplicantFilters as IFilters } from '../types'

const router = useRouter()
const toast  = useToast()
const store  = useApplicantStore()
const { handleDelete } = useApplicants()

// ─── Load applicants excluding final_list and rejected ─────
async function loadInProgress() {
  store.setFilters({
    exclude_statuses: 'final_list,rejected',
  })
  await store.fetchApplicants()
}

onMounted(loadInProgress)
onActivated(loadInProgress)

// ─── 📡 PubNub Real-time Updates ──────────────────────
usePubNub([PubNubChannels.APPLICANTS], (msg) => {
  console.log('📩 PubNub message received:', msg)

  switch (msg.event) {
    case 'applicant.status_changed':
      handleStatusChange(msg.payload)
      break

    case 'applicant.created':
      handleNewApplicant(msg.payload)
      break

    case 'applicant.deleted':
      handleDeletedApplicant(msg.payload)
      break
  }
})

function handleStatusChange(payload: any) {
  const readableStatus = String(payload.new_status).replace(/_/g, ' ')

  toast.add({
    severity: 'info',
    summary: '📌 Applicant Updated',
    detail: `${payload.name} → ${readableStatus}`,
    life: 4000,
  })

  // Refresh list so removed applicants disappear
  loadInProgress()
}

function handleNewApplicant(payload: any) {
  toast.add({
    severity: 'success',
    summary: '👤 New Applicant',
    detail: `${payload.name} was just added by another staff`,
    life: 4000,
  })
  loadInProgress()
}

function handleDeletedApplicant(payload: any) {
  toast.add({
    severity: 'warn',
    summary: '🗑️ Applicant Removed',
    detail: `${payload.name} was deleted`,
    life: 3000,
  })
  loadInProgress()
}

// ─── Stats ────────────────────────────────────────────
const totalCount = computed(() => store.pagination?.total ?? 0)

const pendingCount = computed(
  () => store.applicants.filter((a) => a.status === 'pending').length,
)

const reviewCount = computed(
  () => store.applicants.filter((a) => a.status === 'under_review').length,
)

const verifiedCount = computed(
  () => store.applicants.filter((a) => a.status === 'verified').length,
)

// ─── Handlers ─────────────────────────────────────────
function onFilter(filters: Partial<IFilters>) {
  // Always keep exclude_statuses active
  store.setFilters({
    ...filters,
    exclude_statuses: 'final_list,rejected',
  })
  store.fetchApplicants()
}

function onReset() {
  loadInProgress()
}

function onPageChange(page: number) {
  store.setPage(page)
  store.fetchApplicants()
}

function onLimitChange(limit: number) {
  store.setLimit(limit)
  store.fetchApplicants()
}

async function onDelete(id: number) {
  await handleDelete(id)
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
            Applicants
          </h1>
          <!-- Live indicator -->
          <span
            class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50
                   text-green-700 rounded-full text-xs font-medium ring-1 ring-green-200"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full
                       bg-green-400 opacity-75"
              />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live
          </span>
        </div>
        <p class="text-sm text-blueberry-500">
          Applicants currently in the review process
        </p>
      </div>

      <AppButton
        label="New Applicant"
        icon="pi pi-plus"
        variant="accent"
        @click="router.push({ name: 'applicants.create' })"
      />
    </header>

    <!-- ─── Info Banner ────────────────────────────── -->
    <div
      class="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border
             border-blue-200 rounded-lg text-sm text-blue-700"
    >
      <i class="pi pi-info-circle text-blue-500" />
      Approved applicants are moved to the
      <strong class="mx-1">Final List</strong>
      and are no longer shown here.
    </div>

    <!-- ─── Stats Cards ───────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        label="In Progress"
        :value="totalCount"
        icon="pi pi-users"
        variant="blueberry"
      />
      <AppStatCard
        label="Pending"
        :value="pendingCount"
        icon="pi pi-hourglass"
        variant="apricot"
      />
      <AppStatCard
        label="Under Review"
        :value="reviewCount"
        icon="pi pi-clock"
        variant="citrus"
      />
      <AppStatCard
        label="Verified"
        :value="verifiedCount"
        icon="pi pi-check"
        variant="green"
      />
    </div>

    <!-- ─── Filters ────────────────────────────────── -->
    <AppCard
      :padding="'small'"
      :shadow="'none'"
      class="!bg-transparent !border-appleCore-200/60"
    >
      <ApplicantFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <!-- ─── Table ──────────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <ApplicantTable
        :applicants="store.applicants"
        :pagination="store.pagination"
        :loading="store.loading"
        :submitting="store.submitting"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
        @delete="onDelete"
      />
    </AppCard>
  </div>
</template>