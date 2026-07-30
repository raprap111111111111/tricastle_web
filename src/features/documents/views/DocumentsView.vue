<!-- src/features/documents/views/DocumentsView.vue -->
<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useDocumentStore } from '../stores/document.store'
import ApplicantFolderTable from '../components/ApplicantFolderTable.vue'
import type { ApplicantFolderSummary } from '../types/folders'

const router = useRouter()
const store = useDocumentStore()

onMounted(() => store.fetchFolders())

// ─── Store bindings ─────────────────────────────────────────────────────────
const folders = computed<ApplicantFolderSummary[]>(() => store.folders)
const pagination = computed(() => store.foldersPagination)
const loading = computed(() => store.foldersLoading)

// ─── Stats ─────────────────────────────────────────────────────────────────
const totalFolders = computed(() => pagination.value.total)
const totalDocuments = computed(() =>
  folders.value.reduce((s, f) => s + (f.total_documents ?? 0), 0),
)
const totalTypes = computed(() =>
  folders.value.reduce((s, f) => s + (f.total_types ?? 0), 0),
)
const pendingFolders = computed(() =>
  folders.value.filter((f) => f.has_pending).length,
)

// ─── Search ────────────────────────────────────────────────────────────────
const searchInput = ref('')
let debounce: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(() => {
    store.setFoldersSearch(searchInput.value.trim())
    store.fetchFolders()
  }, 300)
}

function onSearchClick() {
  if (debounce) clearTimeout(debounce)
  store.setFoldersSearch(searchInput.value.trim())
  store.fetchFolders()
}

function onReset() {
  searchInput.value = ''
  store.resetFoldersFilters()
  store.fetchFolders()
}

// ─── Table pagination ──────────────────────────────────────────────────────
function onPageChange(page: number) {
  store.setFoldersPage(page)
  store.fetchFolders()
}

function onLimitChange(limit: number) {
  store.setFoldersLimit(limit)
  store.fetchFolders()
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">

    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <header class="flex items-start justify-between gap-6 flex-wrap">
      <div>
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Documents
        </h1>
        <p class="text-sm text-blueberry-500 mt-1">
          Click an applicant row to view their documents & version history
        </p>
      </div>

      <AppButton label="Upload Document" icon="pi pi-upload" variant="accent"
        @click="router.push({ name: 'documents.create' })" />
    </header>

    <!-- ── Stats ───────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Applicant Folders" :value="totalFolders" icon="pi pi-folder" variant="blueberry" />
      <AppStatCard label="Documents on Page" :value="totalDocuments" icon="pi pi-file" variant="apricot" />
      <AppStatCard label="Types on Page" :value="totalTypes" icon="pi pi-tag" variant="citrus" />
      <AppStatCard label="Pending Review" :value="pendingFolders" icon="pi pi-clock" variant="green" />
    </div>

    <!-- ── Search ──────────────────────────────────────────────────────── -->
    <AppCard padding="small" shadow="none" class="!bg-transparent !border-appleCore-200/60">
      <div class="flex items-center gap-3">

        <!-- Search input — NO @input handler -->
        <div class="relative flex-1">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2
               text-blueberry-400 text-sm pointer-events-none z-10" />
          <InputText v-model="searchInput" placeholder="Search by name, code, or email…" class="w-full !pl-10 !h-11"
            @keyup.enter="onSearchClick" />
        </div>

        <!-- Orange Search Button -->
        <Button icon="pi pi-search" class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500
             !text-white !w-11 !h-11 flex-shrink-0" v-tooltip.top="'Search'" @click="onSearchClick" />

        <!-- Reset Button -->
        <Button label="Reset" icon="pi pi-refresh" text
          class="!text-blueberry-500 hover:!text-apricot-600 !h-11 flex-shrink-0" @click="onReset" />
      </div>
    </AppCard>

    <!-- ── Table ───────────────────────────────────────────────────────── -->
    <AppCard padding="none">
      <ApplicantFolderTable :folders="folders" :pagination="pagination" :loading="loading" @page-change="onPageChange"
        @limit-change="onLimitChange" />
    </AppCard>

  </div>
</template>