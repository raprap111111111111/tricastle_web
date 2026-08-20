<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { COMMON_COUNTRIES, SALARY_CURRENCIES, VISA_TYPES } from '../types'
import type { Deployment, DeployApplicantPayload } from '../types'

// 🏢 Companies + Categories integration
import { useCompanyStore } from '@features/companies/stores/company.store'
import { useCompanyCategoryStore } from '@features/company-categories/stores/company-category.store'
import type { Company } from '@features/companies/types'

const props = defineProps<{
  visible: boolean
  mode: 'deploy' | 'edit'
  deployment?: Deployment | null
  applicantName?: string
  applicantCode?: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', payload: DeployApplicantPayload): void
}>()

// 🏢 Stores
const companyStore = useCompanyStore()
const categoryStore = useCompanyCategoryStore()

// ─── Form state ───────────────────────────────────────
const country = ref<string>('')
const companyId = ref<number | null>(null)
const companyName = ref<string>('')
const position = ref<string>('')
const deploymentDate = ref<Date | null>(null)
const contractDurationMonths = ref<number | null>(null)
const contractStartDate = ref<Date | null>(null)
const contractEndDate = ref<Date | null>(null)
const monthlySalary = ref<number | null>(null)
const salaryCurrency = ref<string>('USD')
const flightDate = ref<Date | null>(null)
const visaType = ref<string>('')
const deploymentNotes = ref<string>('')

// ─── Options ──────────────────────────────────────────
const countryOptions = computed(() =>
  COMMON_COUNTRIES.map((c) => ({ label: c, value: c })),
)

const visaTypeOptions = computed(() =>
  VISA_TYPES.map((v) => ({ label: v, value: v })),
)

// 🏢 Company options — filtered by selected country + active only
const companyOptions = computed(() => {
  let list: Company[] = companyStore.companies.filter((c) => c.is_active)

  if (country.value) {
    list = list.filter((c) => c.country === country.value)
  }

  return list.map((c) => ({
    label: c.name,
    value: c.id,
    code: c.code,
    country: c.country,
    prefecture: c.prefecture,
    city: c.city,
    category: c.category?.name,
    nameJapanese: c.name_japanese,
  }))
})

// 🏷️ Position options from company categories
const positionOptions = computed(() =>
  categoryStore.categories
    .filter((c: any) => c.is_active !== false)
    .map((c: any) => ({
      label: c.name,
      value: c.name,
      code: c.code,
    }))
)

