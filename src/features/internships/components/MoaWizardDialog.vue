<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'

import GuarantorFields from './GuarantorFields.vue'
import { guarantorApi } from '../api/guarantor.api'
import { internshipApi } from '../api/internship.api'
import { useCompanyStore } from '@features/companies/stores/company.store'
import { useCompanyCategoryStore } from '@features/company-categories/stores/company-category.store'
import { useApplicantStore } from '@features/applicants/stores/applicant.store'
import { useMoaDownload } from '../composables/useMoaDownload'
import type { PassportIssuingOffice } from '@features/applicants/types'
import type {
  ApplicantGuarantor,
  Internship,
  InternshipProgramType,
  CreateInternshipPayload,
} from '../types'

const props = defineProps<{
  visible: boolean
  applicantId: number
  applicant?: {
    passport_number?: string | null
    passport_issuing_office_id?: number | null
    passport_issue_date?: string | null
  } | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'completed'): void
}>()

const toast = useToast()

const companyStore = useCompanyStore()
const categoryStore = useCompanyCategoryStore()
const applicantStore = useApplicantStore()

const { activeCategories } = storeToRefs(categoryStore)
const { passportOffices, loadingOffices } = storeToRefs(applicantStore)

const { generating: isDownloading, generateSingle: downloadMoa } = useMoaDownload()

