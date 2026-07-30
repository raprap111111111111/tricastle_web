<template>
  <Textarea
    :model-value="modelValue"
    v-bind="$attrs"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :rows="rows"
    :auto-resize="autoResize"
    class="w-full"
    :class="{ '!border-red-500 !ring-red-100': invalid }"
    @update:model-value="(val) => emit('update:modelValue', val)"
  />
</template>

<script setup lang="ts">
import Textarea from 'primevue/textarea'

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
    rows?: number
    autoResize?: boolean
  }>(),
  {
    disabled: false,
    invalid: false,
    rows: 4,
    autoResize: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()
</script>