// ─── Load companies + categories on mount ──────────────
onMounted(async () => {
  // Load companies
  if (companyStore.companies.length === 0) {
    try {
      companyStore.setFilters({ limit: 1000, is_active: 1 } as any)
      await companyStore.fetchCompanies()
    } catch (err) {
      console.error('Failed to load companies:', err)
    }
  }

  // Load categories
  if (categoryStore.categories.length === 0) {
    try {
      categoryStore.setFilters({ limit: 1000, is_active: 1 } as any)
      await categoryStore.fetchCategories()
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }
})

// ─── Reset form ───────────────────────────────────────
function resetForm() {
  country.value = ''
  companyId.value = null
  companyName.value = ''
  position.value = ''
  deploymentDate.value = null
  contractDurationMonths.value = null
  contractStartDate.value = null
  contractEndDate.value = null
  monthlySalary.value = null
  salaryCurrency.value = 'USD'
  flightDate.value = null
  visaType.value = ''
  deploymentNotes.value = ''
}

// ─── Pre-fill form when editing ───────────────────────
watch(
  () => [props.visible, props.deployment],
  () => {
    if (!props.visible) return

    if (props.mode === 'edit' && props.deployment) {
      const d = props.deployment
      country.value = d.deployment_country ?? ''
      companyName.value = d.deployment_company ?? ''

      const matchedCompany = companyStore.companies.find(
        (c) => c.name === d.deployment_company,
      )
      companyId.value = matchedCompany?.id ?? null

      position.value = d.deployment_position ?? ''
      deploymentDate.value = d.deployed_at ? new Date(d.deployed_at) : null
      contractDurationMonths.value = d.contract_duration_months ?? null
      contractStartDate.value = d.contract_start_date ? new Date(d.contract_start_date) : null
      contractEndDate.value = d.contract_end_date ? new Date(d.contract_end_date) : null
      monthlySalary.value = d.monthly_salary ?? null
      salaryCurrency.value = d.salary_currency ?? 'USD'
      flightDate.value = d.flight_date ? new Date(d.flight_date) : null
      visaType.value = d.visa_type ?? ''
      deploymentNotes.value = d.deployment_notes ?? ''
    } else {
      resetForm()
      deploymentDate.value = new Date()
    }
  },
  { immediate: true },
)

// 🏢 Watch company selection → update companyName + auto-fill country ONLY
watch(companyId, (newId) => {
  if (!newId) {
    companyName.value = ''
    return
  }

  const selected = companyStore.companies.find((c) => c.id === newId)
  if (!selected) return

  companyName.value = selected.name

  // Auto-fill country if not already set
  if (!country.value && selected.country) {
    country.value = selected.country
  }
  // ❌ Do NOT auto-fill position — companies hire for multiple job types
})

// 🏢 Watch country changes → reset company if it doesn't match
watch(country, (newCountry) => {
  if (!newCountry || !companyId.value) return

  const selected = companyStore.companies.find((c) => c.id === companyId.value)
  if (selected && selected.country !== newCountry) {
    companyId.value = null
    companyName.value = ''
  }
})

// ─── Auto-calculate contract end date ─────────────────
watch([contractStartDate, contractDurationMonths], () => {
  if (contractStartDate.value && contractDurationMonths.value && !contractEndDate.value) {
    const end = new Date(contractStartDate.value)
    end.setMonth(end.getMonth() + contractDurationMonths.value)
    contractEndDate.value = end
  }
})

// ─── Validation ───────────────────────────────────────
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!country.value.trim()) errors.value.country = 'Country is required'
  if (!companyName.value.trim()) errors.value.company = 'Company is required'
  if (!deploymentDate.value) errors.value.deploymentDate = 'Deployment date is required'
  return Object.keys(errors.value).length === 0
}

function formatDate(d: Date | null): string | null {
  if (!d) return null
  return d.toISOString().split('T')[0]
}

function onSubmit() {
  if (!validate()) return

  const payload: DeployApplicantPayload = {
    deployment_country: country.value.trim(),
    deployment_company: companyName.value.trim(),
    deployment_date: formatDate(deploymentDate.value)!,
    deployment_position: position.value.trim() || null,
    contract_duration_months: contractDurationMonths.value,
    contract_start_date: formatDate(contractStartDate.value),
    contract_end_date: formatDate(contractEndDate.value),
    monthly_salary: monthlySalary.value,
    salary_currency: salaryCurrency.value,
    flight_date: formatDate(flightDate.value),
    visa_type: visaType.value.trim() || null,
    deployment_notes: deploymentNotes.value.trim() || null,
  }

  emit('submit', payload)
}

function onClose() {
  emit('update:visible', false)
}

// ─── Dialog title ─────────────────────────────────────
const dialogTitle = computed(() =>
  props.mode === 'deploy' ? 'Deploy Applicant' : 'Edit Deployment',
)

