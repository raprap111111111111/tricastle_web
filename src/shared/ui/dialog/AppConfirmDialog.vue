<template>
  <AppDialog
    :visible="visible"
    :title="title"
    size="sm"
    @update:visible="(v) => emit('update:visible', v)"
  >
    <div class="flex gap-4">
      <div
        class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        :class="iconBg"
      >
        <i :class="icon" class="text-white text-xl" />
      </div>
      <div class="flex-1">
        <p class="text-blueberry-800 font-medium">{{ message }}</p>
        <p v-if="description" class="text-sm text-blueberry-500 mt-1">
          {{ description }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <AppButton
          :label="cancelLabel"
          variant="neutral"
          text
          @click="emit('update:visible', false)"
        />
        <AppButton
          :label="confirmLabel"
          :variant="confirmVariant"
          :loading="loading"
          @click="handleConfirm"
        />
      </div>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppDialog from './AppDialog.vue'
import AppButton from '../button/AppButton.vue'

type Variant = 'danger' | 'success' | 'accent' | 'primary'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    message: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: Variant
    loading?: boolean
  }>(),
  {
    title: 'Confirm Action',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmVariant: 'danger',
    loading: false,
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
}>()

const icon = computed(() => {
  const map: Record<Variant, string> = {
    danger:  'pi pi-exclamation-triangle',
    success: 'pi pi-check',
    accent:  'pi pi-info-circle',
    primary: 'pi pi-question-circle',
  }
  return map[props.confirmVariant]
})

const iconBg = computed(() => {
  const map: Record<Variant, string> = {
    danger:  'bg-red-500',
    success: 'bg-green-500',
    accent:  'bg-apricot-500',
    primary: 'bg-blueberry-500',
  }
  return map[props.confirmVariant]
})

function handleConfirm() {
  emit('confirm')
}
</script>