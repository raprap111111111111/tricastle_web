<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { AppHoldToDeleteButton } from '@shared/ui'
import type { CompanyCategory } from '../types'

const props = defineProps<{
  visible: boolean
  category: CompanyCategory | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
}>()

function close() {
  emit('update:visible', false)
}

function onHoldComplete() {
  emit('confirm')
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    :closable="!props.loading"
    :show-header="false"
    :style="{ width: '28rem' }"
    :dismissable-mask="!props.loading"
    :pt="{
      root:    { class: '!bg-[#faf7f2] !border !border-appleCore-200 !rounded-2xl overflow-hidden !shadow-xl' },
      content: { class: '!bg-[#faf7f2] !p-0 !rounded-2xl' },
      mask:    { class: '!bg-blueberry-900/40 !backdrop-blur-sm' },
    }"
    @update:visible="close"
  >
    <div class="p-6 flex flex-col gap-5">
      <!-- Title -->
      <div class="text-center">
        <h2 class="text-blueberry-800 text-2xl font-serif font-bold">
          Hold to delete.
        </h2>
        <p class="text-blueberry-500 text-sm mt-2">
          Companies using this category may be affected.
        </p>
      </div>

      <!-- Category card -->
      <div class="bg-white rounded-xl px-4 py-3 border border-appleCore-200">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-mono text-xs text-blueberry-500 bg-appleCore-50 px-2 py-0.5 rounded">
            {{ props.category?.slug }}
          </span>
          <span
            v-if="props.category?.is_active"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold
                   bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          >
            <i class="pi pi-check-circle text-[8px]" />
            ACTIVE
          </span>
        </div>
        <p class="text-blueberry-800 font-semibold text-sm">
          {{ props.category?.name }}
        </p>
        <p v-if="props.category?.description" class="text-blueberry-500 text-xs mt-0.5 line-clamp-2">
          {{ props.category.description }}
        </p>
      </div>

      <!-- Hold to delete button -->
      <AppHoldToDeleteButton
        label="Hold to delete"
        hint-text="hold 2s"
        :duration="2000"
        :loading="props.loading"
        @complete="onHoldComplete"
      />

      <!-- Cancel -->
      <button
        type="button"
        class="text-center text-blueberry-500 text-sm hover:text-blueberry-700
               transition-colors py-2 disabled:opacity-50 font-medium"
        :disabled="props.loading"
        @click="close"
      >
        Cancel
      </button>
    </div>
  </Dialog>
</template>