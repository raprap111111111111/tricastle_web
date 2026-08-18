<!-- src/features/applicants/components/final-list/BulkAISDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import type { BulkAISMode, BulkProgress } from '@shared/utils/ais'

defineProps<{
  visible:          boolean
  generating:       boolean
  progress:         BulkProgress
  source:           string
  batchId:          number | null
  mode:             BulkAISMode
  selectedCount:    number
  filteredCount:    number
  applicantsCount:  number
  availableBatches: any[]
}>()

const emit = defineEmits<{
  'update:visible': [v: boolean]
  'update:source':  [v: string]
  'update:batchId': [v: number | null]
  'update:mode':    [v: BulkAISMode]
  generate:         []
  close:            []
}>()
</script>

<template>
  <Dialog :visible="visible" modal :draggable="false"
    :dismissable-mask="!generating" :closable="false" :style="{ width: '560px' }"
    :pt="{
      root: { class: 'rounded-2xl overflow-hidden' },
      header: { class: '!p-0' },
      content: { class: '!p-0' },
    }"
    @update:visible="emit('update:visible', $event)">
    <template #container>
      <div class="bg-white rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">

        <div class="flex items-center justify-between p-5 border-b border-appleCore-100 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i class="pi pi-file-pdf text-red-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-semibold text-blueberry-800">Bulk Generate AIS</p>
              <p class="text-[11px] text-blueberry-500">
                Create Applicant Information Sheets in bulk
              </p>
            </div>
          </div>
          <button v-if="!generating" type="button"
            class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
            @click="emit('close')">
            <i class="pi pi-times text-xs" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-5">

          <!-- Generating -->
          <div v-if="generating" class="py-8 text-center">
            <i class="pi pi-spin pi-spinner text-4xl text-red-500 mb-4" />
            <p class="text-sm font-semibold text-blueberry-800 mb-2">
              Generating {{ progress.current }} of {{ progress.total }}...
            </p>
            <p v-if="progress.applicant" class="text-xs text-blueberry-500">
              Current: <strong>{{ progress.applicant }}</strong>
            </p>
            <div class="mt-4 w-full bg-appleCore-100 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-red-500 transition-all duration-300"
                :style="{ width: `${(progress.current / progress.total) * 100}%` }" />
            </div>
            <p class="text-[11px] text-blueberry-400 mt-3">
              Please don't close this window
            </p>
          </div>

          <!-- Config -->
          <template v-else>

            <div>
              <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider mb-3">
                1. Which Applicants?
              </p>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="opt in [
                  { key: 'selected', icon: 'pi-check-square', title: 'Selected', desc: `${selectedCount} checked`, disabled: selectedCount === 0 },
                  { key: 'batch',    icon: 'pi-sitemap',      title: 'By Batch', desc: 'Choose a batch',           disabled: availableBatches.length === 0 },
                  { key: 'all',      icon: 'pi-users',        title: 'All Filtered', desc: `${filteredCount} shown`, disabled: false },
                ]" :key="opt.key" type="button" :disabled="opt.disabled"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                  :class="[
                    source === opt.key ? 'border-red-400 bg-red-50' : 'border-appleCore-100 hover:border-appleCore-300',
                    opt.disabled && 'opacity-40 cursor-not-allowed hover:!border-appleCore-100'
                  ]"
                  @click="!opt.disabled && emit('update:source', opt.key)">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :class="source === opt.key ? 'bg-red-100' : 'bg-appleCore-100'">
                      <i class="pi text-xs" :class="[opt.icon, source === opt.key ? 'text-red-600' : 'text-blueberry-500']" />
                    </div>
                    <span class="text-xs font-semibold text-blueberry-800">{{ opt.title }}</span>
                  </div>
                  <p class="text-[11px] text-blueberry-500 leading-snug">{{ opt.desc }}</p>
                </button>
              </div>

              <div v-if="source === 'batch'" class="pt-3">
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Select Batch</label>
                <Select :model-value="batchId"
                  :options="availableBatches.map(b => ({ label: `${b.name} (#${b.batch_number})${b.is_active ? ' • Active' : ''}`, value: b.id }))"
                  option-label="label" option-value="value" placeholder="Choose a batch..."
                  class="w-full" size="small" filter
                  @update:model-value="emit('update:batchId', $event)" />
              </div>
            </div>

            <div class="pt-4 border-t border-appleCore-100">
              <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider mb-3">
                2. Output Format
              </p>
              <div class="grid grid-cols-2 gap-2">
                <button type="button"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                  :class="mode === 'zip' ? 'border-red-400 bg-red-50' : 'border-appleCore-100 hover:border-appleCore-300'"
                  @click="emit('update:mode', 'zip')">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :class="mode === 'zip' ? 'bg-red-100' : 'bg-appleCore-100'">
                      <i class="pi pi-folder text-xs" :class="mode === 'zip' ? 'text-red-600' : 'text-blueberry-500'" />
                    </div>
                    <span class="text-xs font-semibold text-blueberry-800">ZIP (separate)</span>
                  </div>
                  <p class="text-[11px] text-blueberry-500 leading-snug">
                    One PDF per applicant, bundled in a .zip
                  </p>
                </button>

                <button type="button"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                  :class="mode === 'merged' ? 'border-red-400 bg-red-50' : 'border-appleCore-100 hover:border-appleCore-300'"
                  @click="emit('update:mode', 'merged')">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :class="mode === 'merged' ? 'bg-red-100' : 'bg-appleCore-100'">
                      <i class="pi pi-file text-xs" :class="mode === 'merged' ? 'text-red-600' : 'text-blueberry-500'" />
                    </div>
                    <span class="text-xs font-semibold text-blueberry-800">Merged (single)</span>
                  </div>
                  <p class="text-[11px] text-blueberry-500 leading-snug">
                    All applicants combined into one multi-page PDF
                  </p>
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
              <i class="pi pi-info-circle text-red-500 text-xs" />
              <p class="text-xs text-red-700">
                <strong>{{ applicantsCount }}</strong>
                AIS PDF{{ applicantsCount !== 1 ? 's' : '' }} will be generated as
                <strong>{{ mode === 'zip' ? 'ZIP archive' : 'single merged PDF' }}</strong>
              </p>
            </div>

            <div v-if="applicantsCount > 50" class="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <i class="pi pi-exclamation-triangle text-amber-500 text-xs mt-0.5" />
              <p class="text-xs text-amber-700 leading-snug">
                Generating <strong>{{ applicantsCount }}</strong> PDFs may take a while. Keep this window open.
              </p>
            </div>

          </template>
        </div>

        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50 shrink-0">
          <Button label="Cancel" severity="secondary" text size="small" :disabled="generating" @click="emit('close')" />
          <Button :label="generating ? 'Generating...' : `Generate ${applicantsCount} AIS`" icon="pi pi-file-pdf"
            :loading="generating"
            :disabled="applicantsCount === 0"
            class="!bg-red-600 hover:!bg-red-700 !border-red-600 !text-white"
            @click="emit('generate')" />
        </div>
      </div>
    </template>
  </Dialog>
</template>