<template>
  <div
    class="bg-white rounded-2xl border border-appleCore-100 overflow-hidden transition-shadow"
    :class="[shadowClass, { 'hover:shadow-medium': hoverable }]"
  >
    <div v-if="$slots.header || title" class="px-6 py-4 border-b border-appleCore-100 flex items-center justify-between">
      <div>
        <h3 v-if="title" class="text-base font-serif font-semibold text-blueberry-800">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-sm text-blueberry-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="header" />
    </div>

    <div :class="bodyPadding">
      <slot />
    </div>

    <div v-if="$slots.footer" class="px-6 py-3 border-t border-appleCore-100 bg-appleCore-50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    hoverable?: boolean
    padding?: 'none' | 'small' | 'normal' | 'large'
    shadow?: 'none' | 'soft' | 'medium' | 'strong'
  }>(),
  {
    hoverable: false,
    padding: 'normal',
    shadow: 'soft',
  },
)

const bodyPadding = computed(() => ({
  none: '',
  small: 'p-3',
  normal: 'p-6',
  large: 'p-8',
}[props.padding]))

const shadowClass = computed(() => ({
  none: '',
  soft: 'shadow-soft',
  medium: 'shadow-medium',
  strong: 'shadow-strong',
}[props.shadow]))
</script>