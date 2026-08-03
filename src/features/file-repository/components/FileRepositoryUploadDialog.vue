<!-- src/features/file-repository/components/FileRepositoryUploadDialog.vue -->
<script setup lang="ts">
import { ref, watch }  from 'vue'
import Dialog          from 'primevue/dialog'
import Dropdown        from 'primevue/dropdown'
import ToggleButton    from 'primevue/togglebutton'
import ProgressBar     from 'primevue/progressbar'
import { AppButton } from '@shared/ui'
import FileSizeLabel   from './FileSizeLabel.vue'
import { DISK_OPTIONS } from '../types'

// ─── Constants ───────────────────────────────────────────────────────
const MAX_MB    = 20
const MAX_BYTES = MAX_MB * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
  'application/zip',
]

// ─── Props / Emits ───────────────────────────────────────────────────
const props = defineProps<{
  visible:    boolean
  submitting: boolean
  progress:   number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'upload', file: File, extra: Record<string, any>): void
  (e: 'cancel'): void
}>()

// ─── Local state ─────────────────────────────────────────────────────
const fileInputRef  = ref<HTMLInputElement>()
const dragOver      = ref(false)
const selectedFile  = ref<File | null>(null)
const fileError     = ref<string | null>(null)
const disk          = ref<string>('local')
const isEncrypted   = ref(false)

// Reset when dialog closes
watch(() => props.visible, open => {
  if (!open) resetState()
})

// ─── Helpers ─────────────────────────────────────────────────────────
function resetState() {
  selectedFile.value = null
  fileError.value    = null
  disk.value         = 'local'
  isEncrypted.value  = false
}

function validate(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return `File type "${file.type}" is not supported.`
  if (file.size > MAX_BYTES)
    return `File exceeds the maximum size of ${MAX_MB} MB.`
  return null
}

function setFile(file: File) {
  const err          = validate(file)
  fileError.value    = err
  selectedFile.value = err ? null : file
}

function clearFile() {
  selectedFile.value = null
  fileError.value    = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function onFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) setFile(file)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function mimeIcon(mime: string): string {
  if (mime.startsWith('image/')) return 'pi pi-image'
  if (mime.includes('pdf'))      return 'pi pi-file-pdf'
  if (mime.includes('word'))     return 'pi pi-file-word'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'pi pi-file-excel'
  if (mime.startsWith('text/'))  return 'pi pi-file'
  if (mime.includes('zip'))      return 'pi pi-box'
  return 'pi pi-file'
}

function mimeColor(mime: string): string {
  if (mime.startsWith('image/')) return 'text-purple-500'
  if (mime.includes('pdf'))      return 'text-red-500'
  if (mime.includes('word'))     return 'text-blue-500'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'text-green-600'
  return 'text-blueberry-400'
}

// ─── Submit ──────────────────────────────────────────────────────────
function submit() {
  if (!selectedFile.value) return
  emit('upload', selectedFile.value, {
    disk:         disk.value,
    is_encrypted: isEncrypted.value ? 1 : 0,
  })
}

function close() {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    header="Upload File"
    :style="{ width: '560px' }"
    :draggable="false"
    :pt="{
      header:  '!bg-white !border-b !border-appleCore-100 !px-6 !py-4',
      content: '!bg-white !px-6 !py-5',
      footer:  '!bg-appleCore-50 !border-t !border-appleCore-100 !px-6 !py-4',
    }"
    @update:visible="close"
  >
    <div class="space-y-5">

      <!-- ── Drop Zone ─────────────────────────────────────────────── -->
      <div
        class="border-2 border-dashed rounded-2xl p-8 text-center
               cursor-pointer transition-all duration-150"
        :class="dragOver
          ? 'border-apricot-400 bg-apricot-50/60'
          : 'border-appleCore-300 bg-appleCore-50/40 hover:border-apricot-300 hover:bg-apricot-50/20'"
        @click="fileInputRef?.click()"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop="onDrop"
      >
        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          @change="onFileInput"
        />

        <!-- File selected preview -->
        <div v-if="selectedFile" class="flex flex-col items-center gap-3">
          <div
            class="w-14 h-14 rounded-2xl bg-white border border-appleCore-200
                   flex items-center justify-center shadow-sm"
          >
            <i
              :class="[
                mimeIcon(selectedFile.type),
                mimeColor(selectedFile.type),
                'text-2xl',
              ]"
            />
          </div>
          <div>
            <p class="font-semibold text-blueberry-800 text-sm">
              {{ selectedFile.name }}
            </p>
            <p class="text-xs text-blueberry-400 mt-0.5">
              <FileSizeLabel :bytes="selectedFile.size" :decimals="1" />
              · {{ selectedFile.type }}
            </p>
          </div>
          <button
            class="text-xs text-red-500 underline hover:text-red-600 mt-1 transition-colors"
            @click.stop="clearFile"
          >
            Remove file
          </button>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center gap-3">
          <div
            class="w-14 h-14 rounded-2xl bg-white border border-appleCore-200
                   flex items-center justify-center shadow-sm"
          >
            <i class="pi pi-cloud-upload text-2xl text-blueberry-400" />
          </div>
          <div>
            <p class="font-semibold text-blueberry-700 text-sm">
              Drop your file here, or
              <span class="text-apricot-600 underline">browse</span>
            </p>
            <p class="text-xs text-blueberry-400 mt-1">
              Max {{ MAX_MB }}MB · PDF, Word, Excel, Images, CSV, ZIP
            </p>
          </div>
        </div>
      </div>

      <!-- ── File validation error ──────────────────────────────────── -->
      <div
        v-if="fileError"
        class="flex items-start gap-2 text-xs text-red-600 bg-red-50
               border border-red-200 rounded-xl px-3 py-2"
      >
        <i class="pi pi-exclamation-triangle mt-0.5 flex-shrink-0" />
        <span>{{ fileError }}</span>
      </div>

      <!-- ── Options ───────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 gap-4">

        <!-- Storage disk -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">
            Storage Disk
          </label>
          <Dropdown
            v-model="disk"
            :options="DISK_OPTIONS"
            option-label="label"
            option-value="value"
            class="w-full !text-sm !rounded-xl !border-appleCore-200"
          />
        </div>

        <!-- Encryption toggle -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">
            Encryption
          </label>
          <ToggleButton
            v-model="isEncrypted"
            on-label="Encrypted"
            off-label="Not Encrypted"
            on-icon="pi pi-lock"
            off-icon="pi pi-unlock"
            class="w-full !text-sm !rounded-xl"
          />
        </div>

      </div>

      <!-- ── Upload progress ───────────────────────────────────────── -->
      <div v-if="props.submitting" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-blueberry-600">
            Uploading…
          </span>
          <span class="text-xs font-bold text-apricot-600 tabular-nums">
            {{ props.progress }}%
          </span>
        </div>
        <ProgressBar
          :value="props.progress"
          :show-value="false"
          :pt="{
            root:  '!h-2 !rounded-full !bg-appleCore-100',
            value: '!bg-apricot-500 !rounded-full',
          }"
        />
      </div>

    </div>

    <!-- ── Footer ────────────────────────────────────────────────────── -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <AppButton
          label="Cancel"
          variant="neutral"
          outlined
          :disabled="props.submitting"
          @click="close"
        />
        <AppButton
          label="Upload File"
          variant="accent"
          icon="pi pi-upload"
          :loading="props.submitting"
          :disabled="!selectedFile || !!fileError || props.submitting"
          @click="submit"
        />
      </div>
    </template>

  </Dialog>
</template>