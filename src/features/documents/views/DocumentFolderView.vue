<!-- src/features/documents/views/DocumentFolderView.vue -->
<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useDocumentStore } from '../stores/document.store'
import DocumentStatusBadge from '../components/DocumentStatusBadge.vue'

const props = defineProps<{ applicantId: number }>()

const router = useRouter()
const route  = useRoute()
const store  = useDocumentStore()

const numericApplicantId = computed(() => Number(props.applicantId))

onMounted(() => store.fetchFolder(numericApplicantId.value))
watch(numericApplicantId, (id) => store.fetchFolder(id))

const folder  = computed(() => store.folder)
const loading = computed(() => store.folderLoading)
const error   = computed(() => store.folderError)

// ── Helpers ───────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name.split(' ').map(p => p.charAt(0)).filter(Boolean)
    .slice(0, 2).join('').toUpperCase() || '?'
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString() : '—'
}

// ── Navigation ────────────────────────────────────────────────────────────
function goBack() {
  const fromBatch = route.query.from_batch
  if (fromBatch) {
    router.push({
      name:   'documents.folders',
      params: { batchId: fromBatch as string },
    })
  } else {
    router.push({ name: 'documents.batches' })
  }
}

function goToBatches()            { router.push({ name: 'documents.batches' }) }
function goToApplicant()          { router.push({ name: 'applicants.view',  params: { id: numericApplicantId.value } }) }
function goToDocument(v: any)     { router.push({ name: 'documents.view',   params: { id: v.id } }) }
function editDocument(v: any)     { router.push({ name: 'documents.edit',   params: { id: v.id } }) }
function uploadNewVersion(g: any) { router.push({ name: 'documents.create', query:  { applicant_id: numericApplicantId.value, document_type_id: g.document_type_id } }) }
function uploadNew()              { router.push({ name: 'documents.create', query:  { applicant_id: numericApplicantId.value } }) }
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1200px] mx-auto">

    <!-- Breadcrumb — 3 levels -->
    <div class="flex items-center gap-2">
      <Button icon="pi pi-arrow-left" text rounded @click="goBack" />
      <span class="text-sm text-blueberry-500 flex items-center gap-1 flex-wrap">
        <button
          class="hover:text-apricot-600 font-medium transition-colors"
          @click="goToBatches"
        >
          Batches
        </button>
        <span class="text-blueberry-300 mx-1">/</span>
        <button
          class="hover:text-apricot-600 font-medium transition-colors"
          @click="goBack"
        >
          Applicants
        </button>
        <span class="text-blueberry-300 mx-1">/</span>
        <span class="font-medium text-blueberry-700">
          {{ folder?.applicant_name ?? 'Folder' }}
        </span>
      </span>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <Skeleton height="120px" border-radius="16px" class="mb-2" />
      <Skeleton height="80px"  border-radius="16px" class="mb-2" />
      <Skeleton height="200px" border-radius="16px" />
    </template>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <i class="pi pi-exclamation-circle text-4xl text-red-400 mb-3 block" />
      <p class="text-red-500">{{ error }}</p>
      <AppButton label="Go Back" class="mt-4" @click="goBack" />
    </div>

    <!-- Not found -->
    <div v-else-if="!folder" class="text-center py-20">
      <i class="pi pi-folder-open text-4xl text-blueberry-300 mb-3 block" />
      <p class="text-blueberry-500">Folder not found</p>
      <AppButton label="Go Back" class="mt-4" @click="goBack" />
    </div>

    <!-- Content -->
    <template v-else>
      <AppCard>
        <div class="flex items-start gap-5">
          <div class="w-16 h-16 rounded-2xl bg-apricot-500 text-white flex items-center justify-center font-serif font-bold text-lg flex-shrink-0">
            {{ initials(folder.applicant_name) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-2xl font-serif font-bold text-blueberry-800">
                {{ folder.applicant_name }}
              </h1>
              <span v-if="folder.has_pending"
                    class="text-[10px] font-bold uppercase tracking-wide
                           text-amber-700 bg-amber-50 px-2 py-1 rounded">
                Pending Review
              </span>
            </div>
            <div class="flex items-center gap-3 text-sm mt-1">
              <span class="font-mono text-apricot-600 font-semibold">
                {{ folder.applicant_code }}
              </span>
              <span v-if="folder.applicant_email" class="text-blueberry-400">
                · {{ folder.applicant_email }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <Button icon="pi pi-external-link" label="View Profile" text @click="goToApplicant" />
            <AppButton icon="pi pi-upload" label="Upload Document" variant="accent" @click="uploadNew" />
          </div>
        </div>
      </AppCard>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <AppStatCard label="Document Types" :value="folder.total_types"                icon="pi pi-tag"   variant="apricot"    />
        <AppStatCard label="Total Files"    :value="folder.total_documents"            icon="pi pi-file"  variant="blueberry"  />
        <AppStatCard label="Pending"        :value="folder.has_pending ? 'Yes' : 'None'" icon="pi pi-clock" variant="citrus"     />
      </div>

      <div class="flex flex-col gap-3">
        <AppCard v-for="group in folder.groups" :key="group.document_type_id" padding="none">
          <div class="flex items-center gap-3 px-5 py-4 border-b border-appleCore-100">
            <div class="w-10 h-10 rounded-xl bg-apricot-50 text-apricot-600 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-file text-sm" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-semibold text-blueberry-800 truncate">{{ group.document_type_name }}</p>
                <span class="font-mono text-[10px] text-apricot-600 font-semibold bg-apricot-50 px-1.5 py-0.5 rounded">
                  {{ group.document_type_code }}
                </span>
                <span class="text-xs text-blueberry-400">
                  {{ group.total_versions }} version{{ group.total_versions === 1 ? '' : 's' }}
                </span>
              </div>
            </div>
            <DocumentStatusBadge :status="group.latest_status" />
            <Button icon="pi pi-plus" label="New Version" text size="small"
                    class="!text-apricot-600" @click="uploadNewVersion(group)" />
          </div>

          <div class="flex flex-col divide-y divide-appleCore-100/60">
            <div v-for="v in group.versions" :key="v.id"
                 class="flex items-center gap-3 px-5 py-3 hover:bg-appleCore-50/40 transition-colors"
                 :class="v.is_current ? 'bg-apricot-50/20' : ''">
              <span class="w-10 h-7 rounded-md text-[10px] font-bold tabular-nums flex items-center justify-center flex-shrink-0"
                    :class="v.is_current ? 'bg-apricot-500 text-white' : 'bg-appleCore-100 text-blueberry-600'">
                v{{ v.version }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-blueberry-700 truncate font-medium">{{ v.file_name }}</p>
                <div class="flex items-center gap-2 text-[11px] text-blueberry-400 mt-0.5">
                  <span>{{ formatSize(v.file_size) }}</span>
                  <span>·</span>
                  <span>Uploaded {{ formatDate(v.uploaded_at) }}</span>
                  <template v-if="v.expiry_date">
                    <span>·</span>
                    <span>Expires {{ formatDate(v.expiry_date) }}</span>
                  </template>
                </div>
              </div>
              <div class="flex items-center gap-0.5">
                <Button icon="pi pi-eye"    text rounded size="small"
                        class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
                        v-tooltip.top="'View'"
                        @click="goToDocument(v)" />
                <Button icon="pi pi-pencil" text rounded size="small"
                        class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
                        v-tooltip.top="'Edit'"
                        @click="editDocument(v)" />
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </template>
  </div>
</template>