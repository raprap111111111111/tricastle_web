<!-- src/features/documents/views/DocumentScanView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import { AppCard } from '@shared/ui'
import http from '@shared/api/http'
import ScanAndUploadButton from '@/features/documents/components/ScanAndUploadButton.vue'

const route  = useRoute()
const router = useRouter()

// --- Query params -----------------------------------------------------------
const batchId = computed(() =>
  route.query.batch_id ? Number(route.query.batch_id) : undefined,
)
const preselectedApplicantId = computed(() =>
  route.query.applicant_id ? Number(route.query.applicant_id) : undefined,
)
const preselectedDocTypeId = computed(() =>
  route.query.document_type_id ? Number(route.query.document_type_id) : undefined,
)

const applicantLocked = computed(() => !!preselectedApplicantId.value)
const batchLocked     = computed(() => !!batchId.value)

// --- Types ------------------------------------------------------------------
interface Applicant {
  id: number
  applicant_code?: string
  first_name?: string
  middle_name?: string | null
  last_name?: string
  full_name?: string
  name?: string
  email?: string | null
  status?: string
}
interface DocumentType {
  id: number
  name: string
  code?: string
}
interface Batch {
  id: number
  name?: string
  code?: string
  batch_code?: string
}

// --- State ------------------------------------------------------------------
const applicants     = ref<Applicant[]>([])
const documentTypes  = ref<DocumentType[]>([])
const batch          = ref<Batch | null>(null)
const applicant      = ref<Applicant | null>(null)

const selectedApplicantId    = ref<number | undefined>(preselectedApplicantId.value)
const selectedDocumentTypeId = ref<number | undefined>(preselectedDocTypeId.value)

const loading = ref(true)
const loadError = ref<string | null>(null)

// --- Helpers ----------------------------------------------------------------
function extractArray<T>(res: any): T[] {
  const d = res?.data
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.records)) return d.records
  if (Array.isArray(d?.data))    return d.data
  if (Array.isArray(d?.items))   return d.items
  if (Array.isArray(d?.results)) return d.results
  if (Array.isArray(d?.data?.records)) return d.data.records
  if (Array.isArray(res)) return res
  return []
}

function extractObject<T>(res: any): T | null {
  const d = res?.data
  if (!d) return null
  if (d.record && typeof d.record === 'object') return d.record as T
  if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) return d.data as T
  if (typeof d === 'object' && !Array.isArray(d)) return d as T
  return null
}

function applicantLabel(a: Applicant): string {
  if (a.full_name) return a.full_name
  if (a.name) return a.name
  return [a.first_name, a.middle_name, a.last_name].filter(Boolean).join(' ') || `Applicant #${a.id}`
}

// --- Fetch ------------------------------------------------------------------
async function fetchApplicants(): Promise<Applicant[]> {
  const params: Record<string, any> = {
    per_page: 500,
    limit:    500,
    status:   'final_list',
  }
  if (batchId.value) params.batch_id = batchId.value

  try {
    const res = await http.get('/applicants', { params })
    let list = extractArray<Applicant>(res)
    list = list.filter((a: any) => {
      const s = (a.status ?? a.applicant_status ?? '').toString().toLowerCase()
      return !s || s === 'final_list'
    })
    return list
  } catch {
    return []
  }
}

async function fetchApplicant(id: number): Promise<Applicant | null> {
  try {
    const res = await http.get(`/applicants/${id}`)
    return extractObject<Applicant>(res)
  } catch { return null }
}

async function fetchDocumentTypes(): Promise<DocumentType[]> {
  try {
    const res = await http.get('/document-types', { params: { per_page: 500, is_active: true } })
    return extractArray<DocumentType>(res)
  } catch { return [] }
}

async function fetchBatch(id: number): Promise<Batch | null> {
  for (const url of [`/batches/${id}`, `/document-batches/${id}`]) {
    try {
      const res = await http.get(url)
      const obj = extractObject<Batch>(res)
      if (obj) return obj
    } catch { /* try next */ }
  }
  return null
}

