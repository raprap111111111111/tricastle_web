<!-- src/features/applicants/components/tabs/DocumentsTab.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import ProgressSpinner from 'primevue/progressspinner'
import axios from 'axios'

import { documentsSchema, type DocumentsFormValues } from '../../schemas/applicant.schema'
import type { Applicant } from '../../types'

const props = defineProps<{
  initialValues?: Partial<Applicant> & {
    id_photo_file?: File | null
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
      id_photo_file:     props.initialValues?.id_photo_file     ?? null,
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

watch(values, (v) => emit('validate', v as DocumentsFormValues), { deep: true })

// ─── 🖼️ 2x2 ID Photo Upload State ─────────────────────────────────────────────
const photoInputRef = ref<HTMLInputElement | null>(null)
const idPhotoFile   = ref<File | null>(props.initialValues?.id_photo_file ?? null)
const photoPreview  = ref<string | null>(null)

function triggerPhotoInput() { photoInputRef.value?.click() }

function onPhotoChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file  = input.files?.[0]
  if (file) applyPhoto(file)
}

function applyPhoto(file: File) {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowed.includes(file.type)) {
    toast.add({ severity: 'error', summary: 'Invalid Image', detail: 'Only JPG or PNG images are allowed.', life: 4000 })
    return
  }
  idPhotoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
  setFieldValue('id_photo_file', file)
}

function clearPhotoFile() {
  idPhotoFile.value  = null
  photoPreview.value = null
  setFieldValue('id_photo_file', null)
  if (photoInputRef.value) photoInputRef.value.value = ''
}

// ─── Biodata Upload State ─────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging   = ref(false)
const biodataFile  = ref<File | null>(props.initialValues?.biodata_file ?? null)
const biodataNotes = ref<string>(props.initialValues?.biodata_notes ?? '')

function triggerFileInput() { fileInputRef.value?.click() }

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
    toast.add({ severity: 'error', summary: 'Invalid File', detail: 'Only PDF, JPG, or PNG files are allowed.', life: 4000 })
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
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

watch(biodataNotes, (v) => setFieldValue('biodata_notes', v || null))


// ════════════════════════════════════════════════════════════════════════════
// 🖨️ PHYSICAL SCANNER LOGIC (NAPS2 Integration)
// ════════════════════════════════════════════════════════════════════════════
const helperApi = axios.create({ baseURL: 'http://localhost:5555', timeout: 120000 })

const scanDialogVisible = ref(false)
const scanTarget        = ref<'photo' | 'biodata' | null>(null)
const checkingHelper    = ref(false)
const helperInstalled   = ref(false)
const scanners          = ref<Array<{ name: string }>>([])
const selectedScanner   = ref('')
const scanning          = ref(false)

const scanResolution = ref(300)
const scanColorMode  = ref('Color')

const resolutionOptions = [
  { label: '📄 Draft (150 DPI)',  value: 150 },
  { label: '📋 Normal (300 DPI)', value: 300 },
  { label: '⭐ High (600 DPI)',    value: 600 },
]
const colorModeOptions = [
  { label: '🎨 Color',            value: 'Color' },
  { label: '⚫ Grayscale',        value: 'Gray' },
  { label: '⬛ Black & White',    value: 'BW' },
]

async function openScanner(target: 'photo' | 'biodata') {
  scanTarget.value = target
  scanDialogVisible.value = true
  await checkHelper()
}

async function checkHelper() {
  checkingHelper.value = true
  helperInstalled.value = false
  try {
    const { data } = await helperApi.get('/health')
    if (data.status === 'ok') {
      helperInstalled.value = true
      await loadScanners()
    }
  } catch {
    helperInstalled.value = false
  } finally {
    checkingHelper.value = false
  }
}

async function loadScanners() {
  try {
    const { data } = await helperApi.get('/scanners')
    scanners.value = data.scanners ?? []
    if (scanners.value.length > 0) selectedScanner.value = scanners.value[0].name
  } catch {
    scanners.value = []
  }
}

async function executeScan() {
  scanning.value = true
  try {
    toast.add({ severity: 'info', summary: '📄 Scanning...', detail: 'Scanner is capturing document. Please wait...', life: 5000 })

    // If scanning a photo, request JPG. If biodata, request PDF.
    const format = scanTarget.value === 'photo' ? 'jpg' : 'pdf'

    const { data: scanData } = await helperApi.post('/scan', {
      device:     selectedScanner.value,
      resolution: scanResolution.value,
      colorMode:  scanColorMode.value,
      format:     format,
    })

    if (!scanData.success) throw new Error('Scan failed')

    // Fetch the blob from the local helper server
    const response = await fetch(scanData.data)
    const blob     = await response.blob()
    
    // Create File object
    const filename = scanTarget.value === 'photo' ? `scanned_photo_${Date.now()}.jpg` : `scanned_biodata_${Date.now()}.pdf`
    const file = new File([blob], filename, { type: scanData.mimeType ?? (format === 'jpg' ? 'image/jpeg' : 'application/pdf') })

    // Apply to VeeValidate Form State
    if (scanTarget.value === 'photo') {
      applyPhoto(file)
    } else {
      applyFile(file)
    }

    toast.add({ severity: 'success', summary: 'Scan Complete', detail: 'File added to form successfully!', life: 3000 })
    scanDialogVisible.value = false
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Scan Failed', detail: err.message ?? 'Scanner error', life: 5000 })
  } finally {
    scanning.value = false
  }
}

