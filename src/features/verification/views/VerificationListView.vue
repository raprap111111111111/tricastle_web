<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { AppCard, AppStatCard } from '@shared/ui'
import { useVerificationStore } from '../stores/verification.store'
import VerificationDataTable from '../components/VerificationDataTable.vue'
import VerificationFilters from '../components/VerificationFilters.vue'
import type { VerificationFilters as IFilters } from '../types'

const store = useVerificationStore()

onMounted(() => store.fetchVerifications())
onActivated(() => store.fetchVerifications())

const totalCount = computed(() => store.pagination?.total ?? 0)
const pendingCount = computed(
  () => store.verifications.filter((v) => v.status === 'pending').length,
)
const inProgressCount = computed(
  () => store.verifications.filter((v) => v.status === 'in_progress').length,
)
const completedCount = computed(
  () => store.verifications.filter((v) => v.status === 'completed').length,
)
const approvedCount = computed(
  () => store.verifications.filter((v) => v.status === 'approved').length,
)
const rejectedCount = computed(
  () => store.verifications.filter((v) => v.status === 'rejected').length,
)

function onFilter(filters: Partial<IFilters>) {
  store.setFilters(filters)
  store.fetchVerifications()
}

function onReset() {
  store.resetFilters()
  store.fetchVerifications()
}

function onPageChange(page: number) {
  store.setPage(page)
  store.fetchVerifications()
}

function onLimitChange(limit: number) {
  store.setLimit(limit)
  store.fetchVerifications()
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">
    <!-- Header -->
    <header class="flex flex-col gap-1">
      <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
        Document Verifications
      </h1>
      <p class="text-sm text-blueberry-500">
        Review, verify, and approve submitted documents
      </p>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <AppStatCard
        label="Total"
        :value="totalCount"
        icon="pi pi-file"
        variant="blueberry"
      />
      <AppStatCard
        label="Pending"
        :value="pendingCount"
        icon="pi pi-clock"
        variant="citrus"
      />
      <AppStatCard
        label="In Progress"
        :value="inProgressCount"
        icon="pi pi-spin pi-spinner"
        variant="blueberry"
      />
      <AppStatCard
        label="Completed"
        :value="completedCount"
        icon="pi pi-check"
        variant="green"
      />
      <AppStatCard
        label="Approved"
        :value="approvedCount"
        icon="pi pi-verified"
        variant="green"
      />
      <AppStatCard
        label="Rejected"
        :value="rejectedCount"
        icon="pi pi-times-circle"
        variant="apricot"
      />
    </div>

    <!-- Filters -->
    <AppCard
      :padding="'small'"
      :shadow="'none'"
      class="!bg-transparent !border-appleCore-200/60"
    >
      <VerificationFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <!-- Table -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <VerificationDataTable
        :verifications="store.verifications"
        :pagination="store.pagination"
        :loading="store.loading"
        :submitting="store.submitting"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
      />
    </AppCard>
  </div>
</template>