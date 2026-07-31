<!-- src/features/document-expiry-alerts/components/DocumentExpiryAlertCheckDialog.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

const props = defineProps<{
  visible: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [val: boolean];
  confirm: [];
}>();

function close() {
  emit('update:visible', false);
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Check Expiring Documents"
    :style="{ width: '480px' }"
    :draggable="false"
    @update:visible="close"
  >
    <div class="flex flex-col items-center text-center py-4 gap-4">
      <!-- Icon -->
      <div class="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
        <i class="pi pi-search text-2xl text-amber-500" />
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-800">
          Run Expiry Check
        </h3>
        <p class="text-sm text-gray-500 mt-1 leading-relaxed">
          This will scan all applicant documents and create expiry alerts
          for documents expiring within 30, 60, or 90 days. 
          Notification emails will be sent automatically.
        </p>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-3 gap-3 w-full">
        <div class="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
          <div class="text-lg font-bold text-blue-600">90d</div>
          <div class="text-xs text-blue-500">Early Warning</div>
        </div>
        <div class="bg-orange-50 rounded-lg p-3 border border-orange-100 text-center">
          <div class="text-lg font-bold text-orange-600">60d</div>
          <div class="text-xs text-orange-500">Warning</div>
        </div>
        <div class="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
          <div class="text-lg font-bold text-red-600">30d</div>
          <div class="text-xs text-red-500">Critical</div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          :disabled="loading"
          @click="close"
        />
        <Button
          label="Run Check"
          icon="pi pi-play"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </Dialog>
</template>