<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { useActivityLogStore } from '../stores/activity-log.store'
import ActivityLogActionBadge from '../components/ActivityLogActionBadge.vue'
import ActivityLogDiffDialog from '../components/ActivityLogDiffDialog.vue'

const props = defineProps<{ id: number }>()

const router = useRouter()
const store  = useActivityLogStore()

const diffOpen = ref(false)

onMounted(async () => {
  store.clearLog()
  await store.fetchLog(props.id)
})

const log = computed(() => store.log)

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const hasDiff = computed(
  () =>
    (log.value?.old_values && Object.keys(log.value.old_values).length > 0) ||
    (log.value?.new_values && Object.keys(log.value.new_values).length > 0),
)
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
    <div class="flex items-center gap-3">
      <Button icon="pi pi-arrow-left" text rounded @click="router.push({ name: 'activity-logs.index' })" />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          Activity Log Detail
        </h1>
        <p v-if="log" class="text-sm text-blueberry-500">
          Log #{{ log.id }}
        </p>
      </div>
    </div>

    <template v-if="store.loading">
      <Skeleton height="200px" border-radius="16px" />
      <Skeleton height="200px" border-radius="16px" />
    </template>

    <template v-else-if="!log">
      <div class="text-center py-16 text-blueberry-400">
        <i class="pi pi-exclamation-circle text-4xl mb-3" />
        <p>Activity log not found</p>
      </div>
    </template>

    <template v-else>
      <!-- Overview -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex items-center gap-3">
            <ActivityLogActionBadge :action="log.action" />
            <span class="text-sm font-semibold text-blueberry-700">
              {{ log.module }}
            </span>
          </div>
          <span class="text-xs text-blueberry-400 tabular-nums">
            {{ formatDateTime(log.created_at) }}
          </span>
        </div>

        <p class="text-base text-blueberry-800 leading-relaxed">
          {{ log.description }}
        </p>
      </section>

      <!-- User + Request -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-user text-apricot-500" />
          Actor & Request
        </h3>

        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">User</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ log.user?.full_name ?? log.user?.name ?? 'System' }}
              <span v-if="log.user?.email" class="text-xs text-blueberry-500 block">
                {{ log.user.email }}
              </span>
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">IP Address</dt>
            <dd class="text-sm font-mono text-blueberry-800 mt-1">
              {{ log.ip_address ?? '—' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Method</dt>
            <dd class="text-sm font-mono text-blueberry-800 mt-1">
              {{ log.method ?? '—' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">URL</dt>
            <dd class="text-sm font-mono text-blueberry-800 mt-1 break-all">
              {{ log.url ?? '—' }}
            </dd>
          </div>

          <div class="md:col-span-2">
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">User Agent</dt>
            <dd class="text-xs text-blueberry-600 mt-1 break-all font-mono">
              {{ log.user_agent ?? '—' }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Subject -->
      <section v-if="log.subject_type" class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-tag text-apricot-500" />
          Subject
        </h3>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Type</dt>
            <dd class="text-sm font-mono text-blueberry-800 mt-1">{{ log.subject_type }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">ID</dt>
            <dd class="text-sm font-mono text-blueberry-800 mt-1">{{ log.subject_id }}</dd>
          </div>
        </dl>
      </section>

      <!-- Diff button -->
      <section v-if="hasDiff" class="bg-white rounded-2xl border border-appleCore-100 p-6 flex items-center justify-between">
        <div>
          <h3 class="text-base font-serif font-semibold text-blueberry-800">Data Changes</h3>
          <p class="text-sm text-blueberry-500 mt-1">View what changed in this action</p>
        </div>
        <Button label="View Changes" icon="pi pi-eye" @click="diffOpen = true" />
      </section>

      <!-- Metadata -->
      <section v-if="log.metadata && Object.keys(log.metadata).length" class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-database text-apricot-500" />
          Metadata
        </h3>
        <pre class="text-xs bg-appleCore-50 p-4 rounded-lg overflow-x-auto font-mono text-blueberry-700">
{{ JSON.stringify(log.metadata, null, 2) }}
        </pre>
      </section>
    </template>

    <ActivityLogDiffDialog
      v-model:visible="diffOpen"
      :old-values="log?.old_values ?? null"
      :new-values="log?.new_values ?? null"
    />
  </div>
</template>