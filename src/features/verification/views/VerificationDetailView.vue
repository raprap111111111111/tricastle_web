<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import { useVerificationDetail } from '../composables/useVerificationDetail';
import VerificationStatusTag from '../components/VerificationStatusTag.vue';
import MismatchList from '../components/MismatchList.vue';
import MismatchActionDialog from '../components/MismatchActionDialog.vue';
import VerificationTimeline from '../components/VerificationTimeline.vue';
import { formatDateTime, formatDuration } from '../utils/normalize';
import type { VerificationMismatch } from '../types';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const id = Number(route.params.id);
const {
  verification,
  mismatches,
  loading,
  submitting,
  mismatchSubmitting,
  approve,
  resolveMismatch,
  waiveMismatch,
  escalateMismatch,
} = useVerificationDetail(id);

const dialog = ref<{
  visible: boolean;
  mode: 'resolve' | 'waive' | 'escalate' | null;
  mismatch: VerificationMismatch | null;
}>({ visible: false, mode: null, mismatch: null });

function openMismatchAction(
  mode: 'resolve' | 'waive' | 'escalate',
  m: VerificationMismatch,
) {
  dialog.value = { visible: true, mode, mismatch: m };
}

async function submitDialog(payload: { notes: string; entered_value?: string }) {
  const { mode, mismatch } = dialog.value;
  if (!mode || !mismatch) return;

  try {
    if (mode === 'resolve') {
      await resolveMismatch(mismatch.id, {
        resolution_notes: payload.notes,
        entered_value: payload.entered_value,
      });
    } else if (mode === 'waive') {
      await waiveMismatch(mismatch.id, payload.notes);
    } else if (mode === 'escalate') {
      await escalateMismatch(mismatch.id, payload.notes);
    }
    dialog.value.visible = false;
    toast.add({
      severity: 'success',
      summary: `Mismatch ${mode}d`,
      life: 3000,
    });
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Failed',
      detail: e?.message,
      life: 4000,
    });
  }
}

async function handleApprove() {
  try {
    await approve();
    toast.add({ severity: 'success', summary: 'Approved', life: 3000 });
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Failed',
      detail: e?.message,
      life: 4000,
    });
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <Button
      icon="pi pi-arrow-left"
      label="Back"
      text
      severity="secondary"
      @click="router.back()"
    />

    <div v-if="loading" class="text-center py-16">
      <i class="pi pi-spin pi-spinner text-4xl text-gray-400" />
    </div>

    <template v-else-if="verification">
      <!-- Summary -->
      <div class="bg-white border rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold">Verification #{{ verification.id }}</h2>
            <p class="text-sm text-gray-500">
              Document ID: {{ verification.applicant_document_id }}
            </p>
          </div>
          <VerificationStatusTag :status="verification.status" />
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-gray-500">Match Percentage</p>
            <div class="flex items-center gap-2 mt-1">
              <ProgressBar
                :value="Number(verification.match_percentage)"
                class="flex-1"
                style="height: 8px"
              />
              <span class="text-sm font-semibold">
                {{ verification.match_percentage }}%
              </span>
            </div>
          </div>
          <div>
            <p class="text-xs text-gray-500">Fields</p>
            <p class="font-semibold">
              {{ verification.matched_fields }} / {{ verification.total_fields }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Time Spent</p>
            <p class="font-semibold">{{ formatDuration(verification.time_spent_seconds) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Completed At</p>
            <p class="font-semibold text-sm">{{ formatDateTime(verification.completed_at) }}</p>
          </div>
        </div>

        <div v-if="verification.notes" class="p-3 bg-gray-50 rounded border">
          <p class="text-xs text-gray-500 mb-1">Notes</p>
          <p class="text-sm">{{ verification.notes }}</p>
        </div>

        <div
          v-if="verification.rejection_reason"
          class="p-3 bg-red-50 border border-red-200 rounded"
        >
          <p class="text-xs text-red-700 font-semibold mb-1">Rejection Reason</p>
          <p class="text-sm text-red-800">{{ verification.rejection_reason }}</p>
        </div>

        <div
          v-if="['completed', 'requires_correction'].includes(verification.status)"
          class="flex justify-end gap-2 pt-3 border-t"
        >
          <Button
            label="Continue Review"
            icon="pi pi-pencil"
            severity="secondary"
            @click="router.push({ name: 'verification.review', params: { id } })"
          />
          <Button
            label="Approve"
            icon="pi pi-verified"
            severity="success"
            :loading="submitting"
            @click="handleApprove"
          />
        </div>
      </div>

      <!-- Content grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white border rounded-lg p-6">
            <h3 class="font-semibold mb-4">
              Mismatches ({{ mismatches.length }})
            </h3>
            <MismatchList
              :mismatches="mismatches"
              @resolve="openMismatchAction('resolve', $event)"
              @waive="openMismatchAction('waive', $event)"
              @escalate="openMismatchAction('escalate', $event)"
            />
          </div>
        </div>

        <div>
          <VerificationTimeline :steps="verification.workflow_steps ?? []" />
        </div>
      </div>
    </template>

    <MismatchActionDialog
      v-model:visible="dialog.visible"
      :mode="dialog.mode"
      :mismatch="dialog.mismatch"
      :submitting="mismatchSubmitting"
      @submit="submitDialog"
    />
  </div>
</template>