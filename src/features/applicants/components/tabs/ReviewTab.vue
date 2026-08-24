<!-- src/features/applicants/components/tabs/ReviewTab.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import { useBatchStore } from '@/features/batches/stores/batch.store'
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
  BatchAssignmentValues,
} from '../../schemas/applicant.schema'
import type { WizardStep } from '../../composables/useApplicantWizard'

const props = defineProps<{
  personal:    PersonalFormValues | null
  physical:    PhysicalAddressFormValues | null
  documents:   DocumentsFormValues | null
  deployment?: DeploymentFormValues | null
  family?:     FamilyFormValues | null
  lifestyle:   LifestyleFormValues | null
  educations:  EducationEntryValues[]
  employments: EmploymentEntryValues[]
  tattoos:     TattooEntryValues[]
  batch?:      BatchAssignmentValues | null
  steps:       WizardStep[]
  loading:     boolean
  mode:        'create' | 'edit'
  hasErrors?:  boolean
  invalidSteps?: WizardStep[]
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'back'): void
  (e: 'go-to', step: number): void
}>()

const batchStore = useBatchStore()

// ─── Resolve selected batch details ─────────────────
const selectedBatch = computed(() => {
  if (!props.batch?.batch_id) return null
  return batchStore.batches.find((b: any) => b.id === props.batch!.batch_id) ?? null
})

// ─── Helpers ─────────────────────────────────────────
function displayVal(val: any, fallback = '—'): string {
  if (val === null || val === undefined || val === '') return fallback
  return String(val)
}

function displayCurrency(amount: any, currency: string) {
  if (amount === null || amount === undefined || amount === '') return '—'
  return `${currency} ${Number(amount).toLocaleString()}`
}

function displayBool(val: any): string {
  if (val === true || val === 'true') return 'Yes'
  if (val === false || val === 'false') return 'No'
  return '—'
}

