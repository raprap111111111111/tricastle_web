<script setup lang="ts">
import Timeline from 'primevue/timeline';
import type { VerificationWorkflowStep } from '../types';
import { WORKFLOW_STEP_LABELS } from '../constants/verification.constants';
import { formatDateTime } from '../utils/normalize';

defineProps<{ steps: VerificationWorkflowStep[] }>();

const statusColor: Record<string, string> = {
  completed: 'bg-green-500',
  in_progress: 'bg-blue-500',
  pending: 'bg-gray-300',
  failed: 'bg-red-500',
  skipped: 'bg-gray-400',
};
</script>

<template>
  <div class="p-4 bg-white border rounded-lg">
    <h3 class="font-semibold mb-4">Workflow Timeline</h3>
    <div v-if="!steps.length" class="text-sm text-gray-500 text-center py-4">
      No workflow steps recorded yet
    </div>
    <Timeline v-else :value="steps" align="left" class="custom-timeline">
      <template #marker="{ item }">
        <span
          :class="[
            'w-3 h-3 rounded-full inline-block',
            statusColor[(item as VerificationWorkflowStep).status] || 'bg-gray-300',
          ]"
        />
      </template>
      <template #content="{ item }">
        <div class="pb-4">
          <p class="font-medium text-sm">
            {{ WORKFLOW_STEP_LABELS[(item as VerificationWorkflowStep).step] }}
          </p>
          <p class="text-xs text-gray-500">
            {{ formatDateTime((item as VerificationWorkflowStep).completed_at ?? (item as VerificationWorkflowStep).started_at) }}
          </p>
          <p
            v-if="(item as VerificationWorkflowStep).notes"
            class="text-xs mt-1 text-gray-600"
          >
            {{ (item as VerificationWorkflowStep).notes }}
          </p>
        </div>
      </template>
    </Timeline>
  </div>
</template>