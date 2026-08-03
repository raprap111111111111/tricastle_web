<!-- src/features/file-repository/views/FileRepositoryIndexView.vue -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { storeToRefs }         from 'pinia'
import AppStatCard             from '@shared/ui/AppStatCard.vue'
import AppButton               from '@shared/ui/AppButton.vue'
import { useFileRepositoryStore } from '../stores/file-repository.store'
import { useFileRepository }      from '../composables/useFileRepository'
import FileRepositoryFilters      from '../components/FileRepositoryFilters.vue'
import FileRepositoryTable        from '../components/FileRepositoryTable.vue'
import FileRepositoryUploadDialog from '../components/FileRepositoryUploadDialog.vue'
import FileSizeLabel              from '../components/FileSizeLabel.vue'
import type { FileRepositoryFilters as Filters } from '../types'

// ─── Store ────────────────────────────────────────────────────────────
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

// ─── Composable ───────────────────────────────────────────────────────
const {
  showUploadDialog,
  openUpload,
  closeAll,
  handleUpload,
  handleDelete,
  handlePurge,
} = useFileRepository()

// ─── Init ─────────────────────────────────────────────────────────────
onMounted(() => store.fetchFiles())

// ─── Handlers ─────────────────────────────────────────────────────────
function onFilter(incoming: Partial<Filters>) {
  store.setFilters(incoming)
}

function onReset() {
  store.resetFilters()
}

function onPage(page: number) {
  store.setPage(page)
}

async function onUpload(file: File) {
  await handleUpload(file)
}

async function onDelete(id: number) {
  await handleDelete(id)
}

async function onPurge(id: number) {
  await handlePurge(id)
}
</script>

<template>
  <div class="min-h-screen bg-[#faf7f2] p-6 space-y-6">

    <!-- ── Page Header ───────────────────────────────────────────────── -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="font-serif font-semibold text-blueberry-800 text-2xl leading-tight">
          File Repository
        </h1>
        <p class="text-sm text-blueberry-500 mt-1">
          Centralized storage ledger — every physical file, tracked once.
        </p>
      </div>

      <AppButton
        label="Upload File"
        icon="pi pi-upload"
        @click="openUpload"
        class="bg-apricot-500 hover:bg-apricot-600 text-white border-0 rounded-xl px-4 py-2 text-sm font-medium flex-shrink-0"
      />
    </div>

    <!-- ── Stats Row ─────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <AppStatCard
        label="Total Files"
        :value="totalFiles"
        icon="pi pi-folder"
        icon-class="bg-blueberry-50 text-blueberry-500"
      />

      <AppStatCard
        label="Encrypted"
        :value="encryptedCount"
        icon="pi pi-lock"
        icon-class="bg-appleCore-50 text-blueberry-500"
      />

      <AppStatCard
        label="Unused Files"
        :value="unusedCount"
        icon="pi pi-exclamation-circle"
        icon-class="bg-amber-50 text-amber-500"
      />

      <!-- Total size stat with custom value slot -->
      <div
        class="bg-white rounded-2xl border border-appleCore-200 px-5 py-4 flex items-center gap-4"
      >
        <div class="w-10 h-10 rounded-xl bg-apricot-50 flex items-center justify-center flex-shrink-0">
          <i class="pi pi-database text-apricot-600" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-blueberry-400 font-medium uppercase tracking-wide truncate">
            Total Size (page)
          </p>
          <p class="text-xl font-serif font-semibold text-blueberry-800 mt-0.5">
            <FileSizeLabel :bytes="totalSize" :decimals="1" />
          </p>
        </div>
      </div>

    </div>

    <!-- ── Filters ───────────────────────────────────────────────────── -->
    <FileRepositoryFilters
      :model-value="filters"
      @filter="onFilter"
      @reset="onReset"
    />

    <!-- ── Table ─────────────────────────────────────────────────────── -->
    <FileRepositoryTable
      :files="files"
      :pagination="pagination"
      :loading="loading"
      :submitting="submitting"
      @page="onPage"
      @delete="onDelete"
      @purge="onPurge"
    />

    <!-- ── Upload dialog ─────────────────────────────────────────────── -->
    <FileRepositoryUploadDialog
      v-model:visible="showUploadDialog"
      :submitting="submitting"
      :progress="uploadProgress"
      @upload="onUpload"
      @cancel="closeAll"
    />

  </div>
</template>