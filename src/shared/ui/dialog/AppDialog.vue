<template>
  <Dialog
    :visible="visible"
    :modal="modal"
    :closable="closable"
    :dismissable-mask="dismissableMask"
    :header="title"
    :style="{ width: dialogWidth }"
    :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
    :pt="{
      root: '!rounded-2xl overflow-hidden',
      header: '!bg-white !border-b !border-appleCore-100 !px-6 !py-4',
      title: '!text-lg !font-serif !font-semibold !text-blueberry-800',
      content: '!p-6',
      footer: '!bg-appleCore-50 !border-t !border-appleCore-100 !px-6 !py-3',
    }"
    @update:visible="(val) => emit('update:visible', val)"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    modal?: boolean
    closable?: boolean
    dismissableMask?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  }>(),
  {
    modal: true,
    closable: true,
    dismissableMask: true,
    size: 'md',
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const dialogWidth = computed(() => {
  const map = { sm: '400px', md: '550px', lg: '750px', xl: '950px', full: '95vw' }
  return map[props.size]
})
</script>