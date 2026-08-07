<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import { useCompanyCategoryStore } from '@features/company-categories/stores/company-category.store'
import type {
  BasicInfoFormValues,
  AddressFormValues,
  ContactFormValues,
  DescriptionFormValues,
} from '../../schemas/company.schema'
import type { WizardStep } from '../../composables/useCompanyWizard'

const props = defineProps<{
  basic: BasicInfoFormValues | null
  address: AddressFormValues | null
  contact: ContactFormValues | null
  description: DescriptionFormValues | null
  steps: WizardStep[]
  loading: boolean
  hasErrors: boolean
  invalidSteps: WizardStep[]
  mode?: 'create' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'back'): void
  (e: 'go-to', index: number): void
}>()

const categoryStore = useCompanyCategoryStore()

const categoryName = computed(() => {
  if (!props.basic?.category_id) return '—'
  return categoryStore.categories.find((c) => c.id === props.basic!.category_id)?.name ?? '—'
})

function goToStep(key: string) {
  const idx = props.steps.findIndex((s) => s.key === key)
  if (idx !== -1) emit('go-to', idx)
}
</script>

<template>
  <div class="flex flex-col gap-6">

    <!-- Review Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Basic Info -->
      <div class="bg-white border border-appleCore-100 rounded-2xl p-5 shadow-soft">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-building text-apricot-500" />
            <h3 class="font-serif font-semibold text-blueberry-800">Basic Information</h3>
          </div>
          <button type="button" class="text-xs text-apricot-600 hover:underline" @click="goToStep('basic')">
            Edit
          </button>
        </div>

        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-blueberry-500">Code</dt>
            <dd class="font-mono text-apricot-600 font-semibold">{{ basic?.code ?? '—' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-blueberry-500">Name</dt>
            <dd class="font-medium text-blueberry-800">{{ basic?.name ?? '—' }}</dd>
          </div>
          <div v-if="basic?.name_japanese" class="flex justify-between">
            <dt class="text-blueberry-500">Japanese</dt>
            <dd class="font-medium text-blueberry-800">{{ basic.name_japanese }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-blueberry-500">Category</dt>
            <dd class="font-medium text-blueberry-800">{{ categoryName }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-blueberry-500">Status</dt>
            <dd>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                :class="basic?.is_active ? 'bg-green-100 text-green-700' : 'bg-blueberry-100 text-blueberry-500'"
              >
                {{ basic?.is_active ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <!-- Address -->
      <div class="bg-white border border-appleCore-100 rounded-2xl p-5 shadow-soft">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-map-marker text-apricot-500" />
            <h3 class="font-serif font-semibold text-blueberry-800">Address</h3>
          </div>
          <button type="button" class="text-xs text-apricot-600 hover:underline" @click="goToStep('address')">
            Edit
          </button>
        </div>

        <dl class="space-y-2 text-sm">
          <div v-if="address?.address" class="flex justify-between">
            <dt class="text-blueberry-500">Street</dt>
            <dd class="font-medium text-blueberry-800 text-right">{{ address.address }}</dd>
          </div>
          <div v-if="address?.city" class="flex justify-between">
            <dt class="text-blueberry-500">City</dt>
            <dd class="font-medium text-blueberry-800">{{ address.city }}</dd>
          </div>
          <div v-if="address?.prefecture" class="flex justify-between">
            <dt class="text-blueberry-500">Prefecture</dt>
            <dd class="font-medium text-blueberry-800">{{ address.prefecture }}</dd>
          </div>
          <div v-if="address?.postal_code" class="flex justify-between">
            <dt class="text-blueberry-500">Postal Code</dt>
            <dd class="font-medium text-blueberry-800">{{ address.postal_code }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-blueberry-500">Country</dt>
            <dd class="font-medium text-blueberry-800">🌍 {{ address?.country ?? '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Contact -->
      <div class="bg-white border border-appleCore-100 rounded-2xl p-5 shadow-soft">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-phone text-apricot-500" />
            <h3 class="font-serif font-semibold text-blueberry-800">Contact</h3>
          </div>
          <button type="button" class="text-xs text-apricot-600 hover:underline" @click="goToStep('contact')">
            Edit
          </button>
        </div>

        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-blueberry-500">Person</dt>
            <dd class="font-medium text-blueberry-800">{{ contact?.contact_person ?? '—' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-blueberry-500">Email</dt>
            <dd class="font-medium text-blueberry-800">{{ contact?.contact_email ?? '—' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-blueberry-500">Phone</dt>
            <dd class="font-medium text-blueberry-800">{{ contact?.contact_phone ?? '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Description -->
      <div class="bg-white border border-appleCore-100 rounded-2xl p-5 shadow-soft">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i class="pi pi-file-edit text-apricot-500" />
            <h3 class="font-serif font-semibold text-blueberry-800">Description</h3>
          </div>
          <button type="button" class="text-xs text-apricot-600 hover:underline" @click="goToStep('description')">
            Edit
          </button>
        </div>

        <p class="text-sm text-blueberry-700 whitespace-pre-wrap">
          {{ description?.description || '(No description)' }}
        </p>
      </div>
    </div>

    <!-- Errors -->
    <div v-if="hasErrors" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-800 font-medium mb-2">
        Please fix errors in {{ invalidSteps.length }} step{{ invalidSteps.length > 1 ? 's' : '' }}:
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="step in invalidSteps"
          :key="step.key"
          type="button"
          class="text-xs px-2 py-1 bg-white text-red-700 rounded border border-red-200 hover:bg-red-100"
          @click="goToStep(step.key)"
        >
          {{ step.label }}
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <Button label="Back" icon="pi pi-arrow-left" severity="secondary" text @click="emit('back')" />
      <Button
        :label="mode === 'edit' ? 'Update Company' : 'Create Company'"
        icon="pi pi-check"
        :loading="loading"
        :disabled="hasErrors"
        class="!bg-green-600 hover:!bg-green-700 !border-green-600"
        @click="emit('submit')"
      />
    </div>
  </div>
</template>