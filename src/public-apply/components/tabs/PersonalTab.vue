<!-- src/public-apply/components/tabs/PersonalTab.vue -->
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { computed, ref, watch, onUnmounted } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import Password from 'primevue/password'

import { personalSchema, type PersonalFormValues } from '@/features/applicants/schemas/applicant.schema'
import publicApplyApi from '@/public-apply/services/publicApplyApi'

export type PublicPersonalFormValues = PersonalFormValues & {
  password?: string
  password_confirmation?: string
}

const props = defineProps<{
  initialValues?: PublicPersonalFormValues | null
}>()

const emit = defineEmits<{
  (e: 'next', values: PublicPersonalFormValues): void
  (e: 'validate', values: PublicPersonalFormValues | null): void
}>()

// ─── Schema Extension for Public Account Credentials ────
const publicPersonalSchema = z
  .intersection(
    personalSchema,
    z.object({
      password: z.string().min(8, 'Password must be at least 8 characters'),
      password_confirmation: z.string().min(1, 'Please confirm your password'),
    })
  )
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

// ─── Form Setup ─────────────────────────────────────────
const { handleSubmit, defineField, errors, values, validate } = useForm<PublicPersonalFormValues>({
  validationSchema: toTypedSchema(publicPersonalSchema),
  initialValues: {
    first_name:            props.initialValues?.first_name            ?? '',
    middle_name:           props.initialValues?.middle_name           ?? '',
    last_name:             props.initialValues?.last_name             ?? '',
    suffix:                props.initialValues?.suffix                ?? '',
    email:                 props.initialValues?.email                 ?? '',
    password:              props.initialValues?.password              ?? '',
    password_confirmation: props.initialValues?.password_confirmation ?? '',
    phone:                 props.initialValues?.phone                 ?? '',
    mobile:                props.initialValues?.mobile                ?? '',
    date_of_birth:         props.initialValues?.date_of_birth         ?? null,
    gender:                props.initialValues?.gender                ?? null,
    civil_status:          props.initialValues?.civil_status          ?? null,
    number_of_children:    props.initialValues?.number_of_children    ?? 0,
    nationality:           props.initialValues?.nationality           ?? 'Filipino',
  },
})

const [first_name]            = defineField('first_name')
const [middle_name]           = defineField('middle_name')
const [last_name]             = defineField('last_name')
const [suffix]                = defineField('suffix')
const [email]                 = defineField('email')
const [password]              = defineField('password')
const [password_confirmation] = defineField('password_confirmation')
const [phone]                 = defineField('phone')
const [mobile]                = defineField('mobile')
const [date_of_birth]         = defineField('date_of_birth')
const [gender]                = defineField('gender')
const [civil_status]          = defineField('civil_status')
const [number_of_children]    = defineField('number_of_children')
const [nationality]           = defineField('nationality')

// ─── Fast Birthday Selector (Year -> Month -> Day) ─────
const currentYear = new Date().getFullYear()
const maxAllowedYear = currentYear - 18 // At least 18 years old
const minAllowedYear = 1950

// Year Options: 2008 down to 1950
const yearOptions = computed(() => {
  const yrs: { label: string; value: string }[] = []
  for (let y = maxAllowedYear; y >= minAllowedYear; y--) {
    yrs.push({ label: String(y), value: String(y) })
  }
  return yrs
})

// Month Options
const monthOptions = [
  { label: '01 - Jan', value: '01' },
  { label: '02 - Feb', value: '02' },
  { label: '03 - Mar', value: '03' },
  { label: '04 - Apr', value: '04' },
  { label: '05 - May', value: '05' },
  { label: '06 - Jun', value: '06' },
  { label: '07 - Jul', value: '07' },
  { label: '08 - Aug', value: '08' },
  { label: '09 - Sep', value: '09' },
  { label: '10 - Oct', value: '10' },
  { label: '11 - Nov', value: '11' },
  { label: '12 - Dec', value: '12' },
]

// Parse initial DOB if exists (YYYY-MM-DD)
const initialDobParts = (props.initialValues?.date_of_birth ?? '').split('-')
const birthYear = ref<string | null>(initialDobParts[0] || null)
const birthMonth = ref<string | null>(initialDobParts[1] || null)
const birthDay = ref<string | null>(initialDobParts[2] || null)

