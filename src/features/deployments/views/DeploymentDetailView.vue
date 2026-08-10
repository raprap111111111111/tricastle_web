<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { AppCard } from '@shared/ui'
import { useDeploymentStore } from '../stores/deployment.store'
import { useDeployments } from '../composables/useDeployments'
import DeploymentStatusBadge from '../components/DeploymentStatusBadge.vue'
import MarkReturnedDialog from '../components/MarkReturnedDialog.vue'
import MarkCompletedDialog from '../components/MarkCompletedDialog.vue'
import CancelDeploymentDialog from '../components/CancelDeploymentDialog.vue'

const props = defineProps<{
  id: number
}>()

const router = useRouter()
const store = useDeploymentStore()
const { handleMarkReturned, handleMarkCompleted, handleCancel } = useDeployments()

// ─── Dialogs ──────────────────────────────────────────
const returnedDialog  = ref(false)
const completedDialog = ref(false)
const cancelDialog    = ref(false)

onMounted(() => {
  store.fetchDeployment(props.id)
})

const deployment = computed(() => store.deployment)

// Helper — is this deployment currently active (deployed and not returned/completed/cancelled)?
const isActivelyDeployed = computed(() => {
  const d = deployment.value
  if (!d) return false
  return (d as any).status === 'deployed'
    && !(d as any).cancelled_at
    && !(d as any).returned_at
    && !(d as any).completed_at
})

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  } catch { return '—' }
}

function formatSalary(amount: number | null, currency: string | null): string {
  if (!amount) return '—'
  return `${Number(amount).toLocaleString()} ${currency ?? ''}`
}

function goBack() {
  router.push({ name: 'deployments.index' })
}

function goToApplicant() {
  if (deployment.value?.applicant_id) {
    router.push({ name: 'applicants.show', params: { id: deployment.value.applicant_id } })
  }
}

// ─── Action handlers ──────────────────────────────────
async function onReturnedConfirm(reason: string) {
  if (!deployment.value) return
  const success = await handleMarkReturned(
    deployment.value.id,
    reason,
    deployment.value.applicant?.full_name,
  )
  if (success) {
    returnedDialog.value = false
    await store.fetchDeployment(props.id)
  }
}

async function onCompletedConfirm(notes: string | null) {
  if (!deployment.value) return
  const success = await handleMarkCompleted(
    deployment.value.id,
    notes,
    deployment.value.applicant?.full_name,
  )
  if (success) {
    completedDialog.value = false
    await store.fetchDeployment(props.id)
  }
}

