<!-- src/public-apply/components/tabs/TattooTab.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import type { TattooEntryValues } from '@/features/applicants/schemas/applicant.schema'

const props = defineProps<{
  initialValues?: TattooEntryValues[]
}>()

const emit = defineEmits<{
  (e: 'next', values: { tattoos: TattooEntryValues[] }): void
  (e: 'back'): void
}>()

const locationOptions = [
  { label: 'Left Arm', value: 'left_arm' },
  { label: 'Right Arm', value: 'right_arm' },
  { label: 'Left Leg', value: 'left_leg' },
  { label: 'Right Leg', value: 'right_leg' },
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Neck / Face', value: 'neck_face' },
  { label: 'Other', value: 'other' },
]

const sizeOptions = [
  { label: 'Small (< 5cm)', value: 'small' },
  { label: 'Medium (5-15cm)', value: 'medium' },
  { label: 'Large (> 15cm)', value: 'large' },
]

const entries = ref<TattooEntryValues[]>(
  props.initialValues?.map((t) => ({
    id: t.id,
    location: t.location ?? 'left_arm',
    size: t.size ?? 'small',
    is_visible: t.is_visible ?? false,
    description: t.description ?? '',
    photo_path: t.photo_path ?? null,
  })) ?? [],
)

function addEntry() {
  entries.value.push({
    location: 'left_arm',
    size: 'small',
    is_visible: false,
    description: '',
    photo_path: null,
  })
}

function removeEntry(idx: number) {
  entries.value.splice(idx, 1)
}

function onNext() {
  emit('next', { tattoos: entries.value })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-serif font-semibold text-blueberry-800">
            <i class="pi pi-pencil mr-2" />Tattoos & Body Marks
          </h3>
          <p class="text-xs text-blueberry-500">If you do not have tattoos, you may skip this step by clicking Next.</p>
        </div>
        <Button
          label="Add Tattoo"
          icon="pi pi-plus"
          size="small"
          severity="success"
          outlined
          @click="addEntry"
        />
      </div>

      <div v-if="entries.length === 0" class="text-center py-8 text-blueberry-400">
        <i class="pi pi-check-circle text-3xl mb-2 text-emerald-500" />
        <p class="text-sm">No tattoos recorded. If none, proceed to Next.</p>
      </div>

      <div
        v-for="(entry, idx) in entries"
        :key="idx"
        class="border border-appleCore-100 rounded-lg p-4 mb-4 relative"
      >
        <button
          type="button"
          class="absolute top-3 right-3 text-red-500 hover:text-red-700"
          @click="removeEntry(idx)"
        >
          <i class="pi pi-times" />
        </button>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Location *</label>
            <Select
              v-model="entry.location"
              :options="locationOptions"
              option-label="label"
              option-value="value"
              placeholder="Select location"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Size</label>
            <Select
              v-model="entry.size"
              :options="sizeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select size"
              class="w-full"
            />
          </div>

          <div class="flex items-end gap-2 pb-1">
            <Checkbox v-model="entry.is_visible" :binary="true" :input-id="`visible_${idx}`" />
            <label :for="`visible_${idx}`" class="text-sm text-blueberry-700">
              Visible with clothes
            </label>
          </div>

          <div class="flex flex-col gap-1 md:col-span-3">
            <label class="text-sm font-medium text-blueberry-700">Description</label>
            <InputText v-model="entry.description" placeholder="Tribal, symbol, text, etc." />
          </div>
        </div>
      </div>
    </section>

    <div class="flex justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg
               font-medium text-sm hover:bg-gray-300 transition-colors"
        @click="emit('back')"
      >
        <i class="pi pi-arrow-left text-xs" />
        Back
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-apricot-500 text-white rounded-lg
               font-medium text-sm hover:bg-apricot-600 transition-colors"
        @click="onNext"
      >
        Next
        <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </div>
</template>