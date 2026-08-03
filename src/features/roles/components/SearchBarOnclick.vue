<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'clear'): void
}>()

const isActive = ref(false)
const inputRef = ref<InstanceType<typeof InputText> | null>(null)

function activate() {
  isActive.value = true
  requestAnimationFrame(() => {
    // Focus the underlying <input>
    const input = (inputRef.value as any)?.$el as HTMLInputElement
    input?.focus()
  })
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function onClear() {
  emit('update:modelValue', '')
  emit('clear')
  isActive.value = false
}

function onBlur() {
  if (!props.modelValue) isActive.value = false
}
</script>

<template>
  <div class="relative w-full">
    <!-- Placeholder Button (before click) -->
    <button
      v-if="!isActive"
      type="button"
      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 hover:border-primary-400 hover:shadow-sm transition-all text-left"
      @click="activate"
    >
      <i class="pi pi-search text-surface-400" />
      <span class="text-surface-400 text-sm">
        {{ placeholder ?? 'Search...' }}
      </span>
    </button>

    <!-- Active Search Input -->
    <div v-else class="w-full">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText
          ref="inputRef"
          :model-value="modelValue"
          @input="onInput"
          @blur="onBlur"
          :placeholder="placeholder ?? 'Search...'"
          class="w-full"
        />
        <Button
          v-if="modelValue"
          icon="pi pi-times"
          text
          rounded
          size="small"
          class="!absolute !right-2 !top-1/2 !-translate-y-1/2 !w-8 !h-8"
          @click="onClear"
        />
      </IconField>
    </div>
  </div>
</template>