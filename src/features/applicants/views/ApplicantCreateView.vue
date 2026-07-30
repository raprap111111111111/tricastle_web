<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'

import { useApplicantWizard } from '../composables/useApplicantWizard'
import { useApplicantStore } from '../stores/applicant.store'
import { useApplicantSubStore } from '../stores/applicant-sub.store'

import WizardStepper from '../components/WizardStepper.vue'
import PersonalTab from '../components/tabs/PersonalTab.vue'
import PhysicalAddressTab from '../components/tabs/PhysicalAddressTab.vue'
import DocumentsTab from '../components/tabs/DocumentsTab.vue'
import LifestyleTab from '../components/tabs/LifestyleTab.vue'
import EducationTab from '../components/tabs/EducationTab.vue'
import EmploymentTab from '../components/tabs/EmploymentTab.vue'
import TattooTab from '../components/tabs/TattooTab.vue'
import BatchAssignmentTab from '../components/tabs/BatchAssignmentTab.vue'
import ReviewTab from '../components/tabs/ReviewTab.vue'
import DuplicateWarningDialog from '../components/DuplicateWarningDialog.vue'

import type {
  PersonalFormValues,
  PhysicalAddressFormValues,
  DocumentsFormValues,
  LifestyleFormValues,
  EducationEntryValues,
  EmploymentEntryValues,
  TattooEntryValues,
  BatchAssignmentValues,
} from '../schemas/applicant.schema'
import type { CreateApplicantPayload, DuplicateItem } from '../types'

const router   = useRouter()
const toast    = useToast()
const store    = useApplicantStore()
const subStore = useApplicantSubStore()

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
} = useApplicantWizard()

// ─── Wizard State ─────────────────────────────────────────
const personalData    = ref<PersonalFormValues | null>(null)
const physicalData    = ref<PhysicalAddressFormValues | null>(null)
const documentsData   = ref<DocumentsFormValues | null>(null)
const lifestyleData   = ref<LifestyleFormValues | null>(null)
const educationsData  = ref<EducationEntryValues[]>([])
const employmentsData = ref<EmploymentEntryValues[]>([])
const tattoosData     = ref<TattooEntryValues[]>([])
const batchData       = ref<BatchAssignmentValues | null>(null)

// ─── Duplicate Dialog State ───────────────────────────────
const duplicateDialog     = ref(false)
const foundDuplicates     = ref<DuplicateItem[]>([])

// ─── Validation Handlers ──────────────────────────────────
function onPersonalValidate(values: PersonalFormValues | null) {
  if (values) {
    personalData.value = values
    setStepState('personal', 'valid')
  } else {
    setStepState('personal', 'invalid')
  }
}

function onPhysicalValidate(values: PhysicalAddressFormValues | null) {
  if (values) {
    physicalData.value = values
    setStepState('physical', 'valid')
  } else {
    setStepState('physical', 'invalid')
  }
}

function onDocumentsValidate(values: DocumentsFormValues | null) {
  if (values) {
    documentsData.value = values
    setStepState('documents', 'valid')
  } else {
    setStepState('documents', 'invalid')
  }
}

function onLifestyleValidate(values: LifestyleFormValues | null) {
  if (values) {
    lifestyleData.value = values
    setStepState('lifestyle', 'valid')
  } else {
    setStepState('lifestyle', 'invalid')
  }
}

function onBatchValidate(values: BatchAssignmentValues | null) {
  batchData.value = values
  setStepState('batch', 'valid')
}

// ─── Step Next Handlers ───────────────────────────────────
function onPersonalNext(values: PersonalFormValues) {
  personalData.value = values
  setStepState('personal', 'valid')
  goNext()
}

function onPhysicalNext(values: PhysicalAddressFormValues) {
  physicalData.value = values
  setStepState('physical', 'valid')
  goNext()
}

function onDocumentsNext(values: DocumentsFormValues) {
  documentsData.value = values
  setStepState('documents', 'valid')
  goNext()
}

