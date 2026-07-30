<!-- src/features/document-types/components/RequiredFieldsEditor.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const newField = ref('')

function addField() {
  const val = newField.value.trim()
  if (!val) return
  if (props.modelValue.includes(val)) {
    newField.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, val])
  newField.value = ''
}

function removeField(idx: number) {
  const next = [...props.modelValue]
  next.splice(idx, 1)
  emit('update:modelValue', next)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addField()
  }
}
</script>

<template>
  <div class="space-y-3">
    <!-- Existing chips -->
    <div v-if="modelValue.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="(field, idx) in modelValue"
        :key="idx"
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
               bg-apricot-50 text-apricot-800 text-sm font-medium
               ring-1 ring-apricot-200"
      >
        <i class="pi pi-tag text-[10px]" />
        {{ field }}
        <button
          type="button"
          class="text-apricot-500 hover:text-red-600 transition-colors"
          @click="removeField(idx)"
        >
          <i class="pi pi-times text-[10px]" />
        </button>
      </span>
    </div>
    <p v-else class="text-xs text-blueberry-400 italic">
      No fields defined yet. Add fields that OCR should extract from this document.
    </p>

    <!-- Add input -->
    <div class="flex gap-2">
      <InputText
        v-model="newField"
        placeholder="e.g. full_name, passport_number, date_of_issue..."
        class="flex-1"
        @keydown="onKeydown"
      />
      <Button
        type="button"
        icon="pi pi-plus"
        label="Add"
        severity="secondary"
        outlined
        @click="addField"
      />
    </div>
  </div>
</template>