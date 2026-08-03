<!-- src/features/file-repository/components/FileRepositoryDeleteDialog.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppHoldToDeleteButton from '@shared/ui/AppHoldToDeleteButton.vue'
import type { FileRepository } from '../types'

// ─── Props / Emits ────────────────────────────────────────────────────
const props = defineProps<{
  visible:     boolean
  file:        FileRepository | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm:         [id: number]
  cancel:          []
}>()

// ─── Computed ─────────────────────────────────────────────────────────
const isReferenced = computed(
  () => (props.file?.reference_count ?? 0) > 0
)

const warningText = computed(() => {
  if (!props.file) return ''
  if (isReferenced.value)
    return `This file is still referenced by ${props.file.reference_count} document(s). Deleting it here will soft-delete the repository record but the physical file will be retained until all references are removed.`
  return 'This will soft-delete the file record. The physical file will be marked as unused and can be permanently purged later.'
})

function close() {
  emit('update:visible', false)
  emit('cancel')
}

function onConfirm() {
  if (props.file) emit('confirm', props.file.id)
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="close"
    modal
    :closable="!submitting"
    :style="{ width: '28rem' }"
    :pt="{
      root:    { class: 'rounded-2xl overflow-hidden border border-appleCore-200 shadow-xl' },
      header:  { class: 'bg-[#faf7f2] border-b border-appleCore-100 px-6 py-4' },
      content: { class: 'bg-[#faf7f2] px-6 py-5' },
      footer:  { class: 'bg-[#faf7f2] border-t border-appleCore-100 px-6 py-4' },
    }"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <i class="pi pi-trash text-red-500 text-base" />
        </div>
        <div>
          <p class="font-serif font-semibold text-blueberry-800 text-base leading-tight">
            Delete File
          </p>
          <p class="text-xs text-blueberry-400 mt-0.5">Soft delete — recoverable</p>
        </div>
      </div>
    </template>

    <!-- Body -->
    <template #default>
      <div class="space-y-4">
        <!-- File info pill -->
        <div
          v-if="file"
          class="bg-white rounded-xl border border-appleCore-200 px-4 py-3 flex items-center gap-3"
        >
          <i class="pi pi-file text-blueberry-400 text-lg flex-shrink-0" />
          <div class="min-w-0">
            <p class="text-sm font-medium text-blueberry-700 truncate">
              {{ file.original_name }}
            </p>
            <p class="text-xs text-blueberry-400 font-mono truncate">
              {{ file.file_hash.slice(0, 24) }}…
            </p>
          </div>
        </div>

        <!-- Reference warning -->
        <div
          v-if="isReferenced"
          class="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
        >
          <i class="pi pi-exclamation-triangle text-amber-500 mt-0.5 flex-shrink-0" />
          <p class="text-xs text-amber-700 leading-relaxed">
            {{ warningText }}
          </p>
        </div>
        <div
          v-else
          class="flex gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
        >
          <i class="pi pi-info-circle text-red-400 mt-0.5 flex-shrink-0" />
          <p class="text-xs text-red-600 leading-relaxed">
            {{ warningText }}
          </p>
        </div>

        <!-- Hold-to-confirm -->
        <div class="pt-1">
          <p class="text-xs text-blueberry-400 mb-2 text-center">
            Hold the button below to confirm deletion
          </p>
          <AppHoldToDeleteButton
            :loading="submitting"
            label="Hold to Delete"
            @confirmed="onConfirm"
          />
        </div>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end">
        <Button
          label="Cancel"
          text
          severity="secondary"
          :disabled="submitting"
          @click="close"
          class="!text-blueberry-500 hover:!text-blueberry-700"
        />
      </div>
    </template>
  </Dialog>
</template>