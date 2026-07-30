<!-- src/features/documents/components/DocumentDeleteDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import type { ApplicantDocument } from '../types'

defineProps<{
  visible: boolean
  document: ApplicantDocument | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
}>()

function onClose() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="!loading"
    :draggable="false"
    :dismissable-mask="!loading"
    header="Delete Document"
    :style="{ width: '460px' }"
    @update:visible="onClose"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <div
          class="w-11 h-11 rounded-2xl bg-red-50 text-red-500
                 flex items-center justify-center flex-shrink-0"
        >
          <i class="pi pi-exclamation-triangle text-lg" />
        </div>
        <div class="flex-1">
          <p class="text-sm text-blueberry-700 leading-relaxed">
            Are you sure you want to delete
            <span class="font-semibold text-blueberry-900">
              "{{ document?.file_name ?? 'this document' }}"
            </span>?
          </p>
          <p class="text-xs text-blueberry-500 mt-1">
            This will remove the file and all its version history.
            This action cannot be undone.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <Button
          label="Cancel"
          text
          :disabled="loading"
          class="!text-blueberry-600"
          @click="onClose"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </Dialog>
</template>