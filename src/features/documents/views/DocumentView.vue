<!-- src/features/documents/views/DocumentView.vue -->
<script setup lang="ts">
import { onMounted, computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'

import { AppButton } from '@shared/ui'
import DocumentStatusBadge from '../components/DocumentStatusBadge.vue'
import DocumentUploadDropzone from '../components/DocumentUploadDropzone.vue'
import { useDocumentStore } from '../stores/document.store'
import { useDocuments } from '../composables/useDocuments'
import { documentApi } from '../api/document.api'
import http from '@shared/api/http'
import { useDocumentRealtime } from '@shared/pubnub/useDocumentRealtime'


const props = defineProps<{ id: number }>()

const router = useRouter()
const toast = useToast()
const store = useDocumentStore()
const { handleVerify, handleReject } = useDocuments()

onMounted(async () => {
  store.clearDocument()
  await store.fetchDocument(props.id)
  await loadPreview()
})

const d = computed(() => store.document)

// Listen only to THIS specific document
useDocumentRealtime({
  onReload: async () => {
    await store.fetchDocument(props.id)
    await loadPreview()
  },
  documentId: props.id,
})

// ═══════════════════════════════════════════════════════════════════════════
// FILE PREVIEW (auth-safe blob URL)
// ═══════════════════════════════════════════════════════════════════════════
const previewLoading = ref(false)
const previewError = ref<string | null>(null)
const previewUrl = ref<string>('')

const isImage = computed(() => {
  const mime = d.value?.mime_type ?? ''
  const name = d.value?.file_name ?? ''
  return mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)
})

const isPdf = computed(() => {
  const mime = d.value?.mime_type ?? ''
  const name = d.value?.file_name ?? ''
  return mime === 'application/pdf' || /\.pdf$/i.test(name)
})

const isVideo = computed(() => {
  const mime = d.value?.mime_type ?? ''
  const name = d.value?.file_name ?? ''
  return mime.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(name)
})

const canPreview = computed(() => isImage.value || isPdf.value || isVideo.value)

