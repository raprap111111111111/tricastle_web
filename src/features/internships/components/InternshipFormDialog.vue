<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { useInternships } from '../composables/useInternships'
import { useCompanyStore } from '@features/companies/stores/company.store'
import type { CreateInternshipPayload, InternshipProgramType } from '../types'

const props = defineProps<{
  visible: boolean
  applicantId: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'created'): void
}>()

const { handleCreate } = useInternships()
const companyStore = useCompanyStore()

const defaultForm = (): CreateInternshipPayload => ({
  applicant_id: props.applicantId,
  program_type: 'titp',
  receiving_company_id: null,
  internship_program_id: null,
  contract_start: null,
  contract_years: 3,
  job_description: 'FRAME WORKING',
  municipality: 'Murcia',
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

watch(
  () => props.visible,
  async (isVisible) => {
    if (!isVisible) return

    Object.assign(form, defaultForm())
    startDate.value = null

    if (companyStore.companies.length === 0) {
      await companyStore.fetchCompanies()
    }
  },
)

onMounted(async () => {
  if (companyStore.companies.length === 0) {
    await companyStore.fetchCompanies()
  }
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
    :style="{ width: '520px' }"
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