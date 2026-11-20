<!-- src/public-apply/components/tabs/DocumentsTab.vue -->
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { computed, watch, ref } from 'vue'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'

import {
  documentsSchema,
  type DocumentsFormValues,
} from '@/features/applicants/schemas/applicant.schema'

const props = defineProps<{
  initialValues?: DocumentsFormValues | null
}>()

const emit = defineEmits<{
  (e: 'next', values: DocumentsFormValues): void
  (e: 'back'): void
  (e: 'validate', values: DocumentsFormValues | null): void
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

const { handleSubmit, defineField, errors, values, validate } = useForm<DocumentsFormValues>({
  validationSchema: toTypedSchema(documentsSchema),
  initialValues: {
    passport_number:   props.initialValues?.passport_number   ?? '',
    passport_expiry:   props.initialValues?.passport_expiry   ?? null,
    sss_number:        props.initialValues?.sss_number        ?? '',
    tin_number:        props.initialValues?.tin_number        ?? '',
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

const idPhotoFile = ref<File | null>(null)
const biodataFile = ref<File | null>(null)

function onPhotoSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    idPhotoFile.value = target.files[0]
  }
}

function onBiodataSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    biodataFile.value = target.files[0]
  }
}

watch(values, async () => {
  const result = await validate()
  emit('validate', result.valid ? ({
    ...values,
    id_photo_file: idPhotoFile.value ?? undefined,
    biodata_file: biodataFile.value ?? undefined,
  } as DocumentsFormValues) : null)
}, { deep: true })

const onSubmit = handleSubmit((formValues) => {
  emit('next', {
    ...formValues,
    id_photo_file: idPhotoFile.value ?? undefined,
    biodata_file: biodataFile.value ?? undefined,
  })
})
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4">
        <i class="pi pi-id-card mr-2 text-apricot-500" />Passport & Identification Numbers
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Passport Number</label>
          <InputText v-model="passport_number" placeholder="P1234567A" />
          <small class="text-red-500">{{ errors.passport_number }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Passport Expiry Date</label>
          <DatePicker v-model="passportExpiryProxy" date-format="yy-mm-dd" placeholder="YYYY-MM-DD" show-icon class="w-full" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">SSS Number</label>
          <InputText v-model="sss_number" placeholder="12-3456789-0" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">TIN Number</label>
          <InputText v-model="tin_number" placeholder="123-456-789-000" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">PhilHealth Number</label>
          <InputText v-model="philhealth_number" placeholder="12-345678901-2" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Pag-IBIG (HDMF) Number</label>
          <InputText v-model="pagibig_number" placeholder="1234-5678-9012" />
        </div>
      </div>
    </section>

    <!-- Document Attachments Section -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4">
        <i class="pi pi-upload mr-2 text-apricot-500" />Document Attachments
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5 p-4 border border-appleCore-100 rounded-xl bg-appleCore-50/40">
          <label class="text-sm font-medium text-blueberry-700">2x2 Photo (White Background)</label>
          <input
            type="file"
            accept="image/*"
            class="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            @change="onPhotoSelected"
          />
          <span v-if="idPhotoFile" class="text-xs text-emerald-600 font-medium mt-1">
            <i class="pi pi-check text-[10px]" /> {{ idPhotoFile.name }}
          </span>
        </div>

        <div class="flex flex-col gap-1.5 p-4 border border-appleCore-100 rounded-xl bg-appleCore-50/40">
          <label class="text-sm font-medium text-blueberry-700">Resume / Biodata (PDF/Image)</label>
          <input
            type="file"
            accept=".pdf,image/*"
            class="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            @change="onBiodataSelected"
          />
          <span v-if="biodataFile" class="text-xs text-emerald-600 font-medium mt-1">
            <i class="pi pi-check text-[10px]" /> {{ biodataFile.name }}
          </span>
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
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-apricot-500 text-white rounded-lg
               font-medium text-sm hover:bg-apricot-600 transition-colors"
      >
        Next
        <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </form>
</template>