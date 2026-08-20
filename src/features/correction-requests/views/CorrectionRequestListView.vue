<!-- src/features/correction-requests/views/CorrectionRequestListView.vue -->
<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from 'primevue/confirmdialog'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'

import { useCorrectionRequests } from '../composables/useCorrectionRequests'
import { useCorrectionRequestForm } from '../composables/useCorrectionRequestForm'
import { useCorrectionRequestActions } from '../composables/useCorrectionRequestActions'

import CorrectionRequestTable from '../components/CorrectionRequestTable.vue'
import CorrectionRequestFilters from '../components/CorrectionRequestFilters.vue'
import CorrectionRequestCreateDialog from '../components/CorrectionRequestCreateDialog.vue'
import CorrectionRequestDetailPanel from '../components/CorrectionRequestDetailPanel.vue'
import type { CorrectionRequest } from '../types'

const router = useRouter()

const { store, params, load, onPage, onSearch, onFilter, onSort } =
  useCorrectionRequests()

const form = useCorrectionRequestForm()
const actions = useCorrectionRequestActions(() => load())

onMounted(() => load())
onActivated(() => load())

// ─── Computed Stats ───────────────────────────────────
const totalCount = computed(() => store.total ?? 0)

const pendingCount = computed(
  () => store.records.filter((r) => r.status === 'pending').length,
)
const underReviewCount = computed(
  () => store.records.filter((r) => r.status === 'under_review').length,
)
const approvedCount = computed(
  () => store.records.filter((r) => r.status === 'approved').length,
)
const completedCount = computed(
  () => store.records.filter((r) => r.status === 'completed').length,
)
const rejectedCount = computed(
  () => store.records.filter((r) => r.status === 'rejected').length,
)

// ─── Handlers ─────────────────────────────────────────
function handleView(record: CorrectionRequest) {
  router.push({
    name: 'correction-requests.show',
    params: { id: record.id },
  })
}

async function handleSubmit() {
  const ok = await form.submit()
  if (ok) await load()
}

function onResetFilters() {
  load({ status: undefined, severity: undefined })
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
    <ConfirmDialog />

    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Correction Requests
        </h1>
        <p class="text-sm text-blueberry-500">
          Manage document correction workflows
        </p>
      </div>

      <AppButton
        label="New Request"
        icon="pi pi-plus"
        variant="accent"
        @click="form.openCreate()"
      />
    </header>

    <!-- ─── Stats Cards ───────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <AppStatCard
        label="Total Requests"
        :value="totalCount"
        icon="pi pi-file-edit"
        variant="blueberry"
      />
      <AppStatCard
        label="Pending"
        :value="pendingCount"
        icon="pi pi-hourglass"
        variant="citrus"
      />
      <AppStatCard
        label="Under Review"
        :value="underReviewCount"
        icon="pi pi-clock"
        variant="apricot"
      />
      <AppStatCard
        label="Approved"
        :value="approvedCount"
        icon="pi pi-verified"
        variant="green"
      />
      <AppStatCard
        label="Completed"
        :value="completedCount"
        icon="pi pi-check-circle"
        variant="green"
      />
    </div>

    <!-- ─── Filters ────────────────────────────────── -->
    <AppCard
      :padding="'small'"
      :shadow="'none'"
      class="!bg-transparent !border-appleCore-200/60"
    >
      <CorrectionRequestFilters
        @filter="onFilter"
        @reset="onResetFilters"
      />
    </AppCard>

    <!-- ─── Table ──────────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <CorrectionRequestTable
        :records="store.records"
        :total="store.total"
        :loading="store.loading"
        :submitting="store.submitting"
        :rows="params.limit ?? 10"
        :offset="params.offset ?? 0"
        @page="onPage"
        @sort="onSort"
        @view="handleView"
        @edit="form.openEdit"
        @approve="actions.openApprove"
        @reject="actions.openReject"
        @complete="actions.openComplete"
        @cancel="actions.openCancel"
        @delete="actions.confirmDelete"
      />
    </AppCard>

    <!-- ─── Create / Edit Dialog ─────────────────── -->
    <CorrectionRequestCreateDialog
      v-model:visible="form.visible.value"
      :edit-target="form.editTarget.value"
      :form="form.form"
      :submitting="store.submitting"
      @submit="handleSubmit"
    />

    <!-- ─── Action Dialogs ───────────────────────── -->
    <CorrectionRequestDetailPanel
      :record="actions.actionTarget.value"
      :approve-visible="actions.approveDialog.value"
      :reject-visible="actions.rejectDialog.value"
      :complete-visible="actions.completeDialog.value"
      :cancel-visible="actions.cancelDialog.value"
      :approve-notes="actions.actionNotes.value"
      :reject-reason="actions.actionReason.value"
      :complete-notes="actions.actionNotes.value"
      :cancel-reason="actions.actionReason.value"
      :submitting="store.submitting"
      @update:approve-visible="actions.approveDialog.value = $event"
      @update:reject-visible="actions.rejectDialog.value = $event"
      @update:complete-visible="actions.completeDialog.value = $event"
      @update:cancel-visible="actions.cancelDialog.value = $event"
      @update:approve-notes="actions.actionNotes.value = $event"
      @update:reject-reason="actions.actionReason.value = $event"
      @update:complete-notes="actions.actionNotes.value = $event"
      @update:cancel-reason="actions.actionReason.value = $event"
      @approve="actions.submitApprove"
      @reject="actions.submitReject"
      @complete="actions.submitComplete"
      @cancel="actions.submitCancel"
    />
  </div>
</template>