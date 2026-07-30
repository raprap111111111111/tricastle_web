<template>
  <Button
    v-bind="$attrs"
    :label="label"
    :icon="icon"
    :icon-pos="iconPos"
    :loading="loading"
    :disabled="disabled"
    :severity="severity"
    :size="size"
    :outlined="outlined"
    :text="text"
    :rounded="rounded"
    :class="[
      variantClass,
      { 'w-full': block },
    ]"
  >
    <slot />
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'

type Variant  = 'primary' | 'accent' | 'secondary' | 'neutral' | 'danger' | 'success'
type Size     = 'small' | 'normal' | 'large'
type IconPos  = 'left' | 'right' | 'top' | 'bottom'

const props = withDefaults(
  defineProps<{
    label?: string
    icon?: string
    iconPos?: IconPos
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    outlined?: boolean
    text?: boolean
    rounded?: boolean
    block?: boolean
    severity?: string
  }>(),
  {
    variant: 'accent',
    size: 'normal',
    iconPos: 'left',
    loading: false,
    disabled: false,
    outlined: false,
    text: false,
    rounded: false,
    block: false,
  },
)

const variantClass = computed(() => {
  if (props.text || props.outlined) return ''

  const variants: Record<Variant, string> = {
    accent:    '!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white',
    primary:   '!bg-blueberry-500 hover:!bg-blueberry-600 !border-blueberry-500 !text-white',
    secondary: '!bg-citrus-500 hover:!bg-citrus-600 !border-citrus-500 !text-white',
    neutral:   '!bg-appleCore-300 hover:!bg-appleCore-400 !border-appleCore-300 !text-blueberry-800',
    danger:    '!bg-red-500 hover:!bg-red-600 !border-red-500 !text-white',
    success:   '!bg-green-500 hover:!bg-green-600 !border-green-500 !text-white',
  }
  return variants[props.variant]
})
</script>