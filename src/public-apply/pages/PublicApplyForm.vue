<!-- src/public-apply/pages/PublicApplyForm.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'

import { useApplicantWizard } from '@/features/applicants/composables/useApplicantWizard'
import publicApplyApi from '@/public-apply/services/publicApplyApi'

// 🟢 Import ONLY from public-apply tabs
import WizardStepper from '@/features/applicants/components/WizardStepper.vue'
import PersonalTab from '@/public-apply/components/tabs/PersonalTab.vue'
import PhysicalAddressTab from '@/public-apply/components/tabs/PhysicalAddressTab.vue'
import DocumentsTab from '@/public-apply/components/tabs/DocumentsTab.vue'
import DeploymentTab from '@/public-apply/components/tabs/DeploymentTab.vue'
import FamilyTab from '@/public-apply/components/tabs/FamilyTab.vue'
import LifestyleTab from '@/public-apply/components/tabs/LifestyleTab.vue'
import EducationTab from '@/public-apply/components/tabs/EducationTab.vue'
import EmploymentTab from '@/public-apply/components/tabs/EmploymentTab.vue'
import TattooTab from '@/public-apply/components/tabs/TattooTab.vue'
import ReviewTab from '@/public-apply/components/tabs/ReviewTab.vue'
import DuplicateWarningDialog from '@/features/applicants/components/DuplicateWarningDialog.vue'

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
} from '@/features/applicants/schemas/applicant.schema'
import type { DuplicateItem } from '@/features/applicants/types'

interface WizardStepItem {
  key: string
  label: string
  description?: string
}

const toast = useToast()

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

// ─── Submission State ─────────────────────────────────────────────────────────
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const submittedApplicant = ref<{ applicant_code: string; full_name: string } | null>(null)

// ─── Wizard State ──────────────────────────────────────────────────────────────
const personalData = ref<PersonalFormValues | null>(null)
const physicalData = ref<PhysicalAddressFormValues | null>(null)
const documentsData = ref<DocumentsFormValues | null>(null)
const deploymentData = ref<DeploymentFormValues | null>(null)
const familyData = ref<FamilyFormValues | null>(null)
const lifestyleData = ref<LifestyleFormValues | null>(null)
const educationsData = ref<EducationEntryValues[]>([])
const employmentsData = ref<EmploymentEntryValues[]>([])
const tattoosData = ref<TattooEntryValues[]>([])

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

// ─── Duplicate Pre-check via Public API ──────────────────────────────────────
async function preCheckDuplicates(): Promise<boolean> {
  if (!personalData.value) return true

  try {
    const res = await publicApplyApi.post('/check-duplicates', {
      email: personalData.value.email,
      first_name: personalData.value.first_name,
      middle_name: personalData.value.middle_name ?? undefined,
      last_name: personalData.value.last_name,
      date_of_birth: personalData.value.date_of_birth ?? undefined,
      passport_number: documentsData.value?.passport_number ?? undefined,
    })

    const data = res.data?.data ?? res.data ?? {}
    if (data.has_blockers) {
      foundDuplicates.value = data.duplicates ?? []
      duplicateDialog.value = true
      return false
    }

    if (data.has_duplicates) {
      const warnings = (data.duplicates ?? []).filter((d: DuplicateItem) => d.severity === 'warn')
      if (warnings.length > 0) {
        toast.add({
          severity: 'warn',
          summary: 'Possible Duplicate',
          detail: warnings[0].message,
          life: 6000,
        })
      }
    }
  } catch {
    // Fail quietly on network issues so public user can continue
    return true
  }

  return true
}

