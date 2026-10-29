<script setup lang="ts">
import { ref, computed, defineAsyncComponent, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePortalAuth } from '../composables/usePortalAuth'
import AuthSceneBackground from '@/components/auth-scene/AuthSceneBackground.vue'
import PortalSidebar from '../components/PortalSidebar.vue'

const router = useRouter()
const route = useRoute()

const modalModules = import.meta.glob('../../**/CompanyExperienceModal.vue')
const modalPath = Object.keys(modalModules)[0]
const CompanyExperienceModal = modalPath
  ? defineAsyncComponent(modalModules[modalPath] as () => Promise<any>)
  : null

const { logout } = usePortalAuth()

const showCompany = ref(false)
const companyTab = ref<'about' | 'principles' | 'team'>('about')
const year = computed(() => new Date().getFullYear())
const isMobileMenuOpen = ref(false)

// FIX: Strictly determine layout based on route
const isGuestRoute = computed(() => {
  return [
    '/portal/login',
    '/portal/verify',
    '/portal/register',
    '/portal/forgot-password'
  ].includes(route.path)
})

function openCompany(tab: 'about' | 'principles' | 'team' = 'about') {
  companyTab.value = tab
  showCompany.value = true
}

async function handleLogout() {
  await logout()
  router.push('/portal/login')
}

provide('openCompany', openCompany)
</script>

<template>
  <!-- GUEST LAYOUT -->
  <div
    v-if="isGuestRoute"
    class="min-h-screen flex flex-col justify-between bg-[#F7F5F2] relative overflow-hidden select-none font-sans"
  >
    <AuthSceneBackground />

    <div class="absolute top-0 left-0 w-96 h-96 bg-apricot-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-40 pointer-events-none z-[1]" />
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-blueberry-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-40 pointer-events-none z-[1]" />

    <header class="relative z-20 w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-apricot-500 animate-pulse" />
        <span class="text-xs font-bold tracking-widest text-blueberry-600 uppercase">
          Tricastle International
        </span>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-appleCore-50 border border-appleCore-200 text-blueberry-800 text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          @click="openCompany('about')"
        >
          <i class="pi pi-building text-apricot-500 text-xs" />
          <span>About Us</span>
        </button>
      </div>
    </header>

    <main class="relative z-10 w-full flex-1 flex flex-col justify-center px-4 py-6">
      <router-view />
    </main>

    <footer class="relative z-20 w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-blueberry-500 gap-2 border-t border-appleCore-200/60">
      <p>© {{ year }} Tricastle International, Inc.</p>
    </footer>
  </div>

  <!-- AUTHENTICATED LAYOUT -->
  <div v-else class="flex h-screen bg-[#F7F5F2] overflow-hidden font-sans text-slate-800 select-none">
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
      @click="isMobileMenuOpen = false"
    ></div>

    <PortalSidebar :is-open="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
      <header class="w-full flex items-center justify-between md:justify-end px-6 py-4 lg:px-8 lg:py-6 shrink-0 z-10">
        <button @click="isMobileMenuOpen = true" class="md:hidden text-slate-600 p-2 hover:bg-slate-200 rounded-lg">
          <i class="pi pi-bars text-xl"></i>
        </button>
        <button 
          @click="handleLogout" 
          class="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors py-2 px-3 rounded-lg hover:bg-slate-200/50"
        >
          <i class="pi pi-sign-out text-base"></i>
          <span>Logout</span>
        </button>
      </header>

      <main class="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div class="max-w-6xl mx-auto w-full flex flex-col min-h-full">
          <router-view />
        </div>
      </main>
    </div>
  </div>

  <component
    :is="CompanyExperienceModal"
    v-if="showCompany && CompanyExperienceModal"
    :initial-tab="companyTab"
    @close="showCompany = false"
  />
</template>