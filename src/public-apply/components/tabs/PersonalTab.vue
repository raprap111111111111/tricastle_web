<!-- src/public-apply/components/tabs/PersonalTab.vue -->
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { computed, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'

import { personalSchema, type PersonalFormValues } from '@/features/applicants/schemas/applicant.schema'
import publicApplyApi from '@/public-apply/services/publicApplyApi' // 👈 adjust to your public api path

const props = defineProps<{
  initialValues?: PersonalFormValues | null
}>()

const emit = defineEmits<{
  (e: 'next', values: PersonalFormValues): void
  (e: 'validate', values: PersonalFormValues | null): void
}>()

function toDate(val: string | null | undefined): Date | null {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function toISO(val: Date | null | undefined): string | null {
  if (!val || !(val instanceof Date) || isNaN(val.getTime())) return null
  const y = val.getFullYear()
  const m = String(val.getMonth() + 1).padStart(2, '0')
  const d = String(val.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const { handleSubmit, defineField, errors, values, validate } = useForm<PersonalFormValues>({
  validationSchema: toTypedSchema(personalSchema),
  initialValues: {
    first_name:         props.initialValues?.first_name         ?? '',
    middle_name:        props.initialValues?.middle_name        ?? '',
    last_name:          props.initialValues?.last_name          ?? '',
    suffix:             props.initialValues?.suffix             ?? '',
    email:              props.initialValues?.email              ?? '',
    phone:              props.initialValues?.phone              ?? '',
    mobile:             props.initialValues?.mobile             ?? '',
    date_of_birth:      props.initialValues?.date_of_birth      ?? null,
    gender:             props.initialValues?.gender             ?? null,
    civil_status:       props.initialValues?.civil_status       ?? null,
    number_of_children: props.initialValues?.number_of_children ?? 0,
    nationality:        props.initialValues?.nationality        ?? 'Filipino',
  },
})

const [first_name]         = defineField('first_name')
const [middle_name]        = defineField('middle_name')
const [last_name]          = defineField('last_name')
const [suffix]             = defineField('suffix')
const [email]              = defineField('email')
const [phone]              = defineField('phone')
const [mobile]             = defineField('mobile')
const [date_of_birth]      = defineField('date_of_birth')
const [gender]             = defineField('gender')
const [civil_status]       = defineField('civil_status')
const [number_of_children] = defineField('number_of_children')
const [nationality]        = defineField('nationality')

const domainOptions = [
  { label: '@gmail.com',     value: '@gmail.com' },
  { label: '@yahoo.com',     value: '@yahoo.com' },
  { label: '@outlook.com',   value: '@outlook.com' },
  { label: '@hotmail.com',   value: '@hotmail.com' },
  { label: '@icloud.com',    value: '@icloud.com' },
  { label: 'Other / Custom', value: 'custom' },
]

const emailUsername = ref(props.initialValues?.email?.split('@')[0] ?? '')
const emailDomain = ref('@gmail.com')
const customDomain = ref('')

function syncEmail() {
  const uname = emailUsername.value.trim()
  if (!uname) {
    email.value = ''
    return
  }
  let domain = emailDomain.value
  if (domain === 'custom') {
    let cDom = customDomain.value.trim()
    if (cDom && !cDom.startsWith('@')) cDom = '@' + cDom
    domain = cDom
  }
  email.value = uname ? `${uname}${domain}` : ''
}
watch([emailUsername, emailDomain, customDomain], syncEmail, { immediate: true })

const dobProxy = computed<Date | null>({
  get: () => toDate(date_of_birth.value),
  set: (v) => { date_of_birth.value = toISO(v) },
})

const genderOptions = [
  { label: 'Male',   value: 'male' },
  { label: 'Female', value: 'female' },
]

const civilOptions = [
  { label: 'Single',          value: 'single' },
  { label: 'Married',         value: 'married' },
  { label: 'Widowed',         value: 'widowed' },
  { label: 'Separated',       value: 'separated' },
  { label: 'Divorced',        value: 'divorced' },
  { label: 'Live-in Partner', value: 'live_in_partner' },
]

// ─── Email Check via Public API ─────────────────────────
const emailStatus = ref<'idle' | 'checking' | 'available' | 'taken'>('idle')
const emailDuplicateMsg = ref('')
let emailTimer: number | undefined

watch(email, (newEmail) => {
  if (emailTimer) window.clearTimeout(emailTimer)
  emailStatus.value = 'idle'
  emailDuplicateMsg.value = ''
  if (!newEmail || !newEmail.includes('@') || newEmail.length < 5) return

  emailStatus.value = 'checking'
  emailTimer = window.setTimeout(async () => {
    try {
      const res = await publicApplyApi.post('/check-duplicates', { email: newEmail })
      const dups = res.data?.duplicates ?? []
      const emailDup = dups.find((d: any) => d.type === 'email')
      if (emailDup) {
        emailStatus.value = 'taken'
        emailDuplicateMsg.value = 'This email is already registered.'
      } else {
        emailStatus.value = 'available'
      }
    } catch {
      emailStatus.value = 'idle'
    }
  }, 600)
})

watch(values, async () => {
  const result = await validate()
  emit('validate', result.valid ? { ...values } as PersonalFormValues : null)
}, { deep: true })

const onSubmit = handleSubmit((formValues) => {
  if (emailStatus.value === 'taken') return
  emit('next', formValues)
})
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4">
        <i class="pi pi-user mr-2 text-apricot-500" />Personal Information
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">First Name <span class="text-red-500">*</span></label>
          <InputText v-model="first_name" placeholder="Juan" :invalid="!!errors.first_name" />
          <small class="text-red-500">{{ errors.first_name }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Middle Name</label>
          <InputText v-model="middle_name" placeholder="Santos" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Last Name <span class="text-red-500">*</span></label>
          <InputText v-model="last_name" placeholder="Dela Cruz" :invalid="!!errors.last_name" />
          <small class="text-red-500">{{ errors.last_name }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Suffix</label>
          <InputText v-model="suffix" placeholder="Jr., Sr., III" />
        </div>

        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-sm font-medium text-blueberry-700">Email Address <span class="text-red-500">*</span></label>
          <div class="flex flex-col sm:flex-row items-stretch gap-2">
            <InputText v-model="emailUsername" placeholder="juan.delacruz" class="w-full flex-1" :invalid="!!errors.email || emailStatus === 'taken'" />
            <Select v-model="emailDomain" :options="domainOptions" option-label="label" option-value="value" class="w-full sm:w-44" />
            <InputText v-if="emailDomain === 'custom'" v-model="customDomain" placeholder="@domain.com" class="w-full sm:w-40" />
          </div>
          <p v-if="emailUsername" class="text-[11px] text-blueberry-500 mt-0.5">
            Full email: <span class="font-medium text-blueberry-800">{{ email }}</span>
          </p>
          <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
          <small v-else-if="emailStatus === 'taken'" class="text-red-500">{{ emailDuplicateMsg }}</small>
          <small v-else-if="emailStatus === 'available'" class="text-green-600">Email is available</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Phone</label>
          <InputText v-model="phone" placeholder="+63 912 345 6789" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Mobile</label>
          <InputText v-model="mobile" placeholder="+63 917 123 4567" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Gender</label>
          <Select v-model="gender" :options="genderOptions" option-label="label" option-value="value" placeholder="Select gender" class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Civil Status</label>
          <Select v-model="civil_status" :options="civilOptions" option-label="label" option-value="value" placeholder="Select status" class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Date of Birth</label>
          <DatePicker v-model="dobProxy" date-format="yy-mm-dd" placeholder="YYYY-MM-DD" show-icon class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Number of Children</label>
          <InputNumber v-model="number_of_children" :min="0" :max="30" show-buttons class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Nationality</label>
          <InputText v-model="nationality" placeholder="Filipino" />
        </div>
      </div>
    </section>

    <div class="flex justify-end">
      <button
        type="submit"
        :disabled="emailStatus === 'taken'"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-apricot-500 text-white rounded-lg font-medium text-sm hover:bg-apricot-600 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
      >
        Next <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </form>
</template>