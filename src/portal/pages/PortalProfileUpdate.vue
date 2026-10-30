<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'

import { usePortalAuth } from '../composables/usePortalAuth'
import { usePsgc } from '@shared/composables/usePsgc'
import type { PsgcProvince, PsgcCity } from '@features/applicants/types'

// ─── Field Group Types ───────────────────────────────────────────────────────
interface FieldDef {
  key: string
  label: string
  type: string
  required?: boolean
  options?: string[]
}

interface FieldGroup {
  title: string
  shortTitle: string
  icon: string
  desc: string
  fields: FieldDef[]
}

const router = useRouter()
const toast = useToast()
const {
  applicant,
  missingFields,
  pendingRequest,
  fetchMe,
  submitProfileUpdate,
} = usePortalAuth()

// ─── PSGC (Address) Integration ──────────────────────────────────────────────
const { fetchAllProvinces, fetchCitiesByProvince, findProvinceByName } = usePsgc()

const provincesList = ref<PsgcProvince[]>([])
const citiesList = ref<PsgcCity[]>([])
const permanentCitiesList = ref<PsgcCity[]>([]) // Cities list for permanent address

const isSameAsCurrent = ref(false)

onMounted(async () => {
  await fetchMe()
  provincesList.value = await fetchAllProvinces()
})

// ─── Options (must match applicants table ENUMs) ─────────────────────────────
const genderOptions = ['male', 'female']
const civilStatusOptions = ['single', 'married', 'widowed', 'divorced', 'separated']
const handOptions = ['right', 'left', 'both']
const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'A', 'B', 'AB', 'O']
const jlptOptions = ['N1', 'N2', 'N3', 'N4', 'N5', 'None']

