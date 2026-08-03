<!-- src/features/file-repository/components/FileRepositoryPurgeDialog.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppHoldToDeleteButton from '@shared/ui/AppHoldToDeleteButton.vue'
import FileSizeLabel         from './FileSizeLabel.vue'
import type { FileRepository } from '../types'

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

const isReferenced = computed(
  () => (props.file?.reference_count ?? 0) > 0
)

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
    :style="{ width: '30rem' }"
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
          <i class="pi pi-bomb text-red-600 text-base" />
        </div>
        <div>
          <p class="font-serif font-semibold text-blueberry-800 text-base leading-tight">
            Permanently Purge File
          </p>
          <p class="text-xs text-red-500 font-medium mt-0.5">
            ⚠ This cannot be undone
          </p>
        </div>
      </div>
    </template>

    <!-- Body -->
    <template #default>
      <div class="space-y-4">

        <!-- File summary -->
        <div
          v-if="file"
          class="bg-white rounded-xl border border-appleCore-200 px-4 py-3 space-y-2"
        >
          <div class="flex items-center gap-3">
            <i class="pi pi-file text-blueberry-400 text-lg flex-shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-blueberry-700 truncate">
                {{ file.original_name }}
              </p>
              <p class="text-xs text-blueberry-400 font-mono truncate">
                {{ file.file_hash.slice(0, 32) }}…
              </p>
            </div>
          </div>
          <div class="flex gap-4 text-xs text-blueberry-500 pl-7">
            <span>
              Size: <FileSizeLabel :bytes="file.file_size" />
            </span>
            <span>Disk: {{ file.disk }}</span>
            <span>Refs: {{ file.reference_count }}</span>
          </div>
        </div>

        <!-- Cannot purge if referenced -->
        <div
          v-if="isReferenced"
          class="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
        >
          <i class="pi pi-lock text-amber-500 mt-0.5 flex-shrink-0" />
          <p class="text-xs text-amber-700 leading-relaxed">
            <strong>Cannot purge.</strong> This file is still referenced by
            <strong>{{ file?.reference_count }}</strong> document(s).
            Remove all references before purging.
          </p>
        </div>

        <!-- Purge danger message -->
        <div
          v-else
          class="flex gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
        >
          <i class="pi pi-exclamation-triangle text-red-500 mt-0.5 flex-shrink-0" />
          <div class="text-xs text-red-700 space-y-1 leading-relaxed">
            <p>
              <strong>Permanent action.</strong> This will physically delete the
              file from <strong>{{ file?.disk }}</strong> storage.
            </p>
            <p>There is no recycle bin. The file will be gone forever.</p>
          </div>
        </div>

        <!-- Hold-to-confirm (disabled if referenced) -->
        <div v-if="!isReferenced" class="pt-1">
          <p class="text-xs text-blueberry-400 mb-2 text-center">
            Hold the button below to permanently purge this file
          </p>
          <AppHoldToDeleteButton
            :loading="submitting"
            label="Hold to Purge Permanently"
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