async function loadData() {
  loading.value = true
  loadError.value = null
  try {
    const [types, apps, b, a] = await Promise.all([
      fetchDocumentTypes(),
      applicantLocked.value ? Promise.resolve([]) : fetchApplicants(),
      batchId.value ? fetchBatch(batchId.value) : Promise.resolve(null),
      preselectedApplicantId.value ? fetchApplicant(preselectedApplicantId.value) : Promise.resolve(null),
    ])

    documentTypes.value = types
    applicants.value    = apps
    batch.value         = b
    applicant.value     = a

    if (!types.length) loadError.value = 'Could not load document types.'
  } catch (err: any) {
    loadError.value = err?.message ?? 'Failed to load data'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// --- Derived labels ---------------------------------------------------------
const selectedApplicantName = computed(() => {
  if (applicant.value) return applicantLabel(applicant.value)
  const found = applicants.value.find(a => a.id === selectedApplicantId.value)
  return found ? applicantLabel(found) : ''
})

const selectedDocTypeName = computed(() => {
  const found = documentTypes.value.find(d => d.id === selectedDocumentTypeId.value)
  return found?.name ?? ''
})

function goBack() {
  if (preselectedApplicantId.value) {
    router.push({
      name: 'documents.folder',
      params: { applicantId: preselectedApplicantId.value },
      query: batchId.value ? { from_batch: String(batchId.value) } : undefined,
    })
  } else if (batchId.value) {
    router.push({ name: 'documents.folders', params: { batchId: batchId.value } })
  } else {
    router.push({ name: 'documents.batches' })
  }
}

const backLabel = computed(() => {
  if (preselectedApplicantId.value) return applicant.value?.full_name ?? 'Applicant Folder'
  if (batchId.value)                 return 'Applicant Folders'
  return 'Document Batches'
})

function onUploaded() {
  // Navigation is handled inside ScanAndUploadButton
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[900px] mx-auto">

    <!-- Breadcrumb -->
    <div class="flex items-center gap-2">
      <Button icon="pi pi-arrow-left" text rounded @click="goBack" />
      <span class="text-sm text-blueberry-500">
        <button class="hover:text-apricot-600 font-medium transition-colors" @click="goBack">
          {{ backLabel }}
        </button>
        <span class="text-blueberry-300 mx-1.5">/</span>
        <span class="font-medium text-blueberry-700">Scan Document</span>
      </span>
    </div>

    <!-- Header -->
    <div>
      <h2 class="text-xl font-serif font-bold text-blueberry-800">Scan Document</h2>
      <p class="text-sm text-blueberry-400 mt-0.5">
        <template v-if="batch && applicant">
          Scanning for <span class="font-semibold text-apricot-600">{{ applicantLabel(applicant) }}</span>
          in batch <span class="font-semibold text-apricot-600">
            {{ batch.name ?? batch.batch_code ?? batch.code ?? `#${batch.id}` }}
          </span>
        </template>
        <template v-else-if="batch">
          Scanning into batch <span class="font-semibold text-apricot-600">
            {{ batch.name ?? batch.batch_code ?? batch.code ?? `#${batch.id}` }}
          </span>
        </template>
        <template v-else>
          Select context below, then click Scan.
        </template>
      </p>
    </div>

    <!-- Load error -->
    <div
      v-if="loadError"
      class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
    >
      <i class="pi pi-exclamation-circle mr-1" />
      {{ loadError }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3">
      <Skeleton height="80px" border-radius="16px" />
      <Skeleton height="80px" border-radius="16px" />
    </div>

    <!-- Selection form -->
    <AppCard v-else>
      <div class="flex flex-col gap-4">

        <!-- Locked context chips -->
        <div
          v-if="batchLocked || applicantLocked"
          class="flex flex-wrap gap-2 pb-2 border-b border-appleCore-100"
        >
          <div
            v-if="batchLocked && batch"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full
                   bg-apricot-50 border border-apricot-200 text-xs font-semibold text-apricot-700"
          >
            <i class="pi pi-briefcase text-[10px]" />
            Batch: {{ batch.name ?? batch.batch_code ?? batch.code ?? `#${batch.id}` }}
            <i class="pi pi-lock text-[9px] opacity-60" />
          </div>
          <div
            v-if="applicantLocked && applicant"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full
                   bg-blueberry-50 border border-blueberry-200 text-xs font-semibold text-blueberry-700"
          >
            <i class="pi pi-user text-[10px]" />
            {{ applicantLabel(applicant) }}
            <span v-if="applicant.applicant_code" class="font-mono text-[10px] opacity-70">
              · {{ applicant.applicant_code }}
            </span>
            <i class="pi pi-lock text-[9px] opacity-60" />
          </div>
        </div>

        <!-- Applicant -->
        <div v-if="!applicantLocked">
          <label class="block text-xs font-semibold uppercase tracking-wide text-blueberry-500 mb-1.5">
            Applicant
            <span class="ml-1 text-blueberry-400 font-normal normal-case">
              ({{ applicants.length }} in Final List)
            </span>
          </label>
          <Select
            v-model="selectedApplicantId"
            :options="applicants"
            :option-label="applicantLabel"
            option-value="id"
            placeholder="Select applicant"
            filter
            class="w-full"
            empty-message="No applicants in Final List"
          >
            <template #option="{ option }">
              <div class="flex flex-col">
                <span class="font-semibold text-blueberry-800">{{ applicantLabel(option) }}</span>
                <span v-if="option.applicant_code" class="text-xs text-apricot-600 font-mono">
                  {{ option.applicant_code }}
                </span>
                <span v-if="option.email" class="text-xs text-blueberry-400">{{ option.email }}</span>
              </div>
            </template>
          </Select>
        </div>

        <!-- Document type -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-blueberry-500 mb-1.5">
            Document Type
            <span class="ml-1 text-blueberry-400 font-normal normal-case">
              ({{ documentTypes.length }} available)
            </span>
          </label>
          <Select
            v-model="selectedDocumentTypeId"
            :options="documentTypes"
            option-label="name"
            option-value="id"
            placeholder="Select document type"
            filter
            class="w-full"
          />
        </div>

        <!-- ✅ REAL scanner button — triggers the NAPS2 helper dialog -->
        <div class="flex justify-end pt-3 border-t border-appleCore-100">
          <ScanAndUploadButton
            :applicant-id="selectedApplicantId"
            :document-type-id="selectedDocumentTypeId"
            :batch-id="batchId"
            :applicant-name="selectedApplicantName"
            :document-type-name="selectedDocTypeName"
            @uploaded="onUploaded"
          />
        </div>
      </div>
    </AppCard>
  </div>
</template>