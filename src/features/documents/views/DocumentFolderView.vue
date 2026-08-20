<!-- src/features/documents/views/DocumentFolderView.vue -->
<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useDocumentStore } from '../stores/document.store'
import DocumentStatusBadge from '../components/DocumentStatusBadge.vue'
import type { DocumentStatus } from '../types'
import type { FolderVersion, DocumentGroup } from '../types/folders'
import { useDocumentRealtime } from '@shared/pubnub/useDocumentRealtime'


const props = defineProps<{ applicantId: number }>()

const router = useRouter()
const route = useRoute()
const store = useDocumentStore()
const toast = useToast()

const numericApplicantId = computed(() => Number(props.applicantId))

onMounted(() => store.fetchFolder(numericApplicantId.value))
watch(numericApplicantId, (id) => store.fetchFolder(id))

const folder = computed(() => store.folder)
const loading = computed(() => store.folderLoading)
const error = computed(() => store.folderError)

// ═══════════════════════════════════════════════════════════════════════════
// Filters + expand state (per-group)
// ═══════════════════════════════════════════════════════════════════════════
const showVerifiedOnly = ref(false)
const expandedGroups = ref<Set<number>>(new Set())

// Listen only to THIS applicant's documents
useDocumentRealtime({
  onReload: () => store.fetchFolder(numericApplicantId.value),
  applicantId: numericApplicantId.value,
})

