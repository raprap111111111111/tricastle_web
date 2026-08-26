<!-- src/features/documents/components/ScanAndAutoUpload.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import http from '@shared/api/http'

// ─── Props ──────────────────────────────────────────────
const props = defineProps<{
  applicantId?: number | null
  documentTypeId?: number | null
  batchId?: number | null
  applicantName?: string
  documentTypeName?: string
}>()

const emit = defineEmits<{
  (e: 'uploaded', document: any): void
}>()

const router = useRouter()
const toast = useToast()

// ─── Helper endpoints ───────────────────────────────────
// ─── Helper Endpoints (HTTPS on 5556 first, then HTTP fallback on 5555) ───
const HELPER_ENDPOINTS = [
  'https://127.0.0.1:5556',
  'https://localhost:5556',
  'http://127.0.0.1:5555',
  'http://localhost:5555',
]
const activeHelperUrl = ref(HELPER_ENDPOINTS[0])

// ─── State ──────────────────────────────────────────────
const dialogVisible = ref(false)
const checkingHelper = ref(false)
const helperInstalled = ref(false)
const isHttps = ref(window.location.protocol === 'https:')
const isMixedContentBlocked = ref(false)

const scanners = ref<Array<{ name: string }>>([])
const selectedScanner = ref('')

const scanning = ref(false)
const uploading = ref(false)
const completed = ref(false)

const resolution = ref(300)
const colorMode = ref('Color')

const resolutionOptions = [
  { label: '📄 Draft (150 DPI)', value: 150 },
  { label: '📋 Normal (300 DPI)', value: 300 },
  { label: '⭐ High (600 DPI)', value: 600 },
]

const colorModeOptions = [
  { label: '🎨 Color', value: 'Color' },
  { label: '⚫ Grayscale', value: 'Gray' },
  { label: '⬛ Black & White', value: 'BW' },
]

// ─── Validation ─────────────────────────────────────────
const canScan = computed(() => !!props.applicantId && !!props.documentTypeId)

const validationMessage = computed(() => {
  if (!props.applicantId) return 'Please select an applicant first'
  if (!props.documentTypeId) return 'Please select a document type first'
  if (!props.batchId) return 'No batch selected — document will not appear in Batches view'
  return null
})

const isBusy = computed(() => scanning.value || uploading.value)

const currentStatus = computed(() => {
  if (scanning.value) return { icon: '📄', text: 'Scanning...', detail: 'Scanner is capturing the document' }
  if (uploading.value) return { icon: '☁️', text: 'Uploading...', detail: 'Saving to server' }
  if (completed.value) return { icon: '✅', text: 'Complete!', detail: 'Document uploaded successfully' }
  return null
})

// ─── Actions ────────────────────────────────────────────
async function openDialog() {
  if (!canScan.value) {
    toast.add({
      severity: 'warn',
      summary: 'Missing information',
      detail: validationMessage.value ?? 'Please fill all required fields',
      life: 3000,
    })
    return
  }

  dialogVisible.value = true
  completed.value = false
  await checkHelper()
}

async function checkHelper() {
  checkingHelper.value = true
  helperInstalled.value = false
  isMixedContentBlocked.value = false

  for (const baseUrl of HELPER_ENDPOINTS) {
    try {
      const response = await axios.get(`${baseUrl}/health`, {
        timeout: 4000,
        headers: { 'Access-Control-Request-Private-Network': 'true' },
      })

      if (response.data?.status === 'ok') {
        activeHelperUrl.value = baseUrl
        helperInstalled.value = true
        await loadScanners()
        checkingHelper.value = false
        return
      }
    } catch (err: any) {
      if (isHttps.value && (err.code === 'ERR_NETWORK' || !err.response)) {
        isMixedContentBlocked.value = true
      }
    }
  }

  helperInstalled.value = false
  checkingHelper.value = false
}

async function loadScanners() {
  try {
    const { data } = await axios.get(`${activeHelperUrl.value}/scanners`, { timeout: 5000 })
    scanners.value = data.scanners ?? []
    if (scanners.value.length > 0) {
      selectedScanner.value = scanners.value[0].name
    }
  } catch {
    scanners.value = []
  }
}

