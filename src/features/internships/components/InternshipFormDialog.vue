<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { useInternships } from '../composables/useInternships'
import { useCompanyStore } from '@features/companies/stores/company.store'
import { useApplicantStore } from '@features/applicants/stores/applicant.store'
import type { CreateInternshipPayload, InternshipProgramType } from '../types'
import type { PassportIssuingOffice } from '@features/applicants/types'

const props = defineProps<{
  visible: boolean
  applicantId: number
  /** Optional: pass applicant so we can prefill passport fields */
  applicant?: {
    passport_number?: string | null
    passport_issuing_office_id?: number | null
  } | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'created'): void
}>()

const { handleCreate } = useInternships()
const companyStore = useCompanyStore()
const applicantStore = useApplicantStore()
const { passportOffices, loadingOffices } = storeToRefs(applicantStore)

const defaultForm = (): CreateInternshipPayload => ({
  applicant_id: props.applicantId,
  program_type: 'titp',
  receiving_company_id: null,
  internship_program_id: null,
  contract_start: null,
  contract_years: 3,
  job_description: 'FRAME WORKING',
  municipality: 'Murcia',
  passport_number: props.applicant?.passport_number ?? null,
  passport_issuing_office_id: props.applicant?.passport_issuing_office_id ?? null,
})

const form = reactive<CreateInternshipPayload>(defaultForm())
const startDate = ref<Date | null>(null)

watch(startDate, (v) => {
  form.contract_start = v ? v.toISOString().split('T')[0] : null
})

watch(
  () => props.applicantId,
  (v) => {
    form.applicant_id = v
  },
)

// Prefill passport when applicant prop changes
watch(
  () => props.applicant,
  (applicant) => {
    if (!applicant) return
    if (!form.passport_number && applicant.passport_number) {
      form.passport_number = applicant.passport_number
    }
    if (!form.passport_issuing_office_id && applicant.passport_issuing_office_id) {
      form.passport_issuing_office_id = applicant.passport_issuing_office_id
    }
  },
  { immediate: true },
)

// Clear DFA location when passport number is cleared
watch(
  () => form.passport_number,
  (val) => {
    if (!val || !String(val).trim()) {
      form.passport_issuing_office_id = null
    }
  },
)

watch(
  () => props.visible,
  async (isVisible) => {
    if (!isVisible) return

    Object.assign(form, defaultForm())
    startDate.value = null

    if (companyStore.companies.length === 0) {
      await companyStore.fetchCompanies()
    }
    await applicantStore.fetchPassportOffices()
  },
)

onMounted(async () => {
  if (companyStore.companies.length === 0) {
    await companyStore.fetchCompanies()
  }
  await applicantStore.fetchPassportOffices()
})

const companyOptions = computed(() =>
  companyStore.companies.map((c) => ({
    label: `${c.name}${c.code ? ` (${c.code})` : ''}${c.name_japanese ? ` — ${c.name_japanese}` : ''}`,
    value: c.id,
  })),
)

const typeOptions = [
  { label: 'Internship Program', value: 'intern' as InternshipProgramType },
  { label: 'TITP (Technical Intern Training)', value: 'titp' as InternshipProgramType },
  { label: 'SSW (Specified Skilled Worker)', value: 'ssw' as InternshipProgramType },
  { label: 'SSW Company Transfer', value: 'ssw_transfer' as InternshipProgramType },
]

// Flatten grouped DFA offices for Select
const flatPassportOffices = computed(() => {
  return Object.entries(passportOffices.value).flatMap(([region, offices]) => {
    const list = (offices ?? []) as PassportIssuingOffice[]
    return list.map((o: PassportIssuingOffice) => ({
      id: o.id,
      name: o.name,
      region,
    }))
  })
})

const hasPassportData = computed(() => {
  return !!(form.passport_number && String(form.passport_number).trim())
})

const hasPassportLocation = computed(() => {
  return !!form.passport_issuing_office_id
})

