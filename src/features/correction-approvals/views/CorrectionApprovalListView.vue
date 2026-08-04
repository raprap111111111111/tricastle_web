<!-- src/features/correction-approvals/views/CorrectionApprovalListView.vue -->
<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from 'primevue/confirmdialog'
import { AppCard, AppStatCard } from '@shared/ui'

import { useCorrectionApprovals } from '../composables/useCorrectionApprovals'
import { useCorrectionApprovalActions } from '../composables/useCorrectionApprovalActions'

import CorrectionApprovalTable from '../components/CorrectionApprovalTable.vue'
import CorrectionApprovalFilters from '../components/CorrectionApprovalFilters.vue'
import CorrectionApprovalDetailPanel from '../components/CorrectionApprovalDetailPanel.vue'
import type { CorrectionApproval } from '../types'

const router = useRouter()

const { store, params, load, onPage, onFilter, onSort } = useCorrectionApprovals()

const actions = useCorrectionApprovalActions(() => load())

onMounted(() => load())
onActivated(() => load())

// ─── Computed Stats ───────────────────────────────────
const totalCount = computed(() => store.total ?? 0)
const pendingCount = computed(() => store.pendingCount)
const approvedCount = computed(() => store.approvedCount)
const rejectedCount = computed(() => store.rejectedCount)
const escalatedCount = computed(() => store.escalatedCount)

function handleView(record: CorrectionApproval) {
  router.push({
    name: 'correction-approvals.show',
    params: { id: record.id },
  })
}

function handleReset() {
  load({
    decision: undefined,
    approval_level: undefined,
    pending_only: undefined,
  })
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
    <ConfirmDialog />

    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex flex-col gap-1">
      <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
        Correction Approvals
      </h1>
      <p class="text-sm text-blueberry-500">
        Review and approve correction requests requiring supervisor or admin sign-off
      </p>
    </header>

    <!-- ─── Stats Cards ───────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <AppStatCard
        label="Total"
        :value="totalCount"
        icon="pi pi-file-check"
        variant="blueberry"
      />
      <AppStatCard
        label="Pending"
        :value="pendingCount"
        icon="pi pi-clock"
        variant="citrus"
      />
      <AppStatCard
        label="Approved"
        :value="approvedCount"
        icon="pi pi-verified"
        variant="green"
      />
      <AppStatCard
        label="Rejected"
        :value="rejectedCount"
        icon="pi pi-times-circle"
        variant="apricot"
      />
      <AppStatCard
        label="Escalated"
        :value="escalatedCount"
        icon="pi pi-arrow-up-right"
        variant="blueberry"
      />
    </div>

    <!-- ─── Filters ────────────────────────────────── -->
    <AppCard
      :padding="'small'"
      :shadow="'none'"
      class="!bg-transparent !border-appleCore-200/60"
    >
      <CorrectionApprovalFilters @filter="onFilter" @reset="handleReset" />
    </AppCard>

    <!-- ─── Table ──────────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <CorrectionApprovalTable
        :records="store.records"
        :total="store.total"
        :loading="store.loading"
        :submitting="store.submitting"
        :rows="params.limit ?? 10"
        :offset="params.offset ?? 0"
        @page="onPage"
        @sort="onSort"
        @view="handleView"
        @approve="actions.openApprove"
        @reject="actions.openReject"
        @escalate="actions.openEscalate"
        @delete="actions.confirmDelete"
      />
    </AppCard>

    <!-- ─── Action Dialogs ───────────────────────── -->
    <CorrectionApprovalDetailPanel
      :record="actions.actionTarget.value"
      :approve-visible="actions.approveDialog.value"
      :reject-visible="actions.rejectDialog.value"
      :escalate-visible="actions.escalateDialog.value"
      :comments="actions.comments.value"
      :reason="actions.reason.value"
      :conditions="actions.conditions.value"
      :submitting="store.submitting"
      @update:approve-visible="actions.approveDialog.value = $event"
      @update:reject-visible="actions.rejectDialog.value = $event"
      @update:escalate-visible="actions.escalateDialog.value = $event"
      @update:comments="actions.comments.value = $event"
      @update:reason="actions.reason.value = $event"
      @update:conditions="actions.conditions.value = $event"
      @approve="actions.submitApprove"
      @reject="actions.submitReject"
      @escalate="actions.submitEscalate"
    />
  </div>
</template>