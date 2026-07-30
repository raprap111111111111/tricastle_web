<!-- src/features/documents/views/DocumentView.vue -->
<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
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

const props = defineProps<{ id: number }>()

const router = useRouter()
const toast  = useToast()
const store  = useDocumentStore()
const { handleVerify, handleReject } = useDocuments()

onMounted(async () => {
  store.clearDocument()
  await store.fetchDocument(props.id)
})

const d = computed(() => store.document)

// ─── Reject dialog ──────────────────────────────────────────────────────────
const rejectOpen   = ref(false)
const rejectReason = ref('')

async function submitReject() {
  if (!rejectReason.value.trim()) return
  await handleReject(props.id, rejectReason.value)
  rejectOpen.value   = false
  rejectReason.value = ''
}

// ─── New version dialog ─────────────────────────────────────────────────────
const versionOpen    = ref(false)
const newVersionFile = ref<File | null>(null)
const uploading      = ref(false)

async function submitNewVersion() {
  if (!newVersionFile.value) return
  uploading.value = true
  try {
    // ✅ FIX 1: call API directly — avoids missing store action
    await documentApi.uploadVersion(props.id, newVersionFile.value)
    toast.add({
      severity: 'success',
      summary:  'New Version Uploaded',
      detail:   'Document version updated.',
      life:     3000,
    })
    versionOpen.value    = false
    newVersionFile.value = null
    // Refresh to show updated version history
    await store.fetchDocument(props.id)
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary:  'Upload Failed',
      detail:   e?.response?.data?.message ?? 'Try again.',
      life:     4000,
    })
  } finally {
    uploading.value = false
  }
}

// ─── Formatters ─────────────────────────────────────────────────────────────
function formatDate(v: string | null | undefined): string {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1_024)          return `${bytes} B`
  if (bytes < 1_024 * 1_024) return `${(bytes / 1_024).toFixed(1)} KB`
  return `${(bytes / 1_024 / 1_024).toFixed(1)} MB`
}

function capitalize(v: string | null | undefined): string {
  if (!v) return '—'
  return v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, ' ')
}

