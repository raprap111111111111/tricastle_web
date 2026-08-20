<!-- src/features/documents/views/DocumentFoldersView.vue -->
<script setup lang="ts">
import { onMounted, onActivated, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Skeleton from 'primevue/skeleton'
import Paginator, { type PageState } from 'primevue/paginator'
import { AppCard } from '@shared/ui'
import { useDocumentStore } from '../stores/document.store'
import type { ApplicantFolderSummary } from '../types/folders'
import { useDocumentRealtime } from '@shared/pubnub/useDocumentRealtime'

// ⚠️ CRITICAL: this view uses batchId (NOT applicantId)
const props = defineProps<{ batchId: number }>()

const router = useRouter()
const store  = useDocumentStore()

const search = ref('')
let debounceTimer: ReturnType<typeof setTimeout>

function load() {
  store.setBatchFilter(props.batchId)
  store.setFoldersSearch(search.value.trim())
  store.fetchFolders()
}

onMounted(load)
onActivated(load)
watch(() => props.batchId, load)

// Listen only to THIS batch's documents (auto-refresh on scan/upload)
useDocumentRealtime({
  onReload: load,
  batchId: props.batchId,
})

function onSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 300)
}
function onSearchClick() { clearTimeout(debounceTimer); load() }
function clearSearch()   { search.value = ''; onSearchClick() }
function onRefresh()     { search.value = ''; clearTimeout(debounceTimer); load() }

const pagination   = computed(() => store.foldersPagination)
const currentLimit = computed(() => pagination.value.per_page ?? pagination.value.limit ?? 15)
const currentFirst = computed(() =>
  pagination.value.current_page && currentLimit.value
    ? (pagination.value.current_page - 1) * currentLimit.value
    : pagination.value.offset ?? 0,
)

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    store.setFoldersLimit(event.rows); store.fetchFolders(); return
  }
  store.setFoldersPage(event.page + 1); store.fetchFolders()
}

function goBack() { router.push({ name: 'documents.batches' }) }

function openFolder(applicant: ApplicantFolderSummary) {
  router.push({
    name:   'documents.folder',
    params: { applicantId: applicant.applicant_id },
    query:  { from_batch: String(props.batchId) },
  })
}

// ✅ Upload with batch preselected (user picks applicant)
function goToUploadForBatch() {
  router.push({
    name:  'documents.create',
    query: { batch_id: String(props.batchId) },
  })
}

// ✅ NEW — Scan with batch preselected
function goToScanForBatch() {
  router.push({
    name:  'documents.scan',
    query: { batch_id: String(props.batchId) },
  })
}

function initials(name: string): string {
  return name.split(' ').map(p => p.charAt(0)).filter(Boolean)
    .slice(0, 2).join('').toUpperCase() || '?'
}
function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString() : '—'
}

