<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import BatchForm from '../components/BatchForm.vue'
import { useBatches } from '../composables/useBatches'
import { useBatchStore } from '../stores/batch.store'
import type { BatchPayload } from '../types'

const router = useRouter()
const store  = useBatchStore()
const { handleCreate } = useBatches()

async function onSubmit(payload: BatchPayload) {
  const created = await handleCreate(payload)
  router.push({ name: 'batches.show', params: { id: created.id } })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        @click="router.push({ name: 'batches.index' })"
      />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          New Training Batch
        </h1>
        <p class="text-sm text-blueberry-500">
          Create a new cohort for approved applicants heading to Japan 🇯🇵
        </p>
      </div>
    </div>

    <BatchForm
      submit-label="Create Batch"
      :loading="store.submitting"
      @submit="onSubmit"
      @cancel="router.push({ name: 'batches.index' })"
    />
  </div>
</template>