<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import { documentsSchema, type DocumentsFormValues } from '../../schemas/applicant.schema'
import type { Applicant } from '../../types'

const props = defineProps<{
  initialValues?: Partial<Applicant>
}>()

const emit = defineEmits<{
  (e: 'next', values: DocumentsFormValues): void
  (e: 'back'): void
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

const { handleSubmit, defineField, errors } = useForm<DocumentsFormValues>({
  validationSchema: toTypedSchema(documentsSchema),
  initialValues: {
    passport_number:   props.initialValues?.passport_number   ?? '',
    passport_expiry:   props.initialValues?.passport_expiry   ?? null,
    sss_number:        props.initialValues?.sss_number        ?? '',
    tin_number:        props.initialValues?.tin_number         ?? '',
    philhealth_number: props.initialValues?.philhealth_number ?? '',
    pagibig_number:    props.initialValues?.pagibig_number    ?? '',
  },
})

const [passport_number]   = defineField('passport_number')
const [passport_expiry]   = defineField('passport_expiry')
const [sss_number]        = defineField('sss_number')
const [tin_number]        = defineField('tin_number')
const [philhealth_number] = defineField('philhealth_number')
const [pagibig_number]    = defineField('pagibig_number')

const passportExpiryProxy = computed<Date | null>({
  get: () => toDate(passport_expiry.value),
  set: (v) => { passport_expiry.value = toISO(v) },
})

const onSubmit = handleSubmit((values) => {
  emit('next', values)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
    <section class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">
        <i class="pi pi-id-card mr-2" />Passport Information
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Passport Number</label>
          <InputText v-model="passport_number" placeholder="P1234567A" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Passport Expiry</label>
          <DatePicker
            v-model="passportExpiryProxy"
            date-format="yy-mm-dd"
            placeholder="YYYY-MM-DD"
            show-icon
          />
          <small class="text-red-500">{{ errors.passport_expiry }}</small>
        </div>
      </div>
    </section>

    <section class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">
        <i class="pi pi-file mr-2" />Government IDs
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">SSS Number</label>
          <InputText v-model="sss_number" placeholder="XX-XXXXXXX-X" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">TIN Number</label>
          <InputText v-model="tin_number" placeholder="XXX-XXX-XXX-XXX" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">PhilHealth Number</label>
          <InputText v-model="philhealth_number" placeholder="XX-XXXXXXXXX-X" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Pag-IBIG Number</label>
          <InputText v-model="pagibig_number" placeholder="XXXX-XXXX-XXXX" />
        </div>
      </div>
    </section>

    <div class="flex justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg
               font-medium text-sm hover:bg-gray-300 transition-colors"
        @click="emit('back')"
      >
        <i class="pi pi-arrow-left text-xs" />
        Back
      </button>
      <button
        type="submit"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg
               font-medium text-sm hover:bg-indigo-700 transition-colors"
      >
        Next
        <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </form>
</template>