const downloadUrl = computed(() =>
  d.value ? documentApi.getDownloadUrl(d.value.id) : '#'
)
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-6xl mx-auto">

    <!-- ── Header nav ──────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="router.push({ name: 'documents.index' })"
        />
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
        <AppButton
          variant="secondary"
          icon="pi pi-refresh"
          @click="versionOpen = true"
        >
          New Version
        </AppButton>
        <AppButton
          variant="secondary"
          icon="pi pi-pencil"
          @click="router.push({ name: 'documents.edit', params: { id: d.id } })"
        >
          Edit
        </AppButton>
      </div>
    </div>

    <!-- ── Loading ─────────────────────────────────────────────────────── -->
    <template v-if="store.loading">
      <Skeleton height="200px" border-radius="16px" />
      <Skeleton height="300px" border-radius="16px" />
    </template>

    <!-- ── Not found ───────────────────────────────────────────────────── -->
    <template v-else-if="!d">
      <div class="text-center py-16 text-blueberry-400">
        <i class="pi pi-exclamation-circle text-4xl mb-3" />
        <p>Document not found</p>
      </div>
    </template>

    <!-- ── Content ─────────────────────────────────────────────────────── -->
    <template v-else>

      <!-- Header card -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-start gap-5">
          <div
            class="w-16 h-16 rounded-2xl bg-apricot-50 text-apricot-600
                   flex items-center justify-center flex-shrink-0"
          >
            <i class="pi pi-file text-2xl" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <DocumentStatusBadge :status="d.status" />
              <span
                v-if="d.version > 1"
                class="px-2 py-0.5 rounded-lg bg-apricot-50 text-apricot-700
                       text-xs font-semibold"
              >
                Version {{ d.version }}
              </span>
              <span
                v-if="d.is_expired"
                class="px-2 py-0.5 rounded-lg bg-red-50 text-red-700
                       text-xs font-semibold"
              >
                Expired
              </span>
            </div>

            <h2 class="text-xl font-serif font-semibold text-blueberry-800 break-all">
              {{ d.file_name }}
            </h2>

            <div class="flex flex-wrap gap-4 mt-2 text-sm text-blueberry-500 tabular-nums">
              <span>
                <i class="pi pi-tag text-xs mr-1" />
                {{ d.document_type?.name ?? '—' }}
              </span>
              <span>
                <i class="pi pi-database text-xs mr-1" />
                {{ formatSize(d.file_size) }}
              </span>
              <span>
                <i class="pi pi-calendar text-xs mr-1" />
                Uploaded {{ formatDate(d.created_at) }}
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-2 flex-shrink-0">
            <a
              :href="downloadUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-apricot-500 text-white text-sm font-semibold
                     hover:bg-apricot-600 transition-colors"
            >
              <i class="pi pi-download text-xs" />
              Download
            </a>
          </div>
        </div>
      </section>

      <!-- Details -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3
          class="text-base font-serif font-semibold text-blueberry-800 mb-4
                 flex items-center gap-2"
        >
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
            <dd
              class="text-sm font-medium mt-1"
              :class="d.is_expired ? 'text-red-600' : 'text-blueberry-800'"
            >
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

      <!-- OCR Data -->
      <section
        v-if="d.extracted_data && Object.keys(d.extracted_data).length"
        class="bg-white rounded-2xl border border-appleCore-100 p-6"
      >
        <h3
          class="text-base font-serif font-semibold text-blueberry-800 mb-4
                 flex items-center gap-2"
        >
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

      <!-- Version History -->
      <section
        v-if="d.versions && d.versions.length"
        class="bg-white rounded-2xl border border-appleCore-100 p-6"
      >
        <h3
          class="text-base font-serif font-semibold text-blueberry-800 mb-4
                 flex items-center gap-2"
        >
          <i class="pi pi-history text-apricot-500" />
          Version History
          <span class="text-xs text-blueberry-400 font-sans font-normal">
            ({{ d.versions.length }})
          </span>
        </h3>

        <div class="space-y-3">
          <div
            v-for="v in d.versions"
            :key="v.id"
            class="flex items-center justify-between
                   border border-appleCore-100 rounded-xl p-4"
          >
            <div>
              <p class="font-semibold text-blueberry-800">
                Version {{ v.version_number }}
                <span
                  v-if="v.is_current"
                  class="ml-2 px-2 py-0.5 bg-green-50 text-green-700
                         text-xs font-medium rounded-lg"
                >
                  Current
                </span>
              </p>
              <p class="text-xs text-blueberry-500 tabular-nums mt-0.5">
                {{ v.file_name }} · {{ formatSize(v.file_size) }} ·
                {{ formatDate(v.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Action bar ────────────────────────────────────────────────── -->
      <section
        v-if="d.status !== 'verified' && d.status !== 'rejected'"
        class="bg-white rounded-2xl border border-appleCore-100 p-6
               flex items-center justify-end gap-3"
      >
        <!-- ✅ FIX 2: Use PrimeVue Button — 'danger-ghost' is not a valid AppButton variant -->
        <Button
          severity="danger"
          outlined
          icon="pi pi-times"
          label="Reject"
          @click="rejectOpen = true"
        />

        <AppButton
          icon="pi pi-check"
          :loading="store.submitting"
          @click="handleVerify(d.id)"
        >
          Mark Verified
        </AppButton>
      </section>

    </template>

    <!-- ── Reject dialog ───────────────────────────────────────────────── -->
    <Dialog
      v-model:visible="rejectOpen"
      modal
      header="Reject Document"
      :style="{ width: '480px' }"
    >
      <div class="space-y-4 pt-2">
        <p class="text-sm text-blueberry-600">
          Please provide a reason for rejecting this document.
          The applicant will be notified.
        </p>
        <Textarea
          v-model="rejectReason"
          rows="4"
          placeholder="Reason for rejection..."
          class="w-full"
        />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="rejectOpen = false">
          Cancel
        </AppButton>
        <AppButton
          icon="pi pi-times"
          :disabled="!rejectReason.trim()"
          :loading="store.submitting"
          @click="submitReject"
        >
          Reject
        </AppButton>
      </template>
    </Dialog>

    <!-- ── New version dialog ──────────────────────────────────────────── -->
    <Dialog
      v-model:visible="versionOpen"
      modal
      header="Upload New Version"
      :style="{ width: '540px' }"
    >
      <div class="space-y-4 pt-2">
        <p class="text-sm text-blueberry-600">
          Uploading a new version keeps the previous file in the version history.
        </p>
        <DocumentUploadDropzone
          :disabled="uploading"
          @file="newVersionFile = $event"
          @error="(m) => toast.add({ severity: 'error', summary: 'Invalid File', detail: m, life: 4000 })"
        />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="versionOpen = false">
          Cancel
        </AppButton>
        <AppButton
          icon="pi pi-upload"
          :disabled="!newVersionFile"
          :loading="uploading"
          @click="submitNewVersion"
        >
          Upload
        </AppButton>
      </template>
    </Dialog>

  </div>
</template>