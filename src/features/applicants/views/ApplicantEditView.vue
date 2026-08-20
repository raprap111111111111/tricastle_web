<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

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
import ReviewTab from '../components/tabs/ReviewTab.vue'

import type {
  PersonalFormValues,
  PhysicalAddressFormValues,
  DocumentsFormValues,
  LifestyleFormValues,
  EducationEntryValues,
  EmploymentEntryValues,
  TattooEntryValues,
} from '../schemas/applicant.schema'
import type { UpdateApplicantPayload } from '../types'

const props = defineProps<{ id: number }>()

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

const loaded = ref(false)

// ─── Wizard State ─────────────────────────────────────────
// No batch tab in Edit — batch is managed separately
// from the applicant detail view after final_list status
const personalData    = ref<PersonalFormValues | null>(null)
const physicalData    = ref<PhysicalAddressFormValues | null>(null)
const documentsData   = ref<DocumentsFormValues | null>(null)
const lifestyleData   = ref<LifestyleFormValues | null>(null)
const educationsData  = ref<EducationEntryValues[]>([])
const employmentsData = ref<EmploymentEntryValues[]>([])
const tattoosData     = ref<TattooEntryValues[]>([])

// ─── Load Applicant ───────────────────────────────────────
onMounted(async () => {
  loaded.value = false
  store.clearApplicant()

  try {
    await store.fetchApplicant(props.id)
    const a = store.applicant

    if (!a) {
      toast.add({
        severity: 'error',
        summary: 'Not Found',
        detail: 'Applicant could not be loaded',
        life: 4000,
      })
      router.push({ name: 'applicants.index' })
      return
    }

    // ── Personal ────────────────────────────────────────
    personalData.value = {
      first_name:         a.first_name         ?? '',
      middle_name:        a.middle_name        ?? '',
      last_name:          a.last_name          ?? '',
      suffix:             a.suffix             ?? '',
      email:              a.email              ?? '',
      phone:              a.phone              ?? '',
      mobile:             a.mobile             ?? '',
      date_of_birth:      a.date_of_birth      ?? null,
      gender:             a.gender             ?? null,
      civil_status:       a.civil_status       ?? null,
      number_of_children: a.number_of_children ?? 0,
      nationality:        a.nationality        ?? 'Filipino',
    }
    setStepState('personal', 'valid')

    // ── Physical & Address ──────────────────────────────
    physicalData.value = {
      height_cm:         a.height_cm         ?? null,
      weight_kg:         a.weight_kg         ?? null,
      dominant_hand:     a.dominant_hand     ?? null,
      blood_type:        a.blood_type        ?? null,
      current_address:   a.current_address   ?? '',
      permanent_address: a.permanent_address ?? '',
      city:              a.city              ?? '',
      province:          a.province          ?? '',
      postal_code:       a.postal_code       ?? '',
    }
    setStepState('physical', 'valid')

    // ── Documents ───────────────────────────────────────
    documentsData.value = {
      passport_number:   a.passport_number   ?? '',
      passport_expiry:   a.passport_expiry   ?? null,
      sss_number:        a.sss_number        ?? '',
      tin_number:        a.tin_number        ?? '',
      philhealth_number: a.philhealth_number ?? '',
      pagibig_number:    a.pagibig_number    ?? '',
    }
    setStepState('documents', 'valid')

    // ── Lifestyle ───────────────────────────────────────
    if (a.lifestyle) {
      lifestyleData.value = {
        is_smoking:            a.lifestyle.is_smoking            ?? false,
        is_drinking_alcohol:   a.lifestyle.is_drinking_alcohol   ?? false,
        is_using_drugs:        a.lifestyle.is_using_drugs        ?? false,
        was_smoking:           a.lifestyle.was_smoking           ?? false,
        was_drinking_alcohol:  a.lifestyle.was_drinking_alcohol  ?? false,
        was_using_drugs:       a.lifestyle.was_using_drugs       ?? false,
        smoking_frequency:     a.lifestyle.smoking_frequency     ?? '',
        drinking_frequency:    a.lifestyle.drinking_frequency    ?? '',
        drugs_notes:           a.lifestyle.drugs_notes           ?? '',
        has_medical_condition: a.lifestyle.has_medical_condition ?? false,
        medical_notes:         a.lifestyle.medical_notes         ?? '',
        has_allergies:         a.lifestyle.has_allergies         ?? false,
        allergies_notes:       a.lifestyle.allergies_notes       ?? '',
      }
      setStepState('lifestyle', 'valid')
    }

    // ── Educations ──────────────────────────────────────
    educationsData.value = (a.educations ?? []).map((ed) => ({
      id:               ed.id,
      education_level:  ed.education_level,
      education_status: ed.education_status,
      school_name:      ed.school_name,
      course:           ed.course        ?? '',
      year_started:     ed.year_started  ?? null,
      year_ended:       ed.year_ended    ?? null,
      honors:           ed.honors        ?? '',
    }))

    // ── Employments ─────────────────────────────────────
    employmentsData.value = (a.employments ?? []).map((emp) => ({
      id:                 emp.id,
      company_name:       emp.company_name,
      position:           emp.position,
      industry:           emp.industry           ?? '',
      job_description:    emp.job_description    ?? '',
      date_started:       emp.date_started,
      date_ended:         emp.date_ended         ?? null,
      is_current:         emp.is_current,
      country:            emp.country            ?? 'Philippines',
      city:               emp.city               ?? '',
      salary:             emp.salary             ?? null,
      salary_currency:    emp.salary_currency    ?? 'PHP',
      reason_for_leaving: emp.reason_for_leaving ?? '',
    }))

    // ── Tattoos ─────────────────────────────────────────
    tattoosData.value = (a.tattoos ?? []).map((t) => ({
      id:          t.id,
      location:    t.location,
      size:        t.size        ?? null,
      description: t.description ?? '',
      photo_path:  t.photo_path  ?? '',
      is_visible:  t.is_visible,
    }))

  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: e?.message ?? 'Could not load applicant data',
      life: 4000,
    })
  } finally {
    loaded.value = true
  }
})

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

