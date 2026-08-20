<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import type { Deployment } from '../types'

const props = defineProps<{
  visible: boolean
  deployment?: Deployment | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', reason: string): void
}>()

const reason = ref('')
const error = ref('')

// Reset when opened
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      reason.value = ''
      error.value = ''
    }
  },
)

function onConfirm() {
  if (!reason.value.trim() || reason.value.trim().length < 10) {
    error.value = 'Please provide a reason (at least 10 characters)'
    return
  }
  emit('confirm', reason.value.trim())
}

function onClose() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :draggable="false"
    :dismissable-mask="false"
    :closable="false"
    :style="{ width: '480px' }"
    :pt="{
      root: { class: 'rounded-2xl overflow-hidden' },
      header: { class: '!p-0' },
      content: { class: '!p-0' },
    }"
  >
    <template #container>
      <div class="bg-white rounded-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center gap-3 p-5 border-b border-appleCore-100">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <i class="pi pi-times-circle text-red-600 text-lg" />
          </div>
          <div class="flex-1">
            <p class="text-base font-semibold text-blueberry-800">Cancel Deployment</p>
            <p v-if="deployment?.applicant" class="text-xs text-blueberry-500">
              {{ deployment.applicant.full_name }}
              <span class="text-apricot-600 font-mono ml-1">({{ deployment.applicant.applicant_code }})</span>
            </p>
          </div>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4">
          <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800 font-medium mb-1">⚠️ This will revert their status</p>
            <p class="text-xs text-red-600">
              The applicant will no longer be marked as deployed. Their status will revert back to "Accepted".
            </p>
          </div>

          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
              Cancellation Reason <span class="text-red-500">*</span>
            </label>
            <Textarea
              v-model="reason"
              rows="4"
              placeholder="Please explain why this deployment is being cancelled..."
              class="w-full"
              :class="{ '!border-red-500': error }"
            />
            <p v-if="error" class="text-[10px] text-red-500 mt-1">{{ error }}</p>
            <p v-else class="text-[10px] text-blueberry-400 mt-1">Minimum 10 characters</p>
          </div>

          <div v-if="deployment?.deployment_country" class="text-xs text-blueberry-500 flex flex-col gap-1 p-3 bg-appleCore-50 rounded-lg">
            <span><strong>Country:</strong> {{ deployment.deployment_country }}</span>
            <span v-if="deployment.deployment_company"><strong>Company:</strong> {{ deployment.deployment_company }}</span>
            <span v-if="deployment.deployed_at"><strong>Deployed on:</strong> {{ new Date(deployment.deployed_at).toLocaleDateString() }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
          <Button label="Keep Deployed" severity="secondary" text @click="onClose" />
          <Button
            label="Cancel Deployment"
            icon="pi pi-times"
            :loading="submitting"
            class="!bg-red-600 hover:!bg-red-700 !border-red-600"
            @click="onConfirm"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>