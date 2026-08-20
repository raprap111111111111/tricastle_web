<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'

import { documentsSchema, type DocumentsFormValues } from '../../schemas/applicant.schema'
import type { Applicant } from '../../types'

const props = defineProps<{
  initialValues?: Partial<Applicant> & {
    biodata_file?:  File | null
    biodata_notes?: string | null
  }
}>()

const emit = defineEmits<{
  next:     [values: DocumentsFormValues]
  back:     []
  validate: [values: DocumentsFormValues | null]
}>()

const toast = useToast()

// ─── Date helpers ─────────────────────────────────────────────────────────────
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

// ─── Form ─────────────────────────────────────────────────────────────────────
const { handleSubmit, defineField, setFieldValue, errors, values } =
  useForm<DocumentsFormValues>({
    validationSchema: toTypedSchema(documentsSchema),
    initialValues: {
      passport_number:   props.initialValues?.passport_number   ?? '',
      passport_expiry:   props.initialValues?.passport_expiry   ?? null,
      sss_number:        props.initialValues?.sss_number        ?? '',
      tin_number:        props.initialValues?.tin_number        ?? '',
      philhealth_number: props.initialValues?.philhealth_number ?? '',
      pagibig_number:    props.initialValues?.pagibig_number    ?? '',
      biodata_file:      props.initialValues?.biodata_file      ?? null,
      biodata_notes:     props.initialValues?.biodata_notes     ?? null,
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

// ─── Emit validate on change ──────────────────────────────────────────────────
watch(values, (v) => emit('validate', v as DocumentsFormValues), { deep: true })

// ─── Biodata upload state ─────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging   = ref(false)
const biodataFile  = ref<File | null>(props.initialValues?.biodata_file ?? null)
const biodataNotes = ref<string>(props.initialValues?.biodata_notes ?? '')

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  if (file) applyFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) applyFile(file)
}

function applyFile(file: File) {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

  if (!allowed.includes(file.type)) {
    toast.add({
      severity: 'error',
      summary:  'Invalid File Type',
      detail:   'Only PDF, JPG, or PNG files are allowed for biodata.',
      life:     4000,
    })
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.add({
      severity: 'error',
      summary:  'File Too Large',
      detail:   'Biodata file must be under 10MB.',
      life:     4000,
    })
    return
  }

  biodataFile.value = file
  setFieldValue('biodata_file', file)
}

function clearBiodataFile() {
  biodataFile.value  = null
  biodataNotes.value = ''
  setFieldValue('biodata_file',  null)
  setFieldValue('biodata_notes', null)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

watch(biodataNotes, (v) => setFieldValue('biodata_notes', v || null))

// ─── Submit ───────────────────────────────────────────────────────────────────
const onSubmit = handleSubmit((values) => {
  emit('next', values)
})
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">

    <!-- ─── Passport ────────────────────────────────────────────────────────── -->
    <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
        <i class="pi pi-id-card text-apricot-500" />
        Passport Information
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">
            Passport Number
          </label>
          <InputText
            v-model="passport_number"
            placeholder="e.g. P1234567A"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">
            Passport Expiry Date
          </label>
          <DatePicker
            v-model="passportExpiryProxy"
            date-format="yy-mm-dd"
            placeholder="YYYY-MM-DD"
            show-icon
            class="w-full"
          />
          <small v-if="errors.passport_expiry" class="text-red-500 text-xs">
            {{ errors.passport_expiry }}
          </small>
        </div>
      </div>
    </section>

    <!-- ─── Government IDs ──────────────────────────────────────────────────── -->
    <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
        <i class="pi pi-file text-apricot-500" />
        Government IDs
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">SSS Number</label>
          <InputText v-model="sss_number" placeholder="XX-XXXXXXX-X" class="w-full" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">TIN Number</label>
          <InputText v-model="tin_number" placeholder="XXX-XXX-XXX-XXX" class="w-full" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">PhilHealth Number</label>
          <InputText v-model="philhealth_number" placeholder="XX-XXXXXXXXX-X" class="w-full" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">Pag-IBIG Number</label>
          <InputText v-model="pagibig_number" placeholder="XXXX-XXXX-XXXX" class="w-full" />
        </div>
      </div>
    </section>

    <!-- ─── Biodata Upload ───────────────────────────────────────────────────── -->
    <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-file-pdf text-apricot-500" />
        Biodata Document
        <span class="text-xs font-sans font-normal text-blueberry-400 normal-case tracking-normal ml-1">
          (optional)
        </span>
      </h3>
      <p class="text-xs text-blueberry-400 mb-4">
        Upload now or later from the applicant's profile.
        Accepted: PDF, JPG, PNG — max 10MB.
      </p>

      <!-- Drop zone -->
      <div
        class="relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer select-none"
        :class="isDragging
          ? 'border-apricot-400 bg-apricot-50'
          : biodataFile
            ? 'border-green-300 bg-green-50/50'
            : 'border-appleCore-200 hover:border-apricot-300 hover:bg-apricot-50/20'"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          class="hidden"
          @change="onFileChange"
        />

        <!-- Empty state -->
        <div
          v-if="!biodataFile"
          class="flex flex-col items-center justify-center py-10 gap-2"
        >
          <div class="w-12 h-12 rounded-full bg-appleCore-100 flex items-center justify-center">
            <i class="pi pi-upload text-blueberry-400 text-xl" />
          </div>
          <p class="text-sm font-medium text-blueberry-700">
            Drop biodata here or
            <span class="text-apricot-600 underline underline-offset-2">browse</span>
          </p>
          <p class="text-xs text-blueberry-400">PDF, JPG, PNG · max 10MB</p>
        </div>

        <!-- File selected -->
        <div v-else class="flex items-center gap-3 p-4" @click.stop>
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            :class="biodataFile.type === 'application/pdf' ? 'bg-red-100' : 'bg-blue-100'"
          >
            <i
              class="text-xl"
              :class="biodataFile.type === 'application/pdf'
                ? 'pi pi-file-pdf text-red-600'
                : 'pi pi-image text-blue-600'"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-blueberry-800 truncate">
              {{ biodataFile.name }}
            </p>
            <p class="text-xs text-blueberry-500 mt-0.5">
              {{ formatFileSize(biodataFile.size) }} ·
              <button
                type="button"
                class="text-apricot-600 hover:underline"
                @click="triggerFileInput"
              >
                Replace
              </button>
            </p>
          </div>
          <button
            type="button"
            class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                   hover:bg-red-100 text-blueberry-400 hover:text-red-600 transition-colors"
            @click="clearBiodataFile"
          >
            <i class="pi pi-times text-sm" />
          </button>
        </div>
      </div>

      <!-- Notes -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="biodataFile" class="mt-3">
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Notes
            <span class="font-normal text-blueberry-400 normal-case tracking-normal ml-1">(optional)</span>
          </label>
          <InputText
            v-model="biodataNotes"
            placeholder="e.g. Scanned copy — original submitted on intake day"
            class="w-full"
          />
        </div>
      </Transition>

      <!-- Helper -->
      <div class="flex items-start gap-1.5 mt-3 text-[11px] text-blueberry-400">
        <i class="pi pi-info-circle text-[10px] mt-0.5 flex-shrink-0" />
        <span>
          File uploads <strong>after</strong> the applicant record is saved.
          If it fails, the applicant is still created and you can retry from their profile.
        </span>
      </div>
    </section>

    <!-- ─── Navigation ───────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between pt-2">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-blueberry-700
               rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
        @click="emit('back')"
      >
        <i class="pi pi-arrow-left text-xs" />
        Back
      </button>
      <button
        type="submit"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-apricot-500 text-white
               rounded-xl font-medium text-sm hover:bg-apricot-600 transition-colors"
      >
        Next
        <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>

  </form>
</template>