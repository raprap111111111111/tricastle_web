<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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
import { useMoaDownload } from '../composables/useMoaDownload'
import type {
  ApplicantGuarantor,
  Internship,
  InternshipProgramType,
  CreateInternshipPayload,
} from '../types'

const props = defineProps<{
  visible: boolean
  applicantId: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'completed'): void
}>()

const toast = useToast()
const companyStore = useCompanyStore()
const { generating: isDownloading, generateSingle: downloadMoa } = useMoaDownload()

// ─── Wizard State ─────────────────────────────────────────────────────────────
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
  const r = res as any
  const body = r?.data?.data ?? r?.data ?? r
  if (Array.isArray(body)) return body
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.records)) return body.records
  return []
}

function unwrapOne<T = any>(res: unknown): T | null {
  const r = res as any
  return (r?.data?.data ?? r?.data ?? r) as T
}

// ─── Step 1: Guarantors ───────────────────────────────────────────────────────
const guarantors = ref<ApplicantGuarantor[]>([
  { sequence: 1, full_name: '', civil_status: 'Single', nationality: 'Filipino' },
  { sequence: 2, full_name: '', civil_status: 'Single', nationality: 'Filipino' },
])

async function loadExistingGuarantors() {
  try {
    const res = await guarantorApi.list(props.applicantId)
    const list = unwrapList(res)

    if (list.length >= 1) {
      guarantors.value[0] = { ...guarantors.value[0], ...list[0], sequence: 1 }
    }
    if (list.length >= 2) {
      guarantors.value[1] = { ...guarantors.value[1], ...list[1], sequence: 2 }
      currentStep.value = 2
    }
  } catch (err) {
    console.error('[Wizard] Load guarantors failed', err)
  }
}

async function loadExistingInternship() {
  try {
    const res = await internshipApi.byApplicant(props.applicantId)
    const list = unwrapList(res)
    const current = list.find((i: any) => i.is_current) ?? list[0] ?? null
    if (current) {
      currentInternship.value = current
      if (currentStep.value < 3) currentStep.value = 3
    }
  } catch (err) {
    console.error('[Wizard] Load internship failed', err)
  }
}

async function saveGuarantors() {
  const g1 = guarantors.value[0]
  const g2 = guarantors.value[1]

  if (!g1.full_name?.trim() || !g2.full_name?.trim()) {
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
      guarantors: guarantors.value.map((g, i) => ({ ...g, sequence: i + 1 })),
    })
    toast.add({
      severity: 'success',
      summary: 'Guarantors Saved',
      life: 2500,
    })
    currentStep.value = 2
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: err?.response?.data?.message ?? 'Could not save guarantors.',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

// ─── Step 2: Internship ───────────────────────────────────────────────────────
const internshipForm = ref<CreateInternshipPayload>({
  applicant_id: props.applicantId,
  program_type: 'titp',
  receiving_company_id: null,
  internship_program_id: null,
  contract_start: null,
  contract_years: 3,
  job_description: 'FRAME WORKING',
  municipality: 'Murcia',
})
const startDate = ref<Date | null>(null)

watch(startDate, (v) => {
  internshipForm.value.contract_start = v ? v.toISOString().split('T')[0] : null
})

const companyOptions = computed(() =>
  companyStore.companies.map((c) => ({
    label: `${c.name}${c.code ? ` (${c.code})` : ''}${(c as any).name_japanese ? ` — ${(c as any).name_japanese}` : ''}`,
    value: c.id,
  })),
)

const programTypes = [
  { label: 'Internship Program', value: 'intern' as InternshipProgramType },
  { label: 'TITP (Technical Intern Training)', value: 'titp' as InternshipProgramType },
  { label: 'SSW (Specified Skilled Worker)', value: 'ssw' as InternshipProgramType },
  { label: 'SSW Company Transfer', value: 'ssw_transfer' as InternshipProgramType },
]