const submitLabel = computed(() =>
  props.mode === 'deploy' ? 'Deploy' : 'Update',
)
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :draggable="false"
    :dismissable-mask="false"
    :closable="false"
    :style="{ width: '640px' }"
    :pt="{
      root: { class: 'rounded-2xl overflow-hidden' },
      header: { class: '!p-0' },
      content: { class: '!p-0' },
    }"
  >
    <template #container>
      <div class="bg-white rounded-2xl overflow-hidden">
        <!-- ─── Header ────────────────────────────── -->
        <div class="flex items-center justify-between p-5 border-b border-appleCore-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <i class="pi pi-send text-green-600 text-lg" />
            </div>
            <div>
              <p class="text-base font-semibold text-blueberry-800">{{ dialogTitle }}</p>
              <p v-if="applicantName" class="text-xs text-blueberry-500">
                {{ applicantName }}
                <span v-if="applicantCode" class="text-apricot-600 font-mono">({{ applicantCode }})</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
            @click="onClose"
          >
            <i class="pi pi-times text-sm" />
          </button>
        </div>

        <!-- ─── Body ──────────────────────────────── -->
        <div class="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

          <!-- Destination Section -->
          <div>
            <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <i class="pi pi-globe text-green-500 text-xs" />
              Destination
            </p>

            <div class="grid grid-cols-2 gap-3">
              <!-- Country -->
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                  Country <span class="text-red-500">*</span>
                </label>
                <Select
                  v-model="country"
                  :options="countryOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select country..."
                  class="w-full"
                  filter
                  editable
                  :class="{ '!border-red-500': errors.country }"
                />
                <p v-if="errors.country" class="text-[10px] text-red-500 mt-1">{{ errors.country }}</p>
              </div>

              <!-- 🏢 Company -->
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                  <span>Company <span class="text-red-500">*</span></span>
                  <span v-if="companyStore.loading" class="text-[10px] text-blueberry-400 font-normal">
                    <i class="pi pi-spin pi-spinner text-[9px]" /> Loading...
                  </span>
                  <span
                    v-else-if="country && companyOptions.length > 0"
                    class="text-[10px] text-blueberry-400 font-normal"
                  >
                    ({{ companyOptions.length }} in {{ country }})
                  </span>
                </label>

                <Select
                  v-model="companyId"
                  :options="companyOptions"
                  option-label="label"
                  option-value="value"
                  :placeholder="
                    companyStore.loading
                      ? 'Loading companies...'
                      : companyOptions.length === 0 && country
                        ? 'No companies in ' + country
                        : 'Select company...'
                  "
                  class="w-full"
                  filter
                  show-clear
                  :loading="companyStore.loading"
                  :class="{ '!border-red-500': errors.company }"
                >
                  <template #option="{ option }">
                    <div class="flex items-center gap-2 w-full">
                      <div class="w-7 h-7 rounded-lg bg-blueberry-50 flex items-center justify-center flex-shrink-0">
                        <i class="pi pi-building text-blueberry-500 text-xs" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5">
                          <p class="text-sm font-medium text-blueberry-800 truncate">
                            {{ option.label }}
                          </p>
                          <span v-if="option.code" class="text-[9px] font-mono text-apricot-600 flex-shrink-0">
                            {{ option.code }}
                          </span>
                        </div>
                        <p class="text-[10px] text-blueberry-400 truncate">
                          <i class="pi pi-globe text-[8px]" /> {{ option.country }}
                          <span v-if="option.city"> · {{ option.city }}</span>
                          <span v-if="option.category" class="ml-1 text-blueberry-500">
                            · {{ option.category }}
                          </span>
                        </p>
                      </div>
                    </div>
                  </template>

                  <template #empty>
                    <div class="text-center py-4 px-3">
                      <i class="pi pi-inbox text-2xl text-blueberry-300 mb-2 block" />
                      <p class="text-sm text-blueberry-500">
                        {{ country ? `No companies in ${country}` : 'No companies available' }}
                      </p>
                      <p class="text-[10px] text-blueberry-400 mt-1">
                        Add companies in the Companies module
                      </p>
                    </div>
                  </template>
                </Select>
                <p v-if="errors.company" class="text-[10px] text-red-500 mt-1">{{ errors.company }}</p>

                <p
                  v-else-if="country && companyOptions.length === 0 && !companyStore.loading"
                  class="text-[10px] text-amber-600 mt-1 flex items-center gap-1"
                >
                  <i class="pi pi-exclamation-circle text-[9px]" />
                  No companies found in {{ country }}. Add one in the Companies module.
                </p>
              </div>

              <!-- Position (searchable category dropdown) -->
              <div class="col-span-2">
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                  <span>Position</span>
                  <span v-if="categoryStore.loading" class="text-[10px] text-blueberry-400 font-normal">
                    <i class="pi pi-spin pi-spinner text-[9px]" /> Loading...
                  </span>
                  <span
                    v-else-if="positionOptions.length > 0"
                    class="text-[10px] text-blueberry-400 font-normal"
                  >
                    ({{ positionOptions.length }})
                  </span>
                </label>

                <Select
                  v-model="position"
                  :options="positionOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Search or type position..."
                  class="w-full"
                  filter
                  editable
                  show-clear
                  :loading="categoryStore.loading"
                >
                  <template #option="{ option }">
                    <div class="flex items-center gap-2 w-full">
                      <div class="w-7 h-7 rounded-lg bg-apricot-50 flex items-center justify-center flex-shrink-0">
                        <i class="pi pi-briefcase text-apricot-500 text-xs" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5">
                          <p class="text-sm font-medium text-blueberry-800 truncate">
                            {{ option.label }}
                          </p>
                          <span v-if="option.code" class="text-[9px] font-mono text-apricot-600 flex-shrink-0">
                            {{ option.code }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template #empty>
                    <div class="text-center py-4 px-3">
                      <i class="pi pi-inbox text-xl text-blueberry-300 mb-2 block" />
                      <p class="text-xs text-blueberry-500">No categories found</p>
                      <p class="text-[10px] text-blueberry-400 mt-1">You can type a custom position</p>
                    </div>
                  </template>
                </Select>
              </div>
            </div>
          </div>

          <!-- Dates Section -->
          <div class="pt-4 border-t border-appleCore-100">
            <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <i class="pi pi-calendar text-apricot-500 text-xs" />
              Dates
            </p>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                  Deployment Date <span class="text-red-500">*</span>
                </label>
                <DatePicker
                  v-model="deploymentDate"
                  date-format="M dd, yy"
                  show-icon
                  icon-display="input"
                  class="w-full"
                  :class="{ '!border-red-500': errors.deploymentDate }"
                />
                <p v-if="errors.deploymentDate" class="text-[10px] text-red-500 mt-1">{{ errors.deploymentDate }}</p>
              </div>

              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Flight Date</label>
                <DatePicker
                  v-model="flightDate"
                  date-format="M dd, yy"
                  show-icon
                  icon-display="input"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Contract Section -->
          <div class="pt-4 border-t border-appleCore-100">
            <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <i class="pi pi-briefcase text-blueberry-500 text-xs" />
              Contract
            </p>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Duration (months)</label>
                <InputNumber
                  v-model="contractDurationMonths"
                  placeholder="e.g. 12"
                  :min="1"
                  :max="120"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Start Date</label>
                <DatePicker
                  v-model="contractStartDate"
                  date-format="M dd, yy"
                  show-icon
                  icon-display="input"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                  <span>End Date</span>
                  <span class="text-[9px] text-blueberry-400 font-normal">(auto)</span>
                </label>
                <DatePicker
                  v-model="contractEndDate"
                  date-format="M dd, yy"
                  show-icon
                  icon-display="input"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Salary Section -->
          <div class="pt-4 border-t border-appleCore-100">
            <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <i class="pi pi-dollar text-green-500 text-xs" />
              Compensation
            </p>

            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Monthly Salary</label>
                <InputNumber
                  v-model="monthlySalary"
                  placeholder="e.g. 1500"
                  :min="0"
                  :max-fraction-digits="2"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Currency</label>
                <Select
                  v-model="salaryCurrency"
                  :options="SALARY_CURRENCIES"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Visa Section -->
          <div class="pt-4 border-t border-appleCore-100">
            <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <i class="pi pi-id-card text-apricot-500 text-xs" />
              Visa
            </p>

            <div>
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Visa Type</label>
              <Select
                v-model="visaType"
                :options="visaTypeOptions"
                option-label="label"
                option-value="value"
                placeholder="Select visa type..."
                class="w-full"
                editable
                show-clear
              />
            </div>
          </div>

          <!-- Notes -->
          <div class="pt-4 border-t border-appleCore-100">
            <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Notes</label>
            <Textarea
              v-model="deploymentNotes"
              rows="3"
              placeholder="Any additional deployment notes..."
              class="w-full"
            />
          </div>
        </div>

        <!-- ─── Footer ────────────────────────────── -->
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
          <Button label="Cancel" severity="secondary" text @click="onClose" />
          <Button
            :label="submitLabel"
            :icon="mode === 'deploy' ? 'pi pi-send' : 'pi pi-check'"
            :loading="submitting"
            class="!bg-green-600 hover:!bg-green-700 !border-green-600"
            @click="onSubmit"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>