// ─── Submit ───────────────────────────────────────────────────────────────────
const onSubmit = handleSubmit((values) => {
  emit('next', values)
})
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">

    <!-- ─── 🖼️ 2x2 ID Photo Upload ───────────────────────────────────── -->
    <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-camera text-apricot-500" />
        2×2 ID Photo / Profile Picture
        <span class="text-xs font-sans font-normal text-blueberry-400 normal-case tracking-normal ml-1">(optional)</span>
      </h3>
      <p class="text-xs text-blueberry-400 mb-4">
        Used on table hover previews and profile sheets. White background preferred.
      </p>

      <div class="flex items-center gap-5">
        <!-- Photo Preview Circle -->
        <div class="w-24 h-24 rounded-2xl border-2 border-dashed border-appleCore-200 bg-appleCore-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
          <img v-if="photoPreview" :src="photoPreview" alt="2x2 Preview" class="w-full h-full object-cover" />
          <div v-else class="flex flex-col items-center gap-1 text-blueberry-400">
            <i class="pi pi-image text-2xl" />
            <span class="text-[10px]">2×2 Photo</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex flex-col items-start gap-2">
          <input ref="photoInputRef" type="file" accept="image/jpeg,image/png,image/jpg" class="hidden" @change="onPhotoChange" />

          <div class="flex items-center gap-2">
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-appleCore-200 bg-white text-xs font-semibold text-blueberry-700 hover:bg-appleCore-50 transition-colors shadow-2xs" @click="triggerPhotoInput">
              <i class="pi pi-upload text-xs text-apricot-500" />
              {{ idPhotoFile ? 'Replace Photo' : 'Upload File' }}
            </button>
            
            <!-- 🖨️ SCAN BUTTON -->
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors shadow-2xs" @click="openScanner('photo')">
              <i class="pi pi-print text-xs text-purple-500" />
              Scan Photo
            </button>
          </div>

          <button v-if="idPhotoFile" type="button" class="text-xs text-red-500 hover:underline" @click="clearPhotoFile">Remove photo</button>
          <p class="text-[11px] text-blueberry-400">JPG or PNG · max 5MB</p>
        </div>
      </div>
    </section>

    <!-- ─── Passport ────────────────────────────────────────────────────────── -->
    <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
        <i class="pi pi-id-card text-apricot-500" />
        Passport Information
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">Passport Number</label>
          <InputText v-model="passport_number" placeholder="e.g. P1234567A" class="w-full" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">Passport Expiry Date</label>
          <DatePicker v-model="passportExpiryProxy" date-format="yy-mm-dd" placeholder="YYYY-MM-DD" show-icon class="w-full" />
          <small v-if="errors.passport_expiry" class="text-red-500 text-xs">{{ errors.passport_expiry }}</small>
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
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 flex items-center gap-2">
          <i class="pi pi-file-pdf text-apricot-500" />
          Biodata Document
          <span class="text-xs font-sans font-normal text-blueberry-400 normal-case tracking-normal ml-1">(optional)</span>
        </h3>
        
        <!-- 🖨️ SCAN BUTTON -->
        <Button 
          icon="pi pi-print" 
          label="Scan Biodata" 
          class="!bg-purple-500 !border-purple-500 !text-white hover:!bg-purple-600 !py-1.5 !px-3 !text-xs" 
          @click="openScanner('biodata')"
        />
      </div>

      <p class="text-xs text-blueberry-400 mb-4">
        Upload now or later from the applicant's profile. Accepted: PDF, JPG, PNG — max 10MB.
      </p>

      <!-- Drop zone -->
      <div
        class="relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer select-none"
        :class="isDragging ? 'border-apricot-400 bg-apricot-50' : biodataFile ? 'border-green-300 bg-green-50/50' : 'border-appleCore-200 hover:border-apricot-300 hover:bg-apricot-50/20'"
        @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="onDrop" @click="triggerFileInput"
      >
        <input ref="fileInputRef" type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="onFileChange" />

        <div v-if="!biodataFile" class="flex flex-col items-center justify-center py-10 gap-2">
          <div class="w-12 h-12 rounded-full bg-appleCore-100 flex items-center justify-center">
            <i class="pi pi-upload text-blueberry-400 text-xl" />
          </div>
          <p class="text-sm font-medium text-blueberry-700">
            Drop biodata here, <span class="text-apricot-600 underline underline-offset-2">browse file</span>, or use Scan.
          </p>
        </div>

        <div v-else class="flex items-center gap-3 p-4" @click.stop>
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" :class="biodataFile.type === 'application/pdf' ? 'bg-red-100' : 'bg-blue-100'">
            <i class="text-xl" :class="biodataFile.type === 'application/pdf' ? 'pi pi-file-pdf text-red-600' : 'pi pi-image text-blue-600'" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-blueberry-800 truncate">{{ biodataFile.name }}</p>
            <p class="text-xs text-blueberry-500 mt-0.5">
              {{ formatFileSize(biodataFile.size) }} · <button type="button" class="text-apricot-600 hover:underline" @click="triggerFileInput">Replace</button>
            </p>
          </div>
          <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-red-100 text-blueberry-400 hover:text-red-600 transition-colors" @click="clearBiodataFile">
            <i class="pi pi-times text-sm" />
          </button>
        </div>
      </div>

      <!-- Notes -->
      <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="biodataFile" class="mt-3">
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Notes <span class="font-normal text-blueberry-400 normal-case tracking-normal ml-1">(optional)</span>
          </label>
          <InputText v-model="biodataNotes" placeholder="e.g. Scanned copy — original submitted on intake day" class="w-full" />
        </div>
      </Transition>
    </section>

    <!-- ─── Navigation ───────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between pt-2">
      <button type="button" class="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-blueberry-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors" @click="emit('back')">
        <i class="pi pi-arrow-left text-xs" /> Back
      </button>
      <button type="submit" class="inline-flex items-center gap-2 px-6 py-2.5 bg-apricot-500 text-white rounded-xl font-medium text-sm hover:bg-apricot-600 transition-colors">
        Next <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>

    <!-- 🖨️ SCANNER DIALOG (Embedded) -->
    <Dialog v-model:visible="scanDialogVisible" modal :closable="!scanning" :style="{ width: '520px' }" :pt="{ header: { class: '!bg-purple-50 !border-b !border-purple-100' } }">
      <template #header>
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center">
            <i class="pi pi-print text-white" />
          </div>
          <div>
            <h3 class="font-serif font-bold text-blueberry-800">
              Scan {{ scanTarget === 'photo' ? '2x2 Photo' : 'Biodata' }}
            </h3>
            <p class="text-xs text-blueberry-500 font-normal">Connects to your local physical scanner</p>
          </div>
        </div>
      </template>

      <div class="mt-4">
        <!-- Checking helper -->
        <div v-if="checkingHelper" class="flex flex-col items-center py-8 gap-3">
          <ProgressSpinner style="width: 40px" strokeWidth="4" />
          <p class="text-sm text-blueberry-500">Connecting to scanner...</p>
        </div>

        <!-- Helper not installed -->
        <div v-else-if="!helperInstalled" class="flex flex-col gap-4">
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 class="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <i class="pi pi-exclamation-triangle" /> Scanner Helper Not Running
            </h4>
            <p class="text-sm text-amber-800 mb-3">
              Please make sure the Tricastle Scan Helper (NAPS2 bridge) is running on <code class="bg-amber-100 px-1.5 py-0.5 rounded text-xs">localhost:5555</code>.
            </p>
          </div>
          <div class="flex gap-2">
            <a href="https://www.naps2.com/download" target="_blank" class="flex-1">
              <Button label="Install NAPS2" icon="pi pi-external-link" outlined class="w-full !border-purple-300 !text-purple-600" />
            </a>
            <Button label="Retry" icon="pi pi-refresh" class="!bg-purple-500 !border-purple-500 flex-1" @click="checkHelper" />
          </div>
        </div>

        <!-- Scanner ready -->
        <div v-else class="flex flex-col gap-4">
          <div v-if="scanning" class="rounded-xl p-6 text-center border bg-blue-50 border-blue-200">
            <div class="flex justify-center mb-3">
              <ProgressSpinner style="width: 40px" strokeWidth="4" />
            </div>
            <p class="text-sm font-semibold text-blue-800">📄 Scanning...</p>
            <p class="text-xs mt-1 text-blue-600">Scanner is capturing the document</p>
          </div>

          <template v-else-if="scanners.length > 0">
            <div>
              <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Scanner Device</label>
              <Select v-model="selectedScanner" :options="scanners" option-label="name" option-value="name" class="w-full" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Resolution</label>
                <Select v-model="scanResolution" :options="resolutionOptions" option-label="label" option-value="value" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Color</label>
                <Select v-model="scanColorMode" :options="colorModeOptions" option-label="label" option-value="value" class="w-full" />
              </div>
            </div>
          </template>

          <div v-else-if="scanners.length === 0 && !scanning" class="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p class="text-sm text-amber-800 mb-2">⚠️ No USB scanners detected</p>
            <p class="text-xs text-amber-700 mb-2">Make sure your scanner is powered on and connected.</p>
            <Button label="Refresh" icon="pi pi-refresh" text size="small" @click="loadScanners" />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text @click="scanDialogVisible = false" :disabled="scanning" />
        <Button v-if="helperInstalled && scanners.length > 0 && !scanning" label="Start Scan" icon="pi pi-play" class="!bg-purple-500 !border-purple-500" @click="executeScan" />
      </template>
    </Dialog>

  </form>
</template>