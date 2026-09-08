<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import type { ApplicantGuarantor } from '../types'

const props = defineProps<{
  modelValue: ApplicantGuarantor
  index: number
}>()

const civilOptions = [
  { label: 'Single',    value: 'Single' },
  { label: 'Married',   value: 'Married' },
  { label: 'Widowed',   value: 'Widowed' },
  { label: 'Separated', value: 'Separated' },
  { label: 'Divorced',  value: 'Divorced' },
]

const dateValue = computed<Date | null>({
  get: () =>
    props.modelValue.residence_cert_issued_at
      ? new Date(props.modelValue.residence_cert_issued_at)
      : null,
  set: (v) => {
    props.modelValue.residence_cert_issued_at = v
      ? v.toISOString().split('T')[0]
      : null
  },
})
</script>

<template>
  <!-- No outer card / header — the wizard already provides those -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <!-- Full Name -->
    <div class="min-w-0">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Full Name *</label>
      <InputText
        v-model="modelValue.full_name"
        class="w-full"
        placeholder="e.g. LOTA E. FERRER"
      />
    </div>

    <!-- Age -->
    <div class="min-w-0">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Age</label>
      <InputNumber
        v-model="modelValue.age"
        class="w-full"
        input-class="w-full"
        :min="18"
        :max="100"
        :use-grouping="false"
      />
    </div>

    <!-- Civil Status -->
    <div class="min-w-0">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Civil Status</label>
      <Select
        v-model="modelValue.civil_status"
        :options="civilOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        placeholder="Select..."
        show-clear
      />
    </div>

    <!-- Nationality -->
    <div class="min-w-0">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Nationality</label>
      <InputText v-model="modelValue.nationality" class="w-full" />
    </div>

    <!-- Address -->
    <div class="min-w-0 sm:col-span-2">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Address</label>
      <Textarea v-model="modelValue.address" rows="2" class="w-full" />
    </div>

    <!-- Residence Cert. No. -->
    <div class="min-w-0">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Residence Cert. No.</label>
      <InputText v-model="modelValue.residence_cert_no" class="w-full" />
    </div>

    <!-- Res. Cert Issued -->
    <div class="min-w-0">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Res. Cert Issued</label>
      <DatePicker v-model="dateValue" show-icon class="w-full" />
    </div>

    <!-- Res. Cert Place -->
    <div class="min-w-0">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Res. Cert Place</label>
      <InputText v-model="modelValue.residence_cert_place" class="w-full" />
    </div>

    <!-- Relationship -->
    <div class="min-w-0">
      <label class="block text-xs font-medium text-blueberry-700 mb-1">Relationship</label>
      <InputText
        v-model="modelValue.relationship"
        class="w-full"
        placeholder="Mother, Sister, etc."
      />
    </div>
  </div>
</template>

<style scoped>
/* Force PrimeVue controls to stay inside their grid cell */
:deep(.p-inputnumber),
:deep(.p-inputnumber-input),
:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-textarea),
:deep(.p-datepicker),
:deep(.p-datepicker-input) {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100%;
}
</style>