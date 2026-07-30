<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { computed, ref, watch, onUnmounted } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import type { PersonalFormValues } from '../../schemas/applicant.schema'
import { personalSchema } from '../../schemas/applicant.schema'
import { useApplicantStore } from '../../stores/applicant.store'
import type { Applicant } from '../../types'

const props = defineProps<{
  initialValues?: Partial<Applicant> | PersonalFormValues
}>()

const emit = defineEmits<{
  (e: 'next', values: PersonalFormValues): void
  (e: 'validate', values: PersonalFormValues | null): void
}>()

const store = useApplicantStore()

// ─── Helpers ────────────────────────────────────────────
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

// ─── Form ───────────────────────────────────────────────
const { handleSubmit, defineField, errors, values, validate } = useForm<PersonalFormValues>({
  validationSchema: toTypedSchema(personalSchema),
  initialValues: {
    first_name:         (props.initialValues as any)?.first_name         ?? '',
    middle_name:        (props.initialValues as any)?.middle_name        ?? '',
    last_name:          (props.initialValues as any)?.last_name          ?? '',
    suffix:             (props.initialValues as any)?.suffix             ?? '',
    email:              (props.initialValues as any)?.email              ?? '',
    phone:              (props.initialValues as any)?.phone              ?? '',
    mobile:             (props.initialValues as any)?.mobile             ?? '',
    date_of_birth:      (props.initialValues as any)?.date_of_birth      ?? null,
    gender:             (props.initialValues as any)?.gender             ?? null,
    civil_status:       (props.initialValues as any)?.civil_status       ?? null,
    number_of_children: (props.initialValues as any)?.number_of_children ?? 0,
    nationality:        (props.initialValues as any)?.nationality        ?? 'Filipino',
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

const dobProxy = computed<Date | null>({
  get: () => toDate(date_of_birth.value),
  set: (v) => { date_of_birth.value = toISO(v) },
})

const genderOptions = [
  { label: 'Male',   value: 'male'   },
  { label: 'Female', value: 'female' },
]

const civilOptions = [
  { label: 'Single',    value: 'single'    },
  { label: 'Married',   value: 'married'   },
  { label: 'Widowed',   value: 'widowed'   },
  { label: 'Separated', value: 'separated' },
  { label: 'Divorced',  value: 'divorced'  },
]

// ─── Real-time Duplicate Check ──────────────────────────
type CheckStatus = 'idle' | 'checking' | 'available' | 'taken'

const emailStatus = ref<CheckStatus>('idle')
const emailDuplicateMsg = ref<string>('')

const nameStatus = ref<CheckStatus>('idle')
const nameDuplicateMsg = ref<string>('')

let emailTimer: number | undefined
let nameTimer: number | undefined

// Email check
watch(email, (newEmail) => {
  if (emailTimer) window.clearTimeout(emailTimer)
  emailStatus.value = 'idle'
  emailDuplicateMsg.value = ''

  if (!newEmail || !newEmail.includes('@') || newEmail.length < 5) return

  emailStatus.value = 'checking'
  emailTimer = window.setTimeout(async () => {
    try {
      const result = await store.checkDuplicates({ email: newEmail })
      const emailDup = result.duplicates.find((d) => d.type === 'email')
      if (emailDup) {
        emailStatus.value = 'taken'
        emailDuplicateMsg.value = `Already used by ${emailDup.applicant.full_name} (${emailDup.applicant.applicant_code})`
      } else {
        emailStatus.value = 'available'
      }
    } catch {
      emailStatus.value = 'idle'
    }
  }, 600)
})

// Name + DOB check
watch([first_name, last_name, date_of_birth], async () => {
  if (nameTimer) window.clearTimeout(nameTimer)
  nameStatus.value = 'idle'
  nameDuplicateMsg.value = ''

  const fn = first_name.value?.trim()
  const ln = last_name.value?.trim()
  const dob = date_of_birth.value

  if (!fn || !ln || !dob) return

  nameStatus.value = 'checking'
  nameTimer = window.setTimeout(async () => {
    try {
      const result = await store.checkDuplicates({
        first_name: fn,
        last_name:  ln,
        date_of_birth: dob,
      })
      const nameDup = result.duplicates.find(
        (d) => d.type === 'similar_person' || d.type === 'name_in_batch',
      )
      if (nameDup) {
        nameStatus.value = 'taken'
        nameDuplicateMsg.value = `Possible duplicate: ${nameDup.applicant.full_name} (${nameDup.applicant.applicant_code})`
      } else {
        nameStatus.value = 'available'
      }
    } catch {
      nameStatus.value = 'idle'
    }
  }, 800)
})

onUnmounted(() => {
  if (emailTimer) window.clearTimeout(emailTimer)
  if (nameTimer) window.clearTimeout(nameTimer)
})

// ─── Emit validation status on every change ────────────
watch(values, async () => {
  const result = await validate()
  emit('validate', result.valid ? { ...values } as PersonalFormValues : null)
}, { deep: true, immediate: false })

const onSubmit = handleSubmit((formValues) => {
  // Block submit if email is taken
  if (emailStatus.value === 'taken') {
    return
  }
  emit('next', formValues)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4">
        <i class="pi pi-user mr-2" />Personal Information
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- First Name -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">
            First Name <span class="text-red-500">*</span>
          </label>
          <InputText v-model="first_name" placeholder="Juan" :invalid="!!errors.first_name" />
          <small class="text-red-500">{{ errors.first_name }}</small>
        </div>

        <!-- Middle Name -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Middle Name</label>
          <InputText v-model="middle_name" placeholder="Santos" />
        </div>

        <!-- Last Name -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">
            Last Name <span class="text-red-500">*</span>
          </label>
          <InputText v-model="last_name" placeholder="Dela Cruz" :invalid="!!errors.last_name" />
          <small class="text-red-500">{{ errors.last_name }}</small>
        </div>

        <!-- Suffix -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Suffix</label>
          <InputText v-model="suffix" placeholder="Jr., Sr., III" />
        </div>

        <!-- Email (with real-time check) -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">
            Email <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <InputText
              v-model="email"
              type="email"
              placeholder="juan@example.com"
              class="w-full pr-9"
              :invalid="!!errors.email || emailStatus === 'taken'"
              :class="{
                '!border-green-500': emailStatus === 'available' && !errors.email,
              }"
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2">
              <i v-if="emailStatus === 'checking'" class="pi pi-spin pi-spinner text-blueberry-400 text-sm" />
              <i v-else-if="emailStatus === 'available'" class="pi pi-check-circle text-green-500 text-sm" />
              <i v-else-if="emailStatus === 'taken'" class="pi pi-times-circle text-red-500 text-sm" />
            </div>
          </div>
          <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
          <small v-else-if="emailStatus === 'taken'" class="text-red-500">
            <i class="pi pi-exclamation-circle text-[10px] mr-1" />
            {{ emailDuplicateMsg }}
          </small>
          <small v-else-if="emailStatus === 'available'" class="text-green-600">
            <i class="pi pi-check text-[10px] mr-1" />
            Email is available
          </small>
          <small v-else-if="emailStatus === 'checking'" class="text-blueberry-400">
            Checking availability...
          </small>
        </div>

        <!-- Phone -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Phone</label>
          <InputText v-model="phone" placeholder="+63 912 345 6789" :invalid="!!errors.phone" />
          <small class="text-red-500">{{ errors.phone }}</small>
        </div>

        <!-- Mobile -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Mobile</label>
          <InputText v-model="mobile" placeholder="+63 917 123 4567" />
        </div>

        <!-- Gender -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Gender</label>
          <Select
            v-model="gender"
            :options="genderOptions"
            option-label="label"
            option-value="value"
            placeholder="Select gender"
          />
        </div>

        <!-- Civil Status -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Civil Status</label>
          <Select
            v-model="civil_status"
            :options="civilOptions"
            option-label="label"
            option-value="value"
            placeholder="Select status"
          />
        </div>

        <!-- Date of Birth (with duplicate check) -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Date of Birth</label>
          <DatePicker
            v-model="dobProxy"
            date-format="yy-mm-dd"
            placeholder="YYYY-MM-DD"
            show-icon
          />
          <small v-if="errors.date_of_birth" class="text-red-500">{{ errors.date_of_birth }}</small>
          <small v-else-if="nameStatus === 'taken'" class="text-yellow-600">
            <i class="pi pi-exclamation-triangle text-[10px] mr-1" />
            {{ nameDuplicateMsg }}
          </small>
          <small v-else-if="nameStatus === 'checking'" class="text-blueberry-400">
            Checking for duplicates...
          </small>
        </div>

        <!-- Number of Children -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Number of Children</label>
          <InputNumber v-model="number_of_children" :min="0" :max="30" show-buttons />
        </div>

        <!-- Nationality -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Nationality</label>
          <InputText v-model="nationality" placeholder="Filipino" />
        </div>
      </div>

      <!-- ─── Duplicate Warning Banner ─────────────────── -->
      <div
        v-if="emailStatus === 'taken'"
        class="mt-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
      >
        <i class="pi pi-times-circle text-red-500 text-sm mt-0.5" />
        <div class="flex-1 text-xs">
          <p class="font-semibold text-red-800">Cannot proceed — Email already exists</p>
          <p class="text-red-600 mt-0.5">{{ emailDuplicateMsg }}</p>
        </div>
      </div>

      <div
        v-else-if="nameStatus === 'taken'"
        class="mt-4 flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <i class="pi pi-exclamation-triangle text-yellow-500 text-sm mt-0.5" />
        <div class="flex-1 text-xs">
          <p class="font-semibold text-yellow-800">Possible duplicate person</p>
          <p class="text-yellow-700 mt-0.5">{{ nameDuplicateMsg }}</p>
          <p class="text-yellow-600 mt-1 italic">You may still proceed if this is a different person.</p>
        </div>
      </div>
    </section>

    <div class="flex justify-end">
      <button
        type="submit"
        :disabled="emailStatus === 'taken' || emailStatus === 'checking'"
        class="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-lg
               font-medium text-sm transition-colors disabled:cursor-not-allowed"
        :class="emailStatus === 'taken'
          ? 'bg-gray-300 text-gray-500'
          : 'bg-apricot-500 hover:bg-apricot-600'"
      >
        <i v-if="emailStatus === 'taken'" class="pi pi-lock text-xs" />
        {{ emailStatus === 'taken' ? 'Fix Email First' : 'Next' }}
        <i v-if="emailStatus !== 'taken'" class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </form>
</template>