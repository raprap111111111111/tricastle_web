<!-- src/features/correction-requests/views/CorrectionRequestListView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import ConfirmDialog from 'primevue/confirmdialog'
import { useRouter } from 'vue-router'      

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

// ── Fix: navigate to detail view instead of just setting store.current ──
// src/features/correction-requests/views/CorrectionRequestListView.vue
// ─── SCRIPT SECTION ───────────────────────────────────────

// ADD this import at the top
      // ← ADD




// ✅ NEW
function handleView(record: CorrectionRequest) {
  router.push({
    name: 'correction-requests.show',
    params: { id: record.id },
  })
}

// ── Fix: TS error — extract to a named async function ──────────────────
async function handleSubmit() {
  const ok = await form.submit()
  if (ok) await load()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 md:p-6">
    <ConfirmDialog />

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-lg font-semibold text-surface-800 dark:text-surface-100">
          Correction Requests
        </h1>
        <p class="text-xs text-surface-400 mt-0.5">
          Manage document correction workflows
        </p>
      </div>
      <Button
        label="New Request"
        icon="pi pi-plus"
        size="small"
        @click="form.openCreate()"
      />
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <IconField class="flex-1 min-w-48">
        <InputIcon class="pi pi-search" />
        <InputText
          placeholder="Search requests..."
          class="w-full"
          size="small"
          @input="onSearch(($event.target as HTMLInputElement).value)"
        />
      </IconField>
      <CorrectionRequestFilters
        @filter="onFilter"
        @reset="load({ status: undefined, severity: undefined })"
      />
    </div>

    <!-- Table -->
    <div
      class="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden"
    >
      <CorrectionRequestTable
        :records="store.records"
        :total="store.total"
        :loading="store.loading"
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
    </div>

    <!-- Create / Edit Dialog -->
    <CorrectionRequestCreateDialog
      v-model:visible="form.visible.value"
      :edit-target="form.editTarget.value"
      :form="form.form"
      :submitting="store.submitting"
      @submit="handleSubmit"
    />

    <!-- Action Dialogs -->
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