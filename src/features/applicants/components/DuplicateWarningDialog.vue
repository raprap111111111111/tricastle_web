<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import type { DuplicateItem } from '../types'

const props = defineProps<{
  visible: boolean
  duplicates: DuplicateItem[]
  title?: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const router = useRouter()

function close() {
  emit('update:visible', false)
  emit('close')
}

function goToApplicant(id: number) {
  router.push({ name: 'applicants.show', params: { id } })
  close()
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    email:          'Duplicate Email',
    passport:       'Duplicate Passport',
    name_in_batch:  'Same Name in Same Batch',
    similar_person: 'Possible Same Person',
  }
  return map[type] ?? type
}

function typeIcon(type: string): string {
  const map: Record<string, string> = {
    email:          'pi pi-envelope',
    passport:       'pi pi-id-card',
    name_in_batch:  'pi pi-users',
    similar_person: 'pi pi-user',
  }
  return map[type] ?? 'pi pi-exclamation-triangle'
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(v) => emit('update:visible', v)"
    modal
    :header="title ?? 'Duplicate Applicant Detected'"
    :style="{ width: '600px' }"
    :closable="true"
    :dismissable-mask="true"
  >
    <div class="space-y-4">
      <!-- Header alert -->
      <div class="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <i class="pi pi-times-circle text-red-500 text-xl mt-0.5" />
        <div class="flex-1">
          <h4 class="text-sm font-semibold text-red-800">
            Cannot create applicant
          </h4>
          <p class="text-xs text-red-600 mt-1">
            {{ duplicates.length }} duplicate{{ duplicates.length > 1 ? 's' : '' }} found in the system.
            Please review the existing records below.
          </p>
        </div>
      </div>

      <!-- Duplicates list -->
      <div class="space-y-3">
        <div
          v-for="(dup, i) in duplicates"
          :key="i"
          class="border rounded-lg p-4"
          :class="dup.severity === 'block'
            ? 'border-red-200 bg-red-50/30'
            : 'border-yellow-200 bg-yellow-50/30'"
        >
          <!-- Type badge -->
          <div class="flex items-center gap-2 mb-2">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
              :class="dup.severity === 'block'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'"
            >
              <i :class="typeIcon(dup.type)" class="text-[10px]" />
              {{ typeLabel(dup.type) }}
            </span>
            <span
              v-if="dup.severity === 'block'"
              class="text-[10px] font-bold text-red-600 uppercase tracking-wider"
            >
              Blocking
            </span>
            <span
              v-else
              class="text-[10px] font-bold text-yellow-600 uppercase tracking-wider"
            >
              Warning
            </span>
          </div>

          <!-- Message -->
          <p class="text-sm text-blueberry-700 mb-3">{{ dup.message }}</p>

          <!-- Existing applicant card -->
          <div class="bg-white border border-appleCore-100 rounded-lg p-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs text-apricot-600 font-semibold bg-apricot-50 px-2 py-0.5 rounded">
                    {{ dup.applicant.applicant_code }}
                  </span>
                </div>
                <p class="text-sm font-semibold text-blueberry-800 mt-1">
                  {{ dup.applicant.full_name }}
                </p>
                <p class="text-xs text-blueberry-500 mt-0.5">
                  {{ dup.applicant.email }}
                </p>
              </div>
              <Button
                label="View"
                icon="pi pi-external-link"
                size="small"
                text
                @click="goToApplicant(dup.applicant.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <Button
          label="Close"
          severity="secondary"
          outlined
          @click="close"
        />
      </div>
    </template>
  </Dialog>
</template>