async function submit() {
  await handleCreate(form)
  emit('created')
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="true"
    :style="{ width: '560px' }"
    header="Create Internship"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4 pt-1">
      <!-- Program Type -->
      <div>
        <label class="block text-xs font-medium text-blueberry-700 mb-1">
          Program Type *
        </label>
        <Select
          v-model="form.program_type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <!-- Receiving Company Dropdown -->
      <div>
        <label class="block text-xs font-medium text-blueberry-700 mb-1">
          Receiving Company (Japan) *
        </label>
        <Select
          v-model="form.receiving_company_id"
          :options="companyOptions"
          option-label="label"
          option-value="value"
          filter
          show-clear
          :loading="companyStore.loading"
          placeholder="Search and select receiving company..."
          class="w-full"
        >
          <template #option="slotProps">
            <div class="flex flex-col py-0.5">
              <span class="font-medium text-blueberry-800 text-sm">
                {{ slotProps.option.label }}
              </span>
            </div>
          </template>
        </Select>
        <p
          v-if="!companyStore.loading && companyOptions.length === 0"
          class="text-[11px] text-amber-600 mt-1"
        >
          No companies found. Please add companies in the Companies module first.
        </p>
      </div>

      <!-- Job Description -->
      <div>
        <label class="block text-xs font-medium text-blueberry-700 mb-1">
          Job Description / Trade *
        </label>
        <InputText
          v-model="form.job_description"
          class="w-full"
          placeholder="e.g. FRAME WORKING, CAREGIVING, SCAFFOLDING"
        />
      </div>

      <!-- Contract Dates & Duration -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1">
            Contract Start
          </label>
          <DatePicker
            v-model="startDate"
            show-icon
            class="w-full"
            placeholder="Select date"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1">
            Contract Years
          </label>
          <InputNumber
            v-model="form.contract_years"
            class="w-full"
            :min="1"
            :max="5"
          />
        </div>
      </div>

      <!-- Municipality -->
      <div>
        <label class="block text-xs font-medium text-blueberry-700 mb-1">
          Municipality (MOA Execution Venue)
        </label>
        <InputText
          v-model="form.municipality"
          class="w-full"
          placeholder="e.g. Murcia"
        />
      </div>

      <!-- ═══════════════════════════════════════════════════
           PASSPORT DETAILS
           ═══════════════════════════════════════════════════ -->
      <div class="pt-3 border-t border-appleCore-100">
        <div class="flex items-center justify-between mb-3">
          <label class="text-xs font-bold text-blueberry-500 uppercase tracking-wider flex items-center gap-1.5">
            <i class="pi pi-id-card text-apricot-500" />
            Passport Details
          </label>

          <!-- Status badges -->
          <span
            v-if="!hasPassportData"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold ring-1 ring-amber-200"
          >
            <i class="pi pi-exclamation-triangle text-[9px]" />
            No passport on file
          </span>
          <span
            v-else-if="!hasPassportLocation"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold ring-1 ring-amber-200"
          >
            <i class="pi pi-exclamation-triangle text-[9px]" />
            Missing DFA location
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold ring-1 ring-green-200"
          >
            <i class="pi pi-check text-[9px]" />
            Passport complete
          </span>
        </div>

        <!-- Info when no passport -->
        <div
          v-if="!hasPassportData"
          class="mb-3 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <i class="pi pi-info-circle text-amber-600 text-xs mt-0.5" />
          <p class="text-[11px] text-amber-800 leading-relaxed">
            Applicant has no passport number on record. You can enter it here for this MOA,
            or leave blank if not yet available.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Passport Number -->
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1">
              Passport Number
            </label>
            <InputText
              v-model="form.passport_number"
              class="w-full"
              placeholder="e.g. P1234567A"
            />
            <p v-if="!hasPassportData" class="text-[10px] text-blueberry-400 mt-1">
              Leave blank if applicant has no passport yet
            </p>
          </div>

          <!-- DFA Issuing Location -->
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1 flex items-center gap-1">
              Passport Issuing Location (DFA)
              <i
                v-if="loadingOffices"
                class="pi pi-spin pi-spinner text-[10px] text-apricot-500"
              />
            </label>
            <Select
              v-model="form.passport_issuing_office_id"
              :options="flatPassportOffices"
              option-label="name"
              option-value="id"
              placeholder="Select DFA Location"
              :loading="loadingOffices"
              :disabled="!hasPassportData"
              filter
              show-clear
              class="w-full"
            >
              <template #option="slotProps">
                <div class="flex flex-col py-0.5">
                  <span class="text-[10px] font-bold text-apricot-600 uppercase tracking-wider">
                    {{ slotProps.option.region }}
                  </span>
                  <span class="text-sm font-medium text-blueberry-800">
                    {{ slotProps.option.name }}
                  </span>
                </div>
              </template>
            </Select>
            <p v-if="!hasPassportData" class="text-[10px] text-blueberry-400 mt-1">
              Enter a passport number first
            </p>
            <p
              v-else-if="hasPassportData && !hasPassportLocation"
              class="text-[10px] text-amber-600 mt-1"
            >
              <i class="pi pi-exclamation-triangle text-[9px] mr-0.5" />
              Recommended for MOA generation
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2 pt-3">
        <Button
          label="Cancel"
          severity="secondary"
          text
          @click="emit('update:visible', false)"
        />
        <Button
          label="Create Internship"
          icon="pi pi-check"
          :disabled="!form.receiving_company_id"
          class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white"
          @click="submit"
        />
      </div>
    </template>
  </Dialog>
</template>