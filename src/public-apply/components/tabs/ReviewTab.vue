<!-- src/public-apply/components/tabs/ReviewTab.vue -->
<script setup lang="ts">
import Button from 'primevue/button'
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

const props = defineProps<{
  personal: PersonalFormValues | null
  physical: PhysicalAddressFormValues | null
  documents: DocumentsFormValues | null
  deployment: DeploymentFormValues | null
  family: FamilyFormValues | null
  lifestyle: LifestyleFormValues | null
  educations: EducationEntryValues[]
  employments: EmploymentEntryValues[]
  tattoos: TattooEntryValues[]
  loading?: boolean
  hasErrors?: boolean
  invalidSteps?: Array<{ key: string; label: string }>
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'back'): void
  (e: 'go-to', stepIndex: number): void
}>()
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="bg-apricot-50 border border-apricot-200 rounded-2xl p-4 text-sm text-apricot-900">
      Please review all your details carefully before submitting your application.
    </div>

    <!-- Personal Summary -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-5 space-y-3">
      <div class="flex justify-between items-center border-b border-appleCore-100 pb-2">
        <h4 class="font-serif font-bold text-blueberry-900">Personal Information</h4>
        <button type="button" class="text-xs text-apricot-600 font-semibold hover:underline" @click="emit('go-to', 0)">
          Edit
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div><span class="text-xs text-blueberry-400 block">Full Name</span> <strong>{{ props.personal?.first_name }} {{ props.personal?.middle_name ?? '' }} {{ props.personal?.last_name }} {{ props.personal?.suffix ?? '' }}</strong></div>
        <div><span class="text-xs text-blueberry-400 block">Email</span> {{ props.personal?.email }}</div>
        <div><span class="text-xs text-blueberry-400 block">Phone / Mobile</span> {{ props.personal?.phone || props.personal?.mobile || 'N/A' }}</div>
        <div><span class="text-xs text-blueberry-400 block">Date of Birth</span> {{ props.personal?.date_of_birth || 'N/A' }}</div>
        <div><span class="text-xs text-blueberry-400 block">Civil Status</span> {{ props.personal?.civil_status || 'N/A' }}</div>
        <div><span class="text-xs text-blueberry-400 block">Nationality</span> {{ props.personal?.nationality || 'Filipino' }}</div>
      </div>
    </div>

    <!-- Physical & Address Summary -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-5 space-y-3">
      <div class="flex justify-between items-center border-b border-appleCore-100 pb-2">
        <h4 class="font-serif font-bold text-blueberry-900">Physical & Address</h4>
        <button type="button" class="text-xs text-apricot-600 font-semibold hover:underline" @click="emit('go-to', 1)">
          Edit
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div><span class="text-xs text-blueberry-400 block">Current Address</span> {{ props.physical?.current_address || 'N/A' }}</div>
        <div><span class="text-xs text-blueberry-400 block">Permanent Address</span> {{ props.physical?.permanent_address || 'Same as current' }}</div>
        <div><span class="text-xs text-blueberry-400 block">Height / Weight</span> {{ props.physical?.height_cm ? `${props.physical.height_cm} cm` : 'N/A' }} / {{ props.physical?.weight_kg ? `${props.physical.weight_kg} kg` : 'N/A' }}</div>
        <div><span class="text-xs text-blueberry-400 block">Blood Type</span> {{ props.physical?.blood_type || 'N/A' }}</div>
      </div>
    </div>

    <!-- Deployment Summary -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-5 space-y-3">
      <div class="flex justify-between items-center border-b border-appleCore-100 pb-2">
        <h4 class="font-serif font-bold text-blueberry-900">Job & Deployment Preference</h4>
        <button type="button" class="text-xs text-apricot-600 font-semibold hover:underline" @click="emit('go-to', 3)">
          Edit
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div><span class="text-xs text-blueberry-400 block">Trade / Occupation</span> {{ props.deployment?.trade_or_occupation || 'None specified' }}</div>
        <div><span class="text-xs text-blueberry-400 block">Skill Category</span> {{ props.deployment?.skill_category || 'N/A' }}</div>
        <div><span class="text-xs text-blueberry-400 block">JLPT Level</span> {{ props.deployment?.jlpt_level || 'None' }}</div>
        <div><span class="text-xs text-blueberry-400 block">Willing to Deploy</span> {{ props.deployment?.willing_to_be_deployed ? 'Yes' : 'No' }}</div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between pt-4 border-t border-appleCore-100">
      <Button label="Back" icon="pi pi-arrow-left" severity="secondary" outlined @click="emit('back')" />
      <Button
        label="Submit Application"
        icon="pi pi-check"
        icon-pos="right"
        :loading="props.loading"
        class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white !px-8 !py-3 !rounded-xl font-bold"
        @click="emit('submit')"
      />
    </div>
  </div>
</template>