function onLifestyleNext(values: LifestyleFormValues) {
  lifestyleData.value = values
  setStepState('lifestyle', 'valid')
  goNext()
}

function onEducationNext(values: { educations: EducationEntryValues[] }) {
  educationsData.value = values.educations
  setStepState('education', 'valid')
  goNext()
}

function onEmploymentNext(values: { employments: EmploymentEntryValues[] }) {
  employmentsData.value = values.employments
  setStepState('employment', 'valid')
  goNext()
}

function onTattooNext(values: { tattoos: TattooEntryValues[] }) {
  tattoosData.value = values.tattoos
  setStepState('tattoos', 'valid')
  goNext()
}

function onBatchNext(values: BatchAssignmentValues) {
  batchData.value = values
  setStepState('batch', 'valid')
  goNext()
}

// ─── Pre-check duplicates when moving forward ─────────────
async function preCheckDuplicates(): Promise<boolean> {
  if (!personalData.value) return true

  const result = await store.checkDuplicates({
    email:           personalData.value.email,
    first_name:      personalData.value.first_name,
    middle_name:     personalData.value.middle_name ?? undefined,
    last_name:       personalData.value.last_name,
    date_of_birth:   personalData.value.date_of_birth ?? undefined,
    passport_number: documentsData.value?.passport_number ?? undefined,
    batch_id:        batchData.value?.batch_id ?? undefined,
  })

  if (result.has_blockers) {
    foundDuplicates.value = result.duplicates
    duplicateDialog.value = true
    return false
  }

  // Show warnings but allow continue
  if (result.has_duplicates) {
    const warnings = result.duplicates.filter((d) => d.severity === 'warn')
    if (warnings.length > 0) {
      toast.add({
        severity: 'warn',
        summary: 'Possible Duplicate',
        detail: warnings[0].message,
        life: 6000,
      })
    }
  }

  return true
}

