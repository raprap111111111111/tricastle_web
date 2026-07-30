<template>
  <div class="space-y-6 max-w-3xl">
    <div>
      <h1 class="text-2xl font-serif font-bold text-blueberry-800">My Profile</h1>
      <p class="text-blueberry-500 mt-1">Personal information and account settings</p>
    </div>

    <div class="bg-white rounded-2xl p-8 shadow-soft border border-appleCore-100">
      <div class="flex items-center gap-6 mb-8">
        <div class="w-20 h-20 bg-apricot-500 text-white rounded-full flex items-center justify-center font-bold text-2xl">
          {{ initials }}
        </div>
        <div>
          <h2 class="text-xl font-serif font-bold text-blueberry-800">{{ authStore.fullName }}</h2>
          <p class="text-blueberry-500">{{ authStore.user?.email }}</p>
          <span class="inline-block mt-1 px-2 py-0.5 bg-citrus-500/20 text-citrus-800 text-xs rounded-full font-medium capitalize">
            {{ role.replace('_', ' ') }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <p class="text-xs uppercase tracking-wider text-blueberry-400 mb-1">Employee Code</p>
          <p class="text-blueberry-800 font-medium">{{ authStore.user?.employee_code || '—' }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-blueberry-400 mb-1">Department</p>
          <p class="text-blueberry-800 font-medium">{{ authStore.user?.department || '—' }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-blueberry-400 mb-1">Position</p>
          <p class="text-blueberry-800 font-medium">{{ authStore.user?.position || '—' }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-blueberry-400 mb-1">Phone</p>
          <p class="text-blueberry-800 font-medium">{{ authStore.user?.phone || 'Not set' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@features/auth/stores/auth.store'
import { usePermissions } from '@shared/composables/usePermissions'

const authStore = useAuthStore()
const { role }  = usePermissions()

const initials = computed(() => {
  if (!authStore.user) return '?'
  const f = authStore.user.first_name?.[0] ?? ''
  const l = authStore.user.last_name?.[0]  ?? ''
  return (f + l).toUpperCase() || '?'
})
</script>