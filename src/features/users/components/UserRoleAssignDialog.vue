<!-- src/features/users/components/UserRoleAssignDialog.vue -->
<script setup lang="ts">
import { ref, watch }  from 'vue'
import Dialog          from 'primevue/dialog'
import MultiSelect     from 'primevue/multiselect'
import { AppButton }   from '@shared/ui'
import UserAvatar      from './UserAvatar.vue'
import { ROLE_OPTIONS, type User } from '../types'

const props = defineProps<{
  visible: boolean
  user: User | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm', roles: string[]): void
}>()

const selectedRoles = ref<string[]>([])

watch(() => props.visible, v => {
  if (v && props.user) {
    selectedRoles.value = [...(props.user.roles ?? [])]
  }
})

function submit() { emit('confirm', selectedRoles.value) }
function close()  { emit('update:visible', false) }
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    header="Assign Roles"
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
      <div class="flex items-center gap-3 bg-appleCore-50 border border-appleCore-200 rounded-xl p-4">
        <UserAvatar :user="props.user" size="md" />
        <div>
          <p class="font-semibold text-blueberry-800 text-sm">{{ props.user.full_name }}</p>
          <p class="text-xs text-blueberry-400">{{ props.user.email }}</p>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">Roles</label>
        <MultiSelect
          v-model="selectedRoles"
          :options="ROLE_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Select roles"
          display="chip"
          class="w-full !rounded-xl !border-appleCore-200"
          :pt="{ root: '!min-h-[48px]' }"
        />
        <p class="text-xs text-blueberry-400 mt-1">
          Select one or more roles to assign to this user.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <AppButton label="Cancel" variant="neutral" outlined :disabled="loading" @click="close" />
        <AppButton
          label="Save Roles"
          variant="accent"
          icon="pi pi-check"
          :loading="loading"
          @click="submit"
        />
      </div>
    </template>
  </Dialog>
</template>