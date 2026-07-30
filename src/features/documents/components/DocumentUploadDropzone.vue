<!-- src/features/documents/components/DocumentUploadDropzone.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    accept?: string
    maxSize?: number // bytes
    disabled?: boolean
  }>(),
  {
    accept: '.pdf,.jpg,.jpeg,.png',
    maxSize: 10 * 1024 * 1024, // 10 MB
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'file', file: File): void
  (e: 'error', message: string): void
}>()

const dragging = ref(false)
const selected = ref<File | null>(null)
const inputEl = ref<HTMLInputElement>()

function pick() {
  inputEl.value?.click()
}

function validate(file: File): boolean {
  if (file.size > props.maxSize) {
    emit('error', `File too large. Max ${(props.maxSize / 1024 / 1024).toFixed(0)}MB.`)
    return false
  }
  return true
}

function handleFiles(files: FileList | null) {
  if (!files || files.length === 0) return
  const file = files[0]
  if (!validate(file)) return
  selected.value = file
  emit('file', file)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  if (props.disabled) return
  handleFiles(e.dataTransfer?.files ?? null)
}

function clear() {
  selected.value = null
  if (inputEl.value) inputEl.value.value = ''
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<template>
  <div>
    <input
      ref="inputEl"
      type="file"
      :accept="accept"
      class="hidden"
      :disabled="disabled"
      @change="handleFiles(($event.target as HTMLInputElement).files)"
    />

    <!-- Empty state -->
    <div
      v-if="!selected"
      class="rounded-2xl border-2 border-dashed transition-colors
             px-6 py-10 text-center cursor-pointer"
      :class="[
        dragging
          ? 'border-apricot-400 bg-apricot-50'
          : 'border-appleCore-300 bg-appleCore-50/40 hover:border-apricot-300 hover:bg-apricot-50/40',
        disabled && 'opacity-50 pointer-events-none',
      ]"
      @click="pick"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <i class="pi pi-cloud-upload text-4xl text-blueberry-400" />
      <p class="mt-3 text-sm font-semibold text-blueberry-800">
        Drop file here, or
        <span class="text-apricot-600 underline">browse</span>
      </p>
      <p class="mt-1 text-xs text-blueberry-400">
        {{ accept.split(',').join(', ') }} · max
        {{ (maxSize / 1024 / 1024).toFixed(0) }}MB
      </p>
    </div>

    <!-- Selected state -->
    <div
      v-else
      class="rounded-2xl border border-appleCore-200 bg-white px-4 py-3
             flex items-center gap-3"
    >
      <div
        class="w-10 h-10 rounded-xl bg-apricot-50 text-apricot-600
               flex items-center justify-center flex-shrink-0"
      >
        <i class="pi pi-file text-lg" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-blueberry-800 truncate">
          {{ selected.name }}
        </p>
        <p class="text-xs text-blueberry-500 tabular-nums">
          {{ formatSize(selected.size) }}
        </p>
      </div>
      <button
        type="button"
        class="w-8 h-8 rounded-xl flex items-center justify-center
               text-blueberry-500 hover:bg-red-50 hover:text-red-600
               transition-colors"
        title="Remove"
        @click="clear"
      >
        <i class="pi pi-times text-sm" />
      </button>
    </div>
  </div>
</template>