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
  (e: 'confirm', notes: string | null): void
}>()

const notes = ref('')

watch(() => props.visible, (v) => {
  if (v) {
    notes.value = ''
  }
})

function onConfirm() {
  emit('confirm', notes.value.trim() || null)
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
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <i class="pi pi-check-circle text-blue-600 text-lg" />
          </div>
          <div class="flex-1">
            <p class="text-base font-semibold text-blueberry-800">Mark Contract as Completed</p>
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
          <!-- Info -->
          <div class="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <i class="pi pi-check-circle text-blue-600 mt-0.5" />
            <div class="flex-1 text-xs text-blue-800">
              <p class="font-semibold mb-1">This action will:</p>
              <ul class="list-disc list-inside space-y-0.5 text-blue-700">
                <li>Mark the deployment as <strong>Contract Completed</strong> ✅</li>
                <li>Record today as the <strong>completion date</strong></li>
                <li>Applicant will be eligible for <strong>new deployments</strong></li>
              </ul>
              <p v-if="country || company" class="mt-2 text-blue-600">
                Completed deployment to:
                <strong>{{ country }}</strong>
                <span v-if="company"> · {{ company }}</span>
              </p>
            </div>
          </div>

          <!-- Notes (optional) -->
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
              Completion notes <span class="text-blueberry-400 font-normal">(optional)</span>
            </label>
            <Textarea
              v-model="notes"
              rows="4"
              placeholder="e.g. Excellent performance, contract renewed, planning re-deployment..."
              class="w-full"
            />
            <p class="text-[10px] text-blueberry-400 mt-1">
              Any additional notes about the contract completion
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
          <Button label="Cancel" severity="secondary" text @click="onClose" />
          <Button
            label="Mark as Completed"
            icon="pi pi-check-circle"
            :loading="submitting"
            class="!bg-blue-600 hover:!bg-blue-700 !border-blue-600"
            @click="onConfirm"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>