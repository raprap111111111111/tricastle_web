<!-- src/features/profile-updates/components/ReviewUpdateDialog.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import type { ProfileUpdate } from '../types'

const props = defineProps<{
  visible: boolean
  request: ProfileUpdate | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'approve', id: number): void
  (e: 'decline', id: number, reason: string): void
}>()

const isDeclining = ref(false)
const declineReason = ref('')

// Reset state when dialog opens for a new request
watch(
  () => props.request,
  () => {
    isDeclining.value = false
    declineReason.value = ''
  },
)

function formatKey(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  return String(val)
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function onApprove() {
  if (props.request) emit('approve', props.request.id)
}

function onDeclineConfirm() {
  if (props.request && declineReason.value.trim()) {
    emit('decline', props.request.id, declineReason.value)
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="
      request
        ? `Review Updates: ${request.applicant_name} (${request.applicant_code})`
        : 'Review'
    "
    :style="{ width: '50rem' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="request" class="space-y-4">
      <!-- Status Banner -->
      <div
        v-if="request.status !== 'pending'"
        class="p-3 rounded-md mb-4 bg-gray-50 border border-gray-200 text-sm"
      >
        <p>
          <strong>Status:</strong>
          <span class="capitalize ml-1">{{ request.status }}</span>
          by {{ request.reviewer?.name || 'System' }} on
          {{ formatDate(request.reviewed_at) }}
        </p>
        <p v-if="request.status === 'declined'" class="mt-1 text-red-600">
          <strong>Reason:</strong> {{ request.decline_reason }}
        </p>
      </div>

      <!-- Comparison Table -->
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 font-semibold text-gray-700">Field</th>
              <th class="px-4 py-3 font-semibold text-gray-700">Current Record</th>
              <th class="px-4 py-3 font-semibold text-green-700 bg-green-50/50">
                Proposed Change
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="(newValue, key) in request.proposed_payload"
              :key="String(key)"
            >
              <td class="px-4 py-3 font-medium text-gray-900">
                {{ formatKey(String(key)) }}
              </td>
              <td class="px-4 py-3 text-red-600 line-through bg-red-50/10">
                {{ formatValue(request.current_applicant_data?.[String(key)]) }}
              </td>
              <td class="px-4 py-3 text-green-700 font-medium bg-green-50/30">
                {{ formatValue(newValue) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Decline Input -->
      <div
        v-if="isDeclining"
        class="mt-4 p-4 border border-red-200 bg-red-50 rounded-lg"
      >
        <label class="block text-sm font-medium text-red-900 mb-2">
          Reason for Declining
        </label>
        <Textarea
          v-model="declineReason"
          rows="3"
          class="w-full"
          placeholder="Specify why this update is rejected..."
        />
        <div class="flex justify-end gap-2 mt-3">
          <Button
            label="Cancel"
            class="p-button-text p-button-sm p-button-secondary"
            @click="isDeclining = false"
          />
          <Button
            label="Confirm Decline"
            class="p-button-sm p-button-danger"
            :disabled="!declineReason.trim()"
            :loading="loading"
            @click="onDeclineConfirm"
          />
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <template v-if="request?.status === 'pending' && !isDeclining" #footer>
      <Button
        label="Decline"
        icon="pi pi-times"
        class="p-button-text p-button-danger"
        @click="isDeclining = true"
      />
      <Button
        label="Approve Updates"
        icon="pi pi-check"
        class="!bg-green-600 !border-green-600 hover:!bg-green-700 text-white"
        :loading="loading"
        @click="onApprove"
      />
    </template>
  </Dialog>
</template>