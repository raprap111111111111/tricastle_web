<script setup lang="ts">
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

interface Props {
  /** v-model value (the committed search term) */
  modelValue?: string
  /** Placeholder text */
  placeholder?: string
  /** Show the leading search icon */
  showIcon?: boolean
  /** Show a Clear (X) button when there is text */
  clearable?: boolean
  /** Loading state (disables input + shows spinner on button) */
  loading?: boolean
  /** Disable the whole search bar */
  disabled?: boolean
  /** Button label (optional). If empty, only icon shows */
  buttonLabel?: string
  /** Full width */
  fluid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search...',
  showIcon: true,
  clearable: true,
  loading: false,
  disabled: false,
  buttonLabel: 'Search',
  fluid: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}>()

// Local draft (does NOT emit until Enter or Search click)
const draft = ref(props.modelValue)

// Keep draft in sync if parent resets modelValue
watch(
  () => props.modelValue,
  (val) => {
    if (val !== draft.value) draft.value = val
  },
)

function triggerSearch() {
  emit('update:modelValue', draft.value.trim())
  emit('search', draft.value.trim())
}

function clearSearch() {
  draft.value = ''
  emit('update:modelValue', '')
  emit('clear')
  emit('search', '')
}

function onEnter() {
  triggerSearch()
}
</script>

<template>
  <div
    class="flex items-center gap-2"
    :class="fluid ? 'w-full' : ''"
  >
    <!-- Input group -->
    <div class="relative flex-1">
      <!-- Leading icon -->
      <i
        v-if="showIcon"
        class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-blueberry-400 text-sm pointer-events-none"
      />

      <InputText
        v-model="draft"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        class="w-full"
        :class="[
          showIcon ? '!pl-10' : '',
          clearable && draft ? '!pr-10' : '',
        ]"
        @keydown.enter="onEnter"
      />

      <!-- Clear button -->
      <button
        v-if="clearable && draft && !loading"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-blueberry-400 hover:text-blueberry-600 transition-colors"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <i class="pi pi-times-circle text-sm" />
      </button>
    </div>

    <!-- Search button -->
    <Button
      :label="buttonLabel || undefined"
      :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-search'"
      :disabled="disabled || loading"
      class="!bg-apricot-500 !border-apricot-500 hover:!bg-apricot-600 hover:!border-apricot-600 !text-white"
      @click="triggerSearch"
    />
  </div>
</template>