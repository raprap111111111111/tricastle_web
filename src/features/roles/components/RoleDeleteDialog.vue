<!-- src/features/roles/components/RoleDeleteDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

// ✅ FIX — correct path + name
import AppHoldToDeleteButton from '@shared/ui/button/AppHoldToDeleteButton.vue'

import type { Role } from '../types'

// ─────────────────────────────────────────────
const props = defineProps<{
  visible:    boolean
  role:       Role | null
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
}>()

function close(): void {
  if (props.submitting) return
  emit('update:visible', false)
}

function onHoldComplete(): void {
  emit('confirm')
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :closable="!submitting"
    :dismissable-mask="!submitting"
    :style="{ width: '460px' }"
    :pt="{
      root:    { class: 'rounded-2xl overflow-hidden' },
      header:  { class: '!p-6 !pb-2' },
      content: { class: '!px-6 !pb-6' },
      footer:  { class: '!p-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900' },
    }"
  >
    <!-- ── Header ────────────────────────────── -->
    <template #header>
      <div class="flex items-center gap-3 w-full">
        <div class="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400 text-lg" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-bold text-surface-900 dark:text-surface-0">
            Delete Role
          </h2>
          <p class="text-xs text-surface-500 mt-0.5">
            This action cannot be undone
          </p>
        </div>
      </div>
    </template>

    <!-- ── Body ──────────────────────────────── -->
    <div class="flex flex-col gap-4 pt-2">
      <p class="text-sm text-surface-700 dark:text-surface-200">
        You're about to permanently delete the role
        <span class="font-semibold text-red-600 capitalize">
          "{{ role?.name }}"
        </span>.
      </p>

      <!-- Meta -->
      <div
        v-if="role"
        class="rounded-xl border border-surface-200 dark:border-surface-700 p-3 flex flex-col gap-1 bg-surface-50 dark:bg-surface-900/50"
      >
        <div class="flex justify-between text-xs">
          <span class="text-surface-500">Permissions</span>
          <span class="font-semibold text-surface-800 dark:text-surface-100">
            {{ role.permissions_count }}
          </span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-surface-500">Users assigned</span>
          <span
            class="font-semibold"
            :class="role.users_count > 0 ? 'text-red-600' : 'text-surface-800 dark:text-surface-100'"
          >
            {{ role.users_count }}
          </span>
        </div>
      </div>

      <!-- Warning if role has users -->
      <div
        v-if="role && role.users_count > 0"
        class="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 flex gap-2"
      >
        <i class="pi pi-info-circle text-amber-600 dark:text-amber-400 text-sm mt-0.5 flex-shrink-0" />
        <p class="text-xs text-amber-800 dark:text-amber-200">
          This role is assigned to
          <strong>{{ role.users_count }}</strong> user(s).
          Please reassign them before deleting.
        </p>
      </div>
    </div>

    <!-- ── Footer ────────────────────────────── -->
    <template #footer>
      <div class="flex flex-col gap-3 w-full">
        <!-- ✅ Correct event: @complete (matches your component) -->
        <AppHoldToDeleteButton
          label="Hold to Delete Role"
          hint-text="Hold for 2 seconds to confirm"
          :duration="2000"
          :loading="submitting"
          :disabled="submitting || (role?.users_count ?? 0) > 0"
          @complete="onHoldComplete"
        />

        <Button
          label="Cancel"
          severity="secondary"
          text
          class="w-full"
          :disabled="submitting"
          @click="close"
        />
      </div>
    </template>
  </Dialog>
</template>