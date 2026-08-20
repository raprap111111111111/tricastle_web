<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { useThemeStore } from '@features/settings/theme/theme.store'

const toast = useToast()
const themeStore = useThemeStore()

async function selectTheme(name: any) {
  await themeStore.saveTheme(name)
  toast.add({
    severity: 'success',
    summary: 'Theme applied',
    detail: `Now using ${name} theme`,
    life: 2000,
  })
}

async function toggleEffects(value: boolean) {
  await themeStore.saveEffectsEnabled(value)
  toast.add({
    severity: 'info',
    summary: value ? 'Effects enabled' : 'Effects disabled',
    life: 2000,
  })
}

async function saveBranding() {
  await themeStore.saveBranding({
    app_name:    themeStore.branding.app_name,
    app_tagline: themeStore.branding.app_tagline,
    logo:        themeStore.branding.logo,
    logo_login:  themeStore.branding.logo_login,
  })
  toast.add({
    severity: 'success',
    summary: 'Branding saved',
    life: 2000,
  })
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1200px] mx-auto">

    <!-- Header -->
    <header>
      <h1 class="text-3xl font-serif font-semibold text-blueberry-800">
        Settings
      </h1>
      <p class="text-sm text-blueberry-500 mt-1">
        Customize your Tricastle experience
      </p>
    </header>

    <!-- ─── Theme Picker ────────────────────────────── -->
    <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-serif font-semibold text-blueberry-800">
            🎨 Theme
          </h2>
          <p class="text-sm text-blueberry-500 mt-0.5">
            Choose a look for your app
          </p>
        </div>

        <label class="flex items-center gap-2 cursor-pointer">
          <span class="text-sm text-blueberry-600">Enable Effects</span>
          <ToggleSwitch
            :model-value="themeStore.effectsEnabled"
            @update:model-value="toggleEffects"
          />
        </label>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          v-for="theme in themeStore.availableThemes"
          :key="theme.name"
          type="button"
          class="group relative rounded-2xl border-2 p-4 text-left transition-all
                 hover:shadow-lg hover:-translate-y-0.5"
          :class="
            themeStore.activeThemeName === theme.name
              ? 'border-apricot-500 ring-2 ring-apricot-200'
              : 'border-appleCore-100 hover:border-apricot-300'
          "
          @click="selectTheme(theme.name)"
        >
          <!-- Color preview -->
          <div class="flex gap-1 mb-3">
            <div
              class="w-8 h-8 rounded-lg shadow-sm"
              :style="{ background: theme.colors.primary }"
            />
            <div
              class="w-8 h-8 rounded-lg shadow-sm"
              :style="{ background: theme.colors.accent }"
            />
            <div
              class="w-8 h-8 rounded-lg shadow-sm border border-gray-200"
              :style="{ background: theme.colors.bgSurface }"
            />
            <div
              class="w-8 h-8 rounded-lg shadow-sm"
              :style="{ background: theme.colors.bg }"
            />
          </div>

          <!-- Info -->
          <div class="flex items-center gap-2 mb-1">
            <i :class="theme.icon" class="text-lg" />
            <h3 class="font-serif font-bold text-blueberry-800">{{ theme.label }}</h3>
          </div>
          <p class="text-xs text-blueberry-500">{{ theme.description }}</p>

          <!-- Active badge -->
          <span
            v-if="themeStore.activeThemeName === theme.name"
            class="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full
                   bg-apricot-500 text-white"
          >
            ACTIVE
          </span>
        </button>
      </div>
    </section>

    <!-- ─── Branding ────────────────────────────────── -->
    <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h2 class="text-lg font-serif font-semibold text-blueberry-800 mb-1">
        🏷️ Branding
      </h2>
      <p class="text-sm text-blueberry-500 mb-6">
        Customize your app's name and logos
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-blueberry-700 mb-2">
            App Name
          </label>
          <InputText v-model="themeStore.branding.app_name" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-blueberry-700 mb-2">
            Tagline
          </label>
          <InputText v-model="themeStore.branding.app_tagline" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-blueberry-700 mb-2">
            Logo URL (Sidebar)
          </label>
          <InputText v-model="themeStore.branding.logo" class="w-full" />
          <div class="mt-2 w-16 h-16 rounded-xl overflow-hidden border">
            <img :src="themeStore.branding.logo" class="w-full h-full object-contain" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-blueberry-700 mb-2">
            Logo URL (Login Page)
          </label>
          <InputText v-model="themeStore.branding.logo_login" class="w-full" />
          <div class="mt-2 w-16 h-16 rounded-xl overflow-hidden border">
            <img :src="themeStore.branding.logo_login" class="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <Button
          label="Save Branding"
          icon="pi pi-save"
          @click="saveBranding"
        />
      </div>
    </section>
  </div>
</template>