// ─── Next Handlers ────────────────────────────────────────
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

// ─── Final Submit ─────────────────────────────────────────
async function onFinalSubmit() {
  if (hasErrors.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation Errors',
      detail: `Please fix errors in: ${invalidSteps.value.map((s) => s.label).join(', ')}`,
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

  try {
    // ── Update main applicant fields only
    // Status changes (final_list, rejected) are done from the detail view
    const payload: UpdateApplicantPayload = {
      ...personalData.value,
      ...physicalData.value,
      ...documentsData.value,
    }

    await store.updateApplicant(props.id, payload)

    // ── Lifestyle ──────────────────────────────────────
    if (lifestyleData.value) {
      await subStore.upsertLifestyle({
        applicant_id: props.id,
        ...lifestyleData.value,
      })
    }

    // ── Educations sync ────────────────────────────────
    const existingEduIds = (store.applicant?.educations ?? []).map((e) => e.id)
    const currentEduIds  = educationsData.value.filter((e) => e.id).map((e) => e.id!)

    for (const id of existingEduIds) {
      if (!currentEduIds.includes(id)) {
        await subStore.deleteEducation(id)
      }
    }
    for (const edu of educationsData.value) {
      if (edu.id) {
        await subStore.updateEducation(edu.id, edu)
      } else {
        await subStore.createEducation({ applicant_id: props.id, ...edu })
      }
    }

    // ── Employments sync ───────────────────────────────
    const existingEmpIds = (store.applicant?.employments ?? []).map((e) => e.id)
    const currentEmpIds  = employmentsData.value.filter((e) => e.id).map((e) => e.id!)

    for (const id of existingEmpIds) {
      if (!currentEmpIds.includes(id)) {
        await subStore.deleteEmployment(id)
      }
    }
    for (const emp of employmentsData.value) {
      if (emp.id) {
        await subStore.updateEmployment(emp.id, emp)
      } else {
        await subStore.createEmployment({ applicant_id: props.id, ...emp })
      }
    }

    // ── Tattoos sync ───────────────────────────────────
    const existingTatIds = (store.applicant?.tattoos ?? []).map((t) => t.id)
    const currentTatIds  = tattoosData.value.filter((t) => t.id).map((t) => t.id!)

    for (const id of existingTatIds) {
      if (!currentTatIds.includes(id)) {
        await subStore.deleteTattoo(id)
      }
    }
    for (const tattoo of tattoosData.value) {
      if (tattoo.id) {
        await subStore.updateTattoo(tattoo.id, tattoo)
      } else {
        await subStore.createTattoo({ applicant_id: props.id, ...tattoo })
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Applicant updated successfully',
      life: 3000,
    })

    await store.fetchApplicants()
    router.push({ name: 'applicants.show', params: { id: props.id } })
  } catch (e: any) {
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

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: store.error ?? subStore.error ?? 'Something went wrong',
      life: 4000,
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-5xl mx-auto">

    <!-- ─── Header ─────────────────────────────────────── -->
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        @click="router.push({ name: 'applicants.show', params: { id: props.id } })"
      />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">Edit Applicant</h1>
        <p v-if="store.applicant" class="text-sm text-blueberry-500">
          {{ store.applicant.applicant_code }} —
          {{ store.applicant.first_name }} {{ store.applicant.last_name }}
        </p>
      </div>
    </div>

    <!-- ─── Loading ───────────────────────────────────── -->
    <template v-if="!loaded">
      <Skeleton height="60px" border-radius="12px" />
      <Skeleton height="300px" border-radius="12px" />
    </template>

    <template v-else-if="personalData">

      <!-- ─── Stepper ─────────────────────────────────── -->
      <WizardStepper
        :steps="steps"
        :current-index="currentStepIndex"
        :progress="progress"
        :step-states="stepStates"
        @go-to="goToStep"
      />

      <!-- ─── Error Summary ──────────────────────────── -->
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

      <!-- ─── Steps ───────────────────────────────────── -->
      <PersonalTab
        v-if="currentStep.key === 'personal'"
        :key="`personal-${props.id}`"
        :initial-values="personalData"
        @next="onPersonalNext"
        @validate="onPersonalValidate"
      />

      <PhysicalAddressTab
        v-else-if="currentStep.key === 'physical'"
        :key="`physical-${props.id}`"
        :initial-values="physicalData ?? undefined"
        @next="onPhysicalNext"
        @validate="onPhysicalValidate"
        @back="goBack"
      />

      <DocumentsTab
        v-else-if="currentStep.key === 'documents'"
        :key="`documents-${props.id}`"
        :initial-values="documentsData ?? undefined"
        @next="onDocumentsNext"
        @validate="onDocumentsValidate"
        @back="goBack"
      />

      <LifestyleTab
        v-else-if="currentStep.key === 'lifestyle'"
        :key="`lifestyle-${props.id}`"
        :initial-values="lifestyleData"
        @next="onLifestyleNext"
        @validate="onLifestyleValidate"
        @back="goBack"
      />

      <EducationTab
        v-else-if="currentStep.key === 'education'"
        :key="`education-${props.id}`"
        :initial-values="educationsData"
        @next="onEducationNext"
        @back="goBack"
      />

      <EmploymentTab
        v-else-if="currentStep.key === 'employment'"
        :key="`employment-${props.id}`"
        :initial-values="employmentsData"
        @next="onEmploymentNext"
        @back="goBack"
      />

      <TattooTab
        v-else-if="currentStep.key === 'tattoos'"
        :key="`tattoos-${props.id}`"
        :initial-values="tattoosData"
        @next="onTattooNext"
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
        :steps="steps"
        :loading="store.submitting || subStore.submitting"
        :has-errors="hasErrors"
        :invalid-steps="invalidSteps"
        mode="edit"
        @submit="onFinalSubmit"
        @back="goBack"
        @go-to="goToStep"
      />

    </template>
  </div>
</template>