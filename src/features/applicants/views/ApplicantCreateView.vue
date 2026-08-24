<!-- src/features/applicants/views/ApplicantCreateView.vue -->
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
import DeploymentTab from '../components/tabs/DeploymentTab.vue'
import FamilyTab from '../components/tabs/FamilyTab.vue'
import LifestyleTab from '../components/tabs/LifestyleTab.vue'
import EducationTab from '../components/tabs/EducationTab.vue'
import EmploymentTab from '../components/tabs/EmploymentTab.vue'
import TattooTab from '../components/tabs/TattooTab.vue'
import ReviewTab from '../components/tabs/ReviewTab.vue'
import DuplicateWarningDialog from '../components/DuplicateWarningDialog.vue'

import { DOCUMENT_TYPE_IDS } from '../constants/document-types'

import type {
  PersonalFormValues,
  PhysicalAddressFormValues,
  DocumentsFormValues,
  DeploymentFormValues,
  FamilyFormValues,
  LifestyleFormValues,
  EducationEntryValues,
  EmploymentEntryValues,
  TattooEntryValues,
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

// ─── Wizard State ──────────────────────────────────────────────────────────────
const personalData    = ref<PersonalFormValues | null>(null)
const physicalData    = ref<PhysicalAddressFormValues | null>(null)
const documentsData   = ref<DocumentsFormValues | null>(null)
const deploymentData  = ref<DeploymentFormValues | null>(null)
const familyData      = ref<FamilyFormValues | null>(null)
const lifestyleData   = ref<LifestyleFormValues | null>(null)
const educationsData  = ref<EducationEntryValues[]>([])
const employmentsData = ref<EmploymentEntryValues[]>([])
const tattoosData     = ref<TattooEntryValues[]>([])

// ─── Duplicate Dialog ─────────────────────────────────────────────────────────
const duplicateDialog = ref(false)
const foundDuplicates = ref<DuplicateItem[]>([])

// ─── Validate Handlers ────────────────────────────────────────────────────────

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

function onDeploymentValidate(values: DeploymentFormValues | null) {
  deploymentData.value = values
  setStepState('deployment', 'valid')
}

function onFamilyValidate(values: FamilyFormValues | null) {
  familyData.value = values
  setStepState('family', 'valid')
}

function onLifestyleValidate(values: LifestyleFormValues | null) {
  if (values) {
    lifestyleData.value = values
    setStepState('lifestyle', 'valid')
  } else {
    setStepState('lifestyle', 'invalid')
  }
}

// ─── Next Handlers ────────────────────────────────────────────────────────────

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

function onDeploymentNext(values: DeploymentFormValues) {
  deploymentData.value = values
  setStepState('deployment', 'valid')
  goNext()
}

function onFamilyNext(values: FamilyFormValues) {
  familyData.value = values
  setStepState('family', 'valid')
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

// ─── Duplicate Pre-check ──────────────────────────────────────────────────────
async function preCheckDuplicates(): Promise<boolean> {
  if (!personalData.value) return true

  const result = await store.checkDuplicates({
    email:           personalData.value.email,
    first_name:      personalData.value.first_name,
    middle_name:     personalData.value.middle_name ?? undefined,
    last_name:       personalData.value.last_name,
    date_of_birth:   personalData.value.date_of_birth ?? undefined,
    passport_number: documentsData.value?.passport_number ?? undefined,
  })

  if (result.has_blockers) {
    foundDuplicates.value = result.duplicates
    duplicateDialog.value = true
    return false
  }

  if (result.has_duplicates) {
    const warnings = result.duplicates.filter((d) => d.severity === 'warn')
    if (warnings.length > 0) {
      toast.add({
        severity: 'warn',
        summary:  'Possible Duplicate',
        detail:   warnings[0].message,
        life:     6000,
      })
    }
  }

  return true
}

// ─── Final Submit ─────────────────────────────────────────────────────────────
async function onFinalSubmit() {
  if (hasErrors.value) {
    const stepLabels = invalidSteps.value.map((s) => s.label).join(', ')
    toast.add({
      severity: 'error',
      summary:  'Validation Errors',
      detail:   `Please fix errors in: ${stepLabels}`,
      life:     5000,
    })
    if (firstInvalidStepIndex.value !== null) {
      goToStep(firstInvalidStepIndex.value)
    }
    return
  }

  if (!personalData.value) {
    toast.add({
      severity: 'warn',
      summary:  'Incomplete',
      detail:   'Please fill personal info',
      life:     3000,
    })
    goToStep(0)
    return
  }

  const canProceed = await preCheckDuplicates()
  if (!canProceed) return

  try {
    // 🎯 Strip File objects from JSON payload to prevent breaking API
    const { 
      biodata_file, 
      biodata_notes, 
      id_photo_file, 
      ...docFields 
    } = documentsData.value ?? {}

    const payload: CreateApplicantPayload = {
      ...personalData.value,
      ...(physicalData.value ?? {}),
      ...docFields,
      ...(deploymentData.value ?? {}),
      ...(familyData.value ?? {}),
    }

    const created = await store.createApplicant(payload)

    // ── Sub-resources ──────────────────────────────────────────────────────────
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

    // 📸 Upload 2x2 Photo if scanned/uploaded
    if (id_photo_file instanceof File) {
      try {
        await subStore.uploadBiodata(
          created.id,
          id_photo_file,
          DOCUMENT_TYPE_IDS.ID_PHOTO ?? 10,
          '2x2 Profile Photo',
        )
      } catch (err: any) {
        toast.add({
          severity: 'warn',
          summary:  'Photo Upload Issue',
          detail:   err?.response?.data?.message ?? 'Applicant created, but 2x2 photo could not be attached.',
          life:     6000,
        })
      }
    }

    // 📄 Upload Biodata if scanned/uploaded
    if (biodata_file instanceof File) {
      try {
        await subStore.uploadBiodata(
          created.id,
          biodata_file,
          DOCUMENT_TYPE_IDS.BIODATA ?? 9,
          biodata_notes ?? undefined,
        )
      } catch (err: any) {
        toast.add({
          severity: 'warn',
          summary:  'Biodata Upload Issue',
          detail:   err?.response?.data?.message ?? 'Applicant created, but biodata file could not be attached.',
          life:     6000,
        })
      }
    }

    toast.add({
      severity: 'success',
      summary:  'Applicant Created',
      detail:   `${created.applicant_code} created — status: Pending`,
      life:     3000,
    })

    await store.fetchApplicants()
    router.push({ name: 'applicants.index' })

  } catch (e: any) {
    if (e?.response?.status === 409 && e?.response?.data?.duplicates?.length) {
      foundDuplicates.value = e.response.data.duplicates
      duplicateDialog.value = true
      return
    }

    if (e?.response?.status === 422) {
      const errors     = e.response.data.errors ?? {}
      const firstError = Object.values(errors)[0] as string[] | undefined

      toast.add({
        severity: 'error',
        summary:  'Validation Failed',
        detail:   firstError?.[0] ?? e.response.data.message ?? 'Please check your inputs.',
        life:     5000,
      })

      if (errors.email || errors.first_name || errors.last_name) {
        goToStep(steps.findIndex((s) => s.key === 'personal'))
      } else if (
        errors.skill_category         ||
        errors.trade_or_occupation    ||
        errors.jlpt_level             ||
        errors.willing_to_be_deployed ||
        errors.expected_salary
      ) {
        goToStep(steps.findIndex((s) => s.key === 'deployment'))
      } else if (
        errors.father_name ||
        errors.mother_name ||
        errors.spouse_name ||
        errors.emergency_contact_phone
      ) {
        goToStep(steps.findIndex((s) => s.key === 'family'))
      }
      return
    }

    toast.add({
      severity: 'error',
      summary:  'Error',
      detail:   e?.response?.data?.message ?? store.error ?? subStore.error ?? 'Something went wrong',
      life:     4000,
    })
  }
}

function onDuplicateDialogClose() {
  goToStep(steps.findIndex((s) => s.key === 'personal'))
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        @click="router.push({ name: 'applicants.index' })"
      />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          Create Applicant
        </h1>
        <p class="text-sm text-blueberry-500">{{ currentStep.description }}</p>
      </div>
    </div>

    <div class="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
      <i class="pi pi-info-circle text-blue-500" />
      Applicant will start as <strong class="mx-1">Pending</strong>.
      Batch assignment is available after moving to <strong class="ml-1">Final List</strong>.
    </div>

    <WizardStepper
      :steps="steps"
      :current-index="currentStepIndex"
      :progress="progress"
      :step-states="stepStates"
      @go-to="goToStep"
    />

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
                   hover:bg-red-100 transition-colors"
            @click="goToStep(steps.findIndex((s) => s.key === step.key))"
          >
            <i class="pi pi-arrow-right text-[10px]" />
            {{ step.label }}
          </button>
        </div>
      </div>
    </div>

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

    <DeploymentTab
      v-else-if="currentStep.key === 'deployment'"
      :initial-values="deploymentData ?? undefined"
      @next="onDeploymentNext"
      @validate="onDeploymentValidate"
      @back="goBack"
    />

    <FamilyTab
      v-else-if="currentStep.key === 'family'"
      :initial-values="familyData ?? undefined"
      @next="onFamilyNext"
      @validate="onFamilyValidate"
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

    <ReviewTab
      v-else-if="currentStep.key === 'review'"
      :personal="personalData"
      :physical="physicalData"
      :documents="documentsData"
      :deployment="deploymentData"
      :family="familyData"
      :lifestyle="lifestyleData"
      :educations="educationsData"
      :employments="employmentsData"
      :tattoos="tattoosData"
      :steps="steps"
      :loading="store.submitting || subStore.submitting"
      :has-errors="hasErrors"
      :invalid-steps="invalidSteps"
      mode="create"
      @submit="onFinalSubmit"
      @back="goBack"
      @go-to="goToStep"
    />

    <DuplicateWarningDialog
      v-model:visible="duplicateDialog"
      :duplicates="foundDuplicates"
      @close="onDuplicateDialogClose"
    />
  </div>
</template>