const folders = computed(() => store.folders)
const loading = computed(() => store.foldersLoading)
const error   = computed(() => store.foldersError)
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1100px] mx-auto">

    <!-- Breadcrumb -->
    <div class="flex items-center gap-2">
      <Button icon="pi pi-arrow-left" text rounded @click="goBack" />
      <span class="text-sm text-blueberry-500">
        <button class="hover:text-apricot-600 font-medium transition-colors" @click="goBack">
          Document Batches
        </button>
        <span class="text-blueberry-300 mx-1.5">/</span>
        <span class="font-medium text-blueberry-700">Applicants</span>
      </span>
    </div>

    <!-- Header -->
    <div class="flex items-start justify-between gap-6 flex-wrap">
      <div>
        <h2 class="text-xl font-serif font-bold text-blueberry-800">
          Applicant Folders
          <span v-if="pagination.total" class="text-base font-normal text-blueberry-400 ml-1">
            ({{ pagination.total }})
          </span>
        </h2>
        <p class="text-sm text-blueberry-400 mt-0.5">
          Applicants in this batch who have uploaded or scanned documents
        </p>
      </div>

      <!-- ✅ Action buttons — batch is preselected -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <Button
          icon="pi pi-camera"
          label="Scan Document"
          outlined
          class="!border-apricot-500 !text-apricot-600
                 hover:!bg-apricot-50
                 !px-5 !py-2.5 !rounded-xl !font-semibold"
          @click="goToScanForBatch"
        />
        <Button
          icon="pi pi-upload"
          label="Upload Document"
          class="!bg-apricot-500 !border-apricot-500 !text-white
                 hover:!bg-apricot-600 hover:!border-apricot-600
                 !px-5 !py-2.5 !rounded-xl !font-semibold"
          @click="goToUploadForBatch"
        />
      </div>
    </div>

    <!-- Search -->
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2
                  text-blueberry-400 text-sm pointer-events-none z-10" />
        <InputText
          v-model="search"
          placeholder="Search applicants by name, code, or email…"
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

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3">
      <Skeleton v-for="n in 6" :key="n" height="80px" border-radius="16px" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <i class="pi pi-exclamation-circle text-4xl text-red-400 mb-3 block" />
      <p class="text-red-500">{{ error }}</p>
      <Button label="Try again" text class="mt-4 !text-apricot-600" @click="load" />
    </div>

    <!-- ✅ IMPROVED Empty State — explains why + offers actions -->
    <div v-else-if="!folders.length" class="text-center py-16 px-6">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full
                  bg-apricot-50 mb-4">
        <i class="pi pi-folder-open text-3xl text-apricot-400" />
      </div>

      <h3 class="text-lg font-serif font-bold text-blueberry-800 mb-2">
        No documents in this batch yet
      </h3>

      <p class="text-sm text-blueberry-400 max-w-md mx-auto mb-6">
        Scanned or uploaded documents will appear here once they're tagged to
        this batch. Make sure to select this batch before scanning.
      </p>

      <div class="flex items-center justify-center gap-2 flex-wrap">
        <Button
          icon="pi pi-camera"
          label="Scan a document"
          outlined
          class="!border-apricot-500 !text-apricot-600 hover:!bg-apricot-50
                 !px-5 !py-2.5 !rounded-xl !font-semibold"
          @click="goToScanForBatch"
        />
        <Button
          icon="pi pi-upload"
          label="Upload a document"
          class="!bg-apricot-500 !border-apricot-500 !text-white
                 hover:!bg-apricot-600 hover:!border-apricot-600
                 !px-5 !py-2.5 !rounded-xl !font-semibold"
          @click="goToUploadForBatch"
        />
      </div>

      <!-- Diagnostic hint -->
      <div class="mt-8 mx-auto max-w-lg text-left p-4 rounded-xl
                  bg-appleCore-50/60 border border-appleCore-100">
        <p class="text-xs font-bold uppercase tracking-wide text-blueberry-500 mb-1">
          <i class="pi pi-info-circle mr-1" /> Not seeing your scans?
        </p>
        <p class="text-xs text-blueberry-500 leading-relaxed">
          Scanned documents only appear here if they were saved with this
          batch selected. If you scanned from an applicant's profile without
          choosing a batch, the file exists in the applicant's folder but is
          not linked to any batch yet.
        </p>
      </div>
    </div>

    <!-- Folder list -->
    <div v-else class="flex flex-col gap-3">
      <AppCard
        v-for="folder in folders"
        :key="folder.applicant_id"
        class="cursor-pointer hover:shadow-md transition-all duration-150 group"
        @click="openFolder(folder)"
      >
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-apricot-500 text-white
                      flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
            {{ initials(folder.applicant_name) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-blueberry-800">{{ folder.applicant_name }}</span>
              <span class="font-mono text-[11px] font-semibold text-apricot-600 bg-apricot-50 px-1.5 py-0.5 rounded">
                {{ folder.applicant_code }}
              </span>
              <span
                v-if="folder.has_pending"
                class="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded"
              >
                Pending
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-blueberry-400 mt-0.5 flex-wrap">
              <span v-if="folder.applicant_email">{{ folder.applicant_email }}</span>
              <template v-if="folder.applicant_email"><span>·</span></template>
              <span>{{ folder.total_types }} type{{ folder.total_types === 1 ? '' : 's' }}</span>
              <span>·</span>
              <span>{{ folder.total_documents }} file{{ folder.total_documents === 1 ? '' : 's' }}</span>
              <span>·</span>
              <span>Last upload {{ formatDate(folder.latest_upload) }}</span>
            </div>
          </div>
          <i class="pi pi-chevron-right text-blueberry-300 flex-shrink-0
                    group-hover:text-apricot-400 transition-colors" />
        </div>
      </AppCard>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3
             border-t border-appleCore-100 bg-appleCore-50/30 rounded-2xl"
    >
      <div class="text-xs text-blueberry-500">
        Showing
        <span class="font-semibold text-blueberry-700">{{ pagination.from || currentFirst + 1 }}</span>
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
  </div>
</template>