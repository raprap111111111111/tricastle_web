<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import type { CompanyCategory, CompanyCategoryPayload } from '../types'

const props = defineProps<{
  initial?: CompanyCategory | null
  submitLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CompanyCategoryPayload]
  cancel: []
}>()

interface FormState {
  name: string
  slug: string | null
  description: string | null
  is_active: boolean
}

const form = ref<FormState>({
  name:        props.initial?.name ?? '',
  slug:        props.initial?.slug ?? null,
  description: props.initial?.description ?? null,
  is_active:   props.initial?.is_active ?? true,
})

// Auto-slug from name
watch(() => form.value.name, (newName) => {
  if (!props.initial && (!form.value.slug || form.value.slug === '')) {
    form.value.slug = newName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
})

watch(() => props.initial, (val) => {
  if (val) {
    form.value = {
      name:        val.name,
      slug:        val.slug,
      description: val.description,
      is_active:   val.is_active,
    }
  }
})

function onSubmit() {
  emit('submit', { ...form.value })
}
</script>

<template>
  <form
    class="bg-white rounded-2xl border border-appleCore-100 p-6 space-y-6"
    @submit.prevent="onSubmit"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Name <span class="text-red-500">*</span>
        </label>
        <InputText v-model="form.name" placeholder="e.g. Manufacturing" class="w-full" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Slug
          <span class="text-blueberry-400 font-normal normal-case text-[10px] ml-1">
            (auto-generated if empty)
          </span>
        </label>
        <InputText v-model="form.slug" placeholder="manufacturing" class="w-full" />
      </div>
    </div>

    <div>
      <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
        Description
      </label>
      <Textarea
        v-model="form.description"
        rows="4"
        placeholder="Brief description of this category..."
        class="w-full"
      />
    </div>

    <div class="border border-apricot-200 bg-apricot-50/50 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <ToggleSwitch v-model="form.is_active" input-id="cat-active" />
        <div>
          <label for="cat-active" class="text-sm font-semibold text-blueberry-800 cursor-pointer">
            {{ form.is_active ? 'Active' : 'Inactive' }}
          </label>
          <p class="text-xs text-blueberry-500 mt-0.5">
            {{ form.is_active
              ? 'This category is available for new companies.'
              : 'This category is hidden from new company assignments.' }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-4 border-t border-appleCore-100">
      <Button type="button" label="Cancel" severity="secondary" outlined @click="emit('cancel')" />
      <Button type="submit" :label="submitLabel ?? 'Save'" :loading="loading" icon="pi pi-check" />
    </div>
  </form>
</template>