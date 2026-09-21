<!-- src/features/applicants/components/insurance/InsuranceExportDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InsuranceApplicantForm from './InsuranceApplicantForm.vue'
import InsuranceMissingFieldsAlert from './InsuranceMissingFieldsAlert.vue'
import type { InsuranceApplicantRow } from '../../types/insurance-export.types'
import type { InsuranceSortOption } from '../../composables/useInsuranceExport'

defineProps<{
  visible: boolean
  isExporting: boolean
  isLoadingDetails?: boolean
  departureDate: string
  sortBy?: InsuranceSortOption
  rows: InsuranceApplicantRow[]
  missingFields: Array<{ applicantId: number; applicantName: string; fields: string[] }>
  isValid: boolean
  errorMessage: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'update:departureDate', v: string): void
  (e: 'update:sortBy', v: InsuranceSortOption): void
  (e: 'close'): void
  (e: 'submit'): void
}>()
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :dismissable-mask="!isExporting && !isLoadingDetails"
    :closable="false"
    :style="{ width: '780px' }"
    :pt="{
      root: { class: 'rounded-2xl overflow-hidden' },
      header: { class: '!p-0' },
      content: { class: '!p-0' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #container>
      <div class="bg-white rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">

        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-appleCore-100 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <i class="pi pi-file-word text-blue-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-semibold text-blueberry-800">
                Export Migrant Worker Insurance
              </p>
              <p class="text-[11px] text-blueberry-500">
                Generate insurance DOCX report for {{ rows.length || 'selected' }} {{ rows.length === 1 ? 'applicant' : 'applicants' }}
              </p>
            </div>
          </div>
          <button
            v-if="!isExporting && !isLoadingDetails"
            type="button"
            class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500 transition-colors"
            @click="emit('close')"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>

        <!-- Loading Details State -->
        <div v-if="isLoadingDetails" class="p-12 text-center flex flex-col items-center justify-center gap-3">
          <i class="pi pi-spin pi-spinner text-3xl text-blue-600" />
          <p class="text-sm font-semibold text-blueberry-800">Loading applicant details...</p>
          <p class="text-xs text-blueberry-500">Fetching passport numbers, DOBs, and deployment profiles</p>
        </div>

        <!-- Content -->
        <div v-else class="flex-1 overflow-y-auto p-5 space-y-5">
          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <i class="pi pi-exclamation-circle text-red-500 text-sm" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Controls Bar: Departure Date & Sorting -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100/80">
            <!-- Tentative Departure Date -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-blueberry-800">
                Tentative Departure Date <span class="text-red-500">*</span>
              </label>
              <input
                :value="departureDate"
                @input="emit('update:departureDate', ($event.target as HTMLInputElement).value)"
                type="date"
                class="w-full text-xs px-3 py-2 border border-appleCore-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blueberry-900 font-medium cursor-pointer"
              />
            </div>

            <!-- 🎯 Sort By Selector -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-blueberry-800">
                Sort Order
              </label>
              <select
                :value="sortBy"
                @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value as InsuranceSortOption)"
                class="w-full text-xs px-3 py-2 border border-appleCore-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blueberry-900 font-medium cursor-pointer"
              >
                <option value="surname_asc">Surname (A → Z)</option>
                <option value="surname_desc">Surname (Z → A)</option>
                <option value="firstname_asc">First Name (A → Z)</option>
                <option value="default">Default (Selection Order)</option>
              </select>
            </div>
          </div>

          <!-- Missing Fields Warning -->
          <InsuranceMissingFieldsAlert :missing-items="missingFields" />

          <!-- Applicants List -->
          <div class="space-y-3">
            <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider">
              Applicant Details (Fill or correct missing fields)
            </p>

            <InsuranceApplicantForm
              v-for="(applicant, index) in rows"
              :key="applicant.id"
              :applicant="applicant"
              :index="index"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50 shrink-0">
          <Button
            label="Cancel"
            severity="secondary"
            text
            size="small"
            :disabled="isExporting || isLoadingDetails"
            @click="emit('close')"
          />
          <Button
            :label="isExporting ? 'Generating DOCX...' : `Generate Insurance (${rows.length} PAX)`"
            icon="pi pi-file-word"
            :loading="isExporting"
            :disabled="!isValid || isExporting || isLoadingDetails"
            class="!bg-blue-600 hover:!bg-blue-700 !border-blue-600 !text-white"
            @click="emit('submit')"
          />
        </div>

      </div>
    </template>
  </Dialog>
</template>