// Day Options dynamically adjusted for month / leap years
const dayOptions = computed(() => {
  let totalDays = 31
  if (birthMonth.value) {
    const m = parseInt(birthMonth.value, 10)
    if ([4, 6, 9, 11].includes(m)) {
      totalDays = 30
    } else if (m === 2) {
      const y = birthYear.value ? parseInt(birthYear.value, 10) : 2000
      const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
      totalDays = isLeap ? 29 : 28
    }
  }

  const days: { label: string; value: string }[] = []
  for (let d = 1; d <= totalDays; d++) {
    const val = String(d).padStart(2, '0')
    days.push({ label: val, value: val })
  }
  return days
})

// Sync Year, Month, Day -> date_of_birth string ("YYYY-MM-DD")
watch([birthYear, birthMonth, birthDay], () => {
  if (birthYear.value && birthMonth.value && birthDay.value) {
    date_of_birth.value = `${birthYear.value}-${birthMonth.value}-${birthDay.value}`
  } else {
    date_of_birth.value = null
  }
})

// ─── Email Domain Selector ──────────────────────────────
const domainOptions = [
  { label: '@gmail.com',     value: '@gmail.com' },
  { label: '@yahoo.com',     value: '@yahoo.com' },
  { label: '@outlook.com',   value: '@outlook.com' },
  { label: '@hotmail.com',   value: '@hotmail.com' },
  { label: '@icloud.com',    value: '@icloud.com' },
  { label: 'Other / Custom', value: 'custom' },
]

const rawInitialEmail = props.initialValues?.email ?? ''
let initialUsername = ''
let initialDomain = '@gmail.com'
let initialCustomDomain = ''

if (rawInitialEmail) {
  const parts = rawInitialEmail.split('@')
  if (parts.length === 2) {
    initialUsername = parts[0]
    const fullDomain = '@' + parts[1]
    const matched = domainOptions.find((d) => d.value.toLowerCase() === fullDomain.toLowerCase())
    if (matched) {
      initialDomain = matched.value
    } else {
      initialDomain = 'custom'
      initialCustomDomain = '@' + parts[1]
    }
  } else {
    initialUsername = rawInitialEmail
  }
}

const emailUsername = ref(initialUsername)
const emailDomain = ref(initialDomain)
const customDomain = ref(initialCustomDomain)

