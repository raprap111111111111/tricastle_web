<!-- src/features/document-types/views/DocumentTypeView.vue -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

import { AppButton } from '@shared/ui'
import DocumentTypeCategoryBadge from '../components/DocumentTypeCategoryBadge.vue'
import { useDocumentTypeStore } from '@features/document-types/stores/documentType.store'


const props = defineProps<{ id: number }>()

const router = useRouter()
const store  = useDocumentTypeStore()

onMounted(async () => {
  store.clearType()
  await store.fetchType(props.id)
})

const t = computed(() => store.type)

function formatDate(v: string | null | undefined): string {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="router.push({ name: 'document-types.index' })"
        />
        <div>
          <h1 class="text-2xl font-serif font-bold text-blueberry-800">
            Document Type Details
          </h1>
          <p v-if="t" class="text-sm text-blueberry-500">
            View configuration and settings
          </p>
        </div>
      </div>

      <div v-if="t" class="flex items-center gap-2">
        <AppButton
          variant="secondary"
          icon="pi pi-pencil"
          @click="router.push({ name: 'document-types.edit', params: { id: t.id } })"
        >
          Edit
        </AppButton>
      </div>
    </div>

    <template v-if="store.loading">
      <Skeleton height="180px" border-radius="16px" />
      <Skeleton height="240px" border-radius="16px" />
    </template>

    <template v-else-if="!t">
      <div class="text-center py-16 text-blueberry-400">
        <i class="pi pi-exclamation-circle text-4xl mb-3" />
        <p>Document type not found</p>
      </div>
    </template>

    <template v-else>
      <!-- Header Card -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-start gap-5">
          <div
            class="w-16 h-16 rounded-2xl bg-apricot-50 text-apricot-600
                   flex items-center justify-center flex-shrink-0"
          >
            <i class="pi pi-tag text-2xl" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <DocumentTypeCategoryBadge :category="t.category" />
              <span
                v-if="t.is_active"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg
                       bg-green-50 text-green-700 text-xs font-semibold"
              >
                <i class="pi pi-circle-fill text-[6px]" /> Active
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg
                       bg-gray-100 text-gray-600 text-xs font-semibold"
              >
                <i class="pi pi-circle-fill text-[6px]" /> Inactive
              </span>
              <span
                v-if="t.is_required"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg
                       bg-red-50 text-red-700 text-xs font-semibold"
              >
                <i class="pi pi-asterisk text-[8px]" /> Required
              </span>
            </div>
            <h2 class="text-xl font-serif font-semibold text-blueberry-800">
              {{ t.name }}
            </h2>
            <div class="flex flex-wrap gap-3 mt-1 items-center">
              <span
                class="font-mono text-xs text-apricot-600 font-semibold bg-apricot-50 px-2 py-0.5 rounded"
              >
                {{ t.code }}
              </span>
              <span class="text-xs text-blueberry-500 tabular-nums">
                Sort Order: {{ t.sort_order }}
              </span>
            </div>
            <p v-if="t.description" class="text-sm text-blueberry-600 mt-3 leading-relaxed">
              {{ t.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- Config -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-cog text-apricot-500" />
          Configuration
        </h3>

        <dl class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Category</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 capitalize">
              {{ t.category }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Validity</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 tabular-nums">
              {{ t.validity_days ? `${t.validity_days} days` : 'Never expires' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Expiry Warning</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 tabular-nums">
              {{ t.expiry_warning_days }} days before
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Sort Order</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 tabular-nums">
              {{ t.sort_order }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Required</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ t.is_required ? 'Yes' : 'No' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Active</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ t.is_active ? 'Yes' : 'No' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Created</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 tabular-nums">
              {{ formatDate(t.created_at) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Last Updated</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 tabular-nums">
              {{ formatDate(t.updated_at) }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Required Fields -->
      <section
        v-if="t.required_fields && t.required_fields.length > 0"
        class="bg-white rounded-2xl border border-appleCore-100 p-6"
      >
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-list text-apricot-500" />
          Required Fields
          <span class="text-xs text-blueberry-400 font-sans font-normal">
            ({{ t.required_fields.length }})
          </span>
        </h3>
        <p class="text-xs text-blueberry-500 mb-4">
          OCR will attempt to extract these fields from uploaded documents of this type.
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="field in t.required_fields"
            :key="field"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
                   bg-apricot-50 text-apricot-800 text-sm font-medium
                   ring-1 ring-apricot-200"
          >
            <i class="pi pi-tag text-[10px]" />
            {{ field }}
          </span>
        </div>
      </section>

      <!-- Validation Rules (if any) -->
      <section
        v-if="t.validation_rules && Object.keys(t.validation_rules).length > 0"
        class="bg-white rounded-2xl border border-appleCore-100 p-6"
      >
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-check-square text-apricot-500" />
          Validation Rules
        </h3>
        <pre
          class="bg-appleCore-50 rounded-xl p-4 text-xs text-blueberry-700 font-mono
                 overflow-x-auto leading-relaxed"
        >{{ JSON.stringify(t.validation_rules, null, 2) }}</pre>
      </section>
    </template>
  </div>
</template>