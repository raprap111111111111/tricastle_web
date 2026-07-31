<!-- src/features/document-versions/components/DocumentVersionUploadDialog.vue -->
<script setup lang="ts">
import Dialog     from 'primevue/dialog'
import Textarea   from 'primevue/textarea'
import Select     from 'primevue/select'
import FileUpload from 'primevue/fileupload'
import Button     from 'primevue/button'
import { computed, ref, watch } from 'vue'
import { useVersionUpload } from '../composables/useVersionUpload'
import { CHANGE_REASON_PRESETS, MAX_UPLOAD_MB, ACCEPTED_MIME } from '../constants'

const props = defineProps<{
  visible:             boolean
  applicantDocumentId: number
  documentName?:       string
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'uploaded'): void
}>()

const {
  selectedFile,
  changeReason,
  uploading,
  onFileSelected,
  submit,
} = useVersionUpload()

const presetReason = ref<string>('')
const customReason = ref<string>('')

watch(presetReason, (v) => {
  changeReason.value = v === 'Other' ? customReason.value : v
})
watch(customReason, (v) => {
  if (presetReason.value === 'Other') changeReason.value = v
})

function close() {
  presetReason.value = ''
  customReason.value = ''
  onFileSelected(null)
  emit('update:visible', false)
}

async function handleSubmit() {
  const created = await submit(props.applicantDocumentId)
  if (created) {
    emit('uploaded')
    close()
  }
}

const canSubmit = computed(
  () => !!selectedFile.value && !!changeReason.value.trim(),
)
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="!uploading"
    :style="{ width: '560px' }"
    header="Upload New Version"
    @update:visible="close"
  >
    <div class="flex flex-col gap-4 pt-2">
      <p v-if="documentName" class="text-sm text-blueberry-500">
        Uploading a new version of
        <span class="font-semibold text-blueberry-800">{{ documentName }}</span>.
        The previous version will be preserved for audit.
      </p>

      <!-- File picker -->
      <div>
        <label class="block text-sm font-medium text-blueberry-700 mb-1.5">
          File <span class="text-red-500">*</span>
        </label>
        <FileUpload
          mode="basic"
          :accept="ACCEPTED_MIME"
          :max-file-size="MAX_UPLOAD_MB * 1024 * 1024"
          :auto="false"
          choose-label="Select file"
          :disabled="uploading"
          @select="(e: any) => onFileSelected(e.files?.[0] ?? null)"
          class="w-full"
        />
        <p v-if="selectedFile" class="text-xs text-blueberry-500 mt-1">
          {{ selectedFile.name }}
        </p>
      </div>

      <!-- Reason preset -->
      <div>
        <label class="block text-sm font-medium text-blueberry-700 mb-1.5">
          Reason <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="presetReason"
          :options="CHANGE_REASON_PRESETS"
          option-label="label"
          option-value="value"
          placeholder="Select a reason…"
          class="w-full"
        />
      </div>

      <!-- Custom reason -->
      <div v-if="presetReason === 'Other'">
        <label class="block text-sm font-medium text-blueberry-700 mb-1.5">
          Please specify
        </label>
        <Textarea
          v-model="customReason"
          rows="3"
          class="w-full"
          placeholder="Explain why a new version is being uploaded…"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" text :disabled="uploading" @click="close" />
      <Button
        label="Upload"
        icon="pi pi-upload"
        :loading="uploading"
        :disabled="!canSubmit"
        class="!bg-apricot-500 !border-apricot-500 !text-white"
        @click="handleSubmit"
      />
    </template>
  </Dialog>
</template>