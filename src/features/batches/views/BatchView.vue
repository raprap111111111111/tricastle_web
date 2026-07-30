<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import BatchStatusBadge from '../components/BatchStatusBadge.vue'
import { useBatchStore } from '../stores/batch.store'
import { useBatches } from '../composables/useBatches'

const props = defineProps<{ id: number }>()

const router = useRouter()
const store  = useBatchStore()
const { handleActivate, handleDeactivate } = useBatches()

onMounted(async () => {
  store.clearBatch()
  await store.fetchBatch(props.id)
})

const b = computed(() => store.batch)

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

async function onToggleActive() {
  if (!b.value) return
  if (b.value.is_active) {
    await handleDeactivate(b.value.id)
  } else {
    await handleActivate(b.value.id)
  }
  await store.fetchBatch(props.id)
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-4xl mx-auto">

    <!-- Header Nav -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text rounded
          @click="router.push({ name: 'batches.index' })"
        />
        <div>
          <h1 class="text-2xl font-serif font-bold text-blueberry-800">
            Batch Details
          </h1>
          <p v-if="b" class="text-sm text-blueberry-500">
            Batch #{{ b.batch_number }}
          </p>
        </div>
      </div>

      <div v-if="b" class="flex items-center gap-2">
        <Button
          :label="b.is_active ? 'Deactivate' : 'Activate'"
          :icon="b.is_active ? 'pi pi-times-circle' : 'pi pi-check-circle'"
          :severity="b.is_active ? 'warn' : 'success'"
          outlined
          :loading="store.submitting"
          @click="onToggleActive"
        />
        <Button
          label="Edit"
          icon="pi pi-pencil"
          severity="secondary"
          outlined
          @click="router.push({ name: 'batches.edit', params: { id: b.id } })"
        />
      </div>
    </div>

    <!-- Loading -->
    <template v-if="store.loading">
      <Skeleton height="200px" border-radius="16px" />
      <Skeleton height="200px" border-radius="16px" />
    </template>

    <!-- Not Found -->
    <template v-else-if="!b">
      <div class="text-center py-16 text-blueberry-400">
        <i class="pi pi-graduation-cap text-4xl mb-3" />
        <p>Batch not found</p>
      </div>
    </template>

    <!-- Details -->
    <template v-else>

      <!-- Active Banner -->
      <div
        v-if="b.is_active"
        class="flex items-center gap-3 p-4 bg-gradient-to-r from-apricot-50 to-citrus-50
               border border-apricot-200 rounded-2xl"
      >
        <div class="w-10 h-10 rounded-full bg-apricot-500 text-white flex items-center justify-center">
          <i class="pi pi-star-fill" />
        </div>
        <div>
          <p class="text-sm font-semibold text-apricot-800">This is the Active Batch</p>
          <p class="text-xs text-apricot-600 mt-0.5">
            New applicants are automatically added to this batch
          </p>
        </div>
      </div>

      <!-- Header Card -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="font-mono text-xs text-apricot-600 font-semibold bg-apricot-50 px-2 py-0.5 rounded">
                Batch #{{ b.batch_number }}
              </span>
              <BatchStatusBadge :status="b.status" />
              <span
                v-if="b.is_active"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
                       bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              >
                <i class="pi pi-check-circle text-[10px]" />
                Active
              </span>
            </div>
            <h2 class="text-2xl font-serif font-semibold text-blueberry-800">
              {{ b.name }}
            </h2>
            <div class="flex flex-wrap gap-4 mt-2 text-sm text-blueberry-500">
              <span v-if="b.country" class="flex items-center gap-1.5">
                <i class="pi pi-globe text-xs" />
                {{ b.country }} 🇯🇵
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Deployment -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-calendar text-apricot-500" />
          Deployment
        </h3>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">
              Departure to Japan 🇯🇵
            </dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ formatDate(b.deployment_date) }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Description -->
      <section
        v-if="b.description"
        class="bg-white rounded-2xl border border-appleCore-100 p-6"
      >
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-2 flex items-center gap-2">
          <i class="pi pi-align-left text-apricot-500" />
          About This Batch
        </h3>
        <p class="text-sm text-blueberry-700 whitespace-pre-line leading-relaxed">
          {{ b.description }}
        </p>
      </section>
    </template>
  </div>
</template>