async function onCancelConfirm(reason: string) {
  if (!deployment.value) return
  const result = await handleCancel(
    deployment.value.id,
    reason,
    deployment.value.applicant?.full_name,
  )
  if (result) {
    cancelDialog.value = false
    await store.fetchDeployment(props.id)
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1200px] mx-auto">

    <!-- Loading -->
    <template v-if="store.loading">
      <Skeleton height="60px" border-radius="12px" />
      <Skeleton height="400px" border-radius="16px" />
    </template>

    <!-- Not found -->
    <template v-else-if="!deployment">
      <div class="text-center py-16">
        <i class="pi pi-send text-4xl text-blueberry-300 mb-3" />
        <p class="text-blueberry-500">Deployment not found</p>
        <Button label="Back to Deployments" icon="pi pi-arrow-left" text class="mt-4" @click="goBack" />
      </div>
    </template>

    <!-- Detail -->
    <template v-else>
      <!-- Header -->
      <header class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <Button icon="pi pi-arrow-left" text rounded @click="goBack" />
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
                Deployment Details
              </h1>
              <DeploymentStatusBadge :status="deployment.status" :cancelled-at="deployment.cancelled_at" />
            </div>
            <p class="text-sm text-blueberry-500 mt-1">
              {{ deployment.applicant?.full_name ?? 'Unknown Applicant' }}
              <span v-if="deployment.applicant?.applicant_code" class="text-apricot-600 font-mono ml-1">
                ({{ deployment.applicant.applicant_code }})
              </span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button
            label="View Applicant"
            icon="pi pi-external-link"
            severity="secondary"
            outlined
            @click="goToApplicant"
          />
        </div>
      </header>

      <!-- 🚀 Action Bar (only when actively deployed) -->
      <div
        v-if="isActivelyDeployed"
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4
               bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50
               border-2 border-indigo-200 rounded-xl shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center shadow-sm">
            <i class="pi pi-cog text-white" />
          </div>
          <div>
            <p class="text-sm font-semibold text-indigo-900">
              Update Deployment Status
            </p>
            <p class="text-xs text-indigo-700 mt-0.5">
              Choose the action that reflects the current situation
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <Button
            label="Mark Returned"
            icon="pi pi-home"
            severity="warning"
            outlined
            size="small"
            @click="returnedDialog = true"
          />
          <Button
            label="Mark Completed"
            icon="pi pi-check-circle"
            size="small"
            class="!bg-blue-600 hover:!bg-blue-700 !border-blue-600"
            @click="completedDialog = true"
          />
          <Button
            label="Cancel Deployment"
            icon="pi pi-times-circle"
            severity="danger"
            outlined
            size="small"
            @click="cancelDialog = true"
          />
        </div>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Destination Card -->
        <AppCard padding="normal" shadow="soft">
          <template #header>
            <div class="flex items-center gap-2 mb-3">
              <i class="pi pi-globe text-green-500" />
              <h3 class="font-serif text-lg font-semibold text-blueberry-800">Destination</h3>
            </div>
          </template>

          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Country</dt>
              <dd class="font-semibold text-blueberry-800">{{ deployment.deployment_country ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Company</dt>
              <dd class="font-semibold text-blueberry-800">{{ deployment.deployment_company ?? '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Position</dt>
              <dd class="font-semibold text-blueberry-800">{{ deployment.deployment_position ?? '—' }}</dd>
            </div>
          </dl>
        </AppCard>

        <!-- Timeline Card -->
        <AppCard padding="normal" shadow="soft">
          <template #header>
            <div class="flex items-center gap-2 mb-3">
              <i class="pi pi-calendar text-apricot-500" />
              <h3 class="font-serif text-lg font-semibold text-blueberry-800">Timeline</h3>
            </div>
          </template>

          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Deployed Date</dt>
              <dd class="font-semibold text-blueberry-800">{{ formatDate(deployment.deployed_at) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Flight Date</dt>
              <dd class="font-semibold text-blueberry-800">{{ formatDate(deployment.flight_date) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Contract Start</dt>
              <dd class="font-semibold text-blueberry-800">{{ formatDate(deployment.contract_start_date) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Contract End</dt>
              <dd class="font-semibold text-blueberry-800">{{ formatDate(deployment.contract_end_date) }}</dd>
            </div>
          </dl>
        </AppCard>

        <!-- Contract Card -->
        <AppCard padding="normal" shadow="soft">
          <template #header>
            <div class="flex items-center gap-2 mb-3">
              <i class="pi pi-briefcase text-blueberry-500" />
              <h3 class="font-serif text-lg font-semibold text-blueberry-800">Contract</h3>
            </div>
          </template>

          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Duration</dt>
              <dd class="font-semibold text-blueberry-800">
                {{ deployment.contract_duration_months ? `${deployment.contract_duration_months} months` : '—' }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Monthly Salary</dt>
              <dd class="font-semibold text-blueberry-800 tabular-nums">
                {{ formatSalary(deployment.monthly_salary, deployment.salary_currency) }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Visa Type</dt>
              <dd class="font-semibold text-blueberry-800">{{ deployment.visa_type ?? '—' }}</dd>
            </div>
          </dl>
        </AppCard>

        <!-- Processed By Card -->
        <AppCard padding="normal" shadow="soft">
          <template #header>
            <div class="flex items-center gap-2 mb-3">
              <i class="pi pi-user text-apricot-500" />
              <h3 class="font-serif text-lg font-semibold text-blueberry-800">Processed By</h3>
            </div>
          </template>

          <dl class="space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-blueberry-500">Deployed By</dt>
              <dd class="font-semibold text-blueberry-800">
                {{ deployment.processed_by?.full_name ?? '—' }}
              </dd>
            </div>
            <div v-if="deployment.cancelled_by" class="flex justify-between">
              <dt class="text-blueberry-500">Cancelled By</dt>
              <dd class="font-semibold text-red-700">
                {{ deployment.cancelled_by?.full_name ?? '—' }}
              </dd>
            </div>
            <div v-if="deployment.cancelled_at" class="flex justify-between">
              <dt class="text-blueberry-500">Cancelled On</dt>
              <dd class="font-semibold text-red-700">{{ formatDate(deployment.cancelled_at) }}</dd>
            </div>
          </dl>
        </AppCard>
      </div>

      <!-- 🏠 Returned home info -->
      <AppCard v-if="(deployment as any).returned_at" padding="normal" shadow="soft">
        <template #header>
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-home text-orange-500" />
            <h3 class="font-serif text-lg font-semibold text-blueberry-800">Returned Home</h3>
          </div>
        </template>

        <div class="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p class="text-xs font-medium text-orange-600 mb-1">
            Returned on {{ formatDate((deployment as any).returned_at) }}
          </p>
          <p v-if="(deployment as any).return_reason" class="text-sm text-orange-800 whitespace-pre-wrap italic">
            "{{ (deployment as any).return_reason }}"
          </p>
        </div>
      </AppCard>

      <!-- ✅ Completed info -->
      <AppCard v-if="(deployment as any).completed_at" padding="normal" shadow="soft">
        <template #header>
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-check-circle text-blue-500" />
            <h3 class="font-serif text-lg font-semibold text-blueberry-800">Contract Completed</h3>
          </div>
        </template>

        <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-xs font-medium text-blue-600 mb-1">
            Completed on {{ formatDate((deployment as any).completed_at) }}
          </p>
          <p v-if="(deployment as any).completion_notes" class="text-sm text-blue-800 whitespace-pre-wrap">
            {{ (deployment as any).completion_notes }}
          </p>
        </div>
      </AppCard>

      <!-- Notes -->
      <AppCard v-if="deployment.deployment_notes || deployment.cancellation_reason" padding="normal" shadow="soft">
        <template #header>
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-file-edit text-blueberry-500" />
            <h3 class="font-serif text-lg font-semibold text-blueberry-800">Notes</h3>
          </div>
        </template>

        <div v-if="deployment.deployment_notes" class="mb-3">
          <p class="text-xs font-medium text-blueberry-500 mb-1">Deployment Notes</p>
          <p class="text-sm text-blueberry-700 whitespace-pre-wrap">{{ deployment.deployment_notes }}</p>
        </div>

        <div v-if="deployment.cancellation_reason" class="p-3 bg-red-50 rounded-lg border border-red-200">
          <p class="text-xs font-medium text-red-600 mb-1">Cancellation Reason</p>
          <p class="text-sm text-red-800 whitespace-pre-wrap">{{ deployment.cancellation_reason }}</p>
        </div>
      </AppCard>

      <!-- ─── Dialogs ───────────────────────────────── -->
      <MarkReturnedDialog
        v-model:visible="returnedDialog"
        :applicant-name="deployment.applicant?.full_name"
        :applicant-code="deployment.applicant?.applicant_code"
        :country="deployment.deployment_country ?? undefined"
        :company="deployment.deployment_company ?? undefined"
        :submitting="store.submitting"
        @confirm="onReturnedConfirm"
      />

      <MarkCompletedDialog
        v-model:visible="completedDialog"
        :applicant-name="deployment.applicant?.full_name"
        :applicant-code="deployment.applicant?.applicant_code"
        :country="deployment.deployment_country ?? undefined"
        :company="deployment.deployment_company ?? undefined"
        :submitting="store.submitting"
        @confirm="onCompletedConfirm"
      />

      <CancelDeploymentDialog
        v-model:visible="cancelDialog"
        :deployment="deployment"
        :submitting="store.submitting"
        @confirm="onCancelConfirm"
      />
    </template>
  </div>
</template>