function toggleExpand(groupId: number) {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

function isExpanded(groupId: number): boolean {
  return expandedGroups.value.has(groupId)
}

/**
 * Returns the filtered list of versions to display for a group.
 */
function visibleVersions(group: DocumentGroup): FolderVersion[] {
  let list = [...group.versions]

  if (showVerifiedOnly.value) {
    list = list.filter(v => v.status === 'verified')
  }

  list.sort((a, b) => b.version - a.version)

  if (!isExpanded(group.document_type_id)) {
    return list.slice(0, 1)
  }

  return list
}

function hiddenCount(group: DocumentGroup): number {
  const total = showVerifiedOnly.value
    ? group.versions.filter(v => v.status === 'verified').length
    : group.versions.length
  const visible = visibleVersions(group).length
  return Math.max(0, total - visible)
}

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

// ── Navigation ───────────────────────────────────────────────────────────
function goBack() {
  const fromBatch = route.query.from_batch
  if (fromBatch) {
    router.push({
      name: 'documents.folders',
      params: { batchId: String(fromBatch) },
    })
  } else {
    router.push({ name: 'documents.batches' })
  }
}

function goToBatches() {
  router.push({ name: 'documents.batches' })
}

function goToApplicants() {
  goBack()
}

function goToApplicant() {
  router.push({ name: 'applicants.view', params: { id: numericApplicantId.value } })
}

function goToDocument(v: FolderVersion) {
  router.push({ name: 'documents.view', params: { id: v.id } })
}

function editDocument(v: FolderVersion) {
  router.push({ name: 'documents.edit', params: { id: v.id } })
}

function goToVersionHistory(v: FolderVersion) {
  router.push({
    name: 'document-versions.list',
    params: { applicantDocumentId: v.id },
  })
}

function goToVersionDetail(v: FolderVersion) {
  router.push({
    name: 'document-versions.detail',
    params: { id: v.id },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// ✅ UPLOAD ACTIONS — forwards batch + applicant context
// ═══════════════════════════════════════════════════════════════════════════
function uploadNewVersion(g: DocumentGroup) {
  const query: Record<string, any> = {
    applicant_id: numericApplicantId.value,
    document_type_id: g.document_type_id,
  }
  if (route.query.from_batch) {
    query.batch_id = route.query.from_batch
  }

  router.push({
    name: 'documents.create',
    query,
  })
}

function uploadNew() {
  const query: Record<string, any> = {
    applicant_id: numericApplicantId.value,
  }
  if (route.query.from_batch) {
    query.batch_id = route.query.from_batch
  }

  router.push({
    name: 'documents.create',
    query,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// ✅ NEW — SCAN ACTIONS — forwards batch + applicant context
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Scan a brand-new document.
 * Passes: batch_id (if known) + applicant_id
 * User only picks: document type
 */
function scanNew() {
  const query: Record<string, any> = {
    applicant_id: numericApplicantId.value,
  }
  if (route.query.from_batch) {
    query.batch_id = route.query.from_batch
  }

  router.push({
    name: 'documents.scan',
    query,
  })
}

/**
 * Scan a new version for a specific document group.
 * Passes: batch_id (if known) + applicant_id + document_type_id
 * User picks: nothing — just clicks Start scan
 */
function scanNewVersion(g: DocumentGroup) {
  const query: Record<string, any> = {
    applicant_id: numericApplicantId.value,
    document_type_id: g.document_type_id,
  }
  if (route.query.from_batch) {
    query.batch_id = route.query.from_batch
  }

  router.push({
    name: 'documents.scan',
    query,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS UPDATE DIALOG
// ═══════════════════════════════════════════════════════════════════════════
const statusDialog = ref(false)
const editingVersion = ref<FolderVersion | null>(null)
const editingGroup = ref<DocumentGroup | null>(null)
const newStatus = ref<DocumentStatus>('uploaded')
const rejectionReason = ref('')
const statusNotes = ref('')

const statusOptions = [
  { label: 'Uploaded', value: 'uploaded' },
  { label: 'Pending Verification', value: 'pending_verification' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Verified', value: 'verified' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Requires Correction', value: 'requires_correction' },
  { label: 'Expired', value: 'expired' },
]

function openStatusDialog(group: DocumentGroup, version?: FolderVersion) {
  const target = version ?? group.versions.find(v => v.is_current) ?? group.versions[0]
  if (!target) return

  editingGroup.value = group
  editingVersion.value = target
  newStatus.value = target.status as DocumentStatus
  rejectionReason.value = ''
  statusNotes.value = ''
  statusDialog.value = true
}

async function saveStatus() {
  if (!editingVersion.value) return

  if (newStatus.value === 'rejected' && !rejectionReason.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Rejection reason required',
      detail: 'Please provide a reason for rejection.',
      life: 3000,
    })
    return
  }

  try {
    await store.updateDocumentStatus(
      editingVersion.value.id,
      newStatus.value,
      newStatus.value === 'rejected' ? rejectionReason.value.trim() : null,
      statusNotes.value.trim() || null,
    )

    toast.add({
      severity: 'success',
      summary: 'Status updated',
      detail: `Document marked as ${statusLabel(newStatus.value)}`,
      life: 2500,
    })

    statusDialog.value = false
    await store.fetchFolder(numericApplicantId.value)
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Update failed',
      detail: store.error ?? 'Could not update document status',
      life: 3500,
    })
  }
}

function statusLabel(status: string): string {
  return statusOptions.find(s => s.value === status)?.label ?? status
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1200px] mx-auto">

    <!-- ✅ Breadcrumb -->
    <div class="flex items-center gap-2">
      <Button icon="pi pi-arrow-left" text rounded v-tooltip.right="'Back to Applicants'" @click="goToApplicants" />
      <nav class="text-sm text-blueberry-500 flex items-center gap-1 flex-wrap" aria-label="Breadcrumb">
        <button type="button" class="hover:text-apricot-600 hover:underline font-medium transition-colors
                 focus:outline-none focus:text-apricot-600" @click="goToBatches">
          <i class="pi pi-briefcase text-[10px] mr-1" />
          Batches
        </button>

        <span class="text-blueberry-300 mx-1" aria-hidden="true">/</span>

        <button type="button" class="hover:text-apricot-600 hover:underline font-medium transition-colors
                 focus:outline-none focus:text-apricot-600" @click="goToApplicants">
          <i class="pi pi-users text-[10px] mr-1" />
          Applicants
        </button>

        <span class="text-blueberry-300 mx-1" aria-hidden="true">/</span>

        <span class="font-semibold text-blueberry-800" aria-current="page">
          {{ folder?.applicant_name ?? 'Folder' }}
        </span>
      </nav>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <Skeleton height="120px" border-radius="16px" class="mb-2" />
      <Skeleton height="80px" border-radius="16px" class="mb-2" />
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

    <!-- ✅ Content -->
    <template v-else>

      <!-- Applicant header card -->
      <AppCard>
        <div class="flex items-start gap-5">
          <div class="w-16 h-16 rounded-2xl bg-apricot-500 text-white
                      flex items-center justify-center font-serif font-bold text-lg flex-shrink-0">
            {{ initials(folder.applicant_name) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-2xl font-serif font-bold text-blueberry-800">
                {{ folder.applicant_name }}
              </h1>
              <span v-if="folder.has_pending" class="text-[10px] font-bold uppercase tracking-wide
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

          <!-- ✅ Action buttons — View + Scan + Upload -->
          <div class="flex gap-2 flex-shrink-0 flex-wrap">
            <Button icon="pi pi-external-link" label="View Profile" text @click="goToApplicant" />

            <Button
              icon="pi pi-camera"
              label="Scan"
              outlined
              class="!border-apricot-500 !text-apricot-600
                     hover:!bg-apricot-50
                     !px-4 !py-2 !rounded-xl !font-semibold"
              @click="scanNew"
            />

            <AppButton icon="pi pi-upload" label="Upload Document" variant="accent" @click="uploadNew" />
          </div>
        </div>
      </AppCard>

      <!-- Stat cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <AppStatCard label="Document Types" :value="folder.total_types" icon="pi pi-tag" variant="apricot" />
        <AppStatCard label="Total Files" :value="folder.total_documents" icon="pi pi-file" variant="blueberry" />
        <AppStatCard label="Pending" :value="folder.has_pending ? 'Yes' : 'None'" icon="pi pi-clock" variant="citrus" />
      </div>

      <!-- Filter bar -->
      <div class="flex items-center justify-between bg-white rounded-2xl
                  border border-appleCore-100 px-5 py-3">
        <div class="flex items-center gap-3">
          <i class="pi pi-filter text-apricot-500 text-sm" />
          <span class="text-sm font-medium text-blueberry-700">Filters</span>
        </div>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <span class="text-sm text-blueberry-600">Show verified only</span>
          <ToggleSwitch v-model="showVerifiedOnly" />
        </label>
      </div>

      <!-- Document groups -->
      <div class="flex flex-col gap-3">
        <AppCard v-for="group in folder.groups" :key="group.document_type_id" padding="none">

          <!-- ── Group header ── -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-appleCore-100">
            <div class="w-10 h-10 rounded-xl bg-apricot-50 text-apricot-600
                        flex items-center justify-center flex-shrink-0">
              <i class="pi pi-file text-sm" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-semibold text-blueberry-800 truncate">
                  {{ group.document_type_name }}
                </p>
                <span class="font-mono text-[10px] text-apricot-600 font-semibold
                             bg-apricot-50 px-1.5 py-0.5 rounded">
                  {{ group.document_type_code }}
                </span>
                <span class="text-xs text-blueberry-400">
                  {{ group.total_versions }}
                  version{{ group.total_versions === 1 ? '' : 's' }}
                </span>
              </div>
            </div>

            <!-- Clickable status badge -->
            <button type="button" class="cursor-pointer hover:opacity-80 transition-opacity"
              title="Click to change status" @click="openStatusDialog(group)">
              <DocumentStatusBadge :status="group.latest_status" />
            </button>

            <!-- Version History button -->
            <Button v-if="group.versions.length > 0" icon="pi pi-history" label="History" text size="small"
              class="!text-blueberry-500 hover:!text-apricot-600" v-tooltip.top="'View full version history'" @click="goToVersionHistory(
                group.versions.find(v => v.is_current) ?? group.versions[0]
              )" />

            <!-- ✅ NEW: Scan new version -->
            <Button
              icon="pi pi-camera"
              label="Scan"
              text
              size="small"
              class="!text-apricot-600"
              v-tooltip.top="'Scan a new version'"
              @click="scanNewVersion(group)"
            />

            <Button icon="pi pi-plus" label="New Version" text size="small" class="!text-apricot-600"
              @click="uploadNewVersion(group)" />
          </div>

          <!-- ── Empty state ── -->
          <div v-if="visibleVersions(group).length === 0" class="px-5 py-8 text-center">
            <i class="pi pi-inbox text-3xl text-blueberry-300 mb-2 block" />
            <p class="text-sm text-blueberry-500">
              No verified versions for this document.
            </p>
            <button type="button" class="mt-2 text-xs font-medium text-apricot-600 hover:text-apricot-700"
              @click="showVerifiedOnly = false">
              Show all versions
            </button>
          </div>

          <!-- ── Version rows ── -->
          <div v-else class="flex flex-col divide-y divide-appleCore-100/60">
            <div v-for="v in visibleVersions(group)" :key="v.id" role="button" tabindex="0" class="group flex items-center gap-3 px-5 py-3
                     cursor-pointer transition-colors
                     hover:bg-apricot-50/50
                     focus:outline-none focus:bg-apricot-50/50
                     focus:ring-2 focus:ring-inset focus:ring-apricot-300"
              :class="v.is_current ? 'bg-apricot-50/20' : ''" v-tooltip.top="'Click to view document'"
              @click="goToDocument(v)" @keydown.enter="goToDocument(v)" @keydown.space.prevent="goToDocument(v)">
              <!-- Version badge -->
              <span class="w-10 h-7 rounded-md text-[10px] font-bold tabular-nums
                       flex items-center justify-center flex-shrink-0" :class="v.is_current
                        ? 'bg-apricot-500 text-white'
                        : 'bg-appleCore-100 text-blueberry-600'">
                v{{ v.version }}
              </span>

              <!-- File info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm text-blueberry-700 truncate font-medium
                            group-hover:text-apricot-700 transition-colors">
                    {{ v.file_name }}
                  </p>

                  <!-- Per-version status pill -->
                  <span v-if="v.status !== group.latest_status || !v.is_current" class="text-[9px] font-bold uppercase tracking-wide
                           px-1.5 py-0.5 rounded flex-shrink-0" :class="{
                            'bg-green-50  text-green-700': v.status === 'verified',
                            'bg-red-50    text-red-700': v.status === 'rejected',
                            'bg-amber-50  text-amber-700':
                              v.status === 'pending_verification' || v.status === 'under_review',
                            'bg-blueberry-50 text-blueberry-600':
                              !['verified', 'rejected', 'pending_verification', 'under_review']
                                .includes(v.status),
                          }">
                    {{ v.status.replace(/_/g, ' ') }}
                  </span>
                </div>

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

              <!-- ✅ Action buttons -->
              <div class="flex items-center gap-0.5" @click.stop>
                <Button icon="pi pi-eye" text rounded size="small"
                  class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50" v-tooltip.top="'View document'"
                  @click.stop="goToDocument(v)" />

                <Button icon="pi pi-history" text rounded size="small"
                  class="!text-blueberry-500 hover:!text-purple-600 hover:!bg-purple-50"
                  v-tooltip.top="'Version history'" @click.stop="goToVersionHistory(v)" />

                <Button icon="pi pi-refresh" text rounded size="small"
                  class="!text-blueberry-500 hover:!text-emerald-600 hover:!bg-emerald-50"
                  v-tooltip.top="'Change status'" @click.stop="openStatusDialog(group, v)" />

                <Button icon="pi pi-pencil" text rounded size="small"
                  class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50" v-tooltip.top="'Edit'"
                  @click.stop="editDocument(v)" />
              </div>
            </div>

            <!-- ✅ Expand / collapse older versions -->
            <button v-if="hiddenCount(group) > 0 || isExpanded(group.document_type_id)" type="button" class="flex items-center justify-center gap-2 py-2.5
                     text-xs font-semibold text-blueberry-500
                     hover:text-apricot-600 hover:bg-apricot-50/40
                     transition-colors border-t border-appleCore-100/60" @click="toggleExpand(group.document_type_id)">
              <i :class="isExpanded(group.document_type_id)
                ? 'pi pi-chevron-up'
                : 'pi pi-chevron-down'" class="text-[10px]" />
              {{
                isExpanded(group.document_type_id)
                  ? 'Hide older versions'
                  : `Show ${hiddenCount(group)} older version${hiddenCount(group) === 1 ? '' : 's'}`
              }}
            </button>
          </div>

          <!-- ═══════════════ VERSION HISTORY MINI-SECTION ══════════════ -->
          <div v-if="isExpanded(group.document_type_id) && group.versions.length > 1"
            class="border-t border-appleCore-100 bg-appleCore-50/30">
            <div class="flex items-center justify-between px-5 py-3">
              <h4 class="text-xs font-serif font-semibold text-blueberry-700
                         flex items-center gap-1.5">
                <i class="pi pi-history text-apricot-500 text-[11px]" />
                Version History
                <span class="text-[10px] text-blueberry-400 font-sans font-normal">
                  ({{ group.versions.length }})
                </span>
              </h4>

              <Button label="View All" icon="pi pi-external-link" text size="small"
                class="!text-apricot-600 hover:!text-apricot-700 !text-xs" @click="goToVersionHistory(
                  group.versions.find(v => v.is_current) ?? group.versions[0]
                )" />
            </div>

            <div class="flex flex-col divide-y divide-appleCore-100/50 px-3 pb-3">
              <div v-for="ver in [...group.versions].sort((a, b) => b.version - a.version)" :key="ver.id" role="button"
                tabindex="0" class="group/ver flex items-center gap-3 px-3 py-2.5 rounded-xl
                       cursor-pointer transition-all
                       hover:bg-white hover:shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-apricot-300" v-tooltip.top="'View version detail'"
                @click="goToVersionDetail(ver)" @keydown.enter="goToVersionDetail(ver)"
                @keydown.space.prevent="goToVersionDetail(ver)">
                <div class="w-8 h-8 rounded-lg bg-apricot-50 text-apricot-600
                            flex items-center justify-center flex-shrink-0
                            group-hover/ver:bg-apricot-100 transition-colors">
                  <i class="pi pi-file text-xs" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-xs font-semibold text-blueberry-800
                              group-hover/ver:text-apricot-600 transition-colors">
                      Version {{ ver.version }}
                    </p>
                    <span v-if="ver.is_current" class="px-1.5 py-0.5 bg-green-50 text-green-700
                             text-[9px] font-semibold uppercase tracking-wide rounded">
                      Current
                    </span>
                    <span v-else class="text-[9px] font-bold uppercase tracking-wide
                             px-1.5 py-0.5 rounded flex-shrink-0" :class="{
                              'bg-green-50  text-green-700': ver.status === 'verified',
                              'bg-red-50    text-red-700': ver.status === 'rejected',
                              'bg-amber-50  text-amber-700':
                                ver.status === 'pending_verification' || ver.status === 'under_review',
                              'bg-blueberry-50 text-blueberry-600':
                                !['verified', 'rejected', 'pending_verification', 'under_review']
                                  .includes(ver.status),
                            }">
                      {{ ver.status.replace(/_/g, ' ') }}
                    </span>
                  </div>

                  <p class="text-[10px] text-blueberry-400 truncate mt-0.5 tabular-nums">
                    {{ ver.file_name }}
                    · {{ formatSize(ver.file_size) }}
                    · {{ formatDate(ver.uploaded_at) }}
                  </p>
                </div>

                <div class="flex items-center gap-1 flex-shrink-0 text-blueberry-300
                            group-hover/ver:text-apricot-500 transition-colors">
                  <i class="pi pi-external-link text-[11px]" />
                  <span class="text-[10px] font-medium hidden sm:inline">View</span>
                </div>
              </div>
            </div>
          </div>

        </AppCard>
      </div>
    </template>

    <!-- ═══════════════════════ Status Dialog ═══════════════════════ -->
    <Dialog v-model:visible="statusDialog" modal :header="editingVersion
      ? `Update Status — v${editingVersion.version}`
      : 'Update Status'" :style="{ width: '480px' }" :closable="!store.submitting">
      <div class="flex flex-col gap-4 pt-2">

        <div v-if="editingGroup" class="text-sm text-blueberry-500">
          <span class="font-semibold text-blueberry-700">
            {{ editingGroup.document_type_name }}
          </span>
          <span v-if="editingVersion"> · {{ editingVersion.file_name }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">
            New Status
          </label>
          <Select v-model="newStatus" :options="statusOptions" option-label="label" option-value="value" class="w-full"
            placeholder="Select status" />
        </div>

        <div v-if="newStatus === 'rejected'">
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">
            Rejection Reason <span class="text-red-500">*</span>
          </label>
          <Textarea v-model="rejectionReason" rows="3" class="w-full"
            placeholder="Explain why this document is being rejected…" />
        </div>

        <div v-if="newStatus !== 'rejected'">
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">
            Notes
            <span class="text-blueberry-400 font-normal">(optional)</span>
          </label>
          <Textarea v-model="statusNotes" rows="2" class="w-full" placeholder="Add a note about this status change…" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" text :disabled="store.submitting" @click="statusDialog = false" />
        <Button label="Save" icon="pi pi-check" :loading="store.submitting"
          :disabled="newStatus === 'rejected' && !rejectionReason.trim()"
          class="!bg-apricot-500 !border-apricot-500 !text-white" @click="saveStatus" />
      </template>
    </Dialog>

  </div>
</template>