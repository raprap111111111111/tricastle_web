<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Chip from 'primevue/chip'
import Tag from 'primevue/tag'

const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<{
  applicantName?: string
  initialRemarks?: string[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', remarks: string[]): void
}>()

const remarks = ref<string[]>([])
const draft = ref('')

const QUICK_SUGGESTIONS = [
  'long hair',
  'long nails',
  "doesn't use uniform",
  'poor grooming',
  'neat appearance',
  'tattoo visible',
]

watch(
  () => visible.value,
  (isOpen) => {
    if (openIsOpen(isOpen)) {
      remarks.value = [...(props.initialRemarks ?? [])]
      draft.value = ''
    }
  },
)

function openIsOpen(isOpen: boolean): boolean {
  return isOpen
}

function addRemark(text?: string) {
  const value = (text ?? draft.value).trim()
  if (!value) return
  const exists = remarks.value.some((r) => r.toLowerCase() === value.toLowerCase())
  if (!exists) {
    remarks.value = [...remarks.value, value]
  }
  draft.value = ''
}

function removeRemark(index: number) {
  remarks.value = remarks.value.filter((_, i) => i !== index)
}

function onEnter(e: KeyboardEvent) {
  e.preventDefault()
  addRemark()
}

function handleSave() {
  emit('save', [...remarks.value])
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="`Remarks — ${applicantName || 'Applicant'}`"
    :style="{ width: '480px' }"
    :closable="!submitting"
    :pt="{
      root: '!rounded-2xl',
      header: '!pb-2 !border-b !border-appleCore-100',
      content: '!pt-4',
      footer: '!pt-3 !border-t !border-appleCore-100',
    }"
  >
    <div class="flex flex-col gap-4">
      <!-- Existing remarks list -->
      <div v-if="remarks.length" class="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto p-1">
        <Chip
          v-for="(item, i) in remarks"
          :key="`${item}-${i}`"
          :label="item"
          removable
          :disabled="submitting"
          class="!bg-amber-50 !text-amber-900 !border !border-amber-200 !text-xs !font-medium"
          @remove="removeRemark(i)"
        />
      </div>
      <p v-else class="text-xs text-blueberry-400 m-0 py-2 text-center bg-appleCore-50/50 rounded-lg border border-dashed border-appleCore-200">
        No remarks added yet. Type a note or select from quick suggestions below.
      </p>

      <!-- Text input for custom remark -->
      <div class="flex gap-2">
        <InputText
          v-model="draft"
          class="flex-1 !text-sm"
          placeholder="e.g. long hair, long nails..."
          :disabled="submitting"
          @keydown.enter="onEnter"
        />
        <Button
          label="Add"
          icon="pi pi-plus"
          size="small"
          class="!bg-apricot-600 !border-apricot-600 hover:!bg-apricot-700"
          :disabled="!draft.trim() || submitting"
          @click="addRemark()"
        />
      </div>

      <!-- Quick Add Suggestions -->
      <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-blueberry-500">Quick Suggestions</span>
        <div class="flex flex-wrap gap-1.5">
          <Tag
            v-for="s in QUICK_SUGGESTIONS"
            :key="s"
            :value="s"
            severity="secondary"
            class="!cursor-pointer select-none hover:!bg-appleCore-200 hover:!text-blueberry-900 transition-colors !text-xs !font-normal"
            @click="!submitting && addRemark(s)"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        text
        size="small"
        class="!text-blueberry-500 hover:!bg-appleCore-100"
        :disabled="submitting"
        @click="visible = false"
      />
      <Button
        label="Save Remarks"
        icon="pi pi-check"
        size="small"
        class="!bg-apricot-600 !border-apricot-600 hover:!bg-apricot-700"
        :loading="submitting"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>