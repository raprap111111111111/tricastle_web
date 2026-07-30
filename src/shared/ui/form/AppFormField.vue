<template>
  <div class="flex flex-col gap-1.5" :class="{ 'opacity-60': disabled }">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium text-blueberry-700 flex items-center gap-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
      <span v-if="optional" class="text-xs text-blueberry-400 font-normal">(optional)</span>
    </label>

    <div class="relative">
      <slot :id="id" :invalid="!!error" />
    </div>

    <AppFormError v-if="error" :message="error" />
    <p v-else-if="hint" class="text-xs text-blueberry-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import AppFormError from './AppFormError.vue'

const props = withDefaults(
  defineProps<{
    label?: string
    error?: string
    hint?: string
    required?: boolean
    optional?: boolean
    disabled?: boolean
  }>(),
  {
    required: false,
    optional: false,
    disabled: false,
  },
)

const id = `field-${useId()}`
</script>