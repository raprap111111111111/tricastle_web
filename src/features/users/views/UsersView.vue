<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">Users</h1>
        <p class="text-blueberry-500 mt-1">Manage system users</p>
      </div>
      <Button v-if="can(Perm.userCreate)" icon="pi pi-user-plus" label="Add User" class="!bg-apricot-500 hover:!bg-apricot-600 !border-none" />
    </div>
    <div class="bg-white rounded-2xl p-12 shadow-soft border border-appleCore-100 text-center">
      <i class="pi pi-user text-5xl text-blueberry-300 mb-4" />
      <p class="text-blueberry-500">Users list will appear here.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { usePermissions } from '@shared/composables/usePermissions'
import { Perm } from '@shared/constants/permissions'

const { can } = usePermissions()
</script>