<!-- src/features/applicants/components/insurance/InsuranceApplicantForm.vue -->
<script setup lang="ts">
import type { InsuranceApplicantRow } from '../../types/insurance-export.types'

defineProps<{
  applicant: InsuranceApplicantRow
  index: number
}>()
</script>

<template>
  <div class="p-4 border border-appleCore-200 rounded-xl bg-white space-y-3 shadow-xs">
    <div class="flex items-center justify-between border-b border-appleCore-100 pb-2">
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 rounded-full bg-blueberry-50 text-blueberry-700 text-xs font-bold flex items-center justify-center">
          {{ index + 1 }}
        </span>
        <span class="font-semibold text-blueberry-900 text-xs">
          {{ applicant.full_name }}
        </span>
      </div>
      <span v-if="applicant.applicant_code" class="text-[11px] bg-appleCore-100 text-blueberry-600 px-2 py-0.5 rounded-md font-mono">
        {{ applicant.applicant_code }}
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label class="block text-[11px] font-semibold text-blueberry-600 mb-1">
          Date of Birth <span class="text-red-500">*</span>
        </label>
        <input
          v-model="applicant.date_of_birth"
          type="date"
          class="w-full text-xs px-2.5 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blueberry-400 border-appleCore-200 text-blueberry-900"
          :class="{ '!border-red-400 !bg-red-50/50': !applicant.date_of_birth }"
        />
      </div>

      <div>
        <label class="block text-[11px] font-semibold text-blueberry-600 mb-1">
          Passport Number <span class="text-red-500">*</span>
        </label>
        <input
          v-model="applicant.passport_number"
          type="text"
          placeholder="e.g. P1234567A"
          class="w-full text-xs px-2.5 py-1.5 border rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-blueberry-400 border-appleCore-200 text-blueberry-900"
          :class="{ '!border-red-400 !bg-red-50/50': !applicant.passport_number }"
        />
      </div>

      <div>
        <label class="block text-[11px] font-semibold text-blueberry-600 mb-1">
          Occupation / Trade <span class="text-red-500">*</span>
        </label>
        <input
          v-model="applicant.occupation"
          type="text"
          placeholder="e.g. WELDER"
          class="w-full text-xs px-2.5 py-1.5 border rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-blueberry-400 border-appleCore-200 text-blueberry-900"
          :class="{ '!border-red-400 !bg-red-50/50': !applicant.occupation }"
        />
      </div>

      <div>
        <label class="block text-[11px] font-semibold text-blueberry-600 mb-1">
          Foreign Employer <span class="text-red-500">*</span>
        </label>
        <input
          v-model="applicant.foreign_employer"
          type="text"
          placeholder="e.g. ABC JAPAN CORP"
          class="w-full text-xs px-2.5 py-1.5 border rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-blueberry-400 border-appleCore-200 text-blueberry-900"
          :class="{ '!border-red-400 !bg-red-50/50': !applicant.foreign_employer }"
        />
      </div>

      <div>
        <label class="block text-[11px] font-semibold text-blueberry-600 mb-1">
          Destination Country <span class="text-red-500">*</span>
        </label>
        <input
          v-model="applicant.country_destination"
          type="text"
          placeholder="e.g. JAPAN"
          class="w-full text-xs px-2.5 py-1.5 border rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-blueberry-400 border-appleCore-200 text-blueberry-900"
          :class="{ '!border-red-400 !bg-red-50/50': !applicant.country_destination }"
        />
      </div>

      <div>
        <label class="block text-[11px] font-semibold text-blueberry-600 mb-1">
          Contract Duration (Months) <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="applicant.contract_duration_months"
          type="number"
          placeholder="e.g. 36"
          class="w-full text-xs px-2.5 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blueberry-400 border-appleCore-200 text-blueberry-900"
          :class="{ '!border-red-400 !bg-red-50/50': !applicant.contract_duration_months }"
        />
      </div>
    </div>
  </div>
</template>