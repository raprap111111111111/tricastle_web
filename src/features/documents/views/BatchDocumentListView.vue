<!-- src/features/documents/views/BatchDocumentListView.vue -->
<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { AppCard, AppStatCard } from '@shared/ui'
import { useDocumentStore } from '../stores/document.store'
import BatchDocumentTable   from '../components/BatchDocumentTable.vue'
import BatchDocumentFilters from '../components/BatchDocumentFilters.vue'

const store = useDocumentStore()

onMounted(() => store.fetchBatches())
onActivated(() => store.fetchBatches())

// ─── Computed stats ────────────────────────────────────────────────────────
const totalBatches      = computed(() => store.batches.length)
const totalApplicants   = computed(() =>
  store.batches.reduce((sum, b) => sum + (b.applicants_with_docs_count ?? 0), 0),
)
const batchesWithPending = computed(() =>
  store.batches.filter((b) => b.has_pending).length,
)
const batchesComplete   = computed(() =>
  store.batches.filter((b) => !b.has_pending).length,
)

// ─── Handlers ──────────────────────────────────────────────────────────────
function onFilter({ search }: { search: string }) {
  store.fetchBatches(search || undefined)
}

function onReset() {
  store.fetchBatches()
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Header ───────────────────────────────────────── -->
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Document Batches
        </h1>
        <p class="text-sm text-blueberry-500">
          Select a batch to view applicant documents 📁
        </p>
      </div>
    </header>

    <!-- ─── Info banner ──────────────────────────────────── -->
    <div
      class="flex items-center gap-4 p-4 bg-gradient-to-r from-apricot-50 to-citrus-50
             border border-apricot-200 rounded-2xl"
    >
      <div class="flex-shrink-0 w-12 h-12 rounded-full bg-apricot-500 text-white
                  flex items-center justify-center">
        <i class="pi pi-folder-open text-lg" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-apricot-700 uppercase font-semibold tracking-wider">
          Batch-First Navigation
        </p>
        <p class="text-lg font-serif font-bold text-blueberry-800">
          Browse documents by training batch
        </p>
        <p class="text-xs text-blueberry-500 mt-0.5">
          Click any batch to see the applicant folders inside
        </p>
      </div>
    </div>

    <!-- ─── Stats ────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        label="Total Batches"
        :value="totalBatches"
        icon="pi pi-briefcase"
        variant="blueberry"
      />
      <AppStatCard
        label="Applicants w/ Docs"
        :value="totalApplicants"
        icon="pi pi-users"
        variant="apricot"
      />
      <AppStatCard
        label="Pending Review"
        :value="batchesWithPending"
        icon="pi pi-clock"
        variant="citrus"
      />
      <AppStatCard
        label="Complete Batches"
        :value="batchesComplete"
        icon="pi pi-check-circle"
        variant="green"
      />
    </div>

    <!-- ─── Filters ──────────────────────────────────────── -->
    <AppCard
      :padding="'small'"
      :shadow="'none'"
      class="!bg-transparent !border-appleCore-200/60"
    >
      <BatchDocumentFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <!-- ─── Table ────────────────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <BatchDocumentTable
        :batches="store.batches"
        :loading="store.batchesLoading"
      />
    </AppCard>

    <!-- ─── Error state ──────────────────────────────────── -->
    <div
      v-if="store.batchesError"
      class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
    >
      <i class="pi pi-exclamation-triangle text-red-500 text-xl" />
      <div class="flex-1">
        <p class="text-sm font-semibold text-red-800">
          {{ store.batchesError }}
        </p>
      </div>
      <button
        class="text-sm text-red-700 hover:text-red-900 font-medium underline"
        @click="store.fetchBatches()"
      >
        Try again
      </button>
    </div>
  </div>
</template>