function syncEmail() {
  const uname = emailUsername.value.trim()
  if (!uname) {
    email.value = ''
    return
  }

  if (uname.includes('@')) {
    const parts = uname.split('@')
    const userPart = parts[0]
    const domainPart = '@' + parts[1]
    const matched = domainOptions.find((d) => d.value.toLowerCase() === domainPart.toLowerCase())
    if (matched) {
      emailDomain.value = matched.value
      customDomain.value = ''
    } else if (parts[1]) {
      emailDomain.value = 'custom'
      customDomain.value = domainPart.startsWith('@') ? domainPart : '@' + domainPart
    }
    emailUsername.value = userPart
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

// ─── Public Duplicate Checker (Email + Name/DOB) ────────
type CheckStatus = 'idle' | 'checking' | 'available' | 'taken'

const emailStatus = ref<CheckStatus>('idle')
const emailDuplicateMsg = ref<string>('')

const nameStatus = ref<CheckStatus>('idle')
const nameDuplicateMsg = ref<string>('')

let emailTimer: ReturnType<typeof setTimeout> | undefined
let nameTimer: ReturnType<typeof setTimeout> | undefined

// 1. Email Check
watch(email, (newEmail) => {
  if (emailTimer) clearTimeout(emailTimer)
  emailStatus.value = 'idle'
  emailDuplicateMsg.value = ''

  if (!newEmail || !newEmail.includes('@') || newEmail.length < 5) return

  emailStatus.value = 'checking'
  emailTimer = setTimeout(async () => {
    try {
      const res = await publicApplyApi.post('/check-duplicates', { email: newEmail.trim() })
      const data = res.data?.data ?? res.data
      const duplicates = data?.duplicates ?? []
      const emailDup = duplicates.find((d: any) => d.type === 'email')

      if (emailDup) {
        emailStatus.value = 'taken'
        emailDuplicateMsg.value = emailDup.message || 'This email address is already registered.'
      } else {
        emailStatus.value = 'available'
      }
    } catch {
      emailStatus.value = 'idle'
    }
  }, 500)
})

// 2. Name + DOB Check
watch([first_name, last_name, date_of_birth], () => {
  if (nameTimer) clearTimeout(nameTimer)
  nameStatus.value = 'idle'
  nameDuplicateMsg.value = ''

  const fn = first_name.value?.trim()
  const ln = last_name.value?.trim()
  const dob = date_of_birth.value

  if (!fn || !ln || !dob) return

  nameStatus.value = 'checking'
  nameTimer = setTimeout(async () => {
    try {
      const res = await publicApplyApi.post('/check-duplicates', {
        first_name: fn,
        last_name: ln,
        date_of_birth: dob,
      })
      const data = res.data?.data ?? res.data
      const duplicates = data?.duplicates ?? []
      const nameDup = duplicates.find(
        (d: any) => d.type === 'similar_person' || d.type === 'name_in_batch'
      )

      if (nameDup) {
        nameStatus.value = 'taken'
        nameDuplicateMsg.value = nameDup.message || 'An applicant with this name and birthdate already exists.'
      } else {
        nameStatus.value = 'available'
      }
    } catch {
      nameStatus.value = 'idle'
    }
  }, 700)
})

onUnmounted(() => {
  if (emailTimer) clearTimeout(emailTimer)
  if (nameTimer) clearTimeout(nameTimer)
})

// ─── Validate emitter ───────────────────────────────────
watch(values, async () => {
  const result = await validate()
  emit('validate', result.valid ? ({ ...values } as PublicPersonalFormValues) : null)
}, { deep: true })

const onSubmit = handleSubmit((formValues) => {
  if (emailStatus.value === 'taken') return
  emit('next', formValues)
})
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
    <section class="bg-white rounded-2xl border border-appleCore-100 p-4 sm:p-6 shadow-sm flex flex-col gap-6">

      <!-- ─── 1. Personal Information ────────────────────────── -->
      <div>
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center">
          <i class="pi pi-user mr-2 text-apricot-500" />Personal Information
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <!-- First Name -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">First Name <span class="text-red-500">*</span></label>
            <InputText v-model="first_name" placeholder="Juan" :invalid="!!errors.first_name" class="w-full text-xs sm:text-sm" />
            <small class="text-red-500 text-[11px]">{{ errors.first_name }}</small>
          </div>

          <!-- Middle Name -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">Middle Name</label>
            <InputText v-model="middle_name" placeholder="Santos" class="w-full text-xs sm:text-sm" />
          </div>

          <!-- Last Name -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">Last Name <span class="text-red-500">*</span></label>
            <InputText v-model="last_name" placeholder="Dela Cruz" :invalid="!!errors.last_name" class="w-full text-xs sm:text-sm" />
            <small class="text-red-500 text-[11px]">{{ errors.last_name }}</small>
          </div>

          <!-- Suffix -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">Suffix</label>
            <InputText v-model="suffix" placeholder="Jr., Sr., III" class="w-full text-xs sm:text-sm" />
          </div>

          <!-- Gender -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">Gender</label>
            <Select
              v-model="gender"
              :options="genderOptions"
              option-label="label"
              option-value="value"
              placeholder="Select gender"
              class="w-full text-xs sm:text-sm"
            />
          </div>

          <!-- Civil Status -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">Civil Status</label>
            <Select
              v-model="civil_status"
              :options="civilOptions"
              option-label="label"
              option-value="value"
              placeholder="Select status"
              class="w-full text-xs sm:text-sm"
            />
          </div>

          <!-- 🟢 Date of Birth: 1. Year -> 2. Month -> 3. Day Dropdowns (Mobile Optimized) -->
          <div class="flex flex-col gap-1 sm:col-span-2">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700 flex items-center justify-between">
              <span>Date of Birth <span class="text-red-500">*</span></span>
              <span class="text-[10px] text-blueberry-500 font-normal">Year &rarr; Month &rarr; Day</span>
            </label>

            <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
              <!-- 1. Year First -->
              <Select
                v-model="birthYear"
                :options="yearOptions"
                option-label="label"
                option-value="value"
                placeholder="Year"
                size="small"
                class="w-full !min-w-0 !text-xs"
                :pt="{
                  label: { class: '!py-2 !px-2 !text-xs truncate' },
                  dropdown: { class: '!w-6' }
                }"
                :invalid="!!errors.date_of_birth"
              />

              <!-- 2. Month Second -->
              <Select
                v-model="birthMonth"
                :options="monthOptions"
                option-label="label"
                option-value="value"
                placeholder="Month"
                size="small"
                class="w-full !min-w-0 !text-xs"
                :pt="{
                  label: { class: '!py-2 !px-1.5 !text-xs truncate' },
                  dropdown: { class: '!w-6' }
                }"
                :invalid="!!errors.date_of_birth"
              />

              <!-- 3. Day Third -->
              <Select
                v-model="birthDay"
                :options="dayOptions"
                option-label="label"
                option-value="value"
                placeholder="Day"
                size="small"
                class="w-full !min-w-0 !text-xs"
                :pt="{
                  label: { class: '!py-2 !px-2 !text-xs truncate' },
                  dropdown: { class: '!w-6' }
                }"
                :invalid="!!errors.date_of_birth"
              />
            </div>

            <small v-if="errors.date_of_birth" class="text-red-500 text-[11px]">{{ errors.date_of_birth }}</small>
            <small v-else-if="nameStatus === 'taken'" class="text-amber-600 font-medium text-[11px]">
              <i class="pi pi-exclamation-triangle text-[10px] mr-1" />{{ nameDuplicateMsg }}
            </small>
            <small v-else-if="nameStatus === 'checking'" class="text-blueberry-400 text-[11px]">
              Checking for duplicates...
            </small>
          </div>

          <!-- 🟢 Number of Children (Clean Mobile-Friendly Stepper) -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">Number of Children</label>
            <InputNumber
              v-model="number_of_children"
              :min="0"
              :max="30"
              show-buttons
              button-layout="horizontal"
              fluid
              class="w-full"
              input-class="!text-center !text-xs sm:!text-sm !py-2"
              decrement-button-class="!p-2 !bg-appleCore-100 !text-blueberry-700 !border-appleCore-200"
              increment-button-class="!p-2 !bg-appleCore-100 !text-blueberry-700 !border-appleCore-200"
            />
          </div>

          <!-- Nationality -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">Nationality</label>
            <InputText v-model="nationality" placeholder="Filipino" class="w-full text-xs sm:text-sm" />
          </div>
        </div>
      </div>

      <!-- ─── 2. Highlighted Portal Credentials Card ─────────── -->
      <div class="rounded-xl p-4 sm:p-5 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-amber-50/60 border-2 border-apricot-200/90 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-apricot-200/60 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-apricot-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <i class="pi pi-key text-sm" />
            </div>
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-blueberry-900 tracking-tight">
                Applicant Portal Credentials
              </h4>
              <p class="text-[11px] text-blueberry-600">
                You will use these credentials to log in and track your application.
              </p>
            </div>
          </div>
          <span class="self-start sm:self-auto text-[10px] sm:text-[11px] font-semibold bg-apricot-100 text-apricot-800 border border-apricot-300 px-2.5 py-0.5 rounded-full shrink-0">
            Required for Login
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <!-- Email Address -->
          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-xs sm:text-sm font-semibold text-blueberry-800">
              Email Address <span class="text-red-500">*</span>
            </label>
            <div class="flex flex-col sm:flex-row items-stretch gap-2">
              <div class="relative flex-1 min-w-0">
                <InputText
                  v-model="emailUsername"
                  placeholder="juan.delacruz"
                  class="w-full pr-9 bg-white text-xs sm:text-sm"
                  :invalid="!!errors.email || emailStatus === 'taken'"
                  :class="{ '!border-green-500': emailStatus === 'available' && !errors.email }"
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2">
                  <i v-if="emailStatus === 'checking'" class="pi pi-spin pi-spinner text-blueberry-400 text-xs" />
                  <i v-else-if="emailStatus === 'available'" class="pi pi-check-circle text-green-500 text-xs" />
                  <i v-else-if="emailStatus === 'taken'" class="pi pi-times-circle text-red-500 text-xs" />
                </div>
              </div>

              <Select
                v-model="emailDomain"
                :options="domainOptions"
                option-label="label"
                option-value="value"
                class="w-full sm:w-44 bg-white text-xs sm:text-sm"
              />

              <InputText
                v-if="emailDomain === 'custom'"
                v-model="customDomain"
                placeholder="@domain.com"
                class="w-full sm:w-40 bg-white text-xs sm:text-sm"
              />
            </div>

            <p v-if="emailUsername" class="text-[11px] text-blueberry-600 mt-0.5">
              Your Login Email: <span class="font-bold text-blueberry-900 bg-white/80 px-1.5 py-0.5 rounded border border-apricot-200">{{ email }}</span>
            </p>
            <small v-if="errors.email" class="text-red-500 font-medium text-[11px]">{{ errors.email }}</small>
            <small v-else-if="emailStatus === 'taken'" class="text-red-600 font-semibold text-[11px]">
              <i class="pi pi-exclamation-circle text-[10px] mr-1" />{{ emailDuplicateMsg }}
            </small>
            <small v-else-if="emailStatus === 'available'" class="text-green-700 font-semibold text-[11px]">
              <i class="pi pi-check text-[10px] mr-1" />Email is available
            </small>
            <small v-else-if="emailStatus === 'checking'" class="text-blueberry-500 text-[11px]">
              Checking availability...
            </small>
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-semibold text-blueberry-800">
              Password <span class="text-red-500">*</span>
            </label>
            <Password
              v-model="password"
              placeholder="At least 8 characters"
              toggle-mask
              :feedback="false"
              fluid
              class="w-full"
              input-class="w-full bg-white text-xs sm:text-sm"
              :invalid="!!errors.password"
            />
            <small v-if="errors.password" class="text-red-500 font-medium text-[11px]">{{ errors.password }}</small>
            <span v-else class="text-[10px] sm:text-[11px] text-blueberry-500">Must be at least 8 characters</span>
          </div>

          <!-- Confirm Password -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-semibold text-blueberry-800">
              Confirm Password <span class="text-red-500">*</span>
            </label>
            <Password
              v-model="password_confirmation"
              placeholder="Re-enter your password"
              toggle-mask
              :feedback="false"
              fluid
              class="w-full"
              input-class="w-full bg-white text-xs sm:text-sm"
              :invalid="!!errors.password_confirmation"
            />
            <small v-if="errors.password_confirmation" class="text-red-500 font-medium text-[11px]">{{ errors.password_confirmation }}</small>
            <span v-else class="text-[10px] sm:text-[11px] text-blueberry-500">Re-type password to verify</span>
          </div>
        </div>
      </div>

      <!-- ─── 3. Contact Numbers ─────────────────────────────── -->
      <div>
        <h3 class="text-sm font-serif font-semibold text-blueberry-800 mb-3 flex items-center">
          <i class="pi pi-phone mr-2 text-apricot-500" />Contact Details
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <!-- Mobile -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">Mobile Number <span class="text-red-500">*</span></label>
            <InputText v-model="mobile" placeholder="+63 917 123 4567" :invalid="!!errors.mobile" class="w-full text-xs sm:text-sm" />
            <small v-if="errors.mobile" class="text-red-500 text-[11px]">{{ errors.mobile }}</small>
          </div>

          <!-- Phone -->
          <div class="flex flex-col gap-1">
            <label class="text-xs sm:text-sm font-medium text-blueberry-700">Landline / Alternative Phone</label>
            <InputText v-model="phone" placeholder="+63 2 8123 4567" class="w-full text-xs sm:text-sm" />
          </div>
        </div>
      </div>

      <!-- ─── Warnings ───────────────────────────────────────── -->
      <div
        v-if="emailStatus === 'taken'"
        class="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs"
      >
        <i class="pi pi-times-circle text-red-500 mt-0.5 text-base shrink-0" />
        <div>
          <p class="font-semibold text-red-800">Cannot proceed — Email already registered</p>
          <p class="text-red-600 mt-0.5">{{ emailDuplicateMsg }}</p>
        </div>
      </div>

      <div
        v-else-if="nameStatus === 'taken'"
        class="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs"
      >
        <i class="pi pi-exclamation-triangle text-amber-500 mt-0.5 text-base shrink-0" />
        <div>
          <p class="font-semibold text-amber-800">Possible duplicate registration</p>
          <p class="text-amber-700 mt-0.5">{{ nameDuplicateMsg }}</p>
          <p class="text-amber-600 mt-1 italic">You may still proceed if this is your first time applying.</p>
        </div>
      </div>
    </section>

    <!-- Navigation -->
    <div class="flex justify-end">
      <button
        type="submit"
        :disabled="emailStatus === 'taken' || emailStatus === 'checking'"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-white rounded-lg font-medium text-sm transition-colors disabled:cursor-not-allowed shadow-sm"
        :class="emailStatus === 'taken' ? 'bg-gray-300 text-gray-500' : 'bg-apricot-500 hover:bg-apricot-600'"
      >
        <i v-if="emailStatus === 'taken'" class="pi pi-lock text-xs" />
        {{ emailStatus === 'taken' ? 'Fix Email First' : 'Next' }}
        <i v-if="emailStatus !== 'taken'" class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </form>
</template>