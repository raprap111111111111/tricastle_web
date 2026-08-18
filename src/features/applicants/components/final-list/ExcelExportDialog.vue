<!-- src/features/applicants/components/final-list/ExcelExportDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import type { ExcelColumn } from '@shared/utils/excel-export'

defineProps<{
  visible:              boolean
  exportScope:          string
  exportBatchId:        number | null
  exportLocation:       string
  exportStatus:         string
  exporting:            boolean
  filteredCount:        number
  exportCount:          number
  availableBatches:     any[]
  availableLocations:   string[]
  availableStatuses:    string[]
  selectedColumnKeys:   string[]
  columnGroups:         { name: string; columns: ExcelColumn[] }[]
  allColumns:           ExcelColumn[]
}>()

const emit = defineEmits<{
  'update:visible':        [v: boolean]
  'update:exportScope':    [v: string]
  'update:exportBatchId':  [v: number | null]
  'update:exportLocation': [v: string]
  'update:exportStatus':   [v: string]
  toggleColumn:            [key: string]
  toggleGroup:             [name: string]
  applyPreset:             [preset: string]
  selectAll:               []
  clearAll:                []
  download:                []
}>()

function close() { emit('update:visible', false) }
function isGroupChecked(g: any, keys: string[]) { return g.columns.every((c: any) => keys.includes(c.key)) }
function isGroupPartial(g: any, keys: string[]) {
  const some = g.columns.some((c: any) => keys.includes(c.key))
  const all  = g.columns.every((c: any) => keys.includes(c.key))
  return some && !all
}
</script>

