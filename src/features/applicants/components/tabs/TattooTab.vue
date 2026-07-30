<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import type { TattooEntryValues } from '../../schemas/applicant.schema'

const props = defineProps<{
  initialValues?: TattooEntryValues[]
}>()

const emit = defineEmits<{
  (e: 'next', values: { tattoos: TattooEntryValues[] }): void
  (e: 'back'): void
}>()

const entries = ref<TattooEntryValues[]>(
  props.initialValues?.map((t) => ({
    id:          t.id,
    location:    t.location,
    size:        t.size ?? null,
    description: t.description ?? '',
    photo_path:  t.photo_path ?? '',
    is_visible:  t.is_visible,
  })) ?? [],
)

const sizeOptions = [
  { label: 'Small',  value: 'small'  },
  { label: 'Medium', value: 'medium' },
  { label: 'Large',  value: 'large'  },
]

function addEntry() {
  entries.value.push({
    location:    '',
    size:        null,
    description: '',
    photo_path:  '',
    is_visible:  true,
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
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-palette mr-2" />Tattoo Records
        </h3>
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
        <i class="pi pi-palette text-3xl mb-2" />
        <p class="text-sm">No tattoo records. Click "Add Tattoo" if applicable.</p>
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
            <InputText v-model="entry.location" placeholder="Left arm, back, chest..." />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Size</label>
            <Select
              v-model="entry.size"
              :options="sizeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select size"
            />
          </div>

          <div class="flex items-end gap-2 pb-1">
            <Checkbox v-model="entry.is_visible" :binary="true" :input-id="`vis_${idx}`" />
            <label :for="`vis_${idx}`" class="text-sm text-blueberry-700">
              Visible with normal clothes
            </label>
          </div>

          <div class="flex flex-col gap-1 md:col-span-3">
            <label class="text-sm font-medium text-blueberry-700">Description</label>
            <Textarea
              v-model="entry.description"
              rows="2"
              placeholder="Describe the tattoo..."
              auto-resize
            />
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