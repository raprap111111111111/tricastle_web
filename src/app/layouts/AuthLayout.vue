<template>
  <div class="h-screen w-screen overflow-hidden relative select-none bg-appleCore-50 flex flex-col justify-between">
    
    <!-- 1. FULLSCREEN 3D BACKGROUND (Absolute) -->
    <div class="absolute inset-0 z-0">
      <BuildingHeroScene />
    </div>

    <!-- 2. TOP HEADER BAR -->
    <header class="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Brand Badge -->
      <div class="flex items-center gap-2.5 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/60 shadow-sm">
        <img
          src="/tri.png"
          alt="Tricastle"
          class="w-6 h-6 object-contain"
          @error="(e) => ((e.target as HTMLElement).style.display = 'none')"
        />
        <span class="text-xs font-bold tracking-widest text-blueberry-900 uppercase">
          Tricastle International
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md hover:bg-white border border-white/60
                 text-blueberry-900 text-xs font-bold shadow-sm transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
          @click="openCompany('about')"
        >
          <i class="pi pi-building text-apricot-500 text-xs" />
          <span>About Us</span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md hover:bg-white border border-white/60
                 text-blueberry-900 text-xs font-bold shadow-sm transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
          @click="openCompany('principles')"
        >
          <i class="pi pi-compass text-apricot-500 text-xs" />
          <span>Principles</span>
        </button>
      </div>
    </header>

    <!-- 3. CENTER CONTENT AREA (Floating Overlay Card for Login) -->
    <main class="relative z-20 w-full max-w-7xl mx-auto px-6 my-auto flex items-center justify-end pointer-events-none">
      <!-- Floating Glass Login Card (Top-Right aligned over 3D background) -->
      <div class="w-full max-w-md pointer-events-auto bg-white/85 backdrop-blur-xl border border-white/80 p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(30,58,95,0.15)] space-y-5 animate-fadeIn">
        <div class="text-center space-y-1">
          <div class="w-12 h-12 rounded-2xl bg-apricot-50 border border-apricot-200/60 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <img src="/tri.png" alt="Logo" class="w-7 h-7 object-contain" />
          </div>
          <h2 class="text-2xl font-serif font-extrabold text-blueberry-900">
            Tricastle Portal
          </h2>
          <p class="text-[11px] font-bold text-apricot-600 tracking-wider uppercase">
            Construct Your Future
          </p>
        </div>

        <!-- Login Router View -->
        <div class="pt-1">
          <RouterView />
        </div>
      </div>
    </main>

    <!-- 4. BOTTOM FOOTER BAR -->
    <footer class="relative z-20 w-full max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-[11px] text-blueberry-700 bg-white/40 backdrop-blur-md border-t border-white/40 rounded-t-2xl">
      <p class="font-medium">© {{ year }} Tricastle International, Inc. · Bacolod</p>

      <button
        type="button"
        class="flex items-center gap-2 hover:text-blueberry-950 transition-colors group font-semibold cursor-pointer"
        @click="openCompany('team')"
      >
        <span>Engineered & Developed by</span>
        <span class="px-2.5 py-0.5 rounded-lg bg-blueberry-900 text-white font-bold tracking-wide group-hover:bg-apricot-500 transition-colors shadow-sm">
          Ralph Barioga
        </span>
      </button>
    </footer>

    <!-- Lazy company experience modal -->
    <CompanyExperienceModal
      v-if="showCompany"
      :initial-tab="companyTab"
      @close="showCompany = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'
import BuildingHeroScene from '@/components/landing/BuildingHeroScene.vue'

const CompanyExperienceModal = defineAsyncComponent(
  () => import('./company-experience/CompanyExperienceModal.vue'),
)

const showCompany = ref(false)
const companyTab = ref<'about' | 'principles' | 'team'>('about')
const year = computed(() => new Date().getFullYear())

function openCompany(tab: 'about' | 'principles' | 'team' = 'about') {
  companyTab.value = tab
  showCompany.value = true
}
</script>

<style>
/* Lock body from scrolling on the login screen */
html, body {
  overflow: hidden !important;
  height: 100% !important;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>