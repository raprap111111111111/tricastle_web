<!-- src/features/file-repository/components/FileRepositoryUploadDialog.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog   from 'primevue/dialog'
import Button   from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import FileSizeLabel from './FileSizeLabel.vue'

const props = defineProps<{
  visible:     boolean
  submitting?: boolean
  progress?:   number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  upload:          [file: File]
  cancel:          []
}>()

// ─── State ────────────────────────────────────────────────────────────
const selectedFile = ref<File | null>(null)
const isDragging   = ref(false)
const inputRef     = ref<HTMLInputElement | null>(null)

// ─── Computed ─────────────────────────────────────────────────────────
const canSubmit = computed(
  () => selectedFile.value !== null && !props.submitting
)

// ─── Handlers ─────────────────────────────────────────────────────────
function onFileChange(evt: Event) {
  const target = evt.target as HTMLInputElement
  if (target.files?.[0]) selectedFile.value = target.files[0]
}

function onDrop(evt: DragEvent) {
  isDragging.value = false
  const file = evt.dataTransfer?.files?.[0]
  if (file) selectedFile.value = file
}

function onDragover() { isDragging.value = true  }
function onDragleave() { isDragging.value = false }

function clearFile() {
  selectedFile.value = null
  if (inputRef.value) inputRef.value.value = ''
}

function handleSubmit() {
  if (!selectedFile.value) return
  emit('upload', selectedFile.value)
}

function close() {
  if (props.submitting) return
  clearFile()
  emit('update:visible', false)
  emit('cancel')
}

// ─── File icon ────────────────────────────────────────────────────────
function fileIcon(mime?: string): string {
  if (!mime) return 'pi pi-file'
  if (mime === 'application/pdf') return 'pi pi-file-pdf'
  if (mime.startsWith('image/'))  return 'pi pi-image'
  return 'pi pi-file'
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="close"
    modal
    :closable="!submitting"
    header="Upload File"
    :style="{ width: '32rem' }"
    :pt="{
      root:    { class: 'rounded-2xl overflow-hidden border border-appleCore-200 shadow-xl' },
      header:  { class: 'bg-[#faf7f2] border-b border-appleCore-100 px-6 py-4 font-serif font-semibold text-blueberry-800' },
      content: { class: 'bg-[#faf7f2] px-6 py-5' },
      footer:  { class: 'bg-[#faf7f2] border-t border-appleCore-100 px-6 py-4' },
    }"
  >
    <template #default>
      <div class="space-y-5">

        <!-- Drop zone -->
        <div
          class="relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer"
          :class="[
            isDragging
              ? 'border-blueberry-400 bg-blueberry-50'
              : 'border-appleCore-200 bg-white hover:border-appleCore-400'
          ]"
          @dragover.prevent="onDragover"
          @dragleave.prevent="onDragleave"
          @drop.prevent="onDrop"
          @click="inputRef?.click()"
        >
          <div class="flex flex-col items-center justify-center py-10 px-4 text-center pointer-events-none">
            <div class="w-12 h-12 rounded-2xl bg-appleCore-50 border border-appleCore-200 flex items-center justify-center mb-3">
              <i class="pi pi-cloud-upload text-blueberry-400 text-xl" />
            </div>
            <p class="text-sm font-medium text-blueberry-700 mb-1">
              Drag & drop a file here
            </p>
            <p class="text-xs text-blueberry-400">
              or <span class="text-blueberry-600 underline underline-offset-2">click to browse</span>
            </p>
          </div>

          <!-- Hidden input -->
          <input
            ref="inputRef"
            type="file"
            class="sr-only"
            @change="onFileChange"
          />
        </div>

        <!-- Selected file preview -->
        <Transition name="slide-down">
          <div
            v-if="selectedFile"
            class="bg-white rounded-xl border border-appleCore-200 px-4 py-3 flex items-center gap-3"
          >
            <div class="w-9 h-9 rounded-lg bg-appleCore-50 border border-appleCore-200 flex items-center justify-center flex-shrink-0">
              <i :class="[fileIcon(selectedFile.type), 'text-blueberry-500 text-sm']" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-blueberry-700 truncate">
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-blueberry-400 mt-0.5">
                <FileSizeLabel :bytes="selectedFile.size" />
                &nbsp;·&nbsp;
                {{ selectedFile.type || 'Unknown type' }}
              </p>
            </div>
            <Button
              icon="pi pi-times"
              text
              rounded
              severity="secondary"
              size="small"
              :disabled="submitting"
              @click.stop="clearFile"
              class="!text-blueberry-400 hover:!text-blueberry-600"
            />
          </div>
        </Transition>

        <!-- Upload progress -->
        <Transition name="fade">
          <div v-if="submitting" class="space-y-2">
            <div class="flex justify-between text-xs text-blueberry-500">
              <span>Uploading…</span>
              <span>{{ progress ?? 0 }}%</span>
            </div>
            <ProgressBar
              :value="progress ?? 0"
              :pt="{
                root:  { class: 'h-2 rounded-full bg-appleCore-100' },
                value: { class: 'bg-blueberry-500 rounded-full' },
              }"
            />
          </div>
        </Transition>

      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <Button
          label="Cancel"
          text
          severity="secondary"
          :disabled="submitting"
          @click="close"
          class="!text-blueberry-500 hover:!text-blueberry-700"
        />
        <Button
          label="Upload File"
          icon="pi pi-upload"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
          :pt="{
            root: { class: 'bg-blueberry-700 hover:bg-blueberry-800 border-0 text-white rounded-xl px-5' }
          }"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity:   0;
  transform: translateY(-6px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>