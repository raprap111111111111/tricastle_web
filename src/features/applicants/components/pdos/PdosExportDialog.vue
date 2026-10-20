<!-- src/features/applicants/components/pdos/PdosExportDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  isExporting: boolean
  applicantCount: number
  pdosDate: Date
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:pdosDate', value: Date): void
  (e: 'submit'): void
  (e: 'close'): void
}>()

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const localDate = computed({
  get: () => props.pdosDate,
  set: (val) => emit('update:pdosDate', val),
})
</script>

<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    header="Generate PDOS Certificates"
    :style="{ width: '420px' }"
    :closable="!isExporting"
    class="bg-white rounded-xl"
  >
    <div class="flex flex-col gap-4 mt-2">
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <i class="pi pi-file-word text-lg" />
        </div>
        <div>
          <p class="text-slate-900 font-semibold text-sm">Batch PDOS (.docx)</p>
          <p class="text-slate-500 text-xs">
            {{ applicantCount }} applicant(s) selected (2 per page)
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="pdosDate" class="text-slate-700 font-medium text-xs">
          PDOS Seminar Date
        </label>
        <Calendar
          id="pdosDate"
          v-model="localDate"
          dateFormat="dd M yy"
          class="w-full"
          :disabled="isExporting"
          showIcon
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 mt-4">
        <Button
          label="Cancel"
          icon="pi pi-times"
          text
          class="!text-slate-600 hover:!text-slate-900"
          :disabled="isExporting"
          @click="emit('close')"
        />
        <Button
          label="Generate Certificates"
          icon="pi pi-download"
          :loading="isExporting"
          severity="warn"
          class="!bg-orange-600 hover:!bg-orange-700 !border-none !text-white"
          @click="emit('submit')"
        />
      </div>
    </template>
  </Dialog>
</template>