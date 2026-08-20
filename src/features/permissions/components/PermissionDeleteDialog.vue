<script setup lang="ts">
import type { Permission } from '../types'

// PrimeVue
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Message from 'primevue/message'

const props = defineProps<{
  visible:    boolean
  permission: Permission | null
  submitting: boolean
}>()

defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
}>()

const rolesCount = (): number => props.permission?.roles_count ?? 0
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Delete Permission"
    :style="{ width: '440px' }"
    modal
    :closable="!submitting"
  >
    <div class="flex flex-col gap-4 pt-2">

      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <i class="pi pi-exclamation-triangle text-red-500 text-lg" />
        </div>
        <div>
          <p class="font-medium text-surface-900 dark:text-surface-0">
            Delete permission
            <span class="font-mono font-bold text-red-600">"{{ permission?.name }}"</span>?
          </p>
          <p class="text-sm text-surface-500 mt-1">
            This action cannot be undone.
          </p>
        </div>
      </div>

      <Message
        v-if="rolesCount() > 0"
        severity="warn"
        :closable="false"
      >
        This permission is assigned to <strong>{{ rolesCount() }}</strong> role(s).
        Remove it from all roles before deleting.
      </Message>

    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          label="Cancel"
          severity="secondary"
          text
          @click="$emit('update:visible', false)"
          :disabled="submitting"
        />
        <Button
          label="Delete Permission"
          icon="pi pi-trash"
          severity="danger"
          :loading="submitting"
          :disabled="rolesCount() > 0"
          @click="$emit('confirm')"
        />
      </div>
    </template>
  </Dialog>
</template>