// ─── Date helpers ─────────────────────────────────────────────────────────────
function formatLocalDate(d: Date | null): string | null {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(str?: string | null): Date | null {
  if (!str) return null
  const cleanStr = str.split('T')[0]
  const [y, m, d] = cleanStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function ensurePhAddress(addr?: string | null): string {
  const a = (addr ?? '').trim()
  if (!a) return ''
  if (/philippines$/i.test(a)) return a
  return `${a}, Philippines`
}

// ─── Wizard state ─────────────────────────────────────────────────────────────
const currentStep = ref<1 | 2 | 3 | 4>(1)
const loading = ref(false)
const currentInternship = ref<Internship | null>(null)

const steps = [
  { num: 1, title: 'Guarantors', desc: 'Add 2 guarantors', icon: 'pi-users' },
  { num: 2, title: 'Internship', desc: 'Placement details', icon: 'pi-briefcase' },
  { num: 3, title: 'Review', desc: 'Confirm details', icon: 'pi-check-circle' },
  { num: 4, title: 'Download', desc: 'Get MOA file', icon: 'pi-download' },
] as const

const currentStepMeta = computed(() => steps[currentStep.value - 1])

function unwrapList(res: unknown): any[] {
  if (!res) return []
  const r = res as any
  const body = r?.data?.data ?? r?.data ?? r
  if (Array.isArray(body)) return body
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(r?.records)) return r.records
  if (Array.isArray(r?.data?.records)) return r.data.records
  return []
}

function unwrapOne<T = any>(res: unknown): T | null {
  if (!res) return null
  const r = res as any
  return (r?.data?.data ?? r?.data ?? r) as T
}

const flatPassportOffices = computed(() => {
  if (!passportOffices.value || typeof passportOffices.value !== 'object') return []
  return Object.entries(passportOffices.value).flatMap(([region, offices]) => {
    const list = (offices ?? []) as PassportIssuingOffice[]
    return list.map((o) => ({ id: o.id, name: o.name, region }))
  })
})

// ─── Step 1: Guarantors ───────────────────────────────────────────────────────
const guarantors = ref<ApplicantGuarantor[]>([
  { sequence: 1, full_name: '', date_of_birth: null, civil_status: 'single', nationality: 'Filipino' },
  { sequence: 2, full_name: '', date_of_birth: null, civil_status: 'single', nationality: 'Filipino' },
])

async function loadExistingGuarantors(): Promise<boolean> {
  try {
    const res = await guarantorApi.list(props.applicantId)
    const list = unwrapList(res)
    if (list && list.length > 0) {
      const g1 = list.find((g: any) => Number(g.sequence) === 1) || list[0]
      const g2 = list.find((g: any) => Number(g.sequence) === 2) || (list.length > 1 ? list[1] : null)

      guarantors.value = [
        {
          id: g1?.id,
          sequence: 1,
          full_name: g1?.full_name ?? g1?.fullName ?? '',
          date_of_birth: g1?.date_of_birth ?? g1?.dateOfBirth ?? null,
          civil_status: (g1?.civil_status ?? g1?.civilStatus ?? 'single').toString().toLowerCase(),
          nationality: g1?.nationality ?? 'Filipino',
          address: g1?.address ?? '',
          residence_cert_no: g1?.residence_cert_no ?? '',
          residence_cert_issued_at: g1?.residence_cert_issued_at ?? null,
          residence_cert_place: g1?.residence_cert_place ?? '',
          relationship: g1?.relationship ?? '',
        },
        {
          id: g2?.id,
          sequence: 2,
          full_name: g2?.full_name ?? g2?.fullName ?? '',
          date_of_birth: g2?.date_of_birth ?? g2?.dateOfBirth ?? null,
          civil_status: (g2?.civil_status ?? g2?.civilStatus ?? 'single').toString().toLowerCase(),
          nationality: g2?.nationality ?? 'Filipino',
          address: g2?.address ?? '',
          residence_cert_no: g2?.residence_cert_no ?? '',
          residence_cert_issued_at: g2?.residence_cert_issued_at ?? null,
          residence_cert_place: g2?.residence_cert_place ?? '',
          relationship: g2?.relationship ?? '',
        },
      ]
      return !!guarantors.value[0]?.full_name?.trim() && !!guarantors.value[1]?.full_name?.trim()
    }
  } catch (err) {
    console.error('[Wizard] Load guarantors failed:', err)
  }
  return false
}

// ─── Step 2: Internship ───────────────────────────────────────────────────────
const internshipForm = ref<CreateInternshipPayload>({
  applicant_id: props.applicantId,
  program_type: 'titp',
  receiving_company_id: null,
  internship_program_id: null,
  agreement_date: null, // 🎯 Signing of Contract → DAY_S / MONTH_S / YEAR_S
  contract_start: null, // internship period (CON_*)
  contract_years: 3,
  job_description: 'FRAME WORKING',
  municipality: 'Murcia',
  passport_number: props.applicant?.passport_number ?? null,
  passport_issuing_office_id: props.applicant?.passport_issuing_office_id ?? null,
  passport_issue_date: props.applicant?.passport_issue_date ?? null,
})

// 🎯 Signing of Contract (MOA opening date)
const agreementDate = ref<Date | null>(new Date())
// Optional internship period start
const startDate = ref<Date | null>(null)
const passportIssueDate = ref<Date | null>(parseLocalDate(props.applicant?.passport_issue_date))

watch(agreementDate, (v) => {
  internshipForm.value.agreement_date = formatLocalDate(v)
}, { immediate: true })

watch(startDate, (v) => {
  internshipForm.value.contract_start = formatLocalDate(v)
})

watch(passportIssueDate, (v) => {
  internshipForm.value.passport_issue_date = formatLocalDate(v)
})

const companyOptions = computed(() => {
  return companyStore.companies.map((c: any) => {
    const categoryId =
      c.company_category_id ?? c.category_id ?? c.companyCategory?.id ?? c.company_category?.id ?? c.category?.id ?? null
    const categoryName =
      c.companyCategory?.name ??
      c.company_category?.name ??
      c.category?.name ??
      activeCategories.value.find((cat) => Number(cat.id) === Number(categoryId))?.name ??
      null
    const codeLabel = c.code ? ` (${c.code})` : ''
    const categoryLabel = categoryName ? ` · ${categoryName}` : ''
    return {
      label: `${c.name}${codeLabel}${categoryLabel}`,
      value: c.id,
      name: c.name,
      code: c.code ?? null,
      category_name: categoryName,
    }
  })
})

const selectedCompany = computed(() =>
  companyOptions.value.find((c) => c.value === internshipForm.value.receiving_company_id),
)

watch(
  () => internshipForm.value.receiving_company_id,
  (newCompanyId) => {
    if (!newCompanyId) return
    const company = companyOptions.value.find((c) => c.value === newCompanyId)
    if (company?.category_name) {
      if (!internshipForm.value.job_description || internshipForm.value.job_description === 'FRAME WORKING') {
        internshipForm.value.job_description = company.category_name.toUpperCase()
      }
    }
  },
)

const programTypes = [
  { label: 'Internship Program', value: 'intern' as InternshipProgramType },
  { label: 'TITP (Technical Intern Training)', value: 'titp' as InternshipProgramType },
  { label: 'SSW (Specified Skilled Worker)', value: 'ssw' as InternshipProgramType },
  { label: 'SSW Company Transfer', value: 'ssw_transfer' as InternshipProgramType },
]

async function loadExistingInternship(): Promise<boolean> {
  try {
    const res = await internshipApi.byApplicant(props.applicantId)
    const list = unwrapList(res)
    const current = list.find((i: any) => i.is_current) ?? list[0] ?? null

    if (current) {
      currentInternship.value = current
      internshipForm.value = {
        ...internshipForm.value,
        applicant_id: props.applicantId,
        program_type: current.program_type ?? 'titp',
        receiving_company_id: current.receiving_company_id ?? current.receiving_company?.id ?? null,
        internship_program_id: current.internship_program_id ?? null,
        agreement_date: current.agreement_date ?? internshipForm.value.agreement_date ?? null,
        contract_start: current.contract_start ?? null,
        contract_years: current.contract_years ?? 3,
        job_description: current.job_description ?? 'FRAME WORKING',
        municipality: current.municipality ?? 'Murcia',
      }

      if (current.agreement_date) {
        agreementDate.value = parseLocalDate(current.agreement_date)
      }
      if (current.contract_start) {
        startDate.value = parseLocalDate(current.contract_start)
      }
      return true
    }
  } catch (err) {
    console.error('[Wizard] Load internship failed:', err)
  }
  return false
}

async function saveGuarantors() {
  if (!guarantors.value[0].full_name?.trim() || !guarantors.value[1].full_name?.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Data',
      detail: 'Both guarantors must have a Full Name.',
      life: 3500,
    })
    return
  }

  loading.value = true
  try {
    await guarantorApi.sync(props.applicantId, {
      guarantors: guarantors.value.map((g, i) => ({
        ...g,
        sequence: i + 1,
        // 🎯 Ensure address ends with Philippines for G1_ADDR / G2_ADDR
        address: ensurePhAddress(g.address),
      })),
    })
    currentStep.value = 2
  } catch {
    toast.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save guarantors.' })
  } finally {
    loading.value = false
  }
}

