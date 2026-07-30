<template>
  <InputText
    :model-value="modelValue"
    v-bind="$attrs"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :size="size"
    class="w-full"
    :class="{ '!border-red-500 !ring-red-100': invalid }"
    @update:model-value="(val) => emit('update:modelValue', val)"
  />
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'

withDefaults(
  defineProps<{
    modelValue?: string | number
    type?: string
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
    size?: 'small' | 'large'
  }>(),
  {
    type: 'text',
    disabled: false,
    invalid: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
}>()
</script>