<!-- src/features/verification-mismatches/views/VerificationMismatchListView.vue -->
<script setup lang="ts">
import { onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from 'primevue/confirmdialog'
import { AppCard, AppStatCard } from '@shared/ui'

import { useVerificationMismatches } from '../composables/useVerificationMismatches'
import { useVerificationMismatchActions } from '../composables/useVerificationMismatchActions'

import VerificationMismatchTable from '../components/VerificationMismatchTable.vue'
import VerificationMismatchFilters from '../components/VerificationMismatchFilters.vue'
import VerificationMismatchDetailPanel from '../components/VerificationMismatchDetailPanel.vue'
import type { VerificationMismatch } from '../types'

const router = useRouter()

const { store, params, load, onPage, onFilter, onSort } =
  useVerificationMismatches()

const actions = useVerificationMismatchActions(() => load())

onMounted(() => load())
onActivated(() => load())

function handleView(record: VerificationMismatch) {
  router.push({ name: 'mismatches.show', params: { id: record.id } })
}

function onResetFilters() {
  load({
    severity: undefined,
    status: undefined,
    mismatch_type: undefined,
    unresolved_only: undefined,
    critical_only: undefined,
  })
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
    <ConfirmDialog />

    <!-- ─── Header ─────────────────────────────── -->
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Verification Mismatches
        </h1>
        <p class="text-sm text-blueberry-500">
          Review and resolve data discrepancies from document verifications
        </p>
      </div>
    </header>

    <!-- ─── Stats ──────────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <AppStatCard
        label="Total"
        :value="store.total"
        icon="pi pi-list"
        variant="blueberry"
      />
      <AppStatCard
        label="Open"
        :value="store.openCount"
        icon="pi pi-circle-fill"
        variant="citrus"
      />
      <AppStatCard
        label="Critical"
        :value="store.criticalCount"
        icon="pi pi-exclamation-triangle"
        variant="apricot"
      />
      <AppStatCard
        label="Resolved"
        :value="store.resolvedCount"
        icon="pi pi-check-circle"
        variant="green"
      />
      <AppStatCard
        label="Escalated"
        :value="store.escalatedCount"
        icon="pi pi-arrow-up"
        variant="blueberry"
      />
    </div>

    <!-- ─── Filters ────────────────────────────── -->
    <AppCard
      :padding="'small'"
      :shadow="'none'"
      class="!bg-transparent !border-appleCore-200/60"
    >
      <VerificationMismatchFilters
        @filter="onFilter"
        @reset="onResetFilters"
      />
    </AppCard>

    <!-- ─── Table ──────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <VerificationMismatchTable
        :records="store.records"
        :total="store.total"
        :loading="store.loading"
        :rows="params.limit ?? 10"
        :offset="params.offset ?? 0"
        @page="onPage"
        @sort="onSort"
        @view="handleView"
        @resolve="actions.openResolve"
        @waive="actions.openWaive"
        @escalate="actions.openEscalate"
        @delete="actions.confirmDelete"
      />
    </AppCard>

    <!-- ─── Action Dialogs ─────────────────────── -->
    <VerificationMismatchDetailPanel
      :record="actions.actionTarget.value"
      :resolve-visible="actions.resolveDialog.value"
      :waive-visible="actions.waiveDialog.value"
      :escalate-visible="actions.escalateDialog.value"
      :notes="actions.actionNotes.value"
      :submitting="store.submitting"
      @update:resolve-visible="actions.resolveDialog.value = $event"
      @update:waive-visible="actions.waiveDialog.value = $event"
      @update:escalate-visible="actions.escalateDialog.value = $event"
      @update:notes="actions.actionNotes.value = $event"
      @resolve="actions.submitResolve"
      @waive="actions.submitWaive"
      @escalate="actions.submitEscalate"
    />
  </div>
</template>