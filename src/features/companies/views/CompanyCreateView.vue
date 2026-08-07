<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'

import { useCompanyWizard } from '../composables/useCompanyWizard'
import { useCompanyStore } from '../stores/company.store'

import CompanyWizardStepper from '../components/CompanyWizardStepper.vue'
import BasicInfoTab from '../components/tabs/BasicInfoTab.vue'
import AddressTab from '../components/tabs/AddressTab.vue'
import ContactTab from '../components/tabs/ContactTab.vue'
import DescriptionTab from '../components/tabs/DescriptionTab.vue'
import ReviewTab from '../components/tabs/ReviewTab.vue'

import type {
  BasicInfoFormValues,
  AddressFormValues,
  ContactFormValues,
  DescriptionFormValues,
} from '../schemas/company.schema'
import type { CompanyPayload } from '../types'

const router = useRouter()
const toast = useToast()
const store = useCompanyStore()

const {
  steps,
  currentStepIndex,
  currentStep,
  progress,
  stepStates,
  hasErrors,
  invalidSteps,
  firstInvalidStepIndex,
  setStepState,
  goNext,
  goBack,
  goToStep,
} = useCompanyWizard()

// Wizard state
const basicData = ref<BasicInfoFormValues | null>(null)
const addressData = ref<AddressFormValues | null>(null)
const contactData = ref<ContactFormValues | null>(null)
const descriptionData = ref<DescriptionFormValues | null>(null)

// ─── Validation Handlers ──────────────────────────
function onBasicValidate(values: BasicInfoFormValues | null) {
  if (values) {
    basicData.value = values
    setStepState('basic', 'valid')
  } else {
    setStepState('basic', 'invalid')
  }
}

function onAddressValidate(values: AddressFormValues | null) {
  if (values) {
    addressData.value = values
    setStepState('address', 'valid')
  } else {
    setStepState('address', 'invalid')
  }
}

function onContactValidate(values: ContactFormValues | null) {
  if (values) {
    contactData.value = values
    setStepState('contact', 'valid')
  } else {
    setStepState('contact', 'invalid')
  }
}

// ─── Next Handlers ────────────────────────────────
function onBasicNext(values: BasicInfoFormValues) {
  basicData.value = values
  setStepState('basic', 'valid')
  goNext()
}

function onAddressNext(values: AddressFormValues) {
  addressData.value = values
  setStepState('address', 'valid')
  goNext()
}

function onContactNext(values: ContactFormValues) {
  contactData.value = values
  setStepState('contact', 'valid')
  goNext()
}

function onDescriptionNext(values: DescriptionFormValues) {
  descriptionData.value = values
  setStepState('description', 'valid')
  goNext()
}

// ─── Final Submit ─────────────────────────────────
async function onFinalSubmit() {
  if (hasErrors.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation Errors',
      detail: `Please fix errors first`,
      life: 5000,
    })
    if (firstInvalidStepIndex.value !== null) {
      goToStep(firstInvalidStepIndex.value)
    }
    return
  }

  if (!basicData.value) {
    toast.add({
      severity: 'warn',
      summary: 'Incomplete',
      detail: 'Please fill basic information',
      life: 3000,
    })
    goToStep(0)
    return
  }

  try {
    const payload: CompanyPayload = {
      ...basicData.value,
      ...(addressData.value ?? {}),
      ...(contactData.value ?? {}),
      ...(descriptionData.value ?? {}),
    } as CompanyPayload

    const created = await store.createCompany(payload)

    toast.add({
      severity: 'success',
      summary: 'Company Created',
      detail: `${created.name} was successfully added.`,
      life: 3000,
    })

    router.push({ name: 'companies.index' })
  } catch (e: any) {
    if (e?.response?.status === 422) {
      const errors = e.response.data.errors ?? {}
      const firstError = Object.values(errors)[0] as string[] | undefined
      toast.add({
        severity: 'error',
        summary: 'Validation Failed',
        detail: firstError?.[0] ?? 'Please check your inputs',
        life: 5000,
      })
      return
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e?.response?.data?.message ?? store.error ?? 'Something went wrong',
      life: 4000,
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-5xl mx-auto">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        @click="router.push({ name: 'companies.index' })"
      />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          Create Company
        </h1>
        <p class="text-sm text-blueberry-500">{{ currentStep.description }}</p>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
      <i class="pi pi-info-circle text-blue-500" />
      Add a new employer or partner company for overseas deployment.
    </div>

    <!-- Stepper -->
    <CompanyWizardStepper
      :steps="steps"
      :current-index="currentStepIndex"
      :progress="progress"
      :step-states="stepStates"
      @go-to="goToStep"
    />

    <!-- Error Summary -->
    <div
      v-if="hasErrors"
      class="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <i class="pi pi-exclamation-triangle text-red-500 text-lg mt-0.5" />
      <div class="flex-1">
        <h4 class="text-sm font-semibold text-red-800 mb-1">
          {{ invalidSteps.length }} step{{ invalidSteps.length > 1 ? 's have' : ' has' }} errors
        </h4>
        <div class="flex flex-wrap gap-2 mt-2">
          <button
            v-for="step in invalidSteps"
            :key="step.key"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-red-700
                   rounded-md text-xs font-medium border border-red-200
                   hover:bg-red-100"
            @click="goToStep(steps.findIndex((s) => s.key === step.key))"
          >
            <i class="pi pi-arrow-right text-[10px]" />
            {{ step.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Steps -->
    <BasicInfoTab
      v-if="currentStep.key === 'basic'"
      :initial-values="basicData ?? undefined"
      @next="onBasicNext"
      @validate="onBasicValidate"
    />

    <AddressTab
      v-else-if="currentStep.key === 'address'"
      :initial-values="addressData ?? undefined"
      @next="onAddressNext"
      @validate="onAddressValidate"
      @back="goBack"
    />

    <ContactTab
      v-else-if="currentStep.key === 'contact'"
      :initial-values="contactData ?? undefined"
      @next="onContactNext"
      @validate="onContactValidate"
      @back="goBack"
    />

    <DescriptionTab
      v-else-if="currentStep.key === 'description'"
      :initial-values="descriptionData ?? undefined"
      @next="onDescriptionNext"
      @back="goBack"
    />

    <ReviewTab
      v-else-if="currentStep.key === 'review'"
      :basic="basicData"
      :address="addressData"
      :contact="contactData"
      :description="descriptionData"
      :steps="steps"
      :loading="store.submitting"
      :has-errors="hasErrors"
      :invalid-steps="invalidSteps"
      mode="create"
      @submit="onFinalSubmit"
      @back="goBack"
      @go-to="goToStep"
    />
  </div>
</template>