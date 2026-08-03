<!-- src/features/file-repository/components/FileRepositoryDeleteDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { AppButton, AppHoldToDeleteButton } from '@shared/ui'
import FileSizeLabel from './FileSizeLabel.vue'
import type { FileRepository } from '../types'

// ─── Props / Emits ───────────────────────────────────────────────────
const props = defineProps<{
  visible: boolean
  file: FileRepository | null
  loading: boolean
  mode: 'soft' | 'purge'
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm'): void
}>()

// ─── Helpers ─────────────────────────────────────────────────────────
function mimeIcon(mime: string): string {
  if (mime.startsWith('image/')) return 'pi pi-image'
  if (mime.includes('pdf')) return 'pi pi-file-pdf'
  if (mime.includes('word')) return 'pi pi-file-word'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'pi pi-file-excel'
  if (mime.startsWith('text/')) return 'pi pi-file'
  return 'pi pi-file'
}

function mimeColor(mime: string): string {
  if (mime.startsWith('image/')) return 'text-purple-500'
  if (mime.includes('pdf')) return 'text-red-500'
  if (mime.includes('word')) return 'text-blue-500'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'text-green-600'
  return 'text-blueberry-400'
}

function close() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog :visible="props.visible" modal :header="props.mode === 'purge' ? 'Permanently Purge File' : 'Delete File'"
    :style="{ width: '480px' }" :draggable="false" :pt="{
      header: '!bg-white !border-b !border-appleCore-100 !px-6 !py-4',
      content: '!bg-white !px-6 !py-5',
      footer: '!bg-appleCore-50 !border-t !border-appleCore-100 !px-6 !py-4',
    }" @update:visible="close">
    <div v-if="props.file" class="space-y-4">

      <!-- ── Warning Banner ────────────────────────────────────────── -->
      <div class="flex items-start gap-3 p-3 rounded-xl border" :class="props.mode === 'purge'
        ? 'bg-red-50 border-red-200'
        : 'bg-amber-50 border-amber-200'">
        <i class="pi pi-exclamation-triangle mt-0.5 flex-shrink-0"
          :class="props.mode === 'purge' ? 'text-red-500' : 'text-amber-500'" />
        <div>
          <p class="text-sm font-semibold" :class="props.mode === 'purge' ? 'text-red-700' : 'text-amber-700'">
            {{
              props.mode === 'purge'
                ? 'This action cannot be undone!'
                : 'This file will be soft-deleted.'
            }}
          </p>
          <p class="text-xs mt-0.5" :class="props.mode === 'purge' ? 'text-red-500' : 'text-amber-600'">
            {{
              props.mode === 'purge'
                ? 'The physical file will be permanently removed from storage and the database.'
                : 'The record will be flagged as deleted. Use Purge to permanently remove it.'
            }}
          </p>
        </div>
      </div>

      <!-- ── File Info Card ────────────────────────────────────────── -->
      <div class="flex items-center gap-3 bg-appleCore-50 border
               border-appleCore-200 rounded-xl p-4">
        <div class="w-12 h-12 rounded-xl bg-white border border-appleCore-200
                 flex items-center justify-center flex-shrink-0 shadow-sm">
          <i :class="[
            mimeIcon(props.file.mime_type),
            mimeColor(props.file.mime_type),
            'text-xl',
          ]" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-blueberry-800 text-sm truncate" v-tooltip.top="props.file.original_name">
            {{ props.file.original_name }}
          </p>
          <p class="text-xs text-blueberry-400 mt-0.5 flex items-center gap-2 flex-wrap">
            <FileSizeLabel :bytes="props.file.file_size" :decimals="1" />
            <span>·</span>
            <span class="capitalize">{{ props.file.disk }}</span>
            <span>·</span>
            <span v-if="props.file.is_encrypted" class="text-amber-500">
              <i class="pi pi-lock text-xs mr-0.5" />Encrypted
            </span>
            <span v-else class="text-blueberry-300">Unencrypted</span>
          </p>
          <!-- reference count warning -->
          <p class="text-xs mt-1 font-medium"
            :class="props.file.reference_count > 0 ? 'text-red-500' : 'text-blueberry-400'">
            <i class="pi pi-link text-xs mr-1" />
            Used by {{ props.file.reference_count }} document(s)
            <span v-if="props.file.reference_count > 0" class="italic font-normal ml-1">
              — deleting may break linked documents
            </span>
          </p>
        </div>
      </div>


      <!-- ✅ Correct name matching the barrel export -->
      <AppHoldToDeleteButton v-if="props.mode === 'purge'" label="Hold to permanently purge" hint-text="hold 3 seconds"
        :duration="3000" :loading="props.loading" @complete="emit('confirm')" />

    </div>

    <!-- ── Footer ────────────────────────────────────────────────────── -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <AppButton label="Cancel" variant="neutral" outlined :disabled="props.loading" @click="close" />
        <!-- Soft delete has a normal button; purge uses HoldToDelete above -->
        <AppButton v-if="props.mode === 'soft'" label="Delete" variant="danger" icon="pi pi-trash"
          :loading="props.loading" @click="emit('confirm')" />
      </div>
    </template>
  </Dialog>
</template>