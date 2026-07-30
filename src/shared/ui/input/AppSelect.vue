<template>
  <Select
    :model-value="modelValue"
    v-bind="$attrs"
    :options="options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :filter="filter"
    :show-clear="showClear"
    class="w-full"
    :class="{ '!border-red-500 !ring-red-100': invalid }"
    @update:model-value="(val) => emit('update:modelValue', val)"
  />
</template>

<script setup lang="ts">
import Select from 'primevue/select'

withDefaults(
  defineProps<{
    modelValue?: any
    options: any[]
    optionLabel?: string
    optionValue?: string
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
    filter?: boolean
    showClear?: boolean
  }>(),
  {
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: 'Select an option',
    disabled: false,
    invalid: false,
    filter: false,
    showClear: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>