async function createInternship() {
  if (!internshipForm.value.receiving_company_id) {
    toast.add({
      severity: 'warn',
      summary: 'Company Required',
      detail: 'Please select the receiving company.',
    })
    return
  }

  if (!internshipForm.value.agreement_date) {
    toast.add({
      severity: 'warn',
      summary: 'Signing Date Required',
      detail: 'Please select Signing of Contract date (used in MOA opening paragraph).',
    })
    return
  }

  loading.value = true
  try {
    const res = await internshipApi.create(internshipForm.value)
    currentInternship.value = unwrapOne<Internship>(res)
    currentStep.value = 3
  } catch {
    toast.add({ severity: 'error', summary: 'Create Failed', detail: 'Could not create internship.' })
  } finally {
    loading.value = false
  }
}

async function handleDownload() {
  if (!currentInternship.value) return

  try {
    // 🎯 Pass agreement_date so backend fills DAY_S / MONTH_S / YEAR_S
    await downloadMoa(currentInternship.value.id, {
      agreement_date:
        internshipForm.value.agreement_date ?? formatLocalDate(agreementDate.value),
      municipality: internshipForm.value.municipality ?? 'Murcia',
      contract_start: internshipForm.value.contract_start,
      contract_years: internshipForm.value.contract_years,
      job_description: internshipForm.value.job_description,
    })

    toast.add({
      severity: 'success',
      summary: 'Downloaded',
      detail: 'MOA document saved.',
    })
    emit('completed')
    setTimeout(() => closeDialog(), 800)
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Download Failed',
      detail: 'Could not generate MOA.',
    })
  }
}

function closeDialog() {
  emit('update:visible', false)
}

watch(
  () => props.applicant,
  (app) => {
    if (!app) return
    if (!internshipForm.value.passport_number && app.passport_number) {
      internshipForm.value.passport_number = app.passport_number
    }
    if (!internshipForm.value.passport_issuing_office_id && app.passport_issuing_office_id) {
      internshipForm.value.passport_issuing_office_id = app.passport_issuing_office_id
    }
    if (!internshipForm.value.passport_issue_date && app.passport_issue_date) {
      internshipForm.value.passport_issue_date = app.passport_issue_date
      passportIssueDate.value = parseLocalDate(app.passport_issue_date)
    }
  },
  { immediate: true },
)