// ─── Helpers for Dates ───────────────────────────────────────────────────────
function parseDate(val: string | Date | null | undefined): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  const [y, m, d] = String(val).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function formatDate(d: Date | string | null | undefined): string | null {
  if (!d) return null
  if (typeof d === 'string') return d.slice(0, 10)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ─── Field Definitions ────────────────────────────────────────────────────────
const activeTabIndex = ref(0)

const fieldGroups = ref<FieldGroup[]>([
  {
    title: 'Personal Information',
    shortTitle: 'Personal',
    icon: 'pi-user',
    desc: 'Basic personal information',
    fields: [
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'middle_name', label: 'Middle Name', type: 'text', required: false },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'suffix', label: 'Suffix (Jr., III, etc.)', type: 'text', required: false },
      { key: 'email', label: 'Email', type: 'readonly' },
      { key: 'mobile', label: 'Mobile Number', type: 'text', required: true },
      { key: 'phone', label: 'Landline Phone', type: 'text', required: false },
      { key: 'gender', label: 'Gender', type: 'select', options: genderOptions, required: true },
      { key: 'civil_status', label: 'Civil Status', type: 'select', options: civilStatusOptions, required: true },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'number_of_children', label: 'Number of Children', type: 'number', required: true },
      { key: 'nationality', label: 'Nationality', type: 'text', required: true },
    ],
  },
  {
    title: 'Facebook Profile',
    shortTitle: 'Facebook',
    icon: 'pi-facebook',
    desc: 'Link your Facebook profile so staff can verify your identity',
    fields: [
      { key: 'facebook_url', label: 'Facebook Profile URL', type: 'facebook', required: true },
    ],
  },
  {
    title: 'Physical & Address',
    shortTitle: 'Physical & Address',
    icon: 'pi-home',
    desc: 'Physical measurements and current location',
    fields: [
      { key: 'height_cm', label: 'Height (cm)', type: 'number', required: true },
      { key: 'weight_kg', label: 'Weight (kg)', type: 'number', required: true },
      { key: 'dominant_hand', label: 'Dominant Hand', type: 'select', options: handOptions, required: true },
      { key: 'blood_type', label: 'Blood Type', type: 'select', options: bloodTypeOptions, required: true },

      { key: 'province', label: 'Current Province', type: 'psgc-province', required: true },
      { key: 'city', label: 'Current City / Municipality', type: 'psgc-city', required: true },
      { key: 'current_address', label: 'Current Address (Bldg/Street/Brgy)', type: 'textarea', required: true },

      { key: 'same_as_current', label: '', type: 'same-address-checkbox', required: false },

      { key: 'permanent_province', label: 'Permanent Province', type: 'psgc-province-perm', required: true },
      { key: 'permanent_city', label: 'Permanent City / Municipality', type: 'psgc-city-perm', required: true },
      { key: 'permanent_address', label: 'Permanent Address (Bldg/Street/Brgy)', type: 'textarea', required: true },

      { key: 'postal_code', label: 'Postal Code', type: 'text', required: true },
    ],
  },
  {
    title: 'Documents & IDs',
    shortTitle: 'Documents',
    icon: 'pi-id-card',
    desc: 'Passport and Government Identification',
    fields: [
      { key: 'passport_number', label: 'Passport Number', type: 'text', required: false },
      { key: 'passport_expiry', label: 'Passport Expiry Date', type: 'date', required: false },
      { key: 'sss_number', label: 'SSS Number', type: 'text', required: false },
      { key: 'tin_number', label: 'TIN Number', type: 'text', required: false },
      { key: 'philhealth_number', label: 'PhilHealth Number', type: 'text', required: false },
      { key: 'pagibig_number', label: 'Pag-IBIG Number', type: 'text', required: false },
    ],
  },
  {
    title: 'Deployment & Skills',
    shortTitle: 'Deployment',
    icon: 'pi-send',
    desc: 'Trade skills and Japan deployment readiness',
    fields: [
      { key: 'trade_or_occupation', label: 'Trade / Occupation', type: 'text', required: false },
      { key: 'skill_category', label: 'Skill Category', type: 'text', required: false },
      { key: 'jlpt_level', label: 'JLPT Level', type: 'select', options: jlptOptions, required: false },
      { key: 'understands_basic_english', label: 'Understands Basic English', type: 'boolean', required: false },
      { key: 'willing_to_be_deployed', label: 'Willing to be Deployed', type: 'boolean', required: false },
      { key: 'japan_deployment_ready', label: 'Japan Deployment Ready', type: 'boolean', required: false },
      { key: 'previous_japan_experience', label: 'Previous Japan Experience', type: 'boolean', required: false },
      { key: 'years_japan_experience', label: 'Years in Japan', type: 'number', required: false },
      { key: 'has_titp_certificate', label: 'Has TITP Certificate', type: 'boolean', required: false },
      { key: 'titp_occupation', label: 'TITP Occupation', type: 'text', required: false },
      { key: 'ssw_eligible', label: 'SSW Eligible', type: 'boolean', required: false },
    ],
  },
  {
    title: 'Family & Emergency Contacts',
    shortTitle: 'Family',
    icon: 'pi-users',
    desc: 'Immediate family and emergency details',
    fields: [
      { key: 'father_name', label: 'Father Name', type: 'text', required: false },
      { key: 'mother_name', label: 'Mother Name', type: 'text', required: false },
      { key: 'spouse_name', label: 'Spouse Name', type: 'text', required: false },
      { key: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'text', required: false },
      { key: 'emergency_contact_relationship', label: 'Relationship', type: 'text', required: false },
      { key: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'text', required: false },
      { key: 'emergency_contact_address', label: 'Emergency Contact Address', type: 'textarea', required: false },
    ],
  },
])

const progress = computed(() => (activeTabIndex.value / (fieldGroups.value.length - 1)) * 100)

// ─── Form Logic ──────────────────────────────────────────────────────────────
const form = ref<Record<string, any>>({})
const submitting = ref(false)
const showValidation = ref(false)

