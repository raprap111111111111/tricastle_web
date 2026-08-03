<!-- src/features/file-repository/views/FileRepositoryIndexView.vue -->
<script setup lang="ts">
import { onMounted, onActivated } from 'vue'
import { storeToRefs }         from 'pinia'
import { AppStatCard, AppButton, AppCard } from '@shared/ui'    // ✅ add AppCard
import { useFileRepositoryStore } from '../stores/file-repository.store'
import { useFileRepository }      from '../composables/useFileRepository'
import FileRepositoryFilters      from '../components/FileRepositoryFilters.vue'
import FileRepositoryTable        from '../components/FileRepositoryTable.vue'
import FileRepositoryUploadDialog from '../components/FileRepositoryUploadDialog.vue'
import FileSizeLabel              from '../components/FileSizeLabel.vue'
import type { FileRepositoryFilters as Filters } from '../types'

// ─── Store ────────────────────────────────────────────
const store = useFileRepositoryStore()
const {
  files,
  pagination,
  filters,
  loading,
  submitting,
  uploadProgress,
  totalFiles,
  encryptedCount,
  unusedCount,
  totalSize,
} = storeToRefs(store)

const {
  showUploadDialog,
  openUpload,
  closeAll,
  handleUpload,
  handleDelete,
  handlePurge,
} = useFileRepository()

// ─── Init ─────────────────────────────────────────────
onMounted(()   => store.fetchFiles())
onActivated(() => store.fetchFiles())

// ─── Handlers ─────────────────────────────────────────
function onFilter(incoming: Partial<Filters>) {
  store.setFilters(incoming)
}
function onReset()      { store.resetFilters() }
function onPage(page: number) { store.setPage(page) }
async function onUpload(file: File) { await handleUpload(file) }
async function onDelete(id: number) { await handleDelete(id) }
async function onPurge(id: number)  { await handlePurge(id) }
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">

    <!-- ── Header (matches applicants) ────────────────── -->
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          File Repository
        </h1>
        <p class="text-sm text-blueberry-500">
          Centralized storage ledger — every physical file, tracked once.
        </p>
      </div>

      <AppButton
        label="Upload File"
        icon="pi pi-upload"
        variant="accent"
        @click="openUpload"
      />
    </header>

    <!-- ── Stats Cards ───────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        label="Total Files"
        :value="totalFiles"
        icon="pi pi-folder"
        variant="blueberry"
      />
      <AppStatCard
        label="Encrypted"
        :value="encryptedCount"
        icon="pi pi-lock"
        variant="citrus"
      />
      <AppStatCard
        label="Unused Files"
        :value="unusedCount"
        icon="pi pi-exclamation-circle"
        variant="apricot"
      />
      <!-- Total size custom card -->
      <div class="bg-white rounded-2xl border border-appleCore-200 px-5 py-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-apricot-50 flex items-center justify-center flex-shrink-0">
          <i class="pi pi-database text-apricot-600 text-lg" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-blueberry-400 font-medium uppercase tracking-wide">
            Total Size
          </p>
          <p class="text-xl font-serif font-semibold text-blueberry-800 mt-0.5">
            <FileSizeLabel :bytes="totalSize" :decimals="1" />
          </p>
        </div>
      </div>
    </div>

    <!-- ── Filters (matches applicants style) ───────── -->
    <AppCard :padding="'small'" :shadow="'none'" class="!bg-transparent !border-appleCore-200/60">
      <FileRepositoryFilters
        :model-value="filters"
        @filter="onFilter"
        @reset="onReset"
      />
    </AppCard>

    <!-- ── Table ─────────────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <FileRepositoryTable
        :files="files"
        :pagination="pagination"
        :loading="loading"
        :submitting="submitting"
        @page="onPage"
        @delete="onDelete"
        @purge="onPurge"
      />
    </AppCard>

    <!-- ── Upload dialog ─────────────────────────────── -->
    <FileRepositoryUploadDialog
      v-model:visible="showUploadDialog"
      :submitting="submitting"
      :progress="uploadProgress"
      @upload="onUpload"
      @cancel="closeAll"
    />
  </div>
</template>