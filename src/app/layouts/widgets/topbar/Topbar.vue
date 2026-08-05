<template>
  <header class="h-16 bg-white border-b border-appleCore-200 px-6 flex items-center justify-between flex-shrink-0">
    <h2 class="text-lg font-serif font-semibold text-blueberry-800">
      {{ pageTitle }}
    </h2>

    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Notifications -->
      <Button
        icon="pi pi-bell"
        text
        rounded
        severity="secondary"
        aria-label="Notifications"
        @click="router.push('/notifications')"
      />

      <!-- ⚙️ Settings Menu -->
      <Button
        icon="pi pi-cog"
        text
        rounded
        severity="secondary"
        aria-label="Settings"
        aria-haspopup="true"
        aria-controls="settings-menu"
        v-tooltip.bottom="'Settings'"
        @click="toggleSettingsMenu"
      />
      <Menu
        id="settings-menu"
        ref="settingsMenu"
        :model="settingsMenuItems"
        :popup="true"
        :append-to="'body'"
      />

      <!-- Divider -->
      <div class="hidden sm:block h-8 w-px bg-appleCore-200" />

      <!-- Clickable Profile -->
      <button
        type="button"
        class="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-appleCore-100 transition-colors"
        aria-label="Open profile"
        @click="goToProfile"
      >
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-blueberry-800">{{ authStore.fullName }}</p>
          <p class="text-xs text-blueberry-500 capitalize">{{ role.replace('_', ' ') }}</p>
        </div>

        <div class="w-10 h-10 bg-apricot-500 text-white rounded-full flex items-center justify-center font-bold">
          {{ initials }}
        </div>
      </button>

      <!-- Logout -->
      <Button
        icon="pi pi-sign-out"
        text
        rounded
        severity="secondary"
        :loading="loggingOut"
        aria-label="Sign out"
        v-tooltip.bottom="'Sign out'"
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
import Menu from 'primevue/menu'
import { useAuthStore } from '@features/auth/stores/auth.store'
import { usePermissions } from '@shared/composables/usePermissions'

const route     = useRoute()
const router    = useRouter()
const toast     = useToast()
const authStore = useAuthStore()
const { role }  = usePermissions()

const loggingOut  = ref(false)
const settingsMenu = ref()
const pageTitle   = computed(() => (route.meta?.title as string) ?? 'Dashboard')

const initials = computed(() => {
  if (!authStore.user) return '?'
  const first = authStore.user.first_name?.[0] ?? ''
  const last  = authStore.user.last_name?.[0] ?? ''
  return (first + last).toUpperCase() || '?'
})

// ─── Settings dropdown items ─────────────────────────────
const settingsMenuItems = ref([
  {
    label: 'General Settings',
    icon: 'pi pi-sliders-h',
    command: () => router.push('/settings'),
  },
  {
    label: 'Document Types',
    icon: 'pi pi-tag',
    command: () => router.push('/document-types'),
  },
  {
    label: 'Company Categories',
    icon: 'pi pi-tags',
    command: () => router.push('/company-categories'),
  },
  { separator: true },
  {
    label: 'My Profile',
    icon: 'pi pi-user',
    command: () => router.push('/profile'),
  },
  {
    label: 'Preferences',
    icon: 'pi pi-palette',
    command: () => router.push('/profile?tab=preferences'),
  },
])

function toggleSettingsMenu(event: Event) {
  settingsMenu.value.toggle(event)
}

function goToProfile() {
  router.push('/profile')
}

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