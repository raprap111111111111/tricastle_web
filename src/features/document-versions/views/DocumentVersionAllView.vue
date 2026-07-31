<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ConfirmDialog from 'primevue/confirmdialog'
import DocumentVersionTable from '../components/DocumentVersionTable.vue'
import { useDocumentVersionStore } from '../stores/documentVersion.store'

const store = useDocumentVersionStore()

// ✅ Use store.versions (not allVersions)
const versions   = computed(() => store.versions ?? [])
const pagination = computed(() => store.pagination)
const loading    = computed(() => store.loading)
const submitting = computed(() => store.submitting)

const search = ref('')

// Stats
const totalVersions   = computed(() => pagination.value?.total ?? 0)
const currentVersions = computed(() => versions.value.filter(v => v.is_current).length)
const olderVersions   = computed(() => versions.value.filter(v => !v.is_current).length)
const uniqueDocuments = computed(() => {
  const set = new Set(versions.value.map(v => v.applicant_document_id))
  return set.size
})

onMounted(async () => {
  store.pagination.current_page = 1
  store.pagination.per_page     = 15
  store.filters                 = {}
  await store.fetchVersions()   // ✅ Use fetchVersions (fills store.versions)
})

async function applySearch() {
  store.pagination.current_page = 1
  await store.fetchVersions()
}

async function refresh() {
  search.value = ''
  store.filters = {}
  store.pagination.current_page = 1
  await store.fetchVersions()
}

async function onPageChange(page: number) {
  store.pagination.current_page = page
  await store.fetchVersions()
}

async function onLimitChange(limit: number) {
  store.pagination.per_page     = limit
  store.pagination.current_page = 1
  await store.fetchVersions()
}

async function onDelete(id: number) {
  await store.deleteVersion(id)
  await store.fetchVersions()
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">
    <ConfirmDialog />

    <!-- Title -->
    <div>
      <h1 class="text-4xl font-serif font-bold text-blueberry-800">
        Document Versions
      </h1>
      <p class="text-sm text-blueberry-500 mt-2">
        Track every uploaded revision across all applicant documents 🕐
      </p>
    </div>

    <!-- Info banner -->
    <div class="flex items-start gap-4 p-5 rounded-2xl
                bg-gradient-to-r from-apricot-50 via-apricot-50/80 to-transparent
                border border-apricot-100">
      <div class="w-14 h-14 rounded-2xl bg-apricot-500 text-white
                  flex items-center justify-center flex-shrink-0
                  shadow-sm shadow-apricot-500/30">
        <i class="pi pi-history text-xl" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[11px] font-bold uppercase tracking-widest text-apricot-600 mb-1">
          VERSION HISTORY
        </p>
        <h3 class="text-lg font-serif font-bold text-blueberry-800">
          Every upload is preserved
        </h3>
        <p class="text-sm text-blueberry-500 mt-0.5">
          When users re-upload a document, the previous file is saved as a version — click any row to inspect it.
        </p>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl border border-appleCore-100 p-5 flex items-center justify-between">
        <div>
          <p class="text-sm text-blueberry-500 font-medium">Total Versions</p>
          <p class="text-3xl font-serif font-bold text-blueberry-800 mt-2 tabular-nums">
            {{ totalVersions }}
          </p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-blueberry-100 text-blueberry-600
                    flex items-center justify-center flex-shrink-0">
          <i class="pi pi-database" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-appleCore-100 p-5 flex items-center justify-between">
        <div>
          <p class="text-sm text-blueberry-500 font-medium">Documents Tracked</p>
          <p class="text-3xl font-serif font-bold text-blueberry-800 mt-2 tabular-nums">
            {{ uniqueDocuments }}
          </p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-apricot-100 text-apricot-600
                    flex items-center justify-center flex-shrink-0">
          <i class="pi pi-file" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-appleCore-100 p-5 flex items-center justify-between">
        <div>
          <p class="text-sm text-blueberry-500 font-medium">Current</p>
          <p class="text-3xl font-serif font-bold text-blueberry-800 mt-2 tabular-nums">
            {{ currentVersions }}
          </p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600
                    flex items-center justify-center flex-shrink-0">
          <i class="pi pi-check-circle" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-appleCore-100 p-5 flex items-center justify-between">
        <div>
          <p class="text-sm text-blueberry-500 font-medium">Older Versions</p>
          <p class="text-3xl font-serif font-bold text-blueberry-800 mt-2 tabular-nums">
            {{ olderVersions }}
          </p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-citrus-100 text-yellow-600
                    flex items-center justify-center flex-shrink-0">
          <i class="pi pi-clock" />
        </div>
      </div>
    </div>

    <!-- Search bar -->
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2
                  text-blueberry-400 text-sm z-10" />
        <InputText
          v-model="search"
          placeholder="Search file name or change reason..."
          class="w-full !pl-11 !py-3 !rounded-2xl !border-appleCore-100 !bg-white !text-sm"
          @keyup.enter="applySearch"
        />
      </div>

      <Button
        icon="pi pi-search"
        class="!bg-apricot-500 !border-apricot-500 !text-white
               hover:!bg-apricot-600 hover:!border-apricot-600
               !w-12 !h-12 !rounded-2xl"
        v-tooltip.top="'Search'"
        @click="applySearch"
      />

      <Button
        icon="pi pi-refresh"
        class="!bg-white !border-appleCore-100 !text-blueberry-500
               hover:!bg-appleCore-50 hover:!text-apricot-600
               !w-12 !h-12 !rounded-2xl"
        v-tooltip.top="'Refresh'"
        @click="refresh"
      />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-appleCore-100 overflow-hidden">
      <DocumentVersionTable
        :versions="versions"
        :pagination="pagination"
        :loading="loading"
        :submitting="submitting"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
        @delete="onDelete"
      />
    </div>
  </div>
</template>