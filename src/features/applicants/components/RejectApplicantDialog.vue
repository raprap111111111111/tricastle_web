<!-- src/features/applicants/components/RejectApplicantDialog.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import type { Applicant } from '../types'

const props = defineProps<{
  visible: boolean
  applicant: Applicant | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'confirm', reason: string): void
}>()

const reason = ref('')
const error  = ref('')

watch(
  () => props.visible,
  (v) => {
    if (v) {
      reason.value = ''
      error.value = ''
    }
  },
)

function submit() {
  if (!reason.value.trim() || reason.value.trim().length < 5) {
    error.value = 'Please provide a valid reason (min 5 chars)'
    return
  }
  emit('confirm', reason.value.trim())
}

function close() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="!loading"
    :draggable="false"
    :style="{ width: '500px' }"
    header="Reject Applicant"
    @update:visible="close"
  >
    <div class="flex flex-col gap-4">
      <div v-if="applicant" class="p-3 bg-red-50 rounded-lg border border-red-200">
        <p class="text-sm text-red-800">
          You are about to reject
          <strong>
            {{ applicant.first_name }} {{ applicant.last_name }}
          </strong>
          ({{ applicant.applicant_code }}).
        </p>
        <p class="text-xs text-red-600 mt-1">
          This will move the applicant to <strong>rejected</strong> status.
        </p>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-blueberry-800">
          Rejection Reason <span class="text-red-500">*</span>
        </label>
        <Textarea
          v-model="reason"
          rows="4"
          placeholder="Explain why this applicant is being rejected..."
          :disabled="loading"
          class="w-full"
        />
        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          text
          severity="secondary"
          :disabled="loading"
          @click="close"
        />
        <Button
          label="Reject Applicant"
          icon="pi pi-times-circle"
          severity="danger"
          :loading="loading"
          @click="submit"
        />
      </div>
    </template>
  </Dialog>
</template>