<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import type { DescriptionFormValues } from '../../schemas/company.schema'

const props = defineProps<{
  initialValues?: DescriptionFormValues
}>()

const emit = defineEmits<{
  (e: 'next', values: DescriptionFormValues): void
  (e: 'back'): void
}>()

const description = ref(props.initialValues?.description ?? '')

function onSubmit() {
  emit('next', { description: description.value.trim() || null })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="bg-white border border-appleCore-100 rounded-2xl p-6 shadow-soft">
      <div class="flex items-center gap-2 mb-5">
        <i class="pi pi-file-edit text-apricot-500" />
        <h2 class="text-lg font-serif font-semibold text-blueberry-800">Description</h2>
      </div>

      <div>
        <label class="block text-xs font-medium text-blueberry-700 mb-1.5 uppercase tracking-wider">
          Company Profile / Notes
        </label>
        <Textarea
          v-model="description"
          rows="8"
          placeholder="Describe the company profile, industry focus, services, or any other relevant notes..."
          class="w-full"
        />
        <p class="text-xs text-blueberry-400 mt-2">
          Optional · {{ description.length }} / 2000 characters
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <Button label="Back" icon="pi pi-arrow-left" severity="secondary" text @click="emit('back')" />
      <Button label="Next" icon="pi pi-arrow-right" icon-pos="right" @click="onSubmit" />
    </div>
  </div>
</template>