function initForm() {
  if (!applicant.value) return
  fieldGroups.value.forEach((group) => {
    group.fields.forEach((f) => {
      if (f.type === 'readonly') {
        form.value[f.key] = applicant.value![f.key]
      } else if (f.type === 'date') {
        form.value[f.key] = parseDate(applicant.value![f.key])
      } else if (f.type === 'boolean') {
        form.value[f.key] = applicant.value![f.key] ?? false
      } else if (f.type !== 'same-address-checkbox') {
        form.value[f.key] = applicant.value![f.key] ?? ''
      }
    })
  })

  // Detect if permanent address initially matches current address
  if (
    form.value.province &&
    form.value.province === form.value.permanent_province &&
    form.value.city === form.value.permanent_city &&
    form.value.current_address === form.value.permanent_address
  ) {
    isSameAsCurrent.value = true
  }
}

watch(applicant, initForm, { immediate: true })

// Watch Current Province
watch(() => form.value.province, async (newProvName, oldProvName) => {
  if (!newProvName) {
    citiesList.value = []
    return
  }
  const prov = findProvinceByName(newProvName)
  if (prov) {
    citiesList.value = await fetchCitiesByProvince(prov.code)
    if (oldProvName && oldProvName !== newProvName) {
      form.value.city = ''
    }
  } else {
    citiesList.value = []
  }
}, { immediate: true })

// Watch Permanent Province
watch(() => form.value.permanent_province, async (newProvName, oldProvName) => {
  if (!newProvName) {
    permanentCitiesList.value = []
    return
  }
  const prov = findProvinceByName(newProvName)
  if (prov) {
    permanentCitiesList.value = await fetchCitiesByProvince(prov.code)
    if (oldProvName && oldProvName !== newProvName && !isSameAsCurrent.value) {
      form.value.permanent_city = ''
    }
  } else {
    permanentCitiesList.value = []
  }
}, { immediate: true })

// Sync Permanent Address when "Same as Current" is checked
watch(
  [isSameAsCurrent, () => form.value.province, () => form.value.city, () => form.value.current_address],
  ([same, prov, cit, addr]) => {
    if (same) {
      form.value.permanent_province = prov
      form.value.permanent_city = cit
      form.value.permanent_address = addr
    }
  }
)

function isEmptyValue(val: any): boolean {
  if (val === null || val === undefined) return true
  if (typeof val === 'boolean') return false
  if (typeof val === 'number') return false
  return String(val).trim() === ''
}

function isMissing(key: string): boolean {
  if (key === 'same_as_current') return false

  const currentVal = form.value[key]
  if (!isEmptyValue(currentVal)) return false

  let fieldDef: any = null
  for (const group of fieldGroups.value) {
    const found = group.fields.find(f => f.key === key)
    if (found) { fieldDef = found; break }
  }

  const isBackendMissing = missingFields.value.includes(key)
  return Boolean(fieldDef?.required || isBackendMissing)
}

function groupHasMissing(group: FieldGroup): boolean {
  return group.fields.some((f) => isMissing(f.key))
}

const incompleteRequiredFields = computed(() => {
  const list: { key: string; label: string; groupIndex: number; groupTitle: string }[] = []
  fieldGroups.value.forEach((group, groupIndex) => {
    group.fields.forEach((f) => {
      if (f.type === 'readonly' || f.type === 'same-address-checkbox') return
      if (!f.required) return
      if (isEmptyValue(form.value[f.key])) {
        list.push({ key: f.key, label: f.label, groupIndex, groupTitle: group.shortTitle })
      }
    })
  })
  return list
})

const hasIncompleteRequired = computed(() => incompleteRequiredFields.value.length > 0)

