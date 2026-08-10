<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'

const props = defineProps<{
  visible: boolean
  applicantName?: string
  applicantCode?: string
  country?: string
  company?: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', reason: string): void
}>()

const reason = ref('')
const errorMsg = ref('')

watch(() => props.visible, (v) => {
  if (v) {
    reason.value = ''
    errorMsg.value = ''
  }
})

function onConfirm() {
  if (!reason.value.trim() || reason.value.trim().length < 3) {
    errorMsg.value = 'Please provide a reason (minimum 3 characters)'
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
    :closable="false"
    :style="{ width: '500px' }"
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
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <i class="pi pi-home text-orange-600 text-lg" />
          </div>
          <div class="flex-1">
            <p class="text-base font-semibold text-blueberry-800">Mark as Returned Home</p>
            <p v-if="applicantName" class="text-xs text-blueberry-500 mt-0.5">
              {{ applicantName }}
              <span v-if="applicantCode" class="text-apricot-600 font-mono">({{ applicantCode }})</span>
            </p>
          </div>
          <button
            type="button"
            class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
            @click="onClose"
          >
            <i class="pi pi-times text-sm" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4">
          <!-- Warning -->
          <div class="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <i class="pi pi-exclamation-triangle text-orange-600 mt-0.5" />
            <div class="flex-1 text-xs text-orange-800">
              <p class="font-semibold mb-1">This action will:</p>
              <ul class="list-disc list-inside space-y-0.5 text-orange-700">
                <li>Mark the deployment as <strong>Returned Home</strong></li>
                <li>Indicate the applicant came home <strong>before contract completion</strong></li>
                <li>Record the return date as <strong>today</strong></li>
              </ul>
              <p v-if="country || company" class="mt-2 text-orange-600">
                Currently deployed to:
                <strong>{{ country }}</strong>
                <span v-if="company"> · {{ company }}</span>
              </p>
            </div>
          </div>

          <!-- Reason -->
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
              Reason for returning home <span class="text-red-500">*</span>
            </label>
            <Textarea
              v-model="reason"
              rows="4"
              placeholder="e.g. Family emergency, contract violation by employer, health issues, homesickness..."
              class="w-full"
              :class="{ '!border-red-500': errorMsg }"
              @input="errorMsg = ''"
            />
            <p v-if="errorMsg" class="text-[10px] text-red-500 mt-1">{{ errorMsg }}</p>
            <p v-else class="text-[10px] text-blueberry-400 mt-1">
              This reason will be permanently recorded in the deployment history
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
          <Button label="Cancel" severity="secondary" text @click="onClose" />
          <Button
            label="Mark as Returned"
            icon="pi pi-home"
            :loading="submitting"
            class="!bg-orange-600 hover:!bg-orange-700 !border-orange-600"
            @click="onConfirm"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>