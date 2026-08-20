<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import DeploymentDialog from './DeploymentDialog.vue'
import { useDeployments } from '../composables/useDeployments'
import type { DeployApplicantPayload } from '../types'
import { useDeploymentStore } from '../stores/deployment.store'

const props = defineProps<{
  /** The applicant_batch ID (not applicant ID!) */
  applicantBatchId: number
  applicantName?: string
  applicantCode?: string
  /** Show as full button with label */
  showLabel?: boolean
  /** Size */
  size?: 'small' | 'large'
}>()

const emit = defineEmits<{
  (e: 'deployed'): void
}>()

const store = useDeploymentStore()
const { handleDeploy } = useDeployments()
const showDialog = ref(false)

function openDialog() {
  showDialog.value = true
}

async function onSubmit(payload: DeployApplicantPayload) {
  const result = await handleDeploy(props.applicantBatchId, payload, props.applicantName)
  if (result) {
    showDialog.value = false
    emit('deployed')
  }
}
</script>

<template>
  <span @click.stop>
    <Button
      v-if="showLabel"
      label="Deploy"
      icon="pi pi-send"
      size="small"
      class="!bg-green-600 hover:!bg-green-700 !border-green-600 !text-white"
      @click="openDialog"
    />
    <Button
      v-else
      icon="pi pi-send"
      text
      rounded
      :size="size ?? 'small'"
      class="!text-blueberry-500 hover:!text-green-600 hover:!bg-green-50"
      v-tooltip.top="'Deploy Applicant'"
      @click="openDialog"
    />

    <DeploymentDialog
      v-model:visible="showDialog"
      mode="deploy"
      :applicant-name="applicantName"
      :applicant-code="applicantCode"
      :submitting="store.submitting"
      @submit="onSubmit"
    />
  </span>
</template>