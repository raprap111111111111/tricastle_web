<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import { useVerificationDetail } from '../composables/useVerificationDetail';
import { useVerificationTimer } from '../composables/useVerificationTimer';
import DocumentPreview from '../components/DocumentPreview.vue';
import VerificationCompareForm from '../components/VerificationCompareForm.vue';
import VerificationStatusTag from '../components/VerificationStatusTag.vue';
import { formatDuration } from '../utils/normalize';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const id = Number(route.params.id);
const {
  verification,
  loading,
  submitting,
  start,
  complete,
  reject,
} = useVerificationDetail(id);

const { elapsed, start: startTimer, pause: pauseTimer } = useVerificationTimer();

const entered = ref<Record<string, any>>({});
const compareRef = ref<InstanceType<typeof VerificationCompareForm> | null>(null);

const rejectDialog = ref(false);
const rejectReason = ref('');
const rejectNotes = ref('');

const canEdit = computed(() =>
  ['in_progress', 'requires_correction'].includes(verification.value?.status ?? ''),
);

watch(
  verification,
  (v) => {
    if (v?.verification_data) entered.value = { ...v.verification_data };
    if (v?.status === 'in_progress') startTimer();
    else pauseTimer();
  },
  { immediate: true },
);

async function handleStart() {
  try {
    await start();
    startTimer();
    toast.add({ severity: 'success', summary: 'Verification started', life: 3000 });
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Failed to start',
      detail: e?.message,
      life: 4000,
    });
  }
}

async function handleComplete() {
  const summary = compareRef.value?.summary;
  const mismatches = compareRef.value?.detectedMismatches;
  if (!summary) return;

  try {
    await complete({
      verification_data: entered.value,
      match_percentage: summary.match_percentage,
      total_fields: summary.total_fields,
      matched_fields: summary.matched_fields,
      mismatched_fields: summary.mismatched_fields,
      missing_fields: summary.missing_fields,
      mismatches: mismatches ?? [],
      time_spent_seconds: elapsed.value,
    });
    pauseTimer();
    toast.add({
      severity: 'success',
      summary: 'Verification completed',
      life: 3000,
    });
    router.push({ name: 'verification.detail', params: { id } });
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Failed',
      detail: e?.message,
      life: 4000,
    });
  }
}

function openReject() {
  rejectReason.value = '';
  rejectNotes.value = '';
  rejectDialog.value = true;
}

async function submitReject() {
  if (!rejectReason.value.trim()) return;
  try {
    await reject({
      rejection_reason: rejectReason.value,
      notes: rejectNotes.value,
    });
    rejectDialog.value = false;
    toast.add({ severity: 'success', summary: 'Rejected', life: 3000 });
    router.push({ name: 'verification.detail', params: { id } });
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
  <div class="p-6 space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          severity="secondary"
          @click="router.back()"
        />
        <div>
          <h1 class="text-xl font-bold">Verification #{{ id }}</h1>
          <p class="text-sm text-gray-500">
            Compare document with entered data
          </p>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div v-if="verification?.status === 'in_progress'" class="text-sm">
          <i class="pi pi-clock mr-1" />
          <span class="font-mono">{{ formatDuration(elapsed) }}</span>
        </div>
        <VerificationStatusTag v-if="verification" :status="verification.status" />
      </div>
    </div>

    <div v-if="loading" class="text-center py-16">
      <i class="pi pi-spin pi-spinner text-4xl text-gray-400" />
    </div>

    <template v-else-if="verification">
      <!-- Split layout: document + form -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="lg:sticky lg:top-4 lg:self-start">
          <DocumentPreview
            :file-url="verification.document?.file_url"
            :file-name="verification.document?.file_name"
            :mime-type="verification.document?.mime_type"
          />
        </div>

        <div>
          <VerificationCompareForm
            ref="compareRef"
            v-model="entered"
            :source-data="verification.source_data"
            :disabled="!canEdit"
          />
        </div>
      </div>

      <!-- Action bar -->
      <div
        class="sticky bottom-0 bg-white border-t p-4 -mx-6 flex items-center justify-end gap-2 shadow-lg"
      >
        <Button
          v-if="verification.status === 'pending'"
          label="Start Verification"
          icon="pi pi-play"
          :loading="submitting"
          @click="handleStart"
        />
        <Button
          v-if="canEdit"
          label="Reject"
          icon="pi pi-times"
          severity="danger"
          :loading="submitting"
          @click="openReject"
        />
        <Button
          v-if="canEdit"
          label="Complete Verification"
          icon="pi pi-check"
          severity="success"
          :loading="submitting"
          @click="handleComplete"
        />
      </div>
    </template>

    <!-- Reject Dialog -->
    <Dialog
      v-model:visible="rejectDialog"
      header="Reject Verification"
      modal
      :style="{ width: '500px' }"
    >
      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium">Rejection Reason *</label>
          <Textarea v-model="rejectReason" rows="3" class="w-full mt-1" />
        </div>
        <div>
          <label class="text-sm font-medium">Additional Notes</label>
          <Textarea v-model="rejectNotes" rows="2" class="w-full mt-1" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="rejectDialog = false" />
        <Button
          label="Reject"
          severity="danger"
          :loading="submitting"
          :disabled="!rejectReason.trim()"
          @click="submitReject"
        />
      </template>
    </Dialog>
  </div>
</template>