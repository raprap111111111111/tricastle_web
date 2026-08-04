<!-- src/features/correction-approvals/views/CorrectionApprovalDetailView.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { AppCard } from '@shared/ui'

import { useCorrectionApprovalStore } from '../stores/correction-approval.store'
import { useCorrectionApprovalActions } from '../composables/useCorrectionApprovalActions'

import CorrectionApprovalStatusBadge from '../components/CorrectionApprovalStatusBadge.vue'
import CorrectionApprovalLevelBadge from '../components/CorrectionApprovalLevelBadge.vue'
import CorrectionApprovalDetailPanel from '../components/CorrectionApprovalDetailPanel.vue'

const route = useRoute()
const router = useRouter()
const store = useCorrectionApprovalStore()

const id = computed(() => Number(route.params.id))

const actions = useCorrectionApprovalActions(async () => {
  await store.fetchApproval(id.value)
})

onMounted(() => store.fetchApproval(id.value))

function formatDateTime(s: string | null | undefined) {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function back() {
  router.push({ name: 'correction-approvals.index' })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1200px] mx-auto">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="back"
          v-tooltip.right="'Back'"
        />
        <div>
          <h1 class="text-2xl font-serif font-semibold text-blueberry-800">
            Approval #{{ id }}
          </h1>
          <p class="text-sm text-blueberry-500">
            Correction request review details
          </p>
        </div>
      </div>

      <div v-if="store.current" class="flex gap-2">
        <Button
          v-if="store.current.decision === 'pending'"
          label="Approve"
          icon="pi pi-check"
          severity="success"
          @click="actions.openApprove(store.current)"
        />
        <Button
          v-if="store.current.decision === 'pending'"
          label="Reject"
          icon="pi pi-times"
          severity="danger"
          outlined
          @click="actions.openReject(store.current)"
        />
        <Button
          v-if="store.current.decision === 'pending'"
          label="Escalate"
          icon="pi pi-arrow-up-right"
          severity="info"
          outlined
          @click="actions.openEscalate(store.current)"
        />
      </div>
    </header>

    <div v-if="store.loading" class="flex items-center justify-center py-16">
      <i class="pi pi-spin pi-spinner text-3xl text-apricot-500" />
    </div>

    <div v-else-if="store.current" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main info -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <AppCard title="Approval Information" :padding="'normal'">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-semibold text-blueberry-400 uppercase">Status</p>
              <div class="mt-1">
                <CorrectionApprovalStatusBadge :decision="store.current.decision" />
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-blueberry-400 uppercase">Level</p>
              <div class="mt-1">
                <CorrectionApprovalLevelBadge :level="store.current.approval_level" />
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-blueberry-400 uppercase">Decided At</p>
              <p class="text-sm text-blueberry-800 mt-1">
                {{ formatDateTime(store.current.decided_at) }}
              </p>
            </div>
            <div>
              <p class="text-xs font-semibold text-blueberry-400 uppercase">Created</p>
              <p class="text-sm text-blueberry-800 mt-1">
                {{ formatDateTime(store.current.created_at) }}
              </p>
            </div>
          </div>
        </AppCard>

        <AppCard title="Comments" :padding="'normal'">
          <p v-if="store.current.comments" class="text-sm text-blueberry-800 whitespace-pre-line">
            {{ store.current.comments }}
          </p>
          <p v-else class="text-sm text-blueberry-300 italic">No comments yet</p>
        </AppCard>

        <AppCard
          v-if="store.current.conditions && store.current.conditions.length"
          title="Conditions"
          :padding="'normal'"
        >
          <ul class="flex flex-col gap-2">
            <li
              v-for="(c, i) in store.current.conditions"
              :key="i"
              class="flex items-start gap-2 text-sm text-blueberry-800"
            >
              <i class="pi pi-check-circle text-emerald-500 mt-0.5" />
              {{ c }}
            </li>
          </ul>
        </AppCard>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col gap-4">
        <AppCard title="Correction Request" :padding="'normal'">
          <div v-if="store.current.correction_request" class="flex flex-col gap-2">
            <div>
              <p class="text-xs font-semibold text-blueberry-400 uppercase">Code</p>
              <p class="font-mono text-sm text-apricot-600 font-semibold mt-1">
                {{ store.current.correction_request.request_code }}
              </p>
            </div>
            <div>
              <p class="text-xs font-semibold text-blueberry-400 uppercase">Description</p>
              <p class="text-sm text-blueberry-800 mt-1">
                {{ store.current.correction_request.description }}
              </p>
            </div>
            <div>
              <p class="text-xs font-semibold text-blueberry-400 uppercase">Status</p>
              <p class="text-sm text-blueberry-800 mt-1">
                {{ store.current.correction_request.status }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-blueberry-300">No request attached</p>
        </AppCard>

        <AppCard title="Approver" :padding="'normal'">
          <div v-if="store.current.approver" class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-apricot-100 text-apricot-600 flex items-center justify-center"
            >
              <i class="pi pi-user" />
            </div>
            <div>
              <p class="text-sm font-medium text-blueberry-800">
                {{ store.current.approver.name }}
              </p>
              <p class="text-xs text-blueberry-400">{{ store.current.approver.email }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-blueberry-300">Unassigned</p>
        </AppCard>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-16 gap-3">
      <i class="pi pi-exclamation-circle text-3xl text-blueberry-300" />
      <p class="text-sm text-blueberry-500">Approval not found</p>
      <Button label="Go back" @click="back" />
    </div>

    <CorrectionApprovalDetailPanel
      v-if="store.current"
      :record="store.current"
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