const hasChanges = computed(() => {
  if (!applicant.value) return false
  return fieldGroups.value.some((group) =>
    group.fields.some((f) => {
      if (f.type === 'readonly' || f.type === 'same-address-checkbox') return false
      const orig = applicant.value![f.key] ?? (f.type === 'boolean' ? false : '')
      let curr = form.value[f.key]
      if (f.type === 'date') curr = formatDate(curr)
      if (f.type === 'boolean') return Boolean(curr) !== Boolean(orig)
      return String(curr ?? '').trim() !== String(orig ?? '').trim()
    })
  )
})

const submitPayload = computed(() => {
  const payload: Record<string, any> = {}
  fieldGroups.value.forEach((group) => {
    group.fields.forEach((f) => {
      if (f.type === 'readonly' || f.type === 'same-address-checkbox') return
      let val = form.value[f.key]

      if (f.type === 'date') val = formatDate(val)

      if (f.type === 'boolean') {
        payload[f.key] = Boolean(val)
      } else if (val === '' || val === undefined || val === null) {
        payload[f.key] = null
      } else {
        payload[f.key] = val
      }
    })
  })
  return payload
})

function toastRequiredFieldsBlocked() {
  const items = incompleteRequiredFields.value
  const maxShow = 5
  const labels = items.slice(0, maxShow).map((i) => i.label)
  const extra = items.length > maxShow ? ` and ${items.length - maxShow} more` : ''

  toast.add({
    severity: 'warn',
    summary: 'Required fields missing',
    detail: items.length === 1
      ? `Please fill in “${labels[0]}” before submitting.`
      : `Please complete: ${labels.join(', ')}${extra}.`,
    life: 6000,
  })

  if (items.length > 0) {
    activeTabIndex.value = items[0].groupIndex
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function handleSubmit() {
  if (hasIncompleteRequired.value) {
    showValidation.value = true
    toastRequiredFieldsBlocked()
    return
  }

  if (!hasChanges.value) {
    toast.add({
      severity: 'info',
      summary: 'No changes',
      detail: 'Update at least one field before submitting.',
      life: 3500,
    })
    return
  }

  if (pendingRequest.value) {
    toast.add({
      severity: 'warn',
      summary: 'Already under review',
      detail: 'Wait for staff to finish reviewing your previous request.',
      life: 4000,
    })
    return
  }

  submitting.value = true
  try {
    await submitProfileUpdate(submitPayload.value)
    toast.add({
      severity: 'success',
      summary: 'Update Request Submitted',
      detail: 'Your profile changes have been sent to staff for review.',
      life: 4000,
    })

    setTimeout(() => {
      router.push('/portal/dashboard')
    }, 1500)
  } catch (err: any) {
    const data = err.response?.data
    if (data?.errors) {
      const msgs = Object.values(data.errors).flat().join(' ')
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: msgs || 'Please check your inputs.',
        life: 6000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Submission Error',
        detail: data?.message ?? 'Failed to submit profile update.',
        life: 4000,
      })
    }
  } finally {
    submitting.value = false
  }
}

