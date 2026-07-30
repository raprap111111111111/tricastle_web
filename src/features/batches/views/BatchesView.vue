<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useBatches } from '../composables/useBatches'
import { useBatchStore } from '../stores/batch.store'
import BatchTable from '../components/BatchTable.vue'
import BatchFilters from '../components/BatchFilters.vue'
import type { BatchFilters as IFilters } from '../types'

const router = useRouter()
const store  = useBatchStore()
const { handleDelete, handleActivate, handleDeactivate } = useBatches()

onMounted(async () => {
  await store.fetchBatches()
  await store.fetchActiveBatch()
})
onActivated(async () => {
  await store.fetchBatches()
  await store.fetchActiveBatch()
})

const totalCount     = computed(() => store.pagination?.total ?? 0)
const ongoingCount   = computed(() => store.batches.filter(b => b.status === 'ongoing').length)
const deployedCount  = computed(() => store.batches.filter(b => b.status === 'deployed').length)
const completedCount = computed(() => store.batches.filter(b => b.status === 'completed').length)

function onFilter(filters: Partial<IFilters>) {
  store.setFilters(filters)
  store.fetchBatches()
}
function onReset() {
  store.resetFilters()
  store.fetchBatches()
}
function onPageChange(page: number) {
  store.setPage(page)
  store.fetchBatches()
}
function onLimitChange(limit: number) {
  store.setLimit(limit)
  store.fetchBatches()
}
async function onDelete(id: number) {
  await handleDelete(id)
}
async function onActivate(id: number) {
  await handleActivate(id)
  await store.fetchActiveBatch()
}
async function onDeactivate(id: number) {
  await handleDeactivate(id)
  await store.fetchActiveBatch()
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">

    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Training Batches
        </h1>
        <p class="text-sm text-blueberry-500">
          Groups of approved applicants heading to Japan 🇯🇵
        </p>
      </div>
      <AppButton
        label="New Batch"
        icon="pi pi-plus"
        variant="accent"
        @click="router.push({ name: 'batches.create' })"
      />
    </header>

    <!-- ─── Active Batch Banner ────────────────────────── -->
    <div
      v-if="store.activeBatch"
      class="flex items-center gap-4 p-4 bg-gradient-to-r from-apricot-50 to-citrus-50
             border border-apricot-200 rounded-2xl"
    >
      <div class="flex-shrink-0 w-12 h-12 rounded-full bg-apricot-500 text-white
                  flex items-center justify-center">
        <i class="pi pi-star-fill text-lg" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-apricot-700 uppercase font-semibold tracking-wider">
          Currently Active Batch
        </p>
        <p class="text-lg font-serif font-bold text-blueberry-800 truncate">
          {{ store.activeBatch.name }}
          <span class="text-sm text-blueberry-500 font-sans font-normal ml-2">
            Batch #{{ store.activeBatch.batch_number }}
          </span>
        </p>
        <p class="text-xs text-blueberry-500 mt-0.5">
          New applicants will be automatically added to this batch
        </p>
      </div>
      <AppButton
        label="View"
        icon="pi pi-arrow-right"
        variant="secondary"
        @click="router.push({ name: 'batches.show', params: { id: store.activeBatch.id } })"
      />
    </div>

    <div
      v-else
      class="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl"
    >
      <i class="pi pi-exclamation-triangle text-red-500 text-2xl" />
      <div class="flex-1">
        <p class="text-sm font-semibold text-red-800">No Active Batch</p>
        <p class="text-xs text-red-600 mt-0.5">
          New applicants will not be auto-assigned. Activate a batch to enable automatic assignment.
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total Batches" :value="totalCount" icon="pi pi-briefcase" variant="blueberry" />
      <AppStatCard label="Ongoing" :value="ongoingCount" icon="pi pi-graduation-cap" variant="citrus" />
      <AppStatCard label="Deployed to Japan" :value="deployedCount" icon="pi pi-send" variant="apricot" />
      <AppStatCard label="Completed" :value="completedCount" icon="pi pi-check-circle" variant="green" />
    </div>

    <!-- Filters -->
    <AppCard :padding="'small'" :shadow="'none'" class="!bg-transparent !border-appleCore-200/60">
      <BatchFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <!-- Table -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <BatchTable
        :batches="store.batches"
        :pagination="store.pagination"
        :loading="store.loading"
        :submitting="store.submitting"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
        @delete="onDelete"
        @activate="onActivate"
        @deactivate="onDeactivate"
      />
    </AppCard>
  </div>
</template>