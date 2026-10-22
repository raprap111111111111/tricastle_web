<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'

import type { ApplicantGuarantor } from '../types'
import { usePsgc } from '@shared/composables/usePsgc'

const props = defineProps<{
  modelValue: ApplicantGuarantor
  index: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ApplicantGuarantor): void
}>()

// ─── Date Formatting Helpers (Timezone-Safe & ISO-Defensive) ──────────────────
function formatLocalDate(d: Date | null): string | null {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(str?: string | null): Date | null {
  if (!str) return null
  const cleanStr = str.split('T')[0] // Safely handle ISO dates like "1990-05-15T00:00:00Z"
  const [y, m, d] = cleanStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

// ─── 1. Local Reactive State ──────────────────────────────────────────────────
const form = ref<ApplicantGuarantor>({ ...props.modelValue })

const localProvince = ref<string>('')
const localCity = ref<string>('')
const localStreet = ref<string>('')
const isSettingAddress = ref<boolean>(false)

/**
 * Instant Pure JS Address Parser
 * Splits "Street, City, Province, Philippines" into individual fields
 */
function parseAndSetAddress(fullAddress?: string | null) {
  if (!fullAddress?.trim()) return

  isSettingAddress.value = true
  try {
    const clean = fullAddress.trim().replace(/,\s*Philippines$/i, '').trim()
    const parts = clean.split(',').map((p) => p.trim()).filter(Boolean)

    if (parts.length >= 3) {
      localStreet.value = parts.slice(0, parts.length - 2).join(', ')
      localCity.value = parts[parts.length - 2]
      localProvince.value = parts[parts.length - 1]
    } else if (parts.length === 2) {
      localStreet.value = ''
      localCity.value = parts[0]
      localProvince.value = parts[1]
    } else {
      localStreet.value = clean
      localCity.value = ''
      localProvince.value = ''
    }
  } finally {
    isSettingAddress.value = false
  }
}

// ─── 2. Sync External API Data -> Local Form & Parse Address ─────────────────
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) return
    if (JSON.stringify(form.value) !== JSON.stringify(newVal)) {
      form.value = {
        ...newVal,
        civil_status: newVal.civil_status ? newVal.civil_status.toLowerCase() : 'single',
      }
      if (newVal.address && (!localStreet.value && !localCity.value && !localProvince.value)) {
        parseAndSetAddress(newVal.address)
      }
    }
  },
  { deep: true, immediate: true }
)

// ─── 3. Sync Local Form -> Parent Component ───────────────────────────────────
watch(
  form,
  (newVal) => {
    emit('update:modelValue', { ...newVal })
  },
  { deep: true }
)

// ─── Basic Fields Setup ───────────────────────────────────────────────────────
const civilOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Widowed', value: 'widowed' },
  { label: 'Separated', value: 'separated' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Live-in Partner', value: 'live_in_partner' },
]

const birthDateValue = computed<Date | null>({
  get: () => parseLocalDate(form.value.date_of_birth),
  set: (v) => { form.value.date_of_birth = formatLocalDate(v) }
})

const certDateValue = computed<Date | null>({
  get: () => parseLocalDate(form.value.residence_cert_issued_at),
  set: (v) => { form.value.residence_cert_issued_at = formatLocalDate(v) }
})

const computedAge = computed<number | null>(() => {
  if (!form.value.date_of_birth) return null
  const dob = parseLocalDate(form.value.date_of_birth)
  if (!dob) return null

  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age >= 0 && age < 150 ? age : null
})

// ─── PSGC Cascading Address Logic ─────────────────────────────────────────────
const {
  provinces: psgcProvinces,
  fetchAllProvinces,
  fetchCitiesByProvince,
  loadingProvinces,
  loadingCities
} = usePsgc()

const psgcCities = ref<any[]>([])

// Inject existing values so Select always displays the label even before PSGC loads
const provinceOptions = computed(() => {
  const list = psgcProvinces.value.map(p => ({ label: p.name, value: p.name }))
  if (localProvince.value && !list.some(p => p.value === localProvince.value)) {
    list.unshift({ label: localProvince.value, value: localProvince.value })
  }
  return list
})

const cityOptions = computed(() => {
  const list = psgcCities.value.map(c => ({ label: c.name, value: c.name }))
  if (localCity.value && !list.some(c => c.value === localCity.value)) {
    list.unshift({ label: localCity.value, value: localCity.value })
  }
  return list
})

const fullAddressPreview = computed(() => {
  const parts: string[] = []
  if (localStreet.value) parts.push(localStreet.value.trim())
  if (localCity.value) parts.push(localCity.value.trim())
  if (localProvince.value) parts.push(localProvince.value.trim())
  let full = parts.filter(Boolean).join(', ')
  if (full && !/philippines$/i.test(full)) {
    full += ', Philippines'
  }
  return full
})

// Fetch cities when user changes Province manually
watch(localProvince, async (newVal?: string) => {
  if (isSettingAddress.value) return

  psgcCities.value = []
  if (newVal && typeof newVal === 'string') {
    const p = psgcProvinces.value.find(
      x => x.name.toLowerCase() === newVal.toLowerCase() || x.code === newVal
    )
    if (p && typeof p.code === 'string') {
      try {
        psgcCities.value = await fetchCitiesByProvince(p.code)
      } catch (err) {
        console.warn('[GuarantorFields] Non-critical city load warning:', err)
      }
    }
  }
})

// Auto-update address string
watch([localStreet, localCity, localProvince], () => {
  if (!isSettingAddress.value) {
    form.value.address = fullAddressPreview.value
  }
})

