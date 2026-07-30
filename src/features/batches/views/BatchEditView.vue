<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import BatchForm from '../components/BatchForm.vue'
import { useBatches } from '../composables/useBatches'
import { useBatchStore } from '../stores/batch.store'
import type { BatchPayload } from '../types'

const props = defineProps<{ id: number }>()

const router = useRouter()
const store  = useBatchStore()
const { handleUpdate } = useBatches()

onMounted(async () => {
  store.clearBatch()
  await store.fetchBatch(props.id)
})

const batch = computed(() => store.batch)

async function onSubmit(payload: BatchPayload) {
  await handleUpdate(props.id, payload)
  router.push({ name: 'batches.show', params: { id: props.id } })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
    <div class="flex items-center gap-3">
      <Button icon="pi pi-arrow-left" text rounded @click="router.push({ name: 'batches.show', params: { id } })" />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">Edit Batch</h1>
        <p v-if="batch" class="text-sm text-blueberry-500">{{ batch.name }}</p>
      </div>
    </div>

    <Skeleton v-if="store.loading" height="500px" border-radius="16px" />

    <BatchForm
      v-else-if="batch"
      :initial="batch"
      submit-label="Save Changes"
      :loading="store.submitting"
      @submit="onSubmit"
      @cancel="router.push({ name: 'batches.show', params: { id } })"
    />
  </div>
</template>