<template>
  <Dialog :visible="visible" modal :draggable="false" :dismissable-mask="true" :closable="false"
    :style="{ width: '640px' }"
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
            <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <i class="pi pi-file-excel text-green-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-semibold text-blueberry-800">Export Final List to Excel</p>
              <p class="text-[11px] text-blueberry-500">Configure your export</p>
            </div>
          </div>
          <button type="button"
            class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
            @click="close">
            <i class="pi pi-times text-xs" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-5">

          <!-- Scope -->
          <div>
            <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider mb-3">
              1. Export Scope
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="opt in [
                { key: 'current', icon: 'pi-table', title: 'Current View', desc: `Export what's shown (${filteredCount})` },
                { key: 'batch', icon: 'pi-sitemap', title: 'By Batch', desc: 'Filter by batch assignment' },
                { key: 'location', icon: 'pi-map-marker', title: 'By Location', desc: 'Group sheets by province' },
                { key: 'status', icon: 'pi-tag', title: 'By Status', desc: 'One sheet per status' },
              ]" :key="opt.key" type="button"
                class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                :class="exportScope === opt.key
                  ? 'border-apricot-400 bg-apricot-50'
                  : 'border-appleCore-100 hover:border-appleCore-300'"
                @click="emit('update:exportScope', opt.key)">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                    :class="exportScope === opt.key ? 'bg-apricot-100' : 'bg-appleCore-100'">
                    <i class="pi text-xs"
                      :class="[opt.icon, exportScope === opt.key ? 'text-apricot-600' : 'text-blueberry-500']" />
                  </div>
                  <span class="text-xs font-semibold text-blueberry-800">{{ opt.title }}</span>
                </div>
                <p class="text-[11px] text-blueberry-500 leading-snug">{{ opt.desc }}</p>
              </button>
            </div>

            <div v-if="exportScope === 'batch'" class="pt-3">
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Select Batch</label>
              <Select :model-value="exportBatchId"
                :options="[
                  { label: 'All Batches', value: null },
                  ...availableBatches.map(b => ({ label: `${b.name} (#${b.batch_number})`, value: b.id }))
                ]"
                option-label="label" option-value="value" placeholder="Choose a batch..." class="w-full" size="small"
                @update:model-value="emit('update:exportBatchId', $event)" />
            </div>

            <div v-if="exportScope === 'location'" class="pt-3">
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                Filter Location <span class="text-blueberry-400 font-normal">(optional)</span>
              </label>
              <Select :model-value="exportLocation"
                :options="[
                  { label: 'All Locations (grouped by province)', value: '' },
                  ...availableLocations.map(l => ({ label: l, value: l }))
                ]"
                option-label="label" option-value="value" placeholder="All locations..." class="w-full" size="small" filter show-clear
                @update:model-value="emit('update:exportLocation', $event)" />
            </div>

            <div v-if="exportScope === 'status'" class="pt-3">
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                Filter Status <span class="text-blueberry-400 font-normal">(optional)</span>
              </label>
              <Select :model-value="exportStatus"
                :options="[
                  { label: 'All Statuses (one sheet each)', value: '' },
                  ...availableStatuses.map(s => ({
                    label: s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' '),
                    value: s,
                  }))
                ]"
                option-label="label" option-value="value" placeholder="All statuses..." class="w-full" size="small" show-clear
                @update:model-value="emit('update:exportStatus', $event)" />
            </div>
          </div>

          <!-- Columns -->
          <div class="pt-4 border-t border-appleCore-100">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider">
                2. Columns to Include
                <span class="ml-1 text-apricot-600 normal-case">
                  ({{ selectedColumnKeys.length }}/{{ allColumns.length }})
                </span>
              </p>
              <div class="flex items-center gap-1">
                <button type="button" class="text-[11px] text-apricot-600 hover:underline" @click="emit('selectAll')">
                  Select all
                </button>
                <span class="text-blueberry-300">•</span>
                <button type="button" class="text-[11px] text-red-500 hover:underline" @click="emit('clearAll')">
                  Clear
                </button>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-1.5 mb-3">
              <span class="text-[11px] text-blueberry-500 font-medium">Presets:</span>
              <button v-for="preset in [
                { key: 'minimal', label: 'Minimal (5)', icon: 'pi-file' },
                { key: 'contact', label: 'Contact Info', icon: 'pi-id-card' },
                { key: 'deployment', label: 'Deployment', icon: 'pi-send' },
                { key: 'full', label: 'Everything', icon: 'pi-list' },
              ]" :key="preset.key" type="button"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px]
                       bg-appleCore-50 hover:bg-apricot-50 hover:text-apricot-700
                       text-blueberry-700 font-medium transition-colors"
                @click="emit('applyPreset', preset.key)">
                <i :class="`pi ${preset.icon} text-[9px]`" />
                {{ preset.label }}
              </button>
            </div>

            <div class="border border-appleCore-100 rounded-lg max-h-[280px] overflow-y-auto">
              <div v-for="group in columnGroups" :key="group.name"
                class="border-b border-appleCore-100 last:border-b-0">
                <label class="flex items-center gap-2 px-3 py-2 bg-appleCore-50/70 cursor-pointer
                     hover:bg-appleCore-100 transition-colors sticky top-0 z-10">
                  <input type="checkbox" class="w-3.5 h-3.5 rounded accent-apricot-500 cursor-pointer"
                    :checked="isGroupChecked(group, selectedColumnKeys)"
                    :indeterminate.prop="isGroupPartial(group, selectedColumnKeys)"
                    @change="emit('toggleGroup', group.name)" />
                  <span class="text-xs font-bold text-blueberry-700 uppercase tracking-wider">
                    {{ group.name }}
                  </span>
                  <span class="text-[10px] text-blueberry-400 ml-auto">
                    {{ group.columns.filter(c => selectedColumnKeys.includes(c.key)).length }}
                    / {{ group.columns.length }}
                  </span>
                </label>

                <div class="grid grid-cols-2 gap-x-2 p-2">
                  <label v-for="col in group.columns" :key="col.key"
                    class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-appleCore-50
                       cursor-pointer text-xs text-blueberry-700 transition-colors">
                    <input type="checkbox" class="w-3 h-3 rounded accent-apricot-500 cursor-pointer"
                      :checked="selectedColumnKeys.includes(col.key)"
                      @change="emit('toggleColumn', col.key)" />
                    <span class="flex-1 truncate">{{ col.header }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="flex items-center gap-2 px-3 py-2 bg-appleCore-50 rounded-lg">
            <i class="pi pi-info-circle text-blueberry-400 text-xs" />
            <p class="text-xs text-blueberry-600">
              <strong class="text-blueberry-800">{{ exportCount }}</strong>
              applicant{{ exportCount !== 1 ? 's' : '' }}
              × <strong class="text-blueberry-800">{{ selectedColumnKeys.length }}</strong>
              column{{ selectedColumnKeys.length !== 1 ? 's' : '' }} will be exported
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50 shrink-0">
          <Button label="Cancel" severity="secondary" text size="small" @click="close" />
          <Button label="Download .xlsx" icon="pi pi-file-excel"
            :loading="exporting"
            :disabled="selectedColumnKeys.length === 0 || exportCount === 0"
            class="!bg-green-600 hover:!bg-green-700 !border-green-600 !text-white"
            @click="emit('download')" />
        </div>
      </div>
    </template>
  </Dialog>
</template>