async function scanAndUpload() {
  scanning.value = true
  try {
    toast.add({
      severity: 'info',
      summary: '📄 Scanning...',
      detail: 'Please wait, capturing document from scanner',
      life: 3000,
    })

    const { data: scanData } = await axios.post(
      `${activeHelperUrl.value}/scan`,
      {
        device: selectedScanner.value,
        resolution: resolution.value,
        colorMode: colorMode.value,
        format: 'pdf',
      },
      { timeout: 120000 },
    )

    if (!scanData.success) throw new Error(scanData.message ?? 'Scan failed')

    scanning.value = false
    uploading.value = true

    // Base64 → File
    const response = await fetch(scanData.data)
    const blob = await response.blob()
    const file = new File(
      [blob],
      `scan_${props.applicantId}_${Date.now()}.pdf`,
      { type: scanData.mimeType ?? 'application/pdf' },
    )

    toast.add({
      severity: 'info',
      summary: '☁️ Uploading...',
      detail: `Saving to ${props.applicantName ?? 'applicant'}'s folder`,
      life: 2000,
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('applicant_id', String(props.applicantId))
    formData.append('document_type_id', String(props.documentTypeId))
    if (props.batchId) formData.append('batch_id', String(props.batchId))
    formData.append('source', 'scanner')
    formData.append('status', 'uploaded')

    const { data: uploadData } = await http.post('/applicant-documents', formData)

    completed.value = true

    toast.add({
      severity: 'success',
      summary: '✅ Upload complete',
      detail: `${props.documentTypeName ?? 'Document'} saved to ${props.applicantName ?? 'applicant'}'s folder`,
      life: 4000,
    })

    emit('uploaded', uploadData)

    setTimeout(() => {
      dialogVisible.value = false
      router.push({
        name: 'documents.folder',
        params: { applicantId: props.applicantId as number },
        query: props.batchId ? { from_batch: String(props.batchId) } : undefined,
      })
    }, 1500)
  } catch (err: any) {
    console.error('[Scan Upload Error]', err)
    toast.add({
      severity: 'error',
      summary: 'Scan Failed',
      detail: err?.response?.data?.message ?? err?.message ?? 'Could not scan and upload',
      life: 5000,
    })
  } finally {
    scanning.value = false
    uploading.value = false
  }
}

defineExpose({ openDialog })
</script>

<template>
  <div>
    <Button icon="pi pi-print" label="Scan & Auto-Upload" type="button" class="!bg-purple-500 !border-purple-500 !text-white
             hover:!bg-purple-600 hover:!border-purple-600
             !rounded-xl !font-semibold !px-4 !py-2" :disabled="!canScan"
      v-tooltip.top="validationMessage ?? 'Scan and upload directly'" @click="openDialog" />

    <Dialog v-model:visible="dialogVisible" modal :closable="!isBusy" :style="{ width: '540px' }" :pt="{
      header: { class: '!bg-purple-50 !border-b !border-purple-100' },
    }">
      <template #header>
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center">
            <i class="pi pi-print text-white" />
          </div>
          <div>
            <h3 class="font-serif font-bold text-blueberry-800">Scan & Auto-Upload</h3>
            <p class="text-xs text-blueberry-500 font-normal">Direct scan to applicant folder</p>
          </div>
        </div>
      </template>

      <!-- Context summary -->
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
        <p class="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-2">
          📍 Scan will save to:
        </p>
        <div class="space-y-1.5 text-sm">
          <div class="flex items-center gap-2">
            <i class="pi pi-user text-purple-500 text-xs w-4" />
            <span class="text-blueberry-500">Applicant:</span>
            <strong class="text-blueberry-800">{{ applicantName ?? '—' }}</strong>
          </div>
          <div class="flex items-center gap-2">
            <i class="pi pi-file text-purple-500 text-xs w-4" />
            <span class="text-blueberry-500">Document:</span>
            <strong class="text-blueberry-800">{{ documentTypeName ?? '—' }}</strong>
          </div>
          <div v-if="batchId" class="flex items-center gap-2">
            <i class="pi pi-briefcase text-purple-500 text-xs w-4" />
            <span class="text-blueberry-500">Batch:</span>
            <strong class="text-blueberry-800">#{{ batchId }}</strong>
          </div>
        </div>
      </div>

      <!-- Checking helper -->
      <div v-if="checkingHelper" class="flex flex-col items-center py-8 gap-3">
        <ProgressSpinner style="width: 40px" strokeWidth="4" />
        <p class="text-sm text-blueberry-500">Connecting to scanner helper...</p>
      </div>

      <!-- Helper Not Installed -->
      <div v-else-if="!helperInstalled" class="flex flex-col gap-4">
        <!-- Mixed Content Warning -->
        <div v-if="isHttps && isMixedContentBlocked"
          class="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 space-y-2">
          <h4 class="font-bold flex items-center gap-2 text-amber-800 text-sm">
            <i class="pi pi-shield" />
            Chrome Security Setup (Required Once)
          </h4>
          <p>
            Your browser is on <strong>HTTPS (Vercel)</strong> and blocks local scanner calls.
          </p>
          <div class="bg-white/80 p-2.5 rounded-lg border border-amber-200 font-mono text-[11px] space-y-1">
            <p>1. Click the <strong>🔒 Padlock / Tune icon</strong> next to the URL.</p>
            <p>2. Click <strong>Site settings</strong>.</p>
            <p>3. Set <strong>Insecure content</strong> to <strong>ALLOW</strong>.</p>
            <p>4. Refresh page and click Retry Connection.</p>
          </div>
        </div>

        <!-- Install helper box -->
        <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h4 class="font-semibold text-purple-900 mb-1 flex items-center gap-2">
            <i class="pi pi-download" />
            Install Tricastle Scanner Helper
          </h4>
          <p class="text-xs text-purple-700 mb-2">
            Download and run the helper once on this computer. It will auto-start every time Windows boots.
          </p>
          <ol class="text-xs text-purple-800 space-y-1 list-decimal pl-4">
            <li>Click <strong>Download Helper</strong></li>
            <li>Double-click <code>TricastleScannerSetup.exe</code></li>
            <li>Click <strong>Retry Connection</strong></li>
          </ol>
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <!-- 1-click download from Vercel public folder -->
          <a href="/downloads/TricastleScannerSetup.exe" download class="flex-1">
            <Button label="Download Helper (.exe)" icon="pi pi-download"
              class="w-full !bg-purple-600 !border-purple-600 !text-white" />
          </a>

          <a href="https://www.naps2.com/download" target="_blank" class="flex-1">
            <Button label="Install NAPS2" icon="pi pi-external-link" outlined
              class="w-full !border-purple-300 !text-purple-600" />
          </a>
        </div>

        <Button label="Retry Connection" icon="pi pi-refresh" class="w-full !bg-purple-500 !border-purple-500"
          @click="checkHelper" />
      </div>

      <!-- Scanner ready -->
      <div v-else class="flex flex-col gap-4">
        <!-- Busy / Complete status -->
        <div v-if="currentStatus" class="rounded-xl p-6 text-center border" :class="{
          'bg-blue-50 border-blue-200': scanning || uploading,
          'bg-green-50 border-green-200': completed,
        }">
          <div v-if="!completed" class="flex justify-center mb-3">
            <ProgressSpinner style="width: 40px" strokeWidth="4" />
          </div>
          <div v-else class="text-4xl mb-2">✅</div>
          <p class="text-sm font-semibold" :class="completed ? 'text-green-800' : 'text-blue-800'">
            {{ currentStatus.icon }} {{ currentStatus.text }}
          </p>
          <p class="text-xs mt-1" :class="completed ? 'text-green-600' : 'text-blue-600'">
            {{ currentStatus.detail }}
          </p>
        </div>

        <!-- Settings -->
        <template v-if="!isBusy && !completed && scanners.length > 0">
          <div>
            <label class="block text-sm font-medium text-blueberry-700 mb-1.5">
              Scanner Device
            </label>
            <Select v-model="selectedScanner" :options="scanners" option-label="name" option-value="name"
              class="w-full" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-blueberry-700 mb-1.5">
                Resolution
              </label>
              <Select v-model="resolution" :options="resolutionOptions" option-label="label" option-value="value"
                class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-blueberry-700 mb-1.5">
                Color Mode
              </label>
              <Select v-model="colorMode" :options="colorModeOptions" option-label="label" option-value="value"
                class="w-full" />
            </div>
          </div>
        </template>

        <!-- No scanners -->
        <div v-else-if="scanners.length === 0 && !isBusy" class="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p class="text-sm text-amber-800 mb-2">⚠️ No USB scanners detected</p>
          <p class="text-xs text-amber-700 mb-2">
            Make sure your scanner is powered on and connected via USB. Also install NAPS2.
          </p>
          <div class="flex gap-2">
            <Button label="Refresh Scanners" icon="pi pi-refresh" text size="small" @click="loadScanners" />
            <a href="https://www.naps2.com/download" target="_blank">
              <Button label="Install NAPS2" icon="pi pi-external-link" text size="small" />
            </a>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text :disabled="isBusy" @click="dialogVisible = false" />
        <Button v-if="helperInstalled && scanners.length > 0 && !isBusy && !completed" label="Start Scan"
          icon="pi pi-play" class="!bg-purple-500 !border-purple-500" @click="scanAndUpload" />
      </template>
    </Dialog>
  </div>
</template>