// ─── Final Submit via Public Endpoint ─────────────────────────────────────────
async function onFinalSubmit() {
  if (hasErrors.value) {
    const stepLabels = invalidSteps.value.map((s: WizardStepItem) => s.label).join(', ')
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

  const canProceed = await preCheckDuplicates()
  if (!canProceed) return

  isSubmitting.value = true

  try {
    const {
      biodata_file,
      biodata_notes,
      id_photo_file,
      ...docFields
    } = documentsData.value ?? {}

    const payload = {
      ...personalData.value,
      ...(physicalData.value ?? {}),
      ...docFields,
      ...(deploymentData.value ?? {}),
      ...(familyData.value ?? {}),
      lifestyle: lifestyleData.value ?? undefined,
      educations: educationsData.value,
      employments: employmentsData.value,
      tattoos: tattoosData.value,
      status: 'self_registered',
      registration_source: 'qr_code',
    }

    // 🟢 Send to public endpoint without requiring staff auth token
    const res = await publicApplyApi.post('/apply', payload)
    const result = res.data?.data ?? res.data?.applicant ?? res.data

    submittedApplicant.value = {
      applicant_code: result?.applicant_code ?? 'Pending Registration',
      full_name: `${personalData.value.first_name} ${personalData.value.last_name}`,
    }

    isSubmitted.value = true
  } catch (e: any) {
    if (e?.response?.status === 409 && e?.response?.data?.duplicates?.length) {
      foundDuplicates.value = e.response.data.duplicates
      duplicateDialog.value = true
      return
    }

    if (e?.response?.status === 422) {
      const errors = e.response.data.errors ?? {}
      const firstError = Object.values(errors)[0] as string[] | undefined

      toast.add({
        severity: 'error',
        summary: 'Validation Failed',
        detail: firstError?.[0] ?? e.response.data.message ?? 'Please check your inputs.',
        life: 5000,
      })

      if (errors.email || errors.first_name || errors.last_name) {
        goToStep(steps.findIndex((s: WizardStepItem) => s.key === 'personal'))
      } else if (
        errors.skill_category ||
        errors.trade_or_occupation ||
        errors.jlpt_level ||
        errors.willing_to_be_deployed
      ) {
        goToStep(steps.findIndex((s: WizardStepItem) => s.key === 'deployment'))
      } else if (
        errors.father_name ||
        errors.mother_name ||
        errors.spouse_name ||
        errors.emergency_contact_phone
      ) {
        goToStep(steps.findIndex((s: WizardStepItem) => s.key === 'family'))
      }
      return
    }

    toast.add({
      severity: 'error',
      summary: 'Submission Error',
      detail: e?.response?.data?.message ?? 'Could not submit registration. Please try again.',
      life: 4000,
    })
  } finally {
    isSubmitting.value = false
  }
}

function onDuplicateDialogClose() {
  goToStep(steps.findIndex((s: WizardStepItem) => s.key === 'personal'))
}

function resetForm() {
  window.location.reload()
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 lg:p-8 max-w-5xl mx-auto min-h-screen">
    <!-- Success Confirmation -->
    <div
      v-if="isSubmitted"
      class="bg-white rounded-3xl border border-appleCore-200 p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto my-auto flex flex-col items-center gap-6"
    >
      <div class="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-4xl shadow-sm">
        <i class="pi pi-check" />
      </div>

      <div class="space-y-2">
        <h2 class="text-2xl sm:text-3xl font-serif font-bold text-blueberry-900">
          Application Submitted!
        </h2>
        <p class="text-sm text-blueberry-600">
          Thank you, <strong class="text-blueberry-900">{{ submittedApplicant?.full_name }}</strong>. Your registration details have been received.
        </p>
      </div>

      <div class="w-full bg-purple-50/70 border border-purple-200/80 rounded-2xl p-5 flex flex-col items-center gap-1.5">
        <span class="text-xs uppercase font-bold tracking-wider text-purple-700">Your Applicant Reference Code</span>
        <span class="font-mono text-2xl font-black text-purple-900 tracking-wider">
          {{ submittedApplicant?.applicant_code }}
        </span>
        <span class="text-[11px] text-purple-600">Please take a screenshot or note this code for your reference.</span>
      </div>

      <div class="text-left bg-appleCore-50/70 border border-appleCore-100 rounded-xl p-4 text-xs text-blueberry-600 space-y-2 w-full">
        <div class="flex items-start gap-2">
          <i class="pi pi-info-circle text-purple-600 mt-0.5 shrink-0" />
          <span>Your application is currently <strong>Pending Review</strong> by our staff.</span>
        </div>
        <div class="flex items-start gap-2">
          <i class="pi pi-bell text-purple-600 mt-0.5 shrink-0" />
          <span>Once approved, you will receive confirmation and your Applicant Portal credentials will be activated.</span>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full">
        <Button
          label="Submit Another Application"
          icon="pi pi-plus"
          outlined
          class="w-full !text-blueberry-700 !border-blueberry-200 hover:!bg-blueberry-50 !rounded-xl !py-2.5 !text-xs font-bold"
          @click="resetForm"
        />
      </div>
    </div>

    <!-- Application Form -->
    <template v-else>
      <div class="flex items-center justify-between border-b border-appleCore-100 pb-4">
        <div>
          <h1 class="text-2xl font-serif font-bold text-blueberry-900 tracking-tight flex items-center gap-2">
            <i class="pi pi-qrcode text-purple-600" />
            Applicant Registration
          </h1>
          <p class="text-xs sm:text-sm text-blueberry-500">{{ currentStep.description }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 px-4 py-3 bg-purple-50/80 border border-purple-200/80 rounded-xl text-xs text-purple-900 shadow-2xs">
        <i class="pi pi-info-circle text-purple-600 text-base shrink-0" />
        <span>
          Please fill out all required information accurately. Once submitted, your registration will be reviewed by Tricastle staff.
        </span>
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
        class="flex items-start gap-3 p-4 bg-red-50/90 border border-red-200 rounded-xl shadow-2xs"
      >
        <i class="pi pi-exclamation-triangle text-red-600 text-lg mt-0.5 shrink-0" />
        <div class="flex-1">
          <h4 class="text-xs font-bold text-red-900">
            {{ invalidSteps.length }} step{{ invalidSteps.length > 1 ? 's have' : ' has' }} validation errors
          </h4>
          <div class="flex flex-wrap gap-2 mt-2">
            <button
              v-for="step in invalidSteps"
              :key="step.key"
              type="button"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-red-700
                     rounded-lg text-xs font-semibold border border-red-200
                     hover:bg-red-100 transition-colors shadow-2xs"
              @click="goToStep(steps.findIndex((s: WizardStepItem) => s.key === step.key))"
            >
              <i class="pi pi-arrow-right text-[10px]" />
              {{ step.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-appleCore-200 p-6 shadow-2xs">
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
          :loading="isSubmitting"
          :has-errors="hasErrors"
          :invalid-steps="invalidSteps"
          mode="create"
          @submit="onFinalSubmit"
          @back="goBack"
          @go-to="goToStep"
        />
      </div>

      <DuplicateWarningDialog
        v-model:visible="duplicateDialog"
        :duplicates="foundDuplicates"
        @close="onDuplicateDialogClose"
      />
    </template>
  </div>
</template>