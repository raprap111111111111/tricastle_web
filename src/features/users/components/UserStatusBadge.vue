<!-- src/features/users/components/UserStatusBadge.vue -->
<script setup lang="ts">
defineProps<{
  isActive: boolean
  isLocked?: boolean
  twoFactorEnabled?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-1.5 flex-wrap">
    <!-- Active/Inactive -->
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
      :class="isActive
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-appleCore-100 text-blueberry-500 border-appleCore-300'"
    >
      <i :class="isActive ? 'pi pi-check-circle' : 'pi pi-pause-circle'" class="text-[9px]" />
      {{ isActive ? 'Active' : 'Inactive' }}
    </span>

    <!-- Locked -->
    <span
      v-if="isLocked"
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
             bg-red-50 text-red-700 border-red-200"
    >
      <i class="pi pi-lock text-[9px]" />
      Locked
    </span>

    <!-- 2FA -->
    <span
      v-if="twoFactorEnabled"
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
             bg-blue-50 text-blue-700 border-blue-200"
    >
      <i class="pi pi-shield text-[9px]" />
      2FA
    </span>
  </div>
</template>