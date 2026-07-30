<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import { useBatchStore } from '@/features/batches/stores/batch.store'
import type {
  PersonalFormValues,
  PhysicalAddressFormValues,
  DocumentsFormValues,
  LifestyleFormValues,
  EducationEntryValues,
  EmploymentEntryValues,
  TattooEntryValues,
  BatchAssignmentValues,
} from '../../schemas/applicant.schema'
import type { WizardStep } from '../../composables/useApplicantWizard'

const props = defineProps<{
  personal: PersonalFormValues | null
  physical: PhysicalAddressFormValues | null
  documents: DocumentsFormValues | null
  lifestyle: LifestyleFormValues | null
  educations: EducationEntryValues[]
  employments: EmploymentEntryValues[]
  tattoos: TattooEntryValues[]
  batch?: BatchAssignmentValues | null
  steps: WizardStep[]
  loading: boolean
  mode: 'create' | 'edit'
  hasErrors?: boolean
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

    <!-- Personal -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-user mr-2" />Personal Information
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('personal'))" />
      </div>

      <div v-if="props.personal" class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span class="text-blueberry-500">Name:</span>
          <p class="font-medium text-blueberry-800">
            {{ displayVal(props.personal.first_name) }}
            {{ displayVal(props.personal.middle_name, '') }}
            {{ displayVal(props.personal.last_name) }}
            {{ displayVal(props.personal.suffix, '') }}
          </p>
        </div>
        <div>
          <span class="text-blueberry-500">Email:</span>
          <p class="font-medium">{{ displayVal(props.personal.email) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Phone:</span>
          <p class="font-medium">{{ displayVal(props.personal.phone) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Gender:</span>
          <p class="font-medium capitalize">{{ displayVal(props.personal.gender) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Civil Status:</span>
          <p class="font-medium capitalize">{{ displayVal(props.personal.civil_status) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Date of Birth:</span>
          <p class="font-medium">{{ displayVal(props.personal.date_of_birth) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Children:</span>
          <p class="font-medium">{{ props.personal.number_of_children }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Nationality:</span>
          <p class="font-medium">{{ displayVal(props.personal.nationality) }}</p>
        </div>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet</p>
    </section>

    <!-- Physical & Address -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-heart mr-2" />Physical & Address
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('physical'))" />
      </div>

      <div v-if="props.physical" class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span class="text-blueberry-500">Height:</span>
          <p class="font-medium">{{ props.physical.height_cm ? `${props.physical.height_cm} cm` : '—' }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Weight:</span>
          <p class="font-medium">{{ props.physical.weight_kg ? `${props.physical.weight_kg} kg` : '—' }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Blood Type:</span>
          <p class="font-medium">{{ displayVal(props.physical.blood_type) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Hand:</span>
          <p class="font-medium capitalize">{{ displayVal(props.physical.dominant_hand) }}</p>
        </div>
        <div class="md:col-span-2">
          <span class="text-blueberry-500">Current Address:</span>
          <p class="font-medium">{{ displayVal(props.physical.current_address) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">City:</span>
          <p class="font-medium">{{ displayVal(props.physical.city) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Province:</span>
          <p class="font-medium">{{ displayVal(props.physical.province) }}</p>
        </div>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet</p>
    </section>

    <!-- Documents -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-id-card mr-2" />Documents
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('documents'))" />
      </div>

      <div v-if="props.documents" class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <span class="text-blueberry-500">Passport:</span>
          <p class="font-medium">{{ displayVal(props.documents.passport_number) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Passport Expiry:</span>
          <p class="font-medium">{{ displayVal(props.documents.passport_expiry) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">SSS:</span>
          <p class="font-medium">{{ displayVal(props.documents.sss_number) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">TIN:</span>
          <p class="font-medium">{{ displayVal(props.documents.tin_number) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">PhilHealth:</span>
          <p class="font-medium">{{ displayVal(props.documents.philhealth_number) }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Pag-IBIG:</span>
          <p class="font-medium">{{ displayVal(props.documents.pagibig_number) }}</p>
        </div>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet</p>
    </section>

    <!-- Lifestyle -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-shield mr-2" />Lifestyle
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('lifestyle'))" />
      </div>

      <div v-if="props.lifestyle" class="flex flex-wrap gap-3 text-sm">
        <span
          v-if="props.lifestyle.is_smoking"
          class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full"
        >🚬 Smoking</span>
        <span
          v-if="props.lifestyle.is_drinking_alcohol"
          class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
        >🍺 Drinking</span>
        <span
          v-if="props.lifestyle.has_medical_condition"
          class="px-3 py-1 bg-red-100 text-red-800 rounded-full"
        >🏥 Medical Condition</span>
        <span
          v-if="props.lifestyle.has_allergies"
          class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full"
        >⚠️ Allergies</span>
        <span
          v-if="!props.lifestyle.is_smoking && !props.lifestyle.is_drinking_alcohol &&
                !props.lifestyle.has_medical_condition && !props.lifestyle.has_allergies"
          class="text-blueberry-400 italic"
        >No notable lifestyle concerns</span>
      </div>
      <p v-else class="text-blueberry-400 text-sm italic">Not filled yet</p>
    </section>

    <!-- Counts -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <section class="bg-white rounded-xl border border-appleCore-100 p-6 text-center">
        <Button label="Edit" text size="small" icon="pi pi-pencil" class="mb-2" @click="emit('go-to', stepIndex('education'))" />
        <p class="text-3xl font-serif font-bold text-apricot-600">{{ props.educations.length }}</p>
        <p class="text-sm text-blueberry-500">Education Records</p>
      </section>

      <section class="bg-white rounded-xl border border-appleCore-100 p-6 text-center">
        <Button label="Edit" text size="small" icon="pi pi-pencil" class="mb-2" @click="emit('go-to', stepIndex('employment'))" />
        <p class="text-3xl font-serif font-bold text-apricot-600">{{ props.employments.length }}</p>
        <p class="text-sm text-blueberry-500">Employment Records</p>
      </section>

      <section class="bg-white rounded-xl border border-appleCore-100 p-6 text-center">
        <Button label="Edit" text size="small" icon="pi pi-pencil" class="mb-2" @click="emit('go-to', stepIndex('tattoos'))" />
        <p class="text-3xl font-serif font-bold text-apricot-600">{{ props.tattoos.length }}</p>
        <p class="text-sm text-blueberry-500">Tattoo Records</p>
      </section>
    </div>

    <!-- ─── Batch Summary ─────────────────────────────── -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-users mr-2" />Batch Assignment
        </h3>
        <Button label="Edit" text size="small" icon="pi pi-pencil" @click="emit('go-to', stepIndex('batch'))" />
      </div>

      <div v-if="selectedBatch" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-blueberry-500">Batch:</span>
          <p class="font-medium text-blueberry-800">{{ selectedBatch.name }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Country:</span>
          <p class="font-medium text-blueberry-800">{{ selectedBatch.country ?? '—' }}</p>
        </div>
        <div>
          <span class="text-blueberry-500">Initial Status:</span>
          <p class="font-medium text-blueberry-800 capitalize">
            {{ props.batch?.batch_status?.replace(/_/g, ' ') ?? '—' }}
          </p>
        </div>
      </div>

      <p v-else class="text-blueberry-400 text-sm italic">
        No batch assignment (applicant can be added to a batch later)
      </p>
    </section>

    <!-- Nav -->
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
        class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm
               transition-colors disabled:cursor-not-allowed"
        :class="props.hasErrors
          ? 'bg-gray-300 text-gray-500'
          : 'bg-green-600 text-white hover:bg-green-700'"
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