watch(
  () => internshipForm.value.passport_number,
  (val) => {
    if (!val || !String(val).trim()) {
      internshipForm.value.passport_issuing_office_id = null
      internshipForm.value.passport_issue_date = null
      passportIssueDate.value = null
    }
  },
)

watch(
  () => props.visible,
  async (isVisible) => {
    if (!isVisible) return

    guarantors.value = [
      { sequence: 1, full_name: '', date_of_birth: null, civil_status: 'single', nationality: 'Filipino' },
      { sequence: 2, full_name: '', date_of_birth: null, civil_status: 'single', nationality: 'Filipino' },
    ]
    currentInternship.value = null
    currentStep.value = 1
    agreementDate.value = new Date()
    startDate.value = null

    internshipForm.value.applicant_id = props.applicantId
    internshipForm.value.agreement_date = formatLocalDate(agreementDate.value)
    internshipForm.value.passport_number = props.applicant?.passport_number ?? null
    internshipForm.value.passport_issuing_office_id = props.applicant?.passport_issuing_office_id ?? null
    internshipForm.value.passport_issue_date = props.applicant?.passport_issue_date ?? null
    passportIssueDate.value = parseLocalDate(props.applicant?.passport_issue_date)

    loading.value = true
    try {
      Promise.all([
        companyStore.companies.length === 0 ? companyStore.fetchCompanies() : Promise.resolve(),
        categoryStore.fetchActiveCategories(),
        applicantStore.fetchPassportOffices(),
      ]).catch((err) => console.warn('[MoaWizard] background load:', err))

      const guarantorsReady = await loadExistingGuarantors()
      const internshipReady = await loadExistingInternship()

      if (guarantorsReady && internshipReady) currentStep.value = 3
      else if (guarantorsReady) currentStep.value = 2
      else currentStep.value = 1
    } catch (err) {
      console.error('[MoaWizard] Wizard step detection error:', err)
      currentStep.value = 1
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

onMounted(() => {
  Promise.all([
    companyStore.companies.length === 0 ? companyStore.fetchCompanies() : Promise.resolve(),
    categoryStore.fetchActiveCategories(),
    applicantStore.fetchPassportOffices(),
  ]).catch((err) => {
    console.warn('[MoaWizard] Non-critical onMounted background load warning:', err)
  })
})
</script>

<template>
  <Dialog :visible="visible" modal :closable="true" :style="{ width: '880px' }" :breakpoints="{ '960px': '92vw' }" :pt="{
    root: { class: 'moa-wizard-dialog rounded-2xl overflow-hidden shadow-2xl !border-0' },
    header: { class: '!hidden' },
    content: { class: '!p-0' },
    mask: { class: 'backdrop-blur-sm bg-black/50' },
  }" @update:visible="emit('update:visible', $event)">
    <!-- Header -->
    <div class="bg-apricot-500 px-6 py-5 text-white relative shadow-sm z-10">
      <button
        class="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
        @click="closeDialog">
        <i class="pi pi-times text-white text-sm" />
      </button>
      <div class="flex items-center gap-4">
        <div
          class="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30">
          <i :class="`pi ${currentStepMeta.icon}`" class="text-xl text-white" />
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-[0.15em] text-white/80 font-bold mb-0.5">
            MOA Wizard · Step {{ currentStep }} of 4
          </p>
          <h3 class="text-xl font-serif font-bold leading-none text-white">
            {{ currentStepMeta.title }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Stepper -->
    <div class="bg-appleCore-50 border-b border-appleCore-100 px-6 py-4">
      <div class="flex items-center justify-between">
        <template v-for="(step, idx) in steps" :key="step.num">
          <button type="button"
            class="flex flex-col items-center min-w-0 flex-shrink-0 cursor-pointer focus:outline-none group"
            @click="currentStep = step.num">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              :class="[
                step.num < currentStep
                  ? 'bg-apricot-100 text-apricot-600 border border-apricot-200'
                  : step.num === currentStep
                    ? 'bg-apricot-500 text-white shadow-md shadow-apricot-500/30 ring-4 ring-apricot-50 scale-110'
                    : 'bg-white border-2 border-gray-200 text-gray-400 group-hover:border-apricot-300',
              ]">
              <i v-if="step.num < currentStep" class="pi pi-check text-xs" />
              <span v-else>{{ step.num }}</span>
            </div>
            <p class="text-[11px] font-semibold mt-2 whitespace-nowrap transition-colors"
              :class="step.num === currentStep ? 'text-blueberry-800' : 'text-blueberry-400'">
              {{ step.title }}
            </p>
          </button>
          <div v-if="idx < steps.length - 1" class="flex-1 h-0.5 mx-3 -mt-5 rounded-full transition-colors duration-500"
            :class="step.num < currentStep ? 'bg-apricot-300' : 'bg-gray-200'" />
        </template>
      </div>
    </div>

    <!-- Body -->
    <div class="px-6 py-6 max-h-[60vh] overflow-y-auto bg-white">
      <div v-if="loading" class="py-12 flex flex-col items-center justify-center text-center">
        <i class="pi pi-spin pi-spinner text-3xl text-apricot-500 mb-4" />
        <p class="text-sm text-blueberry-500 font-medium">Checking applicant records...</p>
      </div>

      <!-- Step 1 -->
      <div v-else-if="currentStep === 1" class="space-y-5">
        <div class="flex items-start gap-3 p-3.5 rounded-xl bg-appleCore-50 border border-appleCore-100">
          <i class="pi pi-info-circle text-apricot-500 mt-0.5" />
          <div class="text-xs text-blueberry-700 leading-relaxed">
            <strong>Required:</strong> Add 2 guarantors who will co-sign the MOA. Fill in at least the Full Name for
            each to proceed. Address should look like:
            <em>Brgy. Abo-Abo, Murcia, Negros Occidental, Philippines</em>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GuarantorFields v-for="(_, i) in guarantors" :key="i" v-model="guarantors[i]" :index="i" />
        </div>
      </div>

      <!-- Step 2 -->
      <div v-else-if="currentStep === 2" class="space-y-5">
        <div class="flex items-start gap-3 p-3.5 rounded-xl bg-appleCore-50 border border-appleCore-100">
          <i class="pi pi-briefcase text-apricot-500 mt-0.5" />
          <div class="text-xs text-blueberry-700 leading-relaxed">
            Set placement details.
            <strong>Signing of Contract</strong> is the MOA date
            (“this DAY_S day of MONTH_S, YEAR_S”).
            Fields marked <span class="text-red-500">*</span> are required.
          </div>
        </div>

        <!-- Program -->
        <div class="rounded-2xl border border-appleCore-100 bg-white p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-blueberry-500 mb-4">Program Information</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="min-w-0">
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                Program Type <span class="text-red-500">*</span>
              </label>
              <Select v-model="internshipForm.program_type" :options="programTypes" option-label="label"
                option-value="value" class="w-full" />
            </div>
            <div class="min-w-0">
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                Receiving Company <span class="text-red-500">*</span>
              </label>
              <Select v-model="internshipForm.receiving_company_id" :options="companyOptions" option-label="label"
                option-value="value" filter show-clear :loading="companyStore.loading || categoryStore.loading"
                placeholder="Search company or category..." class="w-full">
                <template #value="slotProps">
                  <div v-if="slotProps.value && selectedCompany" class="flex items-center gap-2 truncate py-0.5">
                    <span class="font-semibold text-blueberry-800 text-sm">{{ selectedCompany.name }}</span>
                    <span v-if="selectedCompany.code" class="text-xs text-blueberry-400">({{ selectedCompany.code
                      }})</span>
                    <span v-if="selectedCompany.category_name"
                      class="px-2 py-0.5 rounded bg-apricot-50 text-apricot-700 text-[10px] font-bold border border-apricot-200 uppercase tracking-wider">
                      {{ selectedCompany.category_name }}
                    </span>
                  </div>
                  <span v-else class="text-blueberry-400">Search company or category...</span>
                </template>
                <template #option="slotProps">
                  <div class="flex items-center justify-between w-full py-1">
                    <span class="font-semibold text-blueberry-800 text-sm">
                      {{ slotProps.option.name }}
                      <span v-if="slotProps.option.code" class="text-xs font-normal text-blueberry-400">
                        ({{ slotProps.option.code }})
                      </span>
                    </span>
                    <span v-if="slotProps.option.category_name"
                      class="px-2 py-0.5 rounded-full bg-apricot-50 text-apricot-700 text-[10px] font-bold border border-apricot-200 uppercase tracking-wider ml-2">
                      {{ slotProps.option.category_name }}
                    </span>
                  </div>
                </template>
              </Select>
            </div>
          </div>
        </div>

        <!-- Job & Contract -->
        <div class="rounded-2xl border border-appleCore-100 bg-white p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-blueberry-500 mb-4">Job & Contract Details</p>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 flex items-center justify-between">
                <span>Job Description / Trade <span class="text-red-500">*</span></span>
                <span v-if="selectedCompany?.category_name" class="text-[10px] text-apricot-600 font-semibold">
                  Auto-populated from {{ selectedCompany.category_name }}
                </span>
              </label>
              <InputText v-model="internshipForm.job_description" class="w-full" placeholder="e.g. FRAME WORKING" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- 🎯 Signing of Contract → agreement_date → DAY_S MONTH_S YEAR_S -->
              <div class="min-w-0">
                <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                  Signing of Contract <span class="text-red-500">*</span>
                </label>
                <DatePicker v-model="agreementDate" show-icon class="w-full" placeholder="Select signing date" />
                <p class="text-[10px] text-blueberry-400 mt-1 leading-snug">
                  MOA opening: “this day of month, year at Municipality of …”
                </p>
              </div>

              <div class="min-w-0">
                <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">Contract Years</label>
                <InputNumber v-model="internshipForm.contract_years" class="w-full" :min="1" :max="5" show-buttons />
              </div>

              <div class="min-w-0">
                <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                  Municipality <span class="text-red-500">*</span>
                </label>
                <InputText v-model="internshipForm.municipality" class="w-full" placeholder="e.g. Murcia" />
                <p class="text-[10px] text-blueberry-400 mt-1">
                  Used as <span v-pre>{{CITY}}</span> in MOA
                </p>
              </div>
            </div>

            <!-- Optional period start (CON_*) -->
            <div class="min-w-0 max-w-xs">
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                Contract Period Start <span class="text-blueberry-400 font-normal">(optional)</span>
              </label>
              <DatePicker v-model="startDate" show-icon class="w-full" placeholder="Training period start" />
            </div>
          </div>
        </div>

        <!-- Passport (unchanged structure) -->
        <div class="rounded-2xl border border-appleCore-100 bg-white p-5 shadow-sm mt-5">
          <div class="flex items-center justify-between mb-4">
            <p class="text-xs font-bold uppercase tracking-wider text-blueberry-500 flex items-center gap-1.5">
              <i class="pi pi-id-card text-apricot-500" />
              Passport Details
            </p>
            <span v-if="!internshipForm.passport_number"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold ring-1 ring-amber-200">
              <i class="pi pi-exclamation-triangle text-[9px]" />
              No passport on file
            </span>
            <span v-else-if="!internshipForm.passport_issuing_office_id || !internshipForm.passport_issue_date"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold ring-1 ring-amber-200">
              <i class="pi pi-exclamation-triangle text-[9px]" />
              Incomplete passport info
            </span>
            <span v-else
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold ring-1 ring-green-200">
              <i class="pi pi-check text-[9px]" />
              Passport complete
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="min-w-0">
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">Passport Number</label>
              <InputText v-model="internshipForm.passport_number" class="w-full" placeholder="e.g. P1234567A" />
            </div>
            <div class="min-w-0">
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 flex items-center gap-1">
                Issuing Office (DFA)
                <i v-if="loadingOffices" class="pi pi-spin pi-spinner text-[10px] text-apricot-500" />
              </label>
              <Select v-model="internshipForm.passport_issuing_office_id" :options="flatPassportOffices"
                option-label="name" option-value="id" placeholder="Select DFA Location" :loading="loadingOffices"
                :disabled="!internshipForm.passport_number" filter show-clear class="w-full" />
            </div>
            <div class="min-w-0">
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">Date Issued</label>
              <DatePicker v-model="passportIssueDate" show-icon date-format="yy-mm-dd" placeholder="YYYY-MM-DD"
                class="w-full" :disabled="!internshipForm.passport_number" />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3 -->
      <div v-else-if="currentStep === 3" class="space-y-6 max-w-2xl mx-auto">
        <div class="text-center py-4">
          <div class="w-16 h-16 mx-auto rounded-full bg-apricot-50 flex items-center justify-center mb-3">
            <i class="pi pi-file-word text-apricot-500 text-2xl" />
          </div>
          <h4 class="text-xl font-serif font-bold text-blueberry-800 mb-1">Review Before Generating</h4>
          <p class="text-sm text-blueberry-500">Confirm placement and signing date below.</p>
        </div>

        <div class="rounded-2xl border border-appleCore-100 bg-white overflow-hidden shadow-sm">
          <div class="bg-appleCore-50 px-5 py-3 border-b border-appleCore-100">
            <p class="text-[11px] font-bold uppercase tracking-wider text-blueberry-600">Internship Summary</p>
          </div>
          <div class="divide-y divide-appleCore-50">
            <div class="flex px-5 py-3.5">
              <span class="text-xs font-semibold text-blueberry-500 w-1/3">Program</span>
              <span class="text-sm text-blueberry-800 font-bold">
                {{ currentInternship?.program_type?.toUpperCase() ?? internshipForm.program_type?.toUpperCase() ?? '—'
                }}
              </span>
            </div>
            <div class="flex px-5 py-3.5">
              <span class="text-xs font-semibold text-blueberry-500 w-1/3">Company</span>
              <span class="text-sm text-blueberry-800 font-bold truncate">
                {{ currentInternship?.receiving_company?.name ?? selectedCompany?.name ?? '—' }}
              </span>
            </div>
            <div class="flex px-5 py-3.5">
              <span class="text-xs font-semibold text-blueberry-500 w-1/3">Job Description</span>
              <span class="text-sm text-blueberry-800 font-medium">
                {{ currentInternship?.job_description ?? internshipForm.job_description ?? '—' }}
              </span>
            </div>
            <div class="flex px-5 py-3.5">
              <span class="text-xs font-semibold text-blueberry-500 w-1/3">Signing of Contract</span>
              <span class="text-sm text-blueberry-800 font-medium">
                {{ internshipForm.agreement_date ?? '—' }}
              </span>
            </div>
            <div class="flex px-5 py-3.5">
              <span class="text-xs font-semibold text-blueberry-500 w-1/3">Municipality</span>
              <span class="text-sm text-blueberry-800 font-medium">
                {{ internshipForm.municipality ?? '—' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4 -->
      <div v-else-if="currentStep === 4" class="py-12 text-center space-y-4">
        <div class="w-24 h-24 mx-auto rounded-full bg-apricot-50 flex items-center justify-center animate-pulse">
          <i class="pi pi-check-circle text-apricot-500 text-5xl" />
        </div>
        <div>
          <h4 class="text-2xl font-serif font-bold text-blueberry-800 mb-2">You're All Set! 🎉</h4>
          <p class="text-sm text-blueberry-500 max-w-sm mx-auto leading-relaxed">
            MOA will use your Signing of Contract date and guarantor addresses ending with Philippines.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-appleCore-100 bg-white px-6 py-4 rounded-b-2xl">
      <div class="flex items-center justify-between gap-3">
        <Button v-if="currentStep > 1 && currentStep < 4" label="Back" icon="pi pi-arrow-left" text severity="secondary"
          size="small" @click="currentStep = (currentStep - 1) as 1 | 2 | 3 | 4" />
        <div v-else />
        <div class="flex items-center gap-2">
          <Button label="Cancel" severity="secondary" text size="small" :disabled="loading" @click="closeDialog" />
          <Button v-if="currentStep === 1" label="Save Guarantors" icon="pi pi-arrow-right" icon-pos="right"
            :loading="loading" class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white"
            @click="saveGuarantors" />
          <Button v-else-if="currentStep === 2" label="Save Internship" icon="pi pi-arrow-right" icon-pos="right"
            :loading="loading" :disabled="!internshipForm.receiving_company_id || !internshipForm.agreement_date"
            class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white" @click="createInternship" />
          <Button v-else-if="currentStep === 3" label="Looks Good, Generate" icon="pi pi-arrow-right" icon-pos="right"
            class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white" @click="currentStep = 4" />
          <Button v-else-if="currentStep === 4" label="Download MOA" icon="pi pi-download" :loading="isDownloading"
            class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white shadow-lg shadow-apricot-500/30"
            @click="handleDownload" />
        </div>
      </div>
    </div>
  </Dialog>
</template>