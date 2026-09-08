<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import InternshipStatusBadge from './InternshipStatusBadge.vue'
import InternshipFormDialog from './InternshipFormDialog.vue'
import ChangeCompanyDialog from './ChangeCompanyDialog.vue'
import GenerateMoaDialog from './GenerateMoaDialog.vue'
import { internshipApi } from '../api/internship.api'
import { useMoaDownload } from '../composables/useMoaDownload'
import type { Internship } from '../types'

const props = defineProps<{
  applicantId: number
}>()

const list = ref<Internship[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const showCreate = ref(false)
const showChange = ref(false)
const showMoa = ref(false)
const targetInternship = ref<Internship | null>(null)
const moaTargetId = ref<number | null>(null)
const downloadingId = ref<number | null>(null)

const { generateSingle } = useMoaDownload()

async function load() {
  if (!props.applicantId) {
    list.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const res = await internshipApi.byApplicant(props.applicantId)

    // After the http interceptor, res.data is usually already unwrapped.
    // Support both shapes safely without using "items".
    const body: any = res.data?.data ?? res.data

    const rows =
      (Array.isArray(body) ? body : null) ??
      (Array.isArray(body?.data) ? body.data : null) ??
      (Array.isArray(body?.records) ? body.records : null) ??
      []

    list.value = rows as Internship[]
  } catch (err: any) {
    console.error('[InternshipHistorySection] Failed to load internships:', err)
    error.value = err?.response?.data?.message || 'Failed to load internships'
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Reload when applicant changes (e.g. switching tabs/pages)
watch(() => props.applicantId, load)

function openChange(i: Internship) {
  targetInternship.value = i
  showChange.value = true
}

function openMoa(i: Internship) {
  moaTargetId.value = i.id
  showMoa.value = true
}

async function quickDownload(i: Internship) {
  downloadingId.value = i.id
  try {
    await generateSingle(i.id)
  } catch (err) {
    console.error('[InternshipHistorySection] Quick download failed:', err)
  } finally {
    downloadingId.value = null
  }
}

function onCreated() {
  showCreate.value = false
  load()
}

function onChanged() {
  showChange.value = false
  targetInternship.value = null
  load()
}

function onMoaGenerated() {
  // Optional: keep dialog open or close after success
  // showMoa.value = false
  load()
}
</script>

<template>
  <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 flex items-center gap-2">
        <i class="pi pi-briefcase text-apricot-500" />
        Internships
        <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">
          ({{ list.length }})
        </span>
      </h3>

      <Button
        label="New Internship"
        icon="pi pi-plus"
        size="small"
        class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white"
        @click="showCreate = true"
      />
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <Skeleton height="120px" border-radius="12px" class="mb-2" />
      <Skeleton height="120px" border-radius="12px" />
    </template>

    <!-- Error -->
    <template v-else-if="error">
      <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
        <button
          class="ml-2 underline font-medium"
          type="button"
          @click="load"
        >
          Retry
        </button>
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="!list.length">
      <p class="text-blueberry-400 italic text-sm">No internships yet</p>
    </template>

    <!-- List -->
    <template v-else>
      <div class="space-y-3">
        <div
          v-for="i in list"
          :key="i.id"
          class="border border-appleCore-100 rounded-lg p-4 hover:bg-appleCore-50/30 transition-colors"
        >
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span class="uppercase text-xs font-bold text-blueberry-700">
              {{ i.program_type }}
            </span>
            <InternshipStatusBadge :status="i.status" />
            <span
              v-if="i.is_current"
              class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded"
            >
              CURRENT
            </span>
          </div>

          <p class="font-semibold text-blueberry-800">
            {{ i.receiving_company?.name ?? '—' }}
            <span
              v-if="i.job_description"
              class="text-blueberry-500 font-normal"
            >
              · {{ i.job_description }}
            </span>
          </p>

          <p class="text-xs text-blueberry-500 mt-1">
            {{ i.contract_start ?? '—' }} → {{ i.contract_end ?? '—' }}
          </p>

          <div class="flex items-center gap-2 mt-3 flex-wrap">
            <!-- 🎯 FIXED: Word icon generated for MOA -->
            <Button
              label="Generate MOA"
              icon="pi pi-file-word"
              size="small"
              text
              @click="openMoa(i)"
            />
            <Button
              label="Download"
              icon="pi pi-download"
              size="small"
              text
              severity="success"
              :loading="downloadingId === i.id"
              @click="quickDownload(i)"
            />
            <Button
              v-if="i.can_change_company"
              label="Change Company"
              icon="pi pi-refresh"
              size="small"
              text
              severity="info"
              @click="openChange(i)"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Dialogs -->
    <InternshipFormDialog
      v-model:visible="showCreate"
      :applicant-id="applicantId"
      @created="onCreated"
    />

    <ChangeCompanyDialog
      v-model:visible="showChange"
      :internship="targetInternship"
      @changed="onChanged"
    />

    <GenerateMoaDialog
      v-model:visible="showMoa"
      :internship-id="moaTargetId"
      @generated="onMoaGenerated"
    />
  </section>
</template>