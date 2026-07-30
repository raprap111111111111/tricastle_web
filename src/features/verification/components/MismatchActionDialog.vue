<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import type { VerificationMismatch } from '../types';

type Mode = 'resolve' | 'waive' | 'escalate';

const props = defineProps<{
  visible: boolean;
  mode: Mode | null;
  mismatch: VerificationMismatch | null;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [v: boolean];
  submit: [payload: { notes: string; entered_value?: string }];
}>();

const notes = ref('');
const enteredValue = ref('');

const title = computed(() => {
  if (props.mode === 'resolve') return 'Resolve Mismatch';
  if (props.mode === 'waive') return 'Waive Mismatch';
  if (props.mode === 'escalate') return 'Escalate Mismatch';
  return '';
});

const buttonLabel = computed(() => {
  if (props.mode === 'resolve') return 'Resolve';
  if (props.mode === 'waive') return 'Waive';
  if (props.mode === 'escalate') return 'Escalate';
  return 'Submit';
});

const buttonSeverity = computed(() => {
  if (props.mode === 'resolve') return 'success';
  if (props.mode === 'waive') return 'secondary';
  if (props.mode === 'escalate') return 'warn';
  return 'primary';
});

watch(
  () => props.visible,
  (v) => {
    if (v) {
      notes.value = '';
      enteredValue.value = props.mismatch?.entered_value ?? '';
    }
  },
);

function submit() {
  if (!notes.value.trim()) return;
  emit('submit', {
    notes: notes.value,
    entered_value: props.mode === 'resolve' ? enteredValue.value : undefined,
  });
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="title"
    modal
    :style="{ width: '500px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="mismatch" class="space-y-4">
      <div class="p-3 bg-gray-50 border rounded text-sm">
        <p class="font-semibold">{{ mismatch.field_label }}</p>
        <div class="grid grid-cols-2 gap-3 mt-2">
          <div>
            <p class="text-xs text-gray-500">Source</p>
            <p class="font-mono">{{ mismatch.source_value || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Entered</p>
            <p class="font-mono">{{ mismatch.entered_value || '—' }}</p>
          </div>
        </div>
      </div>

      <div v-if="mode === 'resolve'">
        <label class="text-sm font-medium">Corrected Value</label>
        <InputText v-model="enteredValue" class="w-full mt-1" />
      </div>

      <div>
        <label class="text-sm font-medium">
          {{ mode === 'escalate' ? 'Escalation Reason' : 'Notes' }} *
        </label>
        <Textarea v-model="notes" rows="4" class="w-full mt-1" />
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        text
        @click="emit('update:visible', false)"
      />
      <Button
        :label="buttonLabel"
        :severity="buttonSeverity"
        :loading="submitting"
        :disabled="!notes.trim()"
        @click="submit"
      />
    </template>
  </Dialog>
</template>