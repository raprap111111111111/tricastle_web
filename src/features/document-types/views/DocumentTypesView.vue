<!-- src/features/document-types/views/DocumentTypesView.vue -->
<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useDocumentTypes } from '../composables/useDocumentTypes'
import { useDocumentTypeStore } from '@features/document-types/stores/documentType.store'

import DocumentTypeTable from '../components/DocumentTypeTable.vue'
import DocumentTypeFilters from '../components/DocumentTypeFilters.vue'
import DocumentTypeDeleteDialog from '../components/DocumentTypeDeleteDialog.vue'
import type { DocumentType, DocumentTypeFilters as IFilters } from '../types'

const router = useRouter()
const store  = useDocumentTypeStore()

// ✅ Dialog state + handlers now come from composable
const {
  handleDelete,
  confirmDelete,
  cancelDelete,
  deleteDialogOpen,
  selectedType,
  handleToggle,
} = useDocumentTypes()

onMounted(() => store.fetchTypes())
onActivated(() => store.fetchTypes())

// ─── Stats ─────────────────────────────────────────
const totalCount    = computed(() => store.pagination?.total ?? 0)
const activeCount   = computed(() => store.types.filter((t) => t.is_active).length)
const primaryCount  = computed(() => store.types.filter((t) => t.category === 'primary').length)
const requiredCount = computed(() => store.types.filter((t) => t.is_required).length)

// ─── Handlers ─────────────────────────────────────
function onFilter(filters: Partial<IFilters>) {
  store.setFilters(filters)
  store.fetchTypes()
}
function onReset() {
  store.resetFilters()
  store.fetchTypes()
}
function onPageChange(page: number) {
  store.setPage(page)
  store.fetchTypes()
}
function onLimitChange(limit: number) {
  store.setLimit(limit)
  store.fetchTypes()
}

// ✅ Now receives ID from table, finds the full type object, opens dialog
function onDelete(id: number) {
  const t = store.types.find((x) => x.id === id)
  if (t) handleDelete(t)
}

async function onToggle(payload: { id: number; is_active: boolean; name: string }) {
  await handleToggle(payload.id, payload.is_active, payload.name)
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">

    <!-- ── Header ────────────────────────────────────────── -->
    <header class="flex items-start justify-between gap-6 flex-wrap">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Document Types
        </h1>
        <p class="text-sm text-blueberry-500">
          Manage document categories, validation rules, and expiry policies
        </p>
      </div>

      <AppButton
        label="New Document Type"
        icon="pi pi-plus"
        variant="accent"
        @click="router.push({ name: 'document-types.create' })"
      />
    </header>

    <!-- ── Stats ─────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total Types" :value="totalCount"    icon="pi pi-tag"                variant="blueberry" />
      <AppStatCard label="Active"      :value="activeCount"   icon="pi pi-check-circle"       variant="green" />
      <AppStatCard label="Primary"     :value="primaryCount"  icon="pi pi-star"               variant="apricot" />
      <AppStatCard label="Required"    :value="requiredCount" icon="pi pi-exclamation-circle" variant="citrus" />
    </div>

    <!-- ── Filters ───────────────────────────────────────── -->
    <AppCard padding="small" shadow="none" class="!bg-transparent !border-appleCore-200/60">
      <DocumentTypeFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <!-- ── Table ─────────────────────────────────────────── -->
    <AppCard padding="none" shadow="soft">
      <DocumentTypeTable
        :types="store.types"
        :pagination="store.pagination"
        :loading="store.loading"
        :submitting="store.submitting"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
        @delete="onDelete"
        @toggle="onToggle"
      />
    </AppCard>

    <!-- ✅ Hold-to-delete dialog -->
    <DocumentTypeDeleteDialog
      v-model:visible="deleteDialogOpen"
      :type="selectedType"
      :loading="store.submitting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

  </div>
</template>