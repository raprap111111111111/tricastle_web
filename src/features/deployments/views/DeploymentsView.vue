<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import SelectButton from 'primevue/selectbutton'
import { AppCard } from '@shared/ui'
import { useDeploymentStore } from '../stores/deployment.store'
import { useDeployments } from '../composables/useDeployments'
import { useDeploymentRealtime } from '../composables/useDeploymentRealtime'
import DeploymentStats from '../components/DeploymentStats.vue'
import DeploymentFilters from '../components/DeploymentFilters.vue'
import DeploymentTable from '../components/DeploymentTable.vue'
import DeploymentTimeline from '../components/DeploymentTimeline.vue'
import DeploymentDialog from '../components/DeploymentDialog.vue'
import CancelDeploymentDialog from '../components/CancelDeploymentDialog.vue'
import type { Deployment, DeployApplicantPayload, DeploymentFilters as IFilters } from '../types'

const router = useRouter()
const store = useDeploymentStore()
const { handleUpdate, handleCancel } = useDeployments()

// ─── View mode ────────────────────────────────────────
const viewMode = ref<'table' | 'timeline'>('table')

const viewModeOptions = [
  { label: 'Table', value: 'table', icon: 'pi pi-table' },
  { label: 'Timeline', value: 'timeline', icon: 'pi pi-calendar' },
]

// ─── Dialogs ──────────────────────────────────────────
const editDialog = ref(false)
const cancelDialog = ref(false)
const selectedDeployment = ref<Deployment | null>(null)

// ─── Load data ────────────────────────────────────────
async function loadAll() {
  await Promise.all([
    store.fetchDeployments(),
    store.fetchStats(),
    store.fetchCountries(),
  ])
}

onMounted(loadAll)

// ─── Real-time updates ────────────────────────────────
useDeploymentRealtime({ onReload: loadAll })

// ─── Filter handlers ──────────────────────────────────
function onFilter(filters: Partial<IFilters>) {
  store.setFilters(filters)
  store.fetchDeployments()
}

function onReset() {
  store.resetFilters()
  loadAll()
}

function onPageChange(page: number) {
  store.setPage(page)
  store.fetchDeployments()
}

function onLimitChange(limit: number) {
  store.setLimit(limit)
  store.fetchDeployments()
}

// ─── Row action handlers ──────────────────────────────
function onEdit(deployment: Deployment) {
  selectedDeployment.value = deployment
  editDialog.value = true
}

function onCancelClick(deployment: Deployment) {
  selectedDeployment.value = deployment
  cancelDialog.value = true
}

async function onUpdateSubmit(payload: DeployApplicantPayload) {
  if (!selectedDeployment.value) return

  const result = await handleUpdate(
    selectedDeployment.value.id,
    payload,
    selectedDeployment.value.applicant?.full_name,
  )

  if (result) {
    editDialog.value = false
    selectedDeployment.value = null
    await store.fetchStats()
  }
}

async function onCancelConfirm(reason: string) {
  if (!selectedDeployment.value) return

  const result = await handleCancel(
    selectedDeployment.value.id,
    reason,
    selectedDeployment.value.applicant?.full_name,
  )

  if (result) {
    cancelDialog.value = false
    selectedDeployment.value = null
    await store.fetchStats()
  }
}

const selectedApplicantName = computed(() => selectedDeployment.value?.applicant?.full_name)
const selectedApplicantCode = computed(() => selectedDeployment.value?.applicant?.applicant_code)
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex flex-col sm:flex-row items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="router.push({ name: 'applicants.index' })"
        />
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
              Deployments
            </h1>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium ring-1 ring-green-200">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live
            </span>
          </div>
          <p class="text-sm text-blueberry-500 mt-1">
            Track all overseas deployments and manage contracts
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- View mode toggle -->
        <SelectButton
          v-model="viewMode"
          :options="viewModeOptions"
          option-label="label"
          option-value="value"
          size="small"
        >
          <template #option="{ option }">
            <div class="flex items-center gap-1.5">
              <i :class="option.icon" class="text-xs" />
              <span>{{ option.label }}</span>
            </div>
          </template>
        </SelectButton>

        <Button
          label="Refresh"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="store.loading"
          @click="loadAll"
        />
      </div>
    </header>

    <!-- ─── Stats ──────────────────────────────────── -->
    <DeploymentStats :stats="store.stats" />

    <!-- ─── Filters ────────────────────────────────── -->
    <DeploymentFilters
      :countries="store.countries"
      @filter="onFilter"
      @reset="onReset"
    />

    <!-- ─── Loading skeleton ──────────────────────── -->
    <template v-if="store.loading && store.deployments.length === 0">
      <Skeleton height="400px" border-radius="16px" />
    </template>

    <!-- ─── TABLE View ─────────────────────────────── -->
    <template v-else-if="viewMode === 'table'">
      <AppCard :padding="'none'" :shadow="'soft'">
        <DeploymentTable
          :deployments="store.deployments"
          :pagination="store.pagination"
          :loading="store.loading"
          :submitting="store.submitting"
          @page-change="onPageChange"
          @limit-change="onLimitChange"
          @edit="onEdit"
          @cancel="onCancelClick"
        />
      </AppCard>
    </template>

    <!-- ─── TIMELINE View ─────────────────────────── -->
    <template v-else>
      <DeploymentTimeline
        :deployments="store.deployments"
        :loading="store.loading"
      />
    </template>

    <!-- ─── Edit Dialog ────────────────────────────── -->
    <DeploymentDialog
      v-model:visible="editDialog"
      mode="edit"
      :deployment="selectedDeployment"
      :applicant-name="selectedApplicantName"
      :applicant-code="selectedApplicantCode"
      :submitting="store.submitting"
      @submit="onUpdateSubmit"
    />

    <!-- ─── Cancel Dialog ─────────────────────────── -->
    <CancelDeploymentDialog
      v-model:visible="cancelDialog"
      :deployment="selectedDeployment"
      :submitting="store.submitting"
      @confirm="onCancelConfirm"
    />
  </div>
</template>