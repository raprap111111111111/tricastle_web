<!-- src/features/documents/views/BatchDocumentListView.vue -->
<script setup lang="ts">
import { onMounted, onActivated, computed, ref } from 'vue'
import { useRouter } from 'vue-router'                      // ✅ ADDED
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Paginator, { type PageState } from 'primevue/paginator'
import { AppCard, AppStatCard } from '@shared/ui'
import { useDocumentStore } from '../stores/document.store'
import BatchDocumentTable from '../components/BatchDocumentTable.vue'

const store  = useDocumentStore()
const router = useRouter()                                   // ✅ ADDED

const search = ref('')
let debounceTimer: ReturnType<typeof setTimeout>

function load() {
  store.setBatchesSearch(search.value.trim())
  store.fetchBatches()
}

onMounted(load)
onActivated(load)

function onSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 300)
}

function onSearchClick() {
  clearTimeout(debounceTimer)
  load()
}

function clearSearch() {
  search.value = ''
  onSearchClick()
}

function onRefresh() {
  search.value = ''
  clearTimeout(debounceTimer)
  load()
}

// ─── Stats ────────────────────────────────────────────────────────────────
const totalBatches       = computed(() => store.batchesPagination.total || store.batches.length)
const totalApplicants    = computed(() =>
  store.batches.reduce((sum, b) => sum + (b.applicants_with_docs_count ?? 0), 0),
)
const batchesWithPending = computed(() => store.batches.filter((b) => b.has_pending).length)
const batchesComplete    = computed(() => store.batches.filter((b) => !b.has_pending).length)

// ─── Pagination ──────────────────────────────────────────────────────────
const pagination = computed(() => store.batchesPagination)

const currentLimit = computed(
  () => pagination.value.per_page ?? pagination.value.limit ?? 15,
)

const currentFirst = computed(() => {
  if (pagination.value.current_page && currentLimit.value) {
    return (pagination.value.current_page - 1) * currentLimit.value
  }
  return pagination.value.offset ?? 0
})

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    store.setBatchesLimit(event.rows)
    store.fetchBatches()
    return
  }
  store.setBatchesPage(event.page + 1)
  store.fetchBatches()
}

// ✅ ADDED — Global upload (user picks batch + applicant)
function goToUpload() {
  router.push({ name: 'documents.create' })
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">

    <!-- Header -->
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Document Batches
        </h1>
        <p class="text-sm text-blueberry-500">
          Select a batch to view applicant documents 📁
        </p>
      </div>

      <!-- ✅ Global upload button -->
      <Button
        icon="pi pi-upload"
        label="Upload Document"
        class="!bg-apricot-500 !border-apricot-500 !text-white
               hover:!bg-apricot-600 hover:!border-apricot-600
               !px-5 !py-2.5 !rounded-xl !font-semibold"
        @click="goToUpload"
      />
    </header>

    <!-- Info banner -->
    <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-apricot-50 to-citrus-50
                border border-apricot-200 rounded-2xl">
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

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total Batches"      :value="totalBatches"       icon="pi pi-briefcase"    variant="blueberry" />
      <AppStatCard label="Applicants w/ Docs" :value="totalApplicants"    icon="pi pi-users"        variant="apricot" />
      <AppStatCard label="Pending Review"     :value="batchesWithPending" icon="pi pi-clock"        variant="citrus" />
      <AppStatCard label="Complete Batches"   :value="batchesComplete"    icon="pi pi-check-circle" variant="green" />
    </div>

    <!-- Search bar -->
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2
                  text-blueberry-400 text-sm pointer-events-none z-10" />
        <InputText
          v-model="search"
          placeholder="Search batch name or code…"
          class="w-full !pl-10 !pr-10"
          @input="onSearch"
          @keyup.enter="onSearchClick"
        />
        <button
          v-if="search"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-blueberry-400
                 hover:text-blueberry-600 transition-colors z-10"
          @click="clearSearch"
        >
          <i class="pi pi-times text-xs" />
        </button>
      </div>

      <Button
        icon="pi pi-search"
        class="!bg-apricot-500 !border-apricot-500 hover:!bg-apricot-600 hover:!border-apricot-600 !text-white"
        @click="onSearchClick"
      />

      <Button
        icon="pi pi-refresh"
        outlined
        class="!border-blueberry-200 !text-blueberry-500 hover:!bg-blueberry-50"
        @click="onRefresh"
      />
    </div>

    <!-- Table -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <BatchDocumentTable :batches="store.batches" :loading="store.batchesLoading" />

      <!-- Pagination -->
      <div v-if="pagination.total > 0"
           class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3
                  border-t border-appleCore-100 bg-appleCore-50/30">
        <div class="text-xs text-blueberry-500">
          Showing
          <span class="font-semibold text-blueberry-700">
            {{ pagination.from || currentFirst + 1 }}
          </span>
          to
          <span class="font-semibold text-blueberry-700">
            {{ pagination.to || Math.min(currentFirst + currentLimit, pagination.total) }}
          </span>
          of
          <span class="font-semibold text-blueberry-700">{{ pagination.total }}</span>
        </div>

        <Paginator
          :rows="currentLimit"
          :total-records="pagination.total"
          :first="currentFirst"
          :rows-per-page-options="[15, 25, 50, 100]"
          template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
          class="!bg-transparent !p-0"
          @page="onPageChange"
        />
      </div>
    </AppCard>

    <!-- Error state -->
    <div v-if="store.batchesError"
         class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
      <i class="pi pi-exclamation-triangle text-red-500 text-xl" />
      <div class="flex-1">
        <p class="text-sm font-semibold text-red-800">
          {{ store.batchesError }}
        </p>
      </div>
      <button class="text-sm text-red-700 hover:text-red-900 font-medium underline" @click="load">
        Try again
      </button>
    </div>
  </div>
</template>