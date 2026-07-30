<!-- src/features/document-types/components/DocumentTypeDeleteDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppHoldToDeleteButton from '@shared/ui/button/AppHoldToDeleteButton.vue'
import type { DocumentType } from '../types'

defineProps<{
  visible:  boolean
  type:     DocumentType | null
  loading:  boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'):  void
}>()

function onClose() {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="!loading"
    :draggable="false"
    :dismissable-mask="!loading"
    header="Delete Document Type"
    :style="{ width: '480px' }"
    @update:visible="onClose"
  >
    <div class="flex flex-col gap-5">

      <!-- ── Warning header ────────────────────────────────────────── -->
      <div class="flex items-start gap-3">
        <div
          class="w-11 h-11 rounded-2xl bg-red-50 text-red-500
                 flex items-center justify-center flex-shrink-0"
        >
          <i class="pi pi-exclamation-triangle text-lg" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-blueberry-700 leading-relaxed">
            Are you sure you want to delete
            <span class="font-semibold text-blueberry-900">
              "{{ type?.name ?? 'this document type' }}"
            </span>?
          </p>
          <p class="text-xs text-blueberry-500 mt-1">
            Existing uploaded documents of this type will remain, but no new documents
            can be classified as this type. This action cannot be undone.
          </p>
        </div>
      </div>

      <!-- ── Type preview card ──────────────────────────────────────── -->
      <div
        v-if="type"
        class="rounded-xl border border-appleCore-200 bg-appleCore-50/40 px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-apricot-500 text-white
                   flex items-center justify-center flex-shrink-0"
          >
            <i class="pi pi-tag text-base" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-blueberry-800 truncate">
              {{ type.name }}
            </p>
            <div class="flex items-center gap-2 text-xs mt-0.5">
              <span
                class="font-mono text-apricot-600 font-semibold
                       bg-white px-1.5 py-0.5 rounded"
              >
                {{ type.code }}
              </span>
              <span class="text-blueberry-400 capitalize">
                · {{ type.category }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Hold-to-delete button ──────────────────────────────────── -->
      <AppHoldToDeleteButton
        label="Hold to delete this document type"
        hint-text="Press and hold for 2 seconds"
        :duration="2000"
        :loading="loading"
        @complete="emit('confirm')"
      />
    </div>

    <!-- ── Footer: only Cancel (delete is triggered by holding) ───── -->
    <template #footer>
      <div class="flex items-center justify-end">
        <Button
          label="Cancel"
          text
          :disabled="loading"
          class="!text-blueberry-600"
          @click="onClose"
        />
      </div>
    </template>
  </Dialog>
</template>