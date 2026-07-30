<template>
  <header class="h-16 bg-white border-b border-appleCore-200 px-6 flex items-center justify-between flex-shrink-0">
    <h2 class="text-lg font-serif font-semibold text-blueberry-800">
      {{ pageTitle }}
    </h2>

    <div class="flex items-center gap-4">
      <div class="text-right hidden sm:block">
        <p class="text-sm font-medium text-blueberry-800">{{ authStore.fullName }}</p>
        <p class="text-xs text-blueberry-500 capitalize">{{ role.replace('_', ' ') }}</p>
      </div>

      <div class="w-10 h-10 bg-apricot-500 text-white rounded-full flex items-center justify-center font-bold">
        {{ initials }}
      </div>

      <Button
        icon="pi pi-sign-out"
        text
        rounded
        severity="secondary"
        :loading="loggingOut"
        @click="handleLogout"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { useAuthStore } from '@features/auth/stores/auth.store'
import { usePermissions } from '@shared/composables/usePermissions'

const route     = useRoute()
const router    = useRouter()
const toast     = useToast()
const authStore = useAuthStore()
const { role }  = usePermissions()

const loggingOut = ref(false)
const pageTitle = computed(() => (route.meta?.title as string) ?? 'Dashboard')

const initials = computed(() => {
  if (!authStore.user) return '?'
  const first = authStore.user.first_name?.[0] ?? ''
  const last  = authStore.user.last_name?.[0]  ?? ''
  return (first + last).toUpperCase() || '?'
})

async function handleLogout() {
  loggingOut.value = true
  try {
    await authStore.logout()
    toast.add({ severity: 'success', summary: 'Signed out', life: 2000 })
    await router.push({ name: 'Login' })
  } finally {
    loggingOut.value = false
  }
}
</script>