function stepIndex(key: string): number {
  return props.steps.findIndex((s) => s.key === key)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- ⛔ Error Alert -->
    <div
      v-if="props.hasErrors && props.invalidSteps?.length"
      class="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <i class="pi pi-times-circle text-red-500 text-xl mt-0.5" />
      <div class="flex-1">
        <h4 class="text-sm font-semibold text-red-800">
          Cannot submit — please fix errors first
        </h4>
        <p class="text-xs text-red-600 mt-1">
          The following {{ props.invalidSteps.length }}
          step{{ props.invalidSteps.length > 1 ? 's contain' : ' contains' }}
          invalid or missing required fields:
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <button
            v-for="step in props.invalidSteps"
            :key="step.key"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-red-700 rounded-md
                   text-xs font-medium border border-red-200 hover:bg-red-100 transition-colors"
            @click="emit('go-to', stepIndex(step.key))"
          >
            <i class="pi pi-arrow-right text-[10px]" />
            {{ step.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 1️⃣ Personal Information -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-user text-apricot-500 mr-2" />Personal Information
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('personal'))" />
      </div>

      <div v-if="props.personal" class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Name</span>
          <p class="font-medium text-blueberry-800">
            {{ displayVal(props.personal.first_name) }}
            {{ displayVal(props.personal.middle_name, '') }}
            {{ displayVal(props.personal.last_name) }}
            {{ displayVal(props.personal.suffix, '') }}
          </p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Email</span>
          <p class="font-medium">{{ displayVal(props.personal.email) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Phone</span>
          <p class="font-medium">{{ displayVal(props.personal.phone) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Gender</span>
          <p class="font-medium capitalize">{{ displayVal(props.personal.gender) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Civil Status</span>
          <p class="font-medium capitalize">{{ displayVal(props.personal.civil_status) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Date of Birth</span>
          <p class="font-medium">{{ displayVal(props.personal.date_of_birth) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Children</span>
          <p class="font-medium">{{ props.personal.number_of_children }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Nationality</span>
          <p class="font-medium">{{ displayVal(props.personal.nationality) }}</p>
        </div>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet</p>
    </section>

    <!-- 2️⃣ Physical & Address -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-heart text-apricot-500 mr-2" />Physical & Address
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('physical'))" />
      </div>

      <div v-if="props.physical" class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Height</span>
          <p class="font-medium">{{ props.physical.height_cm ? `${props.physical.height_cm} cm` : '—' }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Weight</span>
          <p class="font-medium">{{ props.physical.weight_kg ? `${props.physical.weight_kg} kg` : '—' }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Blood Type</span>
          <p class="font-medium">{{ displayVal(props.physical.blood_type) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Hand</span>
          <p class="font-medium capitalize">{{ displayVal(props.physical.dominant_hand) }}</p>
        </div>
        <div class="md:col-span-2">
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Current Address</span>
          <p class="font-medium">{{ displayVal(props.physical.current_address) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">City</span>
          <p class="font-medium">{{ displayVal(props.physical.city) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Province</span>
          <p class="font-medium">{{ displayVal(props.physical.province) }}</p>
        </div>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet</p>
    </section>

    <!-- 3️⃣ Documents -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-id-card text-apricot-500 mr-2" />Documents
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('documents'))" />
      </div>

      <div v-if="props.documents" class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Passport Number</span>
          <p class="font-medium font-mono text-apricot-600">{{ displayVal(props.documents.passport_number) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Passport Expiry</span>
          <p class="font-medium">{{ displayVal(props.documents.passport_expiry) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">SSS Number</span>
          <p class="font-medium font-mono text-blueberry-700">{{ displayVal(props.documents.sss_number) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">TIN Number</span>
          <p class="font-medium font-mono text-blueberry-700">{{ displayVal(props.documents.tin_number) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">PhilHealth Number</span>
          <p class="font-medium font-mono text-blueberry-700">{{ displayVal(props.documents.philhealth_number) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Pag-IBIG Number</span>
          <p class="font-medium font-mono text-blueberry-700">{{ displayVal(props.documents.pagibig_number) }}</p>
        </div>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet</p>
    </section>

    <!-- 4️⃣ Deployment Profile -->
    <section v-if="stepIndex('deployment') !== -1" class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-send text-apricot-500 mr-2" />Japan Deployment Profile
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('deployment'))" />
      </div>

      <div v-if="props.deployment" class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Skill Category</span>
          <p class="font-medium capitalize">{{ displayVal(props.deployment.skill_category?.replace('_', '-')) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Occupation / Trade</span>
          <p class="font-medium">{{ displayVal(props.deployment.trade_or_occupation) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Understands Basic English</span>
          <p class="font-medium">{{ displayBool(props.deployment.understands_basic_english) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">JLPT Level</span>
          <p class="font-medium">{{ displayVal(props.deployment.jlpt_level) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Willing to Deploy</span>
          <p class="font-medium">{{ displayBool(props.deployment.willing_to_be_deployed) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Preferred Location</span>
          <p class="font-medium">{{ displayVal(props.deployment.preferred_work_location) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Japan Experience</span>
          <p class="font-medium">
            {{ displayBool(props.deployment.previous_japan_experience) }} 
            <span v-if="props.deployment.previous_japan_experience">
              ({{ props.deployment.years_japan_experience }} yrs)
            </span>
          </p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">TITP Certificate</span>
          <p class="font-medium">
            {{ displayBool(props.deployment.has_titp_certificate) }}
            <span v-if="props.deployment.has_titp_certificate && props.deployment.titp_occupation">
              ({{ props.deployment.titp_occupation }})
            </span>
          </p>
        </div>
        <div class="col-span-2">
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Expected Salary</span>
          <p class="font-medium text-green-700">
            {{ displayCurrency(props.deployment.expected_salary, props.deployment.expected_salary_currency ?? 'JPY') }}
          </p>
        </div>
        <div class="col-span-2">
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Current Salary</span>
          <p class="font-medium text-blue-700">
            {{ displayCurrency(props.deployment.current_salary, props.deployment.current_salary_currency ?? 'PHP') }}
          </p>
        </div>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet (Optional)</p>
    </section>

    <!-- 5️⃣ Family Background -->
    <section v-if="stepIndex('family') !== -1" class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-users text-apricot-500 mr-2" />Family Background
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('family'))" />
      </div>

      <div v-if="props.family" class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        
        <div class="md:col-span-3 bg-appleCore-50 p-3 rounded-lg border border-appleCore-100">
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-0.5">Living Situation</span>
          <p class="font-medium">{{ displayVal(props.family.living_situation) }}</p>
        </div>

        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-1 border-b border-appleCore-100 pb-1">Father</span>
          <p class="font-medium">{{ displayVal(props.family.father_name) }}</p>
          <p class="text-xs text-blueberry-400">{{ displayVal(props.family.father_occupation) }}</p>
          <p class="text-xs text-blueberry-600 font-mono mt-0.5">{{ displayVal(props.family.father_contact) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-1 border-b border-appleCore-100 pb-1">Mother</span>
          <p class="font-medium">{{ displayVal(props.family.mother_name) }}</p>
          <p class="text-xs text-blueberry-400">{{ displayVal(props.family.mother_occupation) }}</p>
          <p class="text-xs text-blueberry-600 font-mono mt-0.5">{{ displayVal(props.family.mother_contact) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-1 border-b border-appleCore-100 pb-1">Spouse</span>
          <p class="font-medium">{{ displayVal(props.family.spouse_name) }}</p>
          <p class="text-xs text-blueberry-400">{{ displayVal(props.family.spouse_occupation) }}</p>
          <p class="text-xs text-blueberry-600 font-mono mt-0.5">{{ displayVal(props.family.spouse_contact) }}</p>
        </div>

        <div class="md:col-span-3 mt-2 border-t border-appleCore-100 pt-3">
          <span class="text-blueberry-500 block text-[11px] uppercase tracking-wider mb-1 text-red-600">Emergency Contact</span>
          <p class="font-bold text-blueberry-800">{{ displayVal(props.family.emergency_contact_name) }} <span class="font-normal text-xs text-blueberry-400 ml-1">({{ displayVal(props.family.emergency_contact_relationship) }})</span></p>
          <p class="font-medium text-red-700 mt-0.5"><i class="pi pi-phone text-xs mr-1"/>{{ displayVal(props.family.emergency_contact_phone) }}</p>
          <p class="text-xs text-blueberry-500 mt-0.5">{{ displayVal(props.family.emergency_contact_address) }}</p>
        </div>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet (Optional)</p>
    </section>

    <!-- 6️⃣ Lifestyle -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-shield text-apricot-500 mr-2" />Lifestyle
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('lifestyle'))" />
      </div>

      <div v-if="props.lifestyle" class="flex flex-wrap gap-3 text-sm">
        <span
          v-if="props.lifestyle.is_smoking"
          class="px-3 py-1 bg-orange-50 text-orange-800 rounded-full border border-orange-200 shadow-xs"
        >🚬 Smoking</span>
        <span
          v-if="props.lifestyle.is_drinking_alcohol"
          class="px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200 shadow-xs"
        >🍺 Drinking</span>
        <span
          v-if="props.lifestyle.has_medical_condition"
          class="px-3 py-1 bg-red-50 text-red-800 rounded-full border border-red-200 shadow-xs font-semibold"
        >🏥 Medical Condition</span>
        <span
          v-if="props.lifestyle.has_allergies"
          class="px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full border border-yellow-200 shadow-xs font-semibold"
        >⚠️ Allergies</span>
        <span
          v-if="!props.lifestyle.is_smoking && !props.lifestyle.is_drinking_alcohol &&
                !props.lifestyle.has_medical_condition && !props.lifestyle.has_allergies"
          class="text-blueberry-400 italic bg-gray-50 px-3 py-1 rounded-full border border-gray-200"
        >No notable lifestyle concerns</span>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet</p>
    </section>

    <!-- 7️⃣ Counts (Educ, Emp, Tattoos) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <section class="bg-white rounded-xl border border-appleCore-100 p-6 text-center shadow-xs">
        <Button label="Edit" text size="small" icon="pi pi-pencil" class="mb-2" @click="emit('go-to', stepIndex('education'))" />
        <p class="text-3xl font-serif font-bold text-apricot-600">{{ props.educations.length }}</p>
        <p class="text-sm text-blueberry-500 font-medium">Education Records</p>
      </section>

      <section class="bg-white rounded-xl border border-appleCore-100 p-6 text-center shadow-xs">
        <Button label="Edit" text size="small" icon="pi pi-pencil" class="mb-2" @click="emit('go-to', stepIndex('employment'))" />
        <p class="text-3xl font-serif font-bold text-apricot-600">{{ props.employments.length }}</p>
        <p class="text-sm text-blueberry-500 font-medium">Employment Records</p>
      </section>

      <section class="bg-white rounded-xl border border-appleCore-100 p-6 text-center shadow-xs">
        <Button label="Edit" text size="small" icon="pi pi-pencil" class="mb-2" @click="emit('go-to', stepIndex('tattoos'))" />
        <p class="text-3xl font-serif font-bold text-apricot-600">{{ props.tattoos.length }}</p>
        <p class="text-sm text-blueberry-500 font-medium">Tattoo Records</p>
      </section>
    </div>

    <!-- ─── Nav / Submit ─────────────────────────────── -->
    <div class="flex justify-between mt-4">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-appleCore-200 text-blueberry-700 rounded-lg
               font-medium text-sm hover:bg-appleCore-50 transition-colors shadow-xs"
        @click="emit('back')"
      >
        <i class="pi pi-arrow-left text-xs" />
        Back
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm shadow-xs
               transition-colors disabled:cursor-not-allowed"
        :class="props.hasErrors
          ? 'bg-red-50 border border-red-200 text-red-600'
          : 'bg-green-600 text-white hover:bg-green-700 border border-green-700'"
        :disabled="props.loading || props.hasErrors"
        :title="props.hasErrors ? 'Fix errors before submitting' : ''"
        @click="emit('submit')"
      >
        <i v-if="props.hasErrors" class="pi pi-lock text-xs" />
        <i v-else-if="!props.loading" class="pi pi-check text-xs" />
        <i v-else class="pi pi-spin pi-spinner text-xs" />
        {{
          props.hasErrors
            ? 'Fix Errors First'
            : props.mode === 'edit'
              ? 'Update Applicant'
              : 'Create Applicant'
        }}
      </button>
    </div>
  </div>
</template>