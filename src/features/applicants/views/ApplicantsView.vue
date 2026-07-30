<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useApplicants } from '../composables/useApplicants'
import { useApplicantStore } from '../stores/applicant.store'
import ApplicantTable from '../components/ApplicantTable.vue'
import ApplicantFilters from '../components/ApplicantFilters.vue'
import type { ApplicantFilters as IFilters } from '../types'

const router = useRouter()
const store  = useApplicantStore()
const { handleDelete } = useApplicants()

onMounted(() => store.fetchApplicants())
onActivated(() => store.fetchApplicants())

// ─── Computed Stats ───────────────────────────────────
const totalCount = computed(() => store.pagination?.total ?? 0)

const verifiedCount = computed(
  () => store.applicants.filter((a) => a.status === 'verified').length,
)

const pendingCount = computed(
  () => store.applicants.filter((a) => a.status === 'pending').length,
)

const reviewCount = computed(
  () => store.applicants.filter((a) => a.status === 'under_review').length,
)

// ─── Handlers ─────────────────────────────────────────
function onFilter(filters: Partial<IFilters>) {
  store.setFilters(filters)
  store.fetchApplicants()
}

function onReset() {
  store.resetFilters()
  store.fetchApplicants()
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
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Applicants
        </h1>
        <p class="text-sm text-blueberry-500">
          Manage and track all applicant records
        </p>
      </div>

      <AppButton
        label="New Applicant"
        icon="pi pi-plus"
        variant="accent"
        @click="router.push({ name: 'applicants.create' })"
      />
    </header>

    <!-- ─── Stats Cards ───────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        label="Total Applicants"
        :value="totalCount"
        icon="pi pi-users"
        variant="blueberry"
      />
      <AppStatCard
        label="Verified"
        :value="verifiedCount"
        icon="pi pi-verified"
        variant="green"
      />
      <AppStatCard
        label="Under Review"
        :value="reviewCount"
        icon="pi pi-clock"
        variant="citrus"
      />
      <AppStatCard
        label="Pending"
        :value="pendingCount"
        icon="pi pi-hourglass"
        variant="apricot"
      />
    </div>

    <!-- ─── Filters ────────────────────────────────── -->
    <AppCard :padding="'small'" :shadow="'none'" class="!bg-transparent !border-appleCore-200/60">
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