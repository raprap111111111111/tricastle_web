<!-- src/features/correction-requests/views/CorrectionRequestDetailView.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import { useCorrectionRequestStore } from '../stores/correction-request.store'
import { useCorrectionRequestActions } from '../composables/useCorrectionRequestActions'
import CorrectionRequestStatusBadge from '../components/CorrectionRequestStatusBadge.vue'
import CorrectionRequestSeverityBadge from '../components/CorrectionRequestSeverityBadge.vue'
import CorrectionRequestEditDialog from '../components/CorrectionRequestEditDialog.vue'
import CorrectionRequestDetailPanel from '../components/CorrectionRequestDetailPanel.vue'

const route = useRoute()
const router = useRouter()
const store = useCorrectionRequestStore()

const editVisible = ref(false)

const actions = useCorrectionRequestActions(async () => {
  await store.fetchOne(Number(route.params.id))
})

onMounted(async () => {
  await store.fetchOne(Number(route.params.id))
})

function fmt(date: string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function fmtDateTime(date: string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const record = store.current
</script>

<template>
  <div class="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
    <!-- Back + Actions -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <Button
        icon="pi pi-arrow-left"
        label="Back"
        size="small"
        text
        severity="secondary"
        @click="router.back()"
      />

      <div v-if="store.current" class="flex items-center gap-2">
        <!-- Edit: only pending/under_review -->
        <Button
          v-if="['pending', 'under_review'].includes(store.current.status)"
          label="Edit"
          icon="pi pi-pencil"
          size="small"
          severity="secondary"
          outlined
          @click="editVisible = true"
        />
        <!-- Approve -->
        <Button
          v-if="
            store.current.status === 'under_review' &&
            store.current.requires_approval
          "
          label="Approve"
          icon="pi pi-check"
          size="small"
          severity="success"
          @click="actions.openApprove(store.current)"
        />
        <!-- Reject -->
        <Button
          v-if="
            store.current.status === 'under_review' &&
            store.current.requires_approval
          "
          label="Reject"
          icon="pi pi-times"
          size="small"
          severity="danger"
          @click="actions.openReject(store.current)"
        />
        <!-- Complete -->
        <Button
          v-if="store.current.status === 'approved'"
          label="Mark Complete"
          icon="pi pi-check-circle"
          size="small"
          @click="actions.openComplete(store.current)"
        />
        <!-- Cancel -->
        <Button
          v-if="!['completed', 'cancelled', 'rejected'].includes(store.current.status)"
          label="Cancel"
          icon="pi pi-ban"
          size="small"
          severity="warn"
          outlined
          @click="actions.openCancel(store.current)"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="space-y-3">
      <Skeleton height="6rem" class="rounded-xl" />
      <Skeleton height="12rem" class="rounded-xl" />
      <Skeleton height="8rem" class="rounded-xl" />
    </div>

    <!-- Not found -->
    <div
      v-else-if="!store.current"
      class="flex flex-col items-center justify-center py-20 text-surface-400"
    >
      <i class="pi pi-inbox text-4xl mb-3" />
      <p class="font-medium">Record not found</p>
      <Button
        label="Go back"
        size="small"
        text
        class="mt-3"
        @click="router.back()"
      />
    </div>

    <template v-else>
      <!-- Header Card -->
      <div
        class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-5 space-y-3"
      >
        <div class="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p class="font-mono text-lg font-bold text-primary-600">
              {{ store.current.request_code }}
            </p>
            <p class="text-xs text-surface-400 mt-0.5">
              Created {{ fmtDateTime(store.current.created_at) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <CorrectionRequestSeverityBadge :severity="store.current.severity" />
            <CorrectionRequestStatusBadge :status="store.current.status" />
          </div>
        </div>

        <!-- Flags -->
        <div class="flex flex-wrap gap-2">
          <Tag
            v-if="store.current.requires_approval"
            value="Requires Approval"
            icon="pi pi-shield"
            severity="warn"
            rounded
          />
          <Tag
            v-if="store.current.requires_new_document"
            value="New Document Required"
            icon="pi pi-file"
            severity="info"
            rounded
          />
          <Tag
            v-if="
              store.current.due_date &&
              new Date(store.current.due_date) < new Date()
            "
            value="Overdue"
            icon="pi pi-clock"
            severity="danger"
            rounded
          />
        </div>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Description & Justification -->
        <div
          class="md:col-span-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-5 space-y-4"
        >
          <h2 class="text-sm font-semibold text-surface-700 dark:text-surface-200">
            Details
          </h2>
          <Divider class="!my-2" />

          <div class="space-y-1">
            <p class="text-xs font-medium text-surface-500">Description</p>
            <p class="text-sm text-surface-800 dark:text-surface-100">
              {{ store.current.description }}
            </p>
          </div>

          <div v-if="store.current.justification" class="space-y-1">
            <p class="text-xs font-medium text-surface-500">Justification</p>
            <p class="text-sm text-surface-800 dark:text-surface-100">
              {{ store.current.justification }}
            </p>
          </div>

          <div
            v-if="store.current.fields_to_correct?.length"
            class="space-y-1"
          >
            <p class="text-xs font-medium text-surface-500">Fields to Correct</p>
            <div class="flex flex-wrap gap-1.5">
              <Tag
                v-for="field in store.current.fields_to_correct"
                :key="field"
                :value="field"
                severity="secondary"
                rounded
              />
            </div>
          </div>
        </div>

        <!-- Meta -->
        <div
          class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-5 space-y-3"
        >
          <h2 class="text-sm font-semibold text-surface-700 dark:text-surface-200">
            Info
          </h2>
          <Divider class="!my-2" />
          <dl class="space-y-2.5 text-sm">
            <div class="flex justify-between">
              <dt class="text-xs text-surface-500">Requested By</dt>
              <dd class="text-xs font-medium text-surface-800 dark:text-surface-100">
                {{ store.current.requester?.name ?? `User #${store.current.requested_by}` }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-surface-500">Due Date</dt>
              <dd
                class="text-xs font-medium"
                :class="
                  store.current.due_date &&
                  new Date(store.current.due_date) < new Date()
                    ? 'text-red-500'
                    : 'text-surface-800 dark:text-surface-100'
                "
              >
                {{ fmt(store.current.due_date) }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-surface-500">Document Verification</dt>
              <dd class="text-xs font-medium text-surface-800 dark:text-surface-100">
                #{{ store.current.document_verification_id }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-surface-500">Applicant Document</dt>
              <dd class="text-xs font-medium text-surface-800 dark:text-surface-100">
                #{{ store.current.applicant_document_id }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-xs text-surface-500">Last Updated</dt>
              <dd class="text-xs text-surface-500">
                {{ fmtDateTime(store.current.updated_at) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Correction Data -->
        <div
          v-if="
            store.current.correction_data &&
            Object.keys(store.current.correction_data).length > 0
          "
          class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-5 space-y-3"
        >
          <h2 class="text-sm font-semibold text-surface-700 dark:text-surface-200">
            Correction Data
          </h2>
          <Divider class="!my-2" />
          <dl class="space-y-2.5">
            <div
              v-for="(val, key) in store.current.correction_data"
              :key="key"
              class="flex justify-between"
            >
              <dt class="text-xs text-surface-500 capitalize">
                {{ String(key).replace(/_/g, ' ') }}
              </dt>
              <dd class="text-xs font-medium text-surface-800 dark:text-surface-100">
                {{ val }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </template>

    <!-- Edit Dialog -->
    <CorrectionRequestEditDialog
      v-model:visible="editVisible"
      :record="store.current"
      @updated="(r) => (store.current = r)"
    />

    <!-- Action Dialogs (approve / reject / complete / cancel) -->
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