async function loadPreview() {
  if (!d.value || !canPreview.value) return
  previewLoading.value = true
  previewError.value = null

  try {
    const response = await http.get(
      `/applicant-documents/${d.value.id}/preview`,
      { responseType: 'blob' },
    )
    const blob = new Blob([response.data], {
      type: d.value.mime_type ?? 'application/octet-stream',
    })
    if (previewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = URL.createObjectURL(blob)
  } catch (e: any) {
    previewError.value = e?.response?.status === 404
      ? 'File not found on server.'
      : 'Failed to load preview.'
  } finally {
    previewLoading.value = false
  }
}

watch(() => d.value?.id, loadPreview)
watch(() => d.value?.updated_at, loadPreview)

onBeforeUnmount(() => {
  if (previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// Reject dialog
// ═══════════════════════════════════════════════════════════════════════════
const rejectOpen = ref(false)
const rejectReason = ref('')

async function submitReject() {
  if (!rejectReason.value.trim()) return
  await handleReject(props.id, rejectReason.value)
  rejectOpen.value = false
  rejectReason.value = ''
}

// ═══════════════════════════════════════════════════════════════════════════
// New version dialog
// ═══════════════════════════════════════════════════════════════════════════
const versionOpen = ref(false)
const newVersionFile = ref<File | null>(null)
const uploading = ref(false)

async function submitNewVersion() {
  if (!newVersionFile.value) return
  uploading.value = true
  try {
    await documentApi.uploadVersion(props.id, newVersionFile.value)
    toast.add({
      severity: 'success',
      summary: 'New Version Uploaded',
      detail: 'Document version updated.',
      life: 3000,
    })
    versionOpen.value = false
    newVersionFile.value = null
    await store.fetchDocument(props.id)
    await loadPreview()
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: e?.response?.data?.message ?? 'Try again.',
      life: 4000,
    })
  } finally {
    uploading.value = false
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Formatters
// ═══════════════════════════════════════════════════════════════════════════
function formatDate(v: string | null | undefined): string {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1_024) return `${bytes} B`
  if (bytes < 1_024 * 1_024) return `${(bytes / 1_024).toFixed(1)} KB`
  return `${(bytes / 1_024 / 1_024).toFixed(1)} MB`
}

function capitalize(v: string | null | undefined): string {
  if (!v) return '—'
  return v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' ')
}

const downloading = ref(false)
async function downloadFile() {
  if (!d.value) return
  downloading.value = true
  try {
    const response = await http.get(
      `/applicant-documents/${d.value.id}/download`,
      { responseType: 'blob' },
    )
    const blob = new Blob([response.data], {
      type: d.value.mime_type ?? 'application/octet-stream',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = d.value.file_name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Download failed',
      detail: e?.response?.data?.message ?? 'Could not download file.',
      life: 3500,
    })
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-6xl mx-auto">

    <!-- ── Header nav ──────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button icon="pi pi-arrow-left" text rounded @click="router.back()" />
        <div>
          <h1 class="text-2xl font-serif font-bold text-blueberry-800">
            Document Details
          </h1>
          <p v-if="d" class="text-sm text-blueberry-500">
            View, verify, and manage document
          </p>
        </div>
      </div>

      <div v-if="d" class="flex items-center gap-2">
        <AppButton variant="secondary" icon="pi pi-history" @click="router.push({
          name: 'document-versions.list',
          params: { applicantDocumentId: d.id }
        })">
          Version History
        </AppButton>
        <AppButton variant="secondary" icon="pi pi-refresh" @click="versionOpen = true">
          New Version
        </AppButton>
        <AppButton variant="secondary" icon="pi pi-pencil"
          @click="router.push({ name: 'documents.edit', params: { id: d.id } })">
          Edit
        </AppButton>
      </div>
    </div>
    <!-- ✅ Header nav div properly closed here -->

    <!-- ── Loading ─────────────────────────────────────────────────────── -->
    <template v-if="store.loading">
      <Skeleton height="200px" border-radius="16px" />
      <Skeleton height="500px" border-radius="16px" />
    </template>

    <!-- ── Not found ───────────────────────────────────────────────────── -->
    <template v-else-if="!d">
      <div class="text-center py-16 text-blueberry-400">
        <i class="pi pi-exclamation-circle text-4xl mb-3 block" />
        <p>Document not found</p>
      </div>
    </template>

    <!-- ── Content ─────────────────────────────────────────────────────── -->
    <template v-else>

      <!-- ═══════════════════ HEADER CARD ═══════════════════ -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-start gap-5">
          <div class="w-16 h-16 rounded-2xl bg-apricot-50 text-apricot-600
                      flex items-center justify-center flex-shrink-0">
            <i class="pi pi-file text-2xl" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <DocumentStatusBadge :status="d.status" />
              <span v-if="d.version > 1"
                class="px-2 py-0.5 rounded-lg bg-apricot-50 text-apricot-700 text-xs font-semibold">
                Version {{ d.version }}
              </span>
              <span v-if="d.is_expired" class="px-2 py-0.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold">
                Expired
              </span>
            </div>

            <h2 class="text-xl font-serif font-semibold text-blueberry-800 break-all">
              {{ d.file_name }}
            </h2>

            <div class="flex flex-wrap gap-4 mt-2 text-sm text-blueberry-500 tabular-nums">
              <span><i class="pi pi-tag text-xs mr-1" />{{ d.document_type?.name ?? '—' }}</span>
              <span><i class="pi pi-database text-xs mr-1" />{{ formatSize(d.file_size) }}</span>
              <span><i class="pi pi-calendar text-xs mr-1" />Uploaded {{ formatDate(d.created_at) }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2 flex-shrink-0">
            <button type="button" :disabled="downloading" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-apricot-500 text-white text-sm font-semibold
                     hover:bg-apricot-600 disabled:opacity-60
                     transition-colors" @click="downloadFile">
              <i :class="downloading ? 'pi pi-spin pi-spinner' : 'pi pi-download'" class="text-xs" />
              {{ downloading ? 'Downloading…' : 'Download' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ═══════════════════ FILE PREVIEW ═══════════════════ -->
      <section class="bg-white rounded-2xl border border-appleCore-100 overflow-hidden">
        <div class="flex items-center gap-2 px-6 py-4 border-b border-appleCore-100">
          <i class="pi pi-eye text-apricot-500" />
          <h3 class="text-base font-serif font-semibold text-blueberry-800">
            File Preview
          </h3>
          <span class="text-xs text-blueberry-400 ml-2">
            ({{ d.mime_type ?? 'unknown' }})
          </span>
          <div class="flex-1" />
          <Button v-if="canPreview" icon="pi pi-refresh" text rounded size="small" :loading="previewLoading"
            v-tooltip.top="'Reload preview'" class="!text-blueberry-500" @click="loadPreview" />
        </div>

        <div class="bg-appleCore-50/40 min-h-[500px] flex items-center justify-center p-4">
          <!-- Loading -->
          <div v-if="previewLoading" class="flex flex-col items-center gap-3">
            <i class="pi pi-spin pi-spinner text-3xl text-apricot-500" />
            <p class="text-sm text-blueberry-500">Loading preview…</p>
          </div>

          <!-- Error -->
          <div v-else-if="previewError" class="text-center">
            <i class="pi pi-exclamation-circle text-4xl text-red-400 mb-3 block" />
            <p class="text-sm text-red-600 mb-4">{{ previewError }}</p>
            <Button label="Try again" text @click="loadPreview" />
          </div>

          <!-- Image -->
          <img v-else-if="isImage && previewUrl" :src="previewUrl" :alt="d.file_name"
            class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm" />

          <!-- PDF -->
          <iframe v-else-if="isPdf && previewUrl" :src="previewUrl" :title="d.file_name"
            class="w-full h-[75vh] border-0 rounded-lg bg-white" />

          <!-- Video -->
          <video v-else-if="isVideo && previewUrl" :src="previewUrl" controls
            class="max-w-full max-h-[75vh] rounded-lg" />

          <!-- Unsupported -->
          <div v-else class="text-center p-8">
            <i class="pi pi-file text-5xl text-blueberry-300 mb-3 block" />
            <p class="text-blueberry-600 font-medium mb-2">Preview not available</p>
            <p class="text-xs text-blueberry-400 mb-4">
              This file type ({{ d.mime_type || 'unknown' }}) cannot be previewed.
            </p>
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-apricot-500 text-white text-sm font-semibold
                     hover:bg-apricot-600 transition-colors" @click="downloadFile">
              <i class="pi pi-download text-xs" />
              Download to view
            </button>
          </div>
        </div>
      </section>

      <!-- ═══════════════════ DETAILS ═══════════════════ -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-info-circle text-apricot-500" />
          Details
        </h3>

        <dl class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Applicant</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              <template v-if="d.applicant">
                {{ d.applicant.first_name }} {{ d.applicant.last_name }}
                <span class="text-xs text-apricot-600 font-mono block">
                  {{ d.applicant.applicant_code }}
                </span>
              </template>
              <template v-else>—</template>
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Document Date</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ formatDate(d.document_date) }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Expiry Date</dt>
            <dd class="text-sm font-medium mt-1" :class="d.is_expired ? 'text-red-600' : 'text-blueberry-800'">
              {{ formatDate(d.expiry_date) }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Priority</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 capitalize">
              {{ d.priority ?? '—' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">MIME Type</dt>
            <dd class="text-sm font-mono text-blueberry-800 mt-1">
              {{ d.mime_type ?? '—' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">OCR Confidence</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 tabular-nums">
              {{ d.ocr_confidence != null ? `${d.ocr_confidence}%` : '—' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Uploaded By</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ d.uploader?.name ?? '—' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Verified By</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ d.verifier?.name ?? '—' }}
            </dd>
          </div>
        </dl>

        <div v-if="d.notes" class="mt-5 pt-5 border-t border-appleCore-100">
          <p class="text-xs text-blueberry-400 uppercase tracking-wider mb-1">Notes</p>
          <p class="text-sm text-blueberry-700 leading-relaxed">{{ d.notes }}</p>
        </div>

        <div v-if="d.rejection_reason" class="mt-5 pt-5 border-t border-appleCore-100">
          <p class="text-xs text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
          <p class="text-sm text-red-700 leading-relaxed">{{ d.rejection_reason }}</p>
        </div>
      </section>

      <!-- ═══════════════════ OCR DATA ═══════════════════ -->
      <section v-if="d.extracted_data && Object.keys(d.extracted_data).length"
        class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-search text-apricot-500" />
          Extracted Data (OCR)
        </h3>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <div v-for="(value, key) in d.extracted_data" :key="key">
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">
              {{ capitalize(String(key)) }}
            </dt>
            <dd class="text-sm text-blueberry-800 mt-0.5 break-words">
              {{ value ?? '—' }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- ═══════════════════ VERSION HISTORY ═══════════════════ -->
      <section v-if="d.versions && d.versions.length" class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <!-- Section header with "View all" -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-serif font-semibold text-blueberry-800 flex items-center gap-2">
            <i class="pi pi-history text-apricot-500" />
            Version History
            <span class="text-xs text-blueberry-400 font-sans font-normal">
              ({{ d.versions.length }})
            </span>
          </h3>

          <!-- ✨ NEW: View all button -->
          <Button label="View All" icon="pi pi-external-link" text size="small"
            class="!text-apricot-600 hover:!text-apricot-700" @click="router.push({
              name: 'document-versions.list',
              params: { applicantDocumentId: d.id }
            })" />
        </div>

        <!-- ✨ Clickable rows -->
        <div class="space-y-3">
          <div v-for="v in d.versions" :key="v.id" role="button" tabindex="0" class="group flex items-center justify-between gap-4
             border border-appleCore-100 rounded-xl p-4
             cursor-pointer transition-all
             hover:border-apricot-300 hover:bg-apricot-50/40 hover:shadow-sm
             focus:outline-none focus:ring-2 focus:ring-apricot-300"
            @click="router.push({ name: 'document-versions.detail', params: { id: v.id } })"
            @keydown.enter="router.push({ name: 'document-versions.detail', params: { id: v.id } })"
            @keydown.space.prevent="router.push({ name: 'document-versions.detail', params: { id: v.id } })">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-10 h-10 rounded-lg bg-apricot-50 text-apricot-600
                    flex items-center justify-center flex-shrink-0
                    group-hover:bg-apricot-100 transition-colors">
                <i class="pi pi-file text-sm" />
              </div>

              <div class="min-w-0">
                <p class="font-semibold text-blueberry-800 group-hover:text-apricot-600 transition-colors">
                  Version {{ v.version_number }}
                  <span v-if="v.is_current"
                    class="ml-2 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                    Current
                  </span>
                </p>
                <p class="text-xs text-blueberry-500 tabular-nums mt-0.5 truncate">
                  {{ v.file_name }} · {{ formatSize(v.file_size) }} · {{ formatDate(v.created_at) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0 text-blueberry-400
                  group-hover:text-apricot-500 transition-colors">
              <i class="pi pi-external-link text-sm" />
              <span class="text-xs font-medium hidden sm:inline">View</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════ ACTION BAR ═══════════════════ -->
      <section v-if="d.status !== 'verified' && d.status !== 'rejected'" class="bg-white rounded-2xl border border-appleCore-100 p-6
               flex items-center justify-end gap-3">
        <Button severity="danger" outlined icon="pi pi-times" label="Reject" @click="rejectOpen = true" />
        <AppButton icon="pi pi-check" :loading="store.submitting" @click="handleVerify(d.id)">
          Mark Verified
        </AppButton>
      </section>

    </template>

    <!-- ═══════════════════ REJECT DIALOG ═══════════════════ -->
    <Dialog v-model:visible="rejectOpen" modal header="Reject Document" :style="{ width: '480px' }">
      <div class="space-y-4 pt-2">
        <p class="text-sm text-blueberry-600">
          Please provide a reason for rejecting this document. The applicant will be notified.
        </p>
        <Textarea v-model="rejectReason" rows="4" placeholder="Reason for rejection..." class="w-full" />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="rejectOpen = false">Cancel</AppButton>
        <AppButton icon="pi pi-times" :disabled="!rejectReason.trim()" :loading="store.submitting"
          @click="submitReject">
          Reject
        </AppButton>
      </template>
    </Dialog>

    <!-- ═══════════════════ NEW VERSION DIALOG ═══════════════════ -->
    <Dialog v-model:visible="versionOpen" modal header="Upload New Version" :style="{ width: '540px' }">
      <div class="space-y-4 pt-2">
        <p class="text-sm text-blueberry-600">
          Uploading a new version keeps the previous file in the version history.
        </p>
        <DocumentUploadDropzone :disabled="uploading" @file="newVersionFile = $event"
          @error="(m) => toast.add({ severity: 'error', summary: 'Invalid File', detail: m, life: 4000 })" />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="versionOpen = false">Cancel</AppButton>
        <AppButton icon="pi pi-upload" :disabled="!newVersionFile" :loading="uploading" @click="submitNewVersion">
          Upload
        </AppButton>
      </template>
    </Dialog>

  </div>
</template>