onMounted(() => {
  // Parse immediately in memory
  if (props.modelValue?.address) {
    parseAndSetAddress(props.modelValue.address)
  }

  // Load provinces safely in background (non-blocking)
  fetchAllProvinces().catch((err) => {
    console.warn('[GuarantorFields] PSGC background load non-critical warning:', err)
  })
})
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-appleCore-100 shadow-sm overflow-hidden flex flex-col h-full hover:border-apricot-200 transition-colors duration-300">

    <!-- ─── CARD HEADER ─── -->
    <div class="flex items-center gap-3 px-5 py-3.5 border-b border-appleCore-100 bg-appleCore-50">
      <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
        :class="index === 0 ? 'bg-apricot-500' : 'bg-blueberry-400'">
        {{ index + 1 }}
      </span>
      <div>
        <p class="text-[13px] font-bold text-blueberry-800 leading-none">Guarantor {{ index + 1 }}</p>
        <p class="text-[10px] text-blueberry-500 mt-1 uppercase tracking-wider font-semibold">
          {{ index === 0 ? 'Primary Co-Signer' : 'Second Co-Signer' }}
        </p>
      </div>
    </div>

    <!-- ─── CARD BODY ─── -->
    <div class="p-5 flex flex-col gap-5 flex-1">

      <!-- 1. Identity Section -->
      <section>
        <div class="mb-4">
          <label class="block text-[11px] font-semibold text-blueberry-700 mb-1.5">
            Full Name <span class="text-apricot-500">*</span>
          </label>
          <InputText v-model="form.full_name" class="w-full !text-sm" placeholder="e.g. Maria Santos Dela Cruz" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="min-w-0">
            <label class="block text-[11px] font-semibold text-blueberry-700 mb-1.5">Relationship</label>
            <InputText v-model="form.relationship" class="w-full !text-sm" placeholder="e.g. Mother" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-[11px] font-semibold text-blueberry-700">Birthday</label>
              <span v-if="computedAge !== null"
                class="text-[10px] font-bold text-apricot-700 bg-apricot-50 px-1.5 py-0.5 rounded border border-apricot-100">
                {{ computedAge }} yrs
              </span>
            </div>
            <DatePicker v-model="birthDateValue" show-icon date-format="yy-mm-dd" class="w-full" input-class="!text-sm"
              placeholder="YYYY-MM-DD" />
          </div>
        </div>
      </section>

      <!-- 2. Demographics Section -->
      <section class="pt-4 border-t border-appleCore-100">
        <div class="grid grid-cols-2 gap-3">
          <div class="min-w-0">
            <label class="block text-[11px] font-semibold text-blueberry-700 mb-1.5">Civil Status</label>
            <Select v-model="form.civil_status" :options="civilOptions" option-label="label" option-value="value"
              class="w-full !text-sm" placeholder="Choose..." />
          </div>
          <div class="min-w-0">
            <label class="block text-[11px] font-semibold text-blueberry-700 mb-1.5">Nationality</label>
            <InputText v-model="form.nationality" class="w-full !text-sm" placeholder="Filipino" />
          </div>
        </div>
      </section>

      <!-- 3. Address Section -->
      <section class="pt-4 border-t border-appleCore-100">
        <label class="block text-[11px] font-semibold text-blueberry-700 mb-2.5">Permanent Address</label>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="min-w-0">
              <Select v-model="localProvince" :options="provinceOptions" option-label="label" option-value="value"
                filter show-clear editable :loading="loadingProvinces"
                :placeholder="loadingProvinces ? 'Loading...' : 'Province (Optional)'" class="w-full !text-sm" />
            </div>
            <div class="min-w-0">
              <Select v-model="localCity" :options="cityOptions" option-label="label" option-value="value" filter
                show-clear editable :loading="loadingCities"
                placeholder="City / Municipality" class="w-full !text-sm" />
            </div>
          </div>

          <Textarea v-model="localStreet" rows="2" class="w-full !text-sm leading-relaxed" auto-resize
            placeholder="House/Street, Barangay..." />

          <div v-if="localProvince || localCity || localStreet"
            class="px-3 py-2 bg-appleCore-50 border border-appleCore-100 rounded-lg">
            <p class="text-[10px] font-bold uppercase tracking-wider text-blueberry-500 mb-0.5">Address Preview</p>
            <p class="text-xs font-medium text-blueberry-800">{{ fullAddressPreview }}</p>
          </div>
        </div>
      </section>

      <!-- 4. Cedula Section -->
      <section class="mt-auto pt-4">
        <div class="bg-appleCore-50 rounded-xl border border-appleCore-100 p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-bold uppercase tracking-widest text-blueberry-600">Residence Cert. (Cedula)</p>
            <span class="text-[10px] text-blueberry-400 font-medium">Optional</span>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-medium text-blueberry-700 mb-1">Cert No.</label>
              <InputText v-model="form.residence_cert_no" class="w-full !text-sm" placeholder="CCI Number" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="min-w-0">
                <label class="block text-[11px] font-medium text-blueberry-700 mb-1">Date Issued</label>
                <DatePicker v-model="certDateValue" show-icon date-format="yy-mm-dd" class="w-full"
                  input-class="!text-sm" placeholder="Pick Date" />
              </div>
              <div class="min-w-0">
                <label class="block text-[11px] font-medium text-blueberry-700 mb-1">Place Issued</label>
                <InputText v-model="form.residence_cert_place" class="w-full !text-sm" placeholder="City / Mun." />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-textarea),
:deep(.p-datepicker) {
  width: 100% !important;
  min-width: 0 !important;
}

:deep(.p-select-label) {
  overflow: visible;
  text-overflow: unset;
}
</style>