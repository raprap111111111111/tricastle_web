<template>
  <Password
    :model-value="modelValue"
    v-bind="$attrs"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :toggle-mask="toggleMask"
    :feedback="feedback"
    input-class="w-full"
    class="w-full"
    @update:model-value="(val) => emit('update:modelValue', val)"
  />
</template>

<script setup lang="ts">
import Password from 'primevue/password'

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
    toggleMask?: boolean
    feedback?: boolean
  }>(),
  {
    disabled: false,
    invalid: false,
    toggleMask: true,
    feedback: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()
</script>