function nextStep() {
  if (activeTabIndex.value < fieldGroups.value.length - 1) {
    activeTabIndex.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function prevStep() {
  if (activeTabIndex.value > 0) {
    activeTabIndex.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function tabButtonClass(group: FieldGroup, index: number) {
  const active = activeTabIndex.value === index
  const bad = groupHasMissing(group)
  if (active && bad) return 'bg-red-500 text-white border-red-500 shadow-md'
  if (active) return 'bg-apricot-500 text-white border-apricot-500 shadow-md'
  if (bad) return 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
  return 'bg-white text-blueberry-700 border-appleCore-200 hover:bg-appleCore-50'
}
</script>

<template>
  <div class="max-w-5xl w-full mx-auto space-y-6 animate-fadeIn pb-16">

    <!-- Header Summary -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 rounded-full bg-blueberry-900 text-white flex items-center justify-center font-serif text-xl font-bold shadow-md">
          {{ applicant?.first_name?.[0] }}{{ applicant?.last_name?.[0] }}
        </div>
        <div>
          <h1 class="text-2xl font-serif font-bold text-blueberry-900">
            {{ applicant?.first_name }} {{ applicant?.last_name }}
          </h1>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs font-semibold text-blueberry-500">
              Applicant Code: {{ applicant?.applicant_code }}
            </span>
            <Tag :value="applicant?.status || 'Pending'" severity="info"
              class="!px-2 !py-0.5 !text-[10px] !font-bold uppercase" />
          </div>
        </div>
      </div>

      <Button label="Back to Dashboard" icon="pi pi-home"
        class="!bg-white !text-blueberry-700 hover:!bg-appleCore-50 !border-appleCore-200 !border !rounded-lg"
        @click="router.push('/portal/dashboard')" />
    </div>

    <!-- Alert Messages -->
    <div class="space-y-3">
      <Message v-if="hasIncompleteRequired" severity="warn" :closable="false"
        class="!rounded-lg border border-amber-200 !m-0 !bg-white">
        <div class="flex items-start gap-2">
          <i class="pi pi-info-circle text-amber-500 mt-0.5" />
          <div class="text-sm text-blueberry-800">
            <p>Please complete the required fields marked with <span class="text-red-500 font-bold">*</span> before
              submitting.</p>
            <p class="mt-1 text-red-600 font-medium">{{ incompleteRequiredFields.length }} required field(s) still
              empty. Red tabs need your attention.</p>
          </div>
        </div>
      </Message>

      <Message v-if="pendingRequest" severity="info" :closable="false"
        class="!rounded-lg border border-blue-200 !m-0 !bg-blue-50/50">
        <div class="flex items-center gap-2">
          <i class="pi pi-clock text-blue-500" />
          <span class="text-sm text-blueberry-800 font-medium">
            Your previously submitted changes are currently <strong class="text-blue-700">Under Review</strong> by
            staff.
          </span>
        </div>
      </Message>
    </div>

    <!-- WIZARD STEPPER -->
    <div class="w-full pt-4">
      <div class="h-1.5 w-full bg-appleCore-200 rounded-full overflow-hidden flex mb-4">
        <div class="h-full bg-apricot-500 transition-all duration-300 ease-out" :style="{ width: `${progress}%` }" />
      </div>

      <div class="flex flex-wrap gap-2 mb-4">
        <button v-for="(group, index) in fieldGroups" :key="group.title" type="button"
          class="rounded-xl text-sm font-medium px-4 py-2 flex items-center gap-2 transition-all border cursor-pointer select-none"
          :class="tabButtonClass(group, index)" @click="activeTabIndex = index">
          <i
            :class="['pi', group.icon, activeTabIndex === index ? 'text-white' : groupHasMissing(group) ? 'text-red-500' : 'text-blueberry-400']" />
          {{ group.shortTitle }}
          <span v-if="groupHasMissing(group)"
            class="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
            :class="activeTabIndex === index ? 'bg-white/25 text-white' : 'bg-red-500 text-white'">!</span>
        </button>
      </div>

      <p class="text-sm text-blueberry-500 font-medium mb-6 flex items-center gap-2 flex-wrap">
        <i class="pi pi-user text-blueberry-400" />
        Step {{ activeTabIndex + 1 }} of {{ fieldGroups.length }}: {{ fieldGroups[activeTabIndex].desc }}
        <span v-if="groupHasMissing(fieldGroups[activeTabIndex])" class="text-red-600 font-semibold">· Incomplete
          required fields</span>
      </p>
    </div>

    <!-- MAIN FORM CARD -->
    <form @submit.prevent="handleSubmit" class="bg-white rounded-xl border border-appleCore-100 p-6 flex flex-col">
      <div class="flex-1 animate-fadeIn" :key="activeTabIndex">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-6 flex items-center">
          <i :class="['pi mr-2 text-apricot-500', fieldGroups[activeTabIndex].icon]" />
          {{ fieldGroups[activeTabIndex].title }}
        </h3>

        <!-- FACEBOOK DEDICATED TAB UI -->
        <div v-if="fieldGroups[activeTabIndex].shortTitle === 'Facebook'"
          class="flex flex-col items-center pt-2 pb-6 w-full">
          <div class="text-center mb-10">
            <p class="text-sm text-blueberry-500 font-medium">Follow these simple steps to find and paste your Facebook
              profile link.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12">
            <!-- Step 1 -->
            <div
              class="bg-appleCore-50/60 rounded-2xl p-6 pt-8 border border-appleCore-100 flex flex-col items-center text-center relative transition-transform hover:-translate-y-1 duration-300">
              <div
                class="absolute -top-4 w-9 h-9 rounded-full bg-blueberry-900 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                1</div>
              <h5 class="font-semibold text-blueberry-900 text-sm mb-3">Go to your Profile</h5>
              <div class="h-64 flex items-center justify-center w-full my-2">
                <img src="/instructions/1st_step.png" alt="Step 1"
                  class="max-h-full max-w-full object-contain rounded-xl shadow-sm border border-black/5" />
              </div>
              <p class="text-xs text-blueberry-600 mt-3 leading-relaxed">Open Facebook and tap on your <b>profile
                  name</b>.</p>
            </div>

            <!-- Step 2 -->
            <div
              class="bg-appleCore-50/60 rounded-2xl p-6 pt-8 border border-appleCore-100 flex flex-col items-center text-center relative transition-transform hover:-translate-y-1 duration-300">
              <div
                class="absolute -top-4 w-9 h-9 rounded-full bg-blueberry-900 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                2</div>
              <h5 class="font-semibold text-blueberry-900 text-sm mb-3">Open the Menu</h5>
              <div class="h-64 flex items-center justify-center w-full my-2">
                <img src="/instructions/2nd_step.png" alt="Step 2"
                  class="max-h-full max-w-full object-contain rounded-xl shadow-sm border border-black/5" />
              </div>
              <p class="text-xs text-blueberry-600 mt-3 leading-relaxed">Tap the <b>⋯ (three dots)</b> button next to
                Edit Profile.</p>
            </div>

            <!-- Step 3 -->
            <div
              class="bg-appleCore-50/60 rounded-2xl p-6 pt-8 border border-appleCore-100 flex flex-col items-center text-center relative transition-transform hover:-translate-y-1 duration-300">
              <div
                class="absolute -top-4 w-9 h-9 rounded-full bg-blueberry-900 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                3</div>
              <h5 class="font-semibold text-blueberry-900 text-sm mb-3">Copy the Link</h5>
              <div class="h-64 flex items-center justify-center w-full my-2">
                <img src="/instructions/3rd_step.png" alt="Step 3"
                  class="max-h-full max-w-full object-contain rounded-xl shadow-sm border border-black/5" />
              </div>
              <p class="text-xs text-blueberry-600 mt-3 leading-relaxed">Tap <b>"Copy link to profile"</b> at the
                bottom.</p>
            </div>
          </div>

          <div
            class="w-full max-w-xl bg-white rounded-2xl p-8 border border-appleCore-200 shadow-[0_8px_24px_rgba(0,0,0,0.04)] relative mt-4">
            <div
              class="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-apricot-500 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
              4</div>
            <div class="text-center mb-6 mt-1">
              <h4 class="text-base font-serif font-bold text-blueberry-900">Paste your link here</h4>
              <p class="text-xs text-blueberry-500 mt-1">Return to this page and paste your copied Facebook link below.
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <div
                class="flex items-stretch rounded-xl border overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-apricot-500/20"
                :class="isMissing('facebook_url') && showValidation ? 'border-red-400' : 'border-appleCore-200 focus-within:border-apricot-500'">
                <div
                  class="bg-blue-50 px-4 flex items-center justify-center border-r border-appleCore-200 text-blue-600 select-none">
                  <i class="pi pi-facebook text-xl"></i>
                </div>
                <InputText v-model="form.facebook_url" type="url" placeholder="https://www.facebook.com/your.username"
                  class="w-full !border-0 !rounded-none !bg-appleCore-50/40 px-4 py-3.5 text-sm text-blueberry-900 placeholder:text-appleCore-400 focus:!ring-0 focus:!outline-none" />
              </div>
              <small v-if="isMissing('facebook_url') && showValidation"
                class="text-red-500 text-center font-medium mt-1">Facebook Profile URL is required</small>
              <p v-else class="text-[11px] text-center text-blueberry-400 mt-1">Example:
                https://www.facebook.com/your.username</p>
            </div>
          </div>
        </div>

        <!-- NORMAL FIELDS GRID -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="field in fieldGroups[activeTabIndex].fields" :key="field.key" class="flex flex-col gap-1"
            :class="{ 'md:col-span-3': field.type === 'same-address-checkbox' }">
            <!-- CHECKBOX (Same as Current) -->
            <div v-if="field.type === 'same-address-checkbox'"
              class="flex items-center gap-2 pt-4 pb-2 border-b border-appleCore-100">
              <Checkbox v-model="isSameAsCurrent" :binary="true" input-id="same_as_curr_box" />
              <label for="same_as_curr_box"
                class="text-sm font-semibold text-blueberry-800 cursor-pointer select-none m-0">
                Permanent Address is the same as Current Address
              </label>
            </div>

            <template v-else>
              <label class="text-sm font-medium text-blueberry-700">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>

              <!-- Readonly -->
              <InputText v-if="field.type === 'readonly'" :model-value="form[field.key]" readonly
                class="w-full bg-appleCore-50 border border-appleCore-200 text-blueberry-600 rounded-lg px-3 py-2 text-sm" />

              <!-- PSGC Province (Current) -->
              <Dropdown v-else-if="field.type === 'psgc-province'" v-model="form[field.key]" :options="provincesList"
                option-label="name" option-value="name" placeholder="Select Province" filter
                class="w-full bg-white border border-appleCore-200 focus:border-apricot-500 rounded-lg text-sm"
                :class="{ 'p-invalid !border-red-400': isMissing(field.key) && showValidation }" />

              <!-- PSGC City (Current) -->
              <Dropdown v-else-if="field.type === 'psgc-city'" v-model="form[field.key]" :options="citiesList"
                option-label="name" option-value="name" placeholder="Select City" filter :disabled="!form.province"
                class="w-full bg-white border border-appleCore-200 focus:border-apricot-500 rounded-lg text-sm"
                :class="{ 'p-invalid !border-red-400': isMissing(field.key) && showValidation }" />

              <!-- PSGC Province (Permanent) -->
              <Dropdown v-else-if="field.type === 'psgc-province-perm'" v-model="form[field.key]"
                :options="provincesList" option-label="name" option-value="name" placeholder="Select Permanent Province"
                filter :disabled="isSameAsCurrent"
                class="w-full bg-white border border-appleCore-200 focus:border-apricot-500 rounded-lg text-sm"
                :class="{ 'p-invalid !border-red-400': isMissing(field.key) && showValidation, 'bg-appleCore-50 text-blueberry-500': isSameAsCurrent }" />

              <!-- PSGC City (Permanent) -->
              <Dropdown v-else-if="field.type === 'psgc-city-perm'" v-model="form[field.key]"
                :options="permanentCitiesList" option-label="name" option-value="name"
                placeholder="Select Permanent City" filter :disabled="!form.permanent_province || isSameAsCurrent"
                class="w-full bg-white border border-appleCore-200 focus:border-apricot-500 rounded-lg text-sm"
                :class="{ 'p-invalid !border-red-400': isMissing(field.key) && showValidation, 'bg-appleCore-50 text-blueberry-500': isSameAsCurrent }" />

              <!-- Date -->
              <Calendar v-else-if="field.type === 'date'" v-model="form[field.key]" date-format="yy-mm-dd"
                placeholder="YYYY-MM-DD" show-icon icon-display="input" :manual-input="true"
                :max-date="field.key === 'date_of_birth' ? new Date() : undefined" class="w-full portal-calendar"
                input-class="w-full !bg-white border !border-appleCore-200 focus:!border-apricot-500 !rounded-lg !px-3 !py-2 !text-sm"
                :class="{ 'p-invalid': isMissing(field.key) && showValidation }" />

              <!-- Textarea -->
              <Textarea v-else-if="field.type === 'textarea'" v-model="form[field.key]" rows="2"
                :disabled="isSameAsCurrent && field.key === 'permanent_address'"
                class="w-full bg-white border border-appleCore-200 focus:border-apricot-500 rounded-lg px-3 py-2 text-sm"
                :class="{ 'p-invalid !border-red-400': isMissing(field.key) && showValidation, 'bg-appleCore-50 text-blueberry-500': isSameAsCurrent && field.key === 'permanent_address' }" />

              <!-- Select -->
              <Dropdown v-else-if="field.type === 'select'" v-model="form[field.key]" :options="field.options"
                placeholder="Select..."
                class="w-full bg-white border border-appleCore-200 focus:border-apricot-500 rounded-lg text-sm"
                :class="{ 'p-invalid !border-red-400': isMissing(field.key) && showValidation }" />

              <!-- Boolean -->
              <div v-else-if="field.type === 'boolean'" class="flex items-center gap-2 pt-1 h-[38px]">
                <Checkbox v-model="form[field.key]" :binary="true" :input-id="field.key" />
                <label :for="field.key" class="text-sm text-blueberry-700 cursor-pointer select-none m-0">Yes /
                  Applicable</label>
              </div>

              <!-- Standard Text / Number -->
              <InputText v-else v-model="form[field.key]" :type="field.type"
                class="w-full bg-white border border-appleCore-200 focus:border-apricot-500 rounded-lg px-3 py-2 text-sm"
                :class="{ 'p-invalid !border-red-400': isMissing(field.key) && showValidation }" />

              <!-- Error -->
              <small v-if="field.required && isMissing(field.key) && showValidation" class="text-red-500">{{ field.label
              }} is required</small>
            </template>
          </div>
        </div>
      </div>

      <!-- Navigation Footer -->
      <div class="mt-8 pt-6 border-t border-appleCore-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button v-if="activeTabIndex > 0" type="button" label="Back" icon="pi pi-arrow-left"
          class="!bg-white !text-blueberry-700 !border !border-appleCore-200 hover:!bg-appleCore-50 !rounded-lg !px-6 !py-2.5 !text-sm !font-medium"
          @click="prevStep" />
        <div v-else />

        <div class="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
          <Button type="submit" label="Submit Updates" icon="pi pi-check"
            class="!bg-green-600 hover:!bg-green-700 !border-none !text-white !rounded-lg !px-6 !py-2.5 !text-sm !font-medium w-full sm:w-auto"
            :loading="submitting" :disabled="!!pendingRequest" />
          <Button v-if="activeTabIndex < fieldGroups.length - 1" type="button" label="Next" icon="pi pi-arrow-right"
            icon-pos="right"
            class="!bg-apricot-500 hover:!bg-apricot-600 !border-none !text-white !rounded-lg !px-6 !py-2.5 !text-sm !font-medium w-full sm:w-auto"
            @click="nextStep" />
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}

:deep(.portal-calendar) {
  width: 100%;
}

:deep(.portal-calendar .p-inputtext) {
  width: 100%;
}

:deep(.p-dropdown) {
  height: 38px;
  display: flex;
  align-items: center;
}

:deep(.p-dropdown-label) {
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  align-items: center;
}

:deep(.p-dropdown.p-invalid),
:deep(.p-inputtext.p-invalid) {
  border-color: #ef4444 !important;
}
</style>