// ─── Final Submit ─────────────────────────────────────────
async function onFinalSubmit() {
  if (hasErrors.value) {
    const stepLabels = invalidSteps.value.map((s) => s.label).join(', ')
    toast.add({
      severity: 'error',
      summary: 'Validation Errors',
      detail: `Please fix errors in: ${stepLabels}`,
      life: 5000,
    })
    if (firstInvalidStepIndex.value !== null) {
      goToStep(firstInvalidStepIndex.value)
    }
    return
  }

  if (!personalData.value) {
    toast.add({
      severity: 'warn',
      summary: 'Incomplete',
      detail: 'Please fill personal info',
      life: 3000,
    })
    goToStep(0)
    return
  }

  // ─── Pre-check for duplicates ───────────────────────────
  const canProceed = await preCheckDuplicates()
  if (!canProceed) return

  try {
    const payload: CreateApplicantPayload = {
      ...personalData.value,
      ...physicalData.value,
      ...documentsData.value,
      ...(batchData.value?.batch_id
        ? {
            batch_id:     batchData.value.batch_id,
            batch_status: batchData.value.batch_status ?? 'applied',
          }
        : {}),
    }

    const created = await store.createApplicant(payload)

    // ─── Sub-resources ─────────────────────────────────
    if (lifestyleData.value) {
      await subStore.upsertLifestyle({
        applicant_id: created.id,
        ...lifestyleData.value,
      })
    }

    for (const edu of educationsData.value) {
      await subStore.createEducation({ applicant_id: created.id, ...edu })
    }

    for (const emp of employmentsData.value) {
      await subStore.createEmployment({ applicant_id: created.id, ...emp })
    }

    for (const tattoo of tattoosData.value) {
      await subStore.createTattoo({ applicant_id: created.id, ...tattoo })
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Applicant ${created.applicant_code} created successfully`,
      life: 3000,
    })

    await store.fetchApplicants()
    router.push({ name: 'applicants.index' })
  } catch (e: any) {
    // ─── Handle duplicate error from backend ───────────
    if (e?.response?.status === 422 && e?.response?.data?.duplicates?.length) {
      foundDuplicates.value = e.response.data.duplicates
      duplicateDialog.value = true
      return
    }

    // ─── Validation error ──────────────────────────────
    if (e?.response?.status === 422) {
      const errors = e.response.data.errors ?? {}
      const firstError = Object.values(errors)[0] as string[] | undefined
      toast.add({
        severity: 'error',
        summary: 'Validation Failed',
        detail: firstError?.[0] ?? e.response.data.message ?? 'Please check your inputs.',
        life: 5000,
      })

      if (errors.email) {
        goToStep(steps.findIndex((s) => s.key === 'personal'))
      }
      return
    }

    // ─── Other errors ──────────────────────────────────
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e?.response?.data?.message ?? store.error ?? subStore.error ?? 'Something went wrong',
      life: 4000,
    })
  }
}

function onDuplicateDialogClose() {
  // Navigate back to personal step so user can adjust
  goToStep(steps.findIndex((s) => s.key === 'personal'))
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
        @click="router.push({ name: 'applicants.index' })"
      />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">Create Applicant</h1>
        <p class="text-sm text-blueberry-500">{{ currentStep.description }}</p>
      </div>
    </div>

    <!-- Stepper -->
    <WizardStepper
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
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-red-700 rounded-md text-xs font-medium border border-red-200 hover:bg-red-100 transition-colors"
            @click="goToStep(steps.findIndex((s) => s.key === step.key))"
          >
            <i class="pi pi-arrow-right text-[10px]" />
            {{ step.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Steps -->
    <PersonalTab
      v-if="currentStep.key === 'personal'"
      :initial-values="personalData ?? undefined"
      @next="onPersonalNext"
      @validate="onPersonalValidate"
    />

    <PhysicalAddressTab
      v-else-if="currentStep.key === 'physical'"
      :initial-values="physicalData ?? undefined"
      @next="onPhysicalNext"
      @validate="onPhysicalValidate"
      @back="goBack"
    />

    <DocumentsTab
      v-else-if="currentStep.key === 'documents'"
      :initial-values="documentsData ?? undefined"
      @next="onDocumentsNext"
      @validate="onDocumentsValidate"
      @back="goBack"
    />

    <LifestyleTab
      v-else-if="currentStep.key === 'lifestyle'"
      :initial-values="lifestyleData"
      @next="onLifestyleNext"
      @validate="onLifestyleValidate"
      @back="goBack"
    />

    <EducationTab
      v-else-if="currentStep.key === 'education'"
      :initial-values="educationsData"
      @next="onEducationNext"
      @back="goBack"
    />

    <EmploymentTab
      v-else-if="currentStep.key === 'employment'"
      :initial-values="employmentsData"
      @next="onEmploymentNext"
      @back="goBack"
    />

    <TattooTab
      v-else-if="currentStep.key === 'tattoos'"
      :initial-values="tattoosData"
      @next="onTattooNext"
      @back="goBack"
    />

    <BatchAssignmentTab
      v-else-if="currentStep.key === 'batch'"
      :initial-values="batchData"
      @next="onBatchNext"
      @validate="onBatchValidate"
      @back="goBack"
    />

    <ReviewTab
      v-else-if="currentStep.key === 'review'"
      :personal="personalData"
      :physical="physicalData"
      :documents="documentsData"
      :lifestyle="lifestyleData"
      :educations="educationsData"
      :employments="employmentsData"
      :tattoos="tattoosData"
      :batch="batchData"
      :steps="steps"
      :loading="store.submitting || subStore.submitting"
      :has-errors="hasErrors"
      :invalid-steps="invalidSteps"
      mode="create"
      @submit="onFinalSubmit"
      @back="goBack"
      @go-to="goToStep"
    />

    <!-- ─── Duplicate Warning Dialog ────────────────────── -->
    <DuplicateWarningDialog
      v-model:visible="duplicateDialog"
      :duplicates="foundDuplicates"
      @close="onDuplicateDialogClose"
    />
  </div>
</template>