<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { COMMON_COUNTRIES, SALARY_CURRENCIES } from '../types'
import type { DeployApplicantPayload } from '../types'

// 🏢 Companies integration
// 🏢 Companies integration
import { useCompanyStore } from '@features/companies/stores/company.store'
import { useCompanyCategoryStore } from '@features/company-categories/stores/company-category.store'
import type { Company } from '@features/companies/types'

const props = defineProps<{
  visible: boolean
  applicantBatchIds: number[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', payload: DeployApplicantPayload): void
}>()

// 🏢 Company store
// 🏢 Stores
const companyStore = useCompanyStore()
const categoryStore = useCompanyCategoryStore()

const country = ref<string>('')
const companyId = ref<number | null>(null)
const companyName = ref<string>('')
const position = ref<string>('')
const deploymentDate = ref<Date | null>(new Date())
const contractDurationMonths = ref<number | null>(null)
const monthlySalary = ref<number | null>(null)
const salaryCurrency = ref<string>('USD')
const visaType = ref<string>('')
const deploymentNotes = ref<string>('')

const errors = ref<Record<string, string>>({})

// ─── Load companies on mount ──────────────────────────
// ─── Load companies + categories on mount ──────────────
// ❌ REMOVE onMounted fetch

watch(
  () => props.visible,
  async (isOpen) => {
    if (!isOpen) return

    // reset form (you already do this)
    country.value = ''
    companyId.value = null
    // ... rest of your reset ...

    if (companyStore.companies.length === 0) {
      try {
        companyStore.setFilters({ limit: 1000, is_active: true } as any)
        await companyStore.fetchCompanies()
      } catch (err) {
        console.error('Failed to load companies:', err)
      }
    }

    if (categoryStore.categories.length === 0) {
      try {
        categoryStore.setFilters({ limit: 1000, is_active: true } as any)
        await categoryStore.fetchCategories()
      } catch (err) {
        console.error('Failed to load categories:', err)
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

// ─── Reset when dialog opens ──────────────────────────
watch(() => props.visible, (v) => {
  if (v) {
    country.value = ''
    companyId.value = null
    companyName.value = ''
    position.value = ''
    deploymentDate.value = new Date()
    contractDurationMonths.value = null
    monthlySalary.value = null
    salaryCurrency.value = 'USD'
    visaType.value = ''
    deploymentNotes.value = ''
    errors.value = {}
  }
})

const countryOptions = computed(() =>
  COMMON_COUNTRIES.map((c) => ({ label: c, value: c })),
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
  }))
})

// 🏢 Sync company name when ID changes + auto-fill country ONLY
watch(companyId, (newId) => {
  if (!newId) {
    companyName.value = ''
    return
  }
  const selected = companyStore.companies.find((c) => c.id === newId)
  if (!selected) return

  companyName.value = selected.name

  // Auto-fill country (safe — company belongs to one country)
  if (selected.country) {
    country.value = selected.country
  }
  // ❌ Do NOT auto-fill position — companies hire for multiple job types
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

// 🏢 Reset company if country changes
watch(country, (newCountry) => {
  if (!newCountry || !companyId.value) return
  const selected = companyStore.companies.find((c) => c.id === companyId.value)
  if (selected && selected.country !== newCountry) {
    companyId.value = null
    companyName.value = ''
  }
})

function formatDate(d: Date | null): string | null {
  if (!d) return null
  return d.toISOString().split('T')[0]
}

function validate(): boolean {
  errors.value = {}
  if (!country.value.trim()) errors.value.country = 'Required'
  if (!companyName.value.trim()) errors.value.company = 'Required'
  if (!deploymentDate.value) errors.value.deploymentDate = 'Required'
  return Object.keys(errors.value).length === 0
}

function onSubmit() {
  if (!validate()) return

  emit('submit', {
    deployment_country: country.value.trim(),
    deployment_company: companyName.value.trim(),
    deployment_date: formatDate(deploymentDate.value)!,
    deployment_position: position.value.trim() || null,
    contract_duration_months: contractDurationMonths.value,
    monthly_salary: monthlySalary.value,
    salary_currency: salaryCurrency.value,
    visa_type: visaType.value.trim() || null,
    deployment_notes: deploymentNotes.value.trim() || null,
  })
}

function onClose() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal :draggable="false" :closable="false"
    :style="{ width: '560px' }" :pt="{
      root: { class: 'rounded-2xl overflow-hidden' },
      header: { class: '!p-0' },
      content: { class: '!p-0' },
    }">
    <template #container>
      <div class="bg-white rounded-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center gap-3 p-5 border-b border-appleCore-100">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
            <i class="pi pi-users text-green-600 text-lg" />
          </div>
          <div class="flex-1">
            <p class="text-base font-semibold text-blueberry-800">Bulk Deploy</p>
            <p class="text-xs text-blueberry-500">
              Deploying <strong class="text-green-600">{{ applicantBatchIds.length }}</strong> applicant{{
                applicantBatchIds.length > 1 ? 's' : '' }} with same info
            </p>
          </div>
          <button type="button"
            class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
            @click="onClose">
            <i class="pi pi-times text-sm" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 gap-3">
            <!-- Country -->
            <div>
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                Country <span class="text-red-500">*</span>
              </label>
              <Select v-model="country" :options="countryOptions" option-label="label" option-value="value"
                placeholder="Select..." class="w-full" filter editable :class="{ '!border-red-500': errors.country }" />
              <p v-if="errors.country" class="text-[10px] text-red-500 mt-1">{{ errors.country }}</p>
            </div>

            <!-- 🏢 Company dropdown from Companies -->
            <div>
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                <span>Company <span class="text-red-500">*</span></span>
                <span v-if="country && companyOptions.length > 0" class="text-[10px] text-blueberry-400 font-normal">
                  ({{ companyOptions.length }})
                </span>
              </label>
              <Select v-model="companyId" :options="companyOptions" option-label="label" option-value="value"
                :placeholder="companyStore.loading
                  ? 'Loading...'
                  : companyOptions.length === 0 && country
                    ? 'No companies in ' + country
                    : 'Select company...'
                  " class="w-full" filter show-clear :loading="companyStore.loading"
                :class="{ '!border-red-500': errors.company }">
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
                        {{ option.country }}
                        <span v-if="option.city"> · {{ option.city }}</span>
                        <span v-if="option.category"> · {{ option.category }}</span>
                      </p>
                    </div>
                  </div>
                </template>

                <template #empty>
                  <div class="text-center py-4 px-3">
                    <i class="pi pi-inbox text-xl text-blueberry-300 mb-2 block" />
                    <p class="text-xs text-blueberry-500">
                      {{
                        country
                          ? `No companies in ${country}`
                          : 'No companies available'
                      }}
                    </p>
                  </div>
                </template>
              </Select>
              <p v-if="errors.company" class="text-[10px] text-red-500 mt-1">{{ errors.company }}</p>
              <p v-else-if="country && companyOptions.length === 0 && !companyStore.loading"
                class="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                <i class="pi pi-exclamation-circle text-[9px]" />
                No companies in {{ country }}
              </p>
            </div>

            <!-- Position -->
            <!-- Position (searchable category dropdown) -->
            <div class="col-span-2">
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                <span>Position</span>
                <span v-if="categoryStore.loading" class="text-[10px] text-blueberry-400 font-normal">
                  <i class="pi pi-spin pi-spinner text-[9px]" /> Loading...
                </span>
                <span v-else-if="positionOptions.length > 0" class="text-[10px] text-blueberry-400 font-normal">
                  ({{ positionOptions.length }})
                </span>
              </label>

              <Select v-model="position" :options="positionOptions" option-label="label" option-value="value"
                placeholder="Search or type position..." class="w-full" filter editable show-clear
                :loading="categoryStore.loading">
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

            <!-- Deployment Date -->
            <div>
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                Deployment Date <span class="text-red-500">*</span>
              </label>
              <DatePicker v-model="deploymentDate" date-format="M dd, yy" show-icon icon-display="input" class="w-full"
                :class="{ '!border-red-500': errors.deploymentDate }" />
            </div>

            <!-- Duration -->
            <div>
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Duration (months)</label>
              <InputNumber v-model="contractDurationMonths" :min="1" :max="120" class="w-full" />
            </div>

            <!-- Salary -->
            <div>
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Monthly Salary</label>
              <InputNumber v-model="monthlySalary" :min="0" class="w-full" />
            </div>

            <!-- Currency -->
            <div>
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Currency</label>
              <Select v-model="salaryCurrency" :options="SALARY_CURRENCIES" option-label="label" option-value="value"
                class="w-full" />
            </div>

            <!-- Notes -->
            <div class="col-span-2">
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Notes</label>
              <Textarea v-model="deploymentNotes" rows="2" class="w-full" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
          <Button label="Cancel" severity="secondary" text @click="onClose" />
          <Button label="Deploy All" icon="pi pi-send" :loading="submitting"
            class="!bg-green-600 hover:!bg-green-700 !border-green-600" @click="onSubmit" />
        </div>
      </div>
    </template>
  </Dialog>
</template>