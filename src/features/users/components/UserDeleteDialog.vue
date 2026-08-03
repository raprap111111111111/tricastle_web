<!-- src/features/users/components/UserDeleteDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { AppButton, AppHoldToDeleteButton } from '@shared/ui'
import UserAvatar      from './UserAvatar.vue'
import UserStatusBadge from './UserStatusBadge.vue'
import type { User } from '../types'

const props = defineProps<{
  visible: boolean
  user: User | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm'): void
}>()

function close() { emit('update:visible', false) }
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    header="Delete User"
    :style="{ width: '480px' }"
    :draggable="false"
    :pt="{
      header:  '!bg-white !border-b !border-appleCore-100 !px-6 !py-4',
      content: '!bg-white !px-6 !py-5',
      footer:  '!bg-appleCore-50 !border-t !border-appleCore-100 !px-6 !py-4',
    }"
    @update:visible="close"
  >
    <div v-if="props.user" class="space-y-4">

      <div class="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
        <i class="pi pi-exclamation-triangle text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <p class="text-sm font-semibold text-red-700">This action cannot be undone!</p>
          <p class="text-xs text-red-500 mt-0.5">
            All user data, roles, and activity history will be permanently deleted.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-appleCore-50 border border-appleCore-200 rounded-xl p-4">
        <UserAvatar :user="props.user" size="lg" />
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-blueberry-800 text-sm">{{ props.user.full_name }}</p>
          <p class="text-xs text-blueberry-400">{{ props.user.email }}</p>
          <div class="mt-1.5">
            <UserStatusBadge
              :is-active="props.user.is_active"
              :is-locked="props.user.is_locked"
            />
          </div>
        </div>
      </div>

      <AppHoldToDeleteButton
        label="Hold to permanently delete"
        hint-text="hold 3 seconds"
        :duration="3000"
        :loading="props.loading"
        @complete="emit('confirm')"
      />
    </div>

    <template #footer>
      <div class="flex justify-end">
        <AppButton label="Cancel" variant="neutral" outlined :disabled="props.loading" @click="close" />
      </div>
    </template>
  </Dialog>
</template>