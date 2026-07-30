<!-- src/features/documents/views/BatchDocumentListView.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button    from 'primevue/button'
import Skeleton  from 'primevue/skeleton'
import { AppCard } from '@shared/ui'
import { useDocumentStore } from '../stores/document.store'
import type { DocumentBatch } from '../types/folders'

const router = useRouter()
const store  = useDocumentStore()

const search = ref('')
let   debounceTimer: ReturnType<typeof setTimeout>

onMounted(() => store.fetchBatches())

function onSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    store.fetchBatches(search.value.trim() || undefined)
  }, 300)
}

function resetSearch() {
  search.value = ''
  store.fetchBatches()
}

function openBatch(batch: DocumentBatch) {
  router.push({
    name:   'documents.folders',
    params: { batchId: batch.id },
  })
}

const batches = computed(() => store.batches)
const loading = computed(() => store.batchesLoading)
const error   = computed(() => store.batchesError)
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1100px] mx-auto">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          Document Batches
        </h1>
        <p class="text-sm text-blueberry-400 mt-0.5">
          Select a batch to view its applicant documents
        </p>
      </div>
    </div>

    <!-- Search -->
    <div class="flex gap-2">
      <span class="p-input-icon-left flex-1">
        <i class="pi pi-search" />
        <InputText
          v-model="search"
          placeholder="Search batches by name or code…"
          class="w-full"
          @input="onSearch"
        />
      </span>
      <Button
        icon="pi pi-refresh"
        label="Reset"
        text
        @click="resetSearch"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3">
      <Skeleton v-for="n in 5" :key="n" height="88px" border-radius="16px" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <i class="pi pi-exclamation-circle text-4xl text-red-400 mb-3 block" />
      <p class="text-red-500">{{ error }}</p>
      <Button
        label="Try again"
        text
        class="mt-4 !text-apricot-600"
        @click="store.fetchBatches()"
      />
    </div>

    <!-- Empty -->
    <div v-else-if="!batches.length" class="text-center py-20">
      <i class="pi pi-inbox text-5xl text-blueberry-200 mb-3 block" />
      <p class="text-blueberry-400 font-medium">
        No batches with documents found
      </p>
    </div>

    <!-- Batch list -->
    <div v-else class="flex flex-col gap-3">
      <AppCard
        v-for="batch in batches"
        :key="batch.id"
        class="cursor-pointer hover:shadow-md transition-all duration-150 group"
        @click="openBatch(batch)"
      >
        <div class="flex items-center gap-4">

          <div class="w-12 h-12 rounded-xl bg-apricot-50 text-apricot-500
                      flex items-center justify-center flex-shrink-0
                      group-hover:bg-apricot-100 transition-colors">
            <i class="pi pi-folder text-xl" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-serif font-bold text-blueberry-800 text-lg leading-tight">
                {{ batch.name }}
              </span>
              <span class="font-mono text-[11px] font-semibold text-apricot-600
                           bg-apricot-50 px-2 py-0.5 rounded">
                {{ batch.code }}
              </span>
              <span
                v-if="batch.has_pending"
                class="text-[10px] font-bold uppercase tracking-wide
                       text-amber-700 bg-amber-50 px-2 py-0.5 rounded"
              >
                Pending
              </span>
            </div>
            <p class="text-sm text-blueberry-400 mt-0.5">
              {{ batch.applicants_with_docs_count }}
              applicant{{ batch.applicants_with_docs_count === 1 ? '' : 's' }}
              with documents
            </p>
          </div>

          <i class="pi pi-chevron-right text-blueberry-300 flex-shrink-0
                    group-hover:text-apricot-400 transition-colors" />
        </div>
      </AppCard>
    </div>
  </div>
</template>