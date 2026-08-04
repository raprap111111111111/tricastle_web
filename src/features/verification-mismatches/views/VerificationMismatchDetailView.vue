<!-- src/features/verification-mismatches/views/VerificationMismatchDetailView.vue -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { AppCard } from '@shared/ui'
import { useVerificationMismatchStore } from '../stores/verification-mismatch.store'
import { useVerificationMismatchActions } from '../composables/useVerificationMismatchActions'

import VerificationMismatchStatusBadge from '../components/VerificationMismatchStatusBadge.vue'
import VerificationMismatchSeverityBadge from '../components/VerificationMismatchSeverityBadge.vue'
import VerificationMismatchDetailPanel from '../components/VerificationMismatchDetailPanel.vue'

const props = defineProps<{ id: number }>()

const router = useRouter()
const store = useVerificationMismatchStore()
const actions = useVerificationMismatchActions(async () => {
  await store.fetchOne(props.id)
})

const record = computed(() => store.current)

onMounted(async () => {
  await store.fetchOne(props.id)
})

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-CA')
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1200px] mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        @click="router.back()"
      />
      <div class="flex-1">
        <h1 class="text-2xl font-serif font-semibold text-blueberry-800">
          Mismatch #{{ id }}
        </h1>
        <p class="text-sm text-blueberry-500">
          Verification mismatch details and resolution
        </p>
      </div>
    </div>

    <div v-if="store.loading" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-3xl text-apricot-500" />
    </div>

    <template v-else-if="record">
      <!-- Overview Card -->
      <AppCard :shadow="'soft'">
        <div class="p-6 flex flex-col gap-6">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p class="text-xs text-blueberry-400 uppercase tracking-wide">
                Field
              </p>
              <h2 class="text-xl font-semibold text-blueberry-800">
                {{ record.field_label }}
              </h2>
              <p class="text-xs text-blueberry-400 font-mono mt-1">
                {{ record.field_name }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <VerificationMismatchSeverityBadge :severity="record.severity" />
              <VerificationMismatchStatusBadge :status="record.status" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="text-xs font-semibold text-blue-700 uppercase mb-1">
                Source Value (Document)
              </p>
              <p class="text-base text-blue-900 break-all">
                {{ record.source_value ?? '—' }}
              </p>
            </div>
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-xs font-semibold text-red-700 uppercase mb-1">
                Entered Value (System)
              </p>
              <p class="text-base text-red-900 break-all">
                {{ record.entered_value ?? '—' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-xs text-blueberry-400 uppercase">Type</p>
              <p class="text-blueberry-800 font-medium capitalize">
                {{ record.mismatch_type.replace(/_/g, ' ') }}
              </p>
            </div>
            <div>
              <p class="text-xs text-blueberry-400 uppercase">Created</p>
              <p class="text-blueberry-800">{{ formatDate(record.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-blueberry-400 uppercase">Resolved</p>
              <p class="text-blueberry-800">{{ formatDate(record.resolved_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-blueberry-400 uppercase">Resolved By</p>
              <p class="text-blueberry-800">{{ record.resolver?.name ?? '—' }}</p>
            </div>
          </div>

          <div v-if="record.resolution_notes" class="border-t pt-4">
            <p class="text-xs text-blueberry-400 uppercase mb-2">
              Resolution Notes
            </p>
            <p class="text-sm text-blueberry-700 whitespace-pre-wrap">
              {{ record.resolution_notes }}
            </p>
          </div>
        </div>
      </AppCard>

      <!-- Actions -->
      <div
        v-if="['open', 'correction_requested', 'escalated'].includes(record.status)"
        class="flex items-center gap-3"
      >
        <Button
          label="Resolve"
          icon="pi pi-check"
          severity="success"
          @click="actions.openResolve(record)"
        />
        <Button
          label="Waive"
          icon="pi pi-ban"
          severity="secondary"
          outlined
          @click="actions.openWaive(record)"
        />
        <Button
          v-if="record.status !== 'escalated'"
          label="Escalate"
          icon="pi pi-arrow-up"
          severity="warn"
          @click="actions.openEscalate(record)"
        />
      </div>
    </template>

    <!-- Action Dialogs -->
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