async function createInternship() {
  if (!internshipForm.value.receiving_company_id) {
    toast.add({
      severity: 'warn',
      summary: 'Company Required',
      detail: 'Please select the receiving company.',
      life: 3500,
    })
    return
  }

  loading.value = true
  try {
    const res = await internshipApi.create(internshipForm.value)
    currentInternship.value = unwrapOne<Internship>(res)
    toast.add({
      severity: 'success',
      summary: 'Internship Created',
      life: 2500,
    })
    currentStep.value = 3
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Create Failed',
      detail: err?.response?.data?.message ?? 'Could not create internship.',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

function proceedToDownload() {
  currentStep.value = 4
}

async function handleDownload() {
  if (!currentInternship.value) return
  try {
    await downloadMoa(currentInternship.value.id)
    toast.add({
      severity: 'success',
      summary: 'MOA Downloaded',
      detail: 'The document has been saved to your device.',
      life: 3000,
    })
    emit('completed')
    setTimeout(() => closeDialog(), 800)
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Download Failed',
      detail: err?.response?.data?.message ?? 'Could not download MOA.',
      life: 4000,
    })
  }
}

function closeDialog() {
  emit('update:visible', false)
}

function goBack() {
  if (currentStep.value > 1) {
    currentStep.value = (currentStep.value - 1) as 1 | 2 | 3 | 4
  }
}

watch(
  () => props.visible,
  async (isVisible) => {
    if (!isVisible) return
    currentStep.value = 1
    loading.value = true
    try {
      if (companyStore.companies.length === 0) {
        await companyStore.fetchCompanies()
      }
      await loadExistingGuarantors()
      await loadExistingInternship()
    } finally {
      loading.value = false
    }
  },
)

