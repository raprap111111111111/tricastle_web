<template>
  <div class="min-h-screen flex flex-col justify-between bg-appleCore-50 relative overflow-hidden select-none">
    <!-- Ambient blobs -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-apricot-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-blueberry-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-40 pointer-events-none" />

    <!-- Top bar -->
    <header class="relative z-20 w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-apricot-500 animate-pulse" />
        <span class="text-xs font-bold tracking-widest text-blueberry-600 uppercase">
          Tricastle International
        </span>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl bg-white hover:bg-appleCore-50 border border-appleCore-200
                 text-blueberry-800 text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          @click="openCompany('about')"
        >
          <i class="pi pi-building text-apricot-500 text-xs" />
          <span>About Us</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl bg-apricot-500/10 hover:bg-apricot-500/20 border border-apricot-500/30
                 text-apricot-600 text-xs font-bold transition-all flex items-center gap-2"
          @click="openCompany('principles')"
        >
          <i class="pi pi-compass text-apricot-500 text-xs" />
          <span>Principles</span>
        </button>
      </div>
    </header>

    <!-- Login center (unchanged look) -->
    <main class="relative z-10 w-full max-w-md px-4 my-auto mx-auto py-6">
      <div class="text-center mb-8 flex flex-col items-center">
        <button type="button" class="mb-4" @click="openCompany('about')">
          <img
            src="/tri.png"
            alt="Tricastle"
            class="w-20 h-20 drop-shadow-md hover:scale-105 transition-transform"
            @error="(e) => ((e.target as HTMLElement).style.display = 'none')"
          />
        </button>
        <h1 class="text-3xl font-serif font-bold text-blueberry-800">
          Tricastle Bacolod
        </h1>
        <p class="text-xs text-blueberry-500 mt-2 tracking-wide uppercase font-semibold">
          WE BUILD YOUR DREAMS AND CONSTRUCT YOUR FUTURE
        </p>
      </div>

      <RouterView />
    </main>

    <!-- Footer -->
    <footer
      class="relative z-20 w-full max-w-6xl mx-auto px-6 py-4
             flex flex-col sm:flex-row items-center justify-between
             text-xs text-blueberry-500 gap-2 border-t border-appleCore-200/60"
    >
      <p>© {{ year }} Tricastle International, Inc.</p>

      <button
        type="button"
        class="flex items-center gap-2 hover:text-blueberry-800 transition-colors group"
        @click="openCompany('team')"
      >
        <span>Engineered & Developed by</span>
        <span
          class="px-2 py-0.5 rounded-md bg-blueberry-800 text-white font-bold tracking-wide
                 group-hover:bg-apricot-500 transition-colors"
        >
          Ralph Barioga
        </span>
      </button>
    </footer>

    <!-- Lazy company experience (only mounts when open) -->
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