onMounted(async () => {
  if (companyStore.companies.length === 0) {
    await companyStore.fetchCompanies()
  }
})
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="true"
    :style="{ width: '860px' }"
    :breakpoints="{ '960px': '92vw' }"
    :pt="{
      root: { class: 'moa-wizard-dialog' },
      header: { class: '!hidden' },
      content: { class: '!p-0' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <!-- ═══════════════ HEADER ═══════════════ -->
    <div class="bg-gradient-to-r from-blueberry-800 to-blueberry-600 px-6 py-5 text-white relative">
      <button
        class="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
        @click="closeDialog"
      >
        <i class="pi pi-times text-white text-sm" />
      </button>
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
          <i :class="`pi ${currentStepMeta.icon}`" class="text-xl" />
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-widest text-white/70 font-semibold">
            MOA Wizard · Step {{ currentStep }} of 4
          </p>
          <h3 class="text-xl font-serif font-bold leading-tight">
            {{ currentStepMeta.title }}
          </h3>
        </div>
      </div>
    </div>

    <!-- ═══════════════ STEPPER ═══════════════ -->
    <div class="bg-appleCore-50/50 border-b border-appleCore-100 px-6 py-4">
      <div class="flex items-center justify-between">
        <template v-for="(step, idx) in steps" :key="step.num">
          <!-- Step node -->
          <div class="flex flex-col items-center min-w-0 flex-shrink-0">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              :class="[
                step.num < currentStep
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                  : step.num === currentStep
                    ? 'bg-apricot-500 text-white shadow-md shadow-apricot-200 ring-4 ring-apricot-100 scale-110'
                    : 'bg-white border-2 border-gray-200 text-gray-400',
              ]"
            >
              <i v-if="step.num < currentStep" class="pi pi-check text-xs" />
              <span v-else>{{ step.num }}</span>
            </div>
            <p
              class="text-[11px] font-semibold mt-1.5 whitespace-nowrap"
              :class="step.num === currentStep ? 'text-blueberry-800' : 'text-blueberry-400'"
            >
              {{ step.title }}
            </p>
          </div>

          <!-- Connector -->
          <div
            v-if="idx < steps.length - 1"
            class="flex-1 h-0.5 mx-2 -mt-5 rounded transition-colors duration-500"
            :class="step.num < currentStep ? 'bg-emerald-400' : 'bg-gray-200'"
          />
        </template>
      </div>
    </div>

    <!-- ═══════════════ BODY ═══════════════ -->
    <div class="px-6 py-6 max-h-[60vh] overflow-y-auto">
      <!-- ─── STEP 1: Guarantors ─── -->
      <div v-if="currentStep === 1" class="space-y-5">
        <div class="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <i class="pi pi-info-circle text-blue-500 mt-0.5" />
          <div class="text-xs text-blue-800">
            <strong>Required:</strong> Add 2 guarantors who will co-sign the MOA. Fill in at least the Full Name for each.
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(_, i) in guarantors"
            :key="i"
            class="min-w-0 rounded-xl border-2 border-appleCore-100 bg-white p-4 hover:border-apricot-200 transition"
          >
            <div class="flex items-center gap-2 mb-3 pb-2 border-b border-appleCore-100">
              <div class="w-7 h-7 rounded-full bg-apricot-100 text-apricot-700 flex items-center justify-center text-xs font-bold">
                {{ i + 1 }}
              </div>
              <p class="text-sm font-bold text-blueberry-800">Guarantor {{ i + 1 }}</p>
            </div>
            <GuarantorFields v-model="guarantors[i]" :index="i" />
          </div>
        </div>
      </div>

      <!-- ─── STEP 2: Internship ─── -->
      <div v-else-if="currentStep === 2" class="space-y-5">
        <div class="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <i class="pi pi-info-circle text-blue-500 mt-0.5" />
          <div class="text-xs text-blue-800">
            Set up where and how the applicant will be placed. Fields marked <span class="text-red-500">*</span> are required.
          </div>
        </div>

        <!-- Section: Program -->
        <div class="rounded-xl border border-appleCore-100 bg-white p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-blueberry-500 mb-3">
            Program Info
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="min-w-0">
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                Program Type <span class="text-red-500">*</span>
              </label>
              <Select
                v-model="internshipForm.program_type"
                :options="programTypes"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>
            <div class="min-w-0">
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                Receiving Company <span class="text-red-500">*</span>
              </label>
              <Select
                v-model="internshipForm.receiving_company_id"
                :options="companyOptions"
                option-label="label"
                option-value="value"
                filter
                show-clear
                :loading="companyStore.loading"
                placeholder="Search company..."
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Section: Job -->
        <div class="rounded-xl border border-appleCore-100 bg-white p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-blueberry-500 mb-3">
            Job & Contract
          </p>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                Job Description / Trade <span class="text-red-500">*</span>
              </label>
              <InputText
                v-model="internshipForm.job_description"
                class="w-full"
                placeholder="e.g. FRAME WORKING"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="min-w-0">
                <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                  Contract Start
                </label>
                <DatePicker v-model="startDate" show-icon class="w-full" placeholder="Select date" />
              </div>
              <div class="min-w-0">
                <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                  Contract Years
                </label>
                <InputNumber
                  v-model="internshipForm.contract_years"
                  class="w-full"
                  :min="1"
                  :max="5"
                  show-buttons
                />
              </div>
              <div class="min-w-0">
                <label class="block text-xs font-semibold text-blueberry-700 mb-1.5">
                  Municipality
                </label>
                <InputText v-model="internshipForm.municipality" class="w-full" placeholder="e.g. Murcia" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── STEP 3: Review ─── -->
      <div v-else-if="currentStep === 3" class="space-y-5">
        <div class="text-center py-2">
          <div class="w-16 h-16 mx-auto rounded-full bg-teal-100 flex items-center justify-center mb-3">
            <i class="pi pi-file-word text-teal-600 text-2xl" />
          </div>
          <h4 class="text-lg font-serif font-bold text-blueberry-800 mb-1">
            Review Before Generating
          </h4>
          <p class="text-sm text-blueberry-500">
            Please confirm the details below before proceeding.
          </p>
        </div>

        <div class="rounded-xl border border-appleCore-100 bg-white overflow-hidden">
          <div class="bg-appleCore-50 px-4 py-2.5 border-b border-appleCore-100">
            <p class="text-xs font-bold uppercase tracking-wider text-blueberry-600">
              Internship Summary
            </p>
          </div>
          <div class="divide-y divide-appleCore-100">
            <div class="flex px-4 py-3">
              <span class="text-xs font-semibold text-blueberry-500 w-40 flex-shrink-0">Program</span>
              <span class="text-sm text-blueberry-800 font-medium">
                {{ currentInternship?.program_type?.toUpperCase() ?? '—' }}
              </span>
            </div>
            <div class="flex px-4 py-3">
              <span class="text-xs font-semibold text-blueberry-500 w-40 flex-shrink-0">Company</span>
              <span class="text-sm text-blueberry-800 font-medium truncate">
                {{ currentInternship?.receiving_company?.name ?? '—' }}
              </span>
            </div>
            <div class="flex px-4 py-3">
              <span class="text-xs font-semibold text-blueberry-500 w-40 flex-shrink-0">Job Description</span>
              <span class="text-sm text-blueberry-800 font-medium">
                {{ currentInternship?.job_description ?? '—' }}
              </span>
            </div>
            <div class="flex px-4 py-3">
              <span class="text-xs font-semibold text-blueberry-500 w-40 flex-shrink-0">Contract Start</span>
              <span class="text-sm text-blueberry-800 font-medium">
                {{ currentInternship?.contract_start ?? '—' }}
              </span>
            </div>
            <div class="flex px-4 py-3">
              <span class="text-xs font-semibold text-blueberry-500 w-40 flex-shrink-0">Duration</span>
              <span class="text-sm text-blueberry-800 font-medium">
                {{ currentInternship?.contract_years ?? '—' }} year(s)
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <i class="pi pi-exclamation-triangle text-amber-500 mt-0.5" />
          <div class="text-xs text-amber-800">
            Once you continue, the MOA will be generated using the data shown above.
          </div>
        </div>
      </div>

      <!-- ─── STEP 4: Download ─── -->
      <div v-else-if="currentStep === 4" class="py-8 text-center space-y-4">
        <div class="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
          <i class="pi pi-check-circle text-emerald-600 text-4xl" />
        </div>
        <div>
          <h4 class="text-xl font-serif font-bold text-blueberry-800 mb-1.5">
            You're All Set! 🎉
          </h4>
          <p class="text-sm text-blueberry-500 max-w-sm mx-auto">
            Your MOA document is ready. Click the download button below to save it to your device.
          </p>
        </div>
      </div>
    </div>

    <!-- ═══════════════ FOOTER ═══════════════ -->
    <div class="border-t border-appleCore-100 bg-white px-6 py-4">
      <div class="flex items-center justify-between gap-3">
        <Button
          v-if="currentStep > 1 && currentStep < 4"
          label="Back"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          size="small"
          @click="goBack"
        />
        <div v-else />

        <div class="flex items-center gap-2">
          <Button label="Cancel" severity="secondary" text size="small" @click="closeDialog" />

          <Button
            v-if="currentStep === 1"
            label="Save & Continue"
            icon="pi pi-arrow-right"
            icon-pos="right"
            :loading="loading"
            class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white !font-semibold"
            @click="saveGuarantors"
          />

          <Button
            v-else-if="currentStep === 2"
            label="Create & Continue"
            icon="pi pi-arrow-right"
            icon-pos="right"
            :loading="loading"
            :disabled="!internshipForm.receiving_company_id"
            class="!bg-blueberry-600 hover:!bg-blueberry-700 !border-blueberry-600 !text-white !font-semibold"
            @click="createInternship"
          />

          <Button
            v-else-if="currentStep === 3"
            label="Looks Good, Continue"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="!bg-teal-600 hover:!bg-teal-700 !border-teal-600 !text-white !font-semibold"
            @click="proceedToDownload"
          />

          <Button
            v-else-if="currentStep === 4"
            label="Download MOA"
            icon="pi pi-download"
            :loading="isDownloading"
            class="!bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600 !text-white !font-semibold"
            @click="handleDownload"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.moa-wizard-dialog) {
  border-radius: 16px;
  overflow: hidden;
}
</style>