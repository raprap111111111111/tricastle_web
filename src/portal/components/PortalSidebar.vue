<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()
const router = useRouter()
const year = computed(() => new Date().getFullYear())

function navigateHome() {
  router.push('/portal/dashboard')
}
</script>

<template>
  <aside 
    class="fixed md:relative z-50 w-[260px] h-full bg-white border-r border-slate-100 flex flex-col shrink-0 transition-transform duration-300 shadow-xl md:shadow-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <div class="p-6 flex-1 flex flex-col overflow-y-auto no-scrollbar">
      
      <!-- Brand Logo using /tri.png -->
      <div class="flex items-center gap-3 mb-10 cursor-pointer group" @click="navigateHome">
        <img 
          src="/tri.png" 
          alt="Tricastle Logo" 
          class="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" 
        />
        <div class="flex flex-col">
          <span class="text-[14px] font-black tracking-widest text-slate-900 leading-none mb-1">TRICASTLE</span>
          <span class="text-[9px] font-bold tracking-[0.2em] text-slate-500 leading-none">INTERNATIONAL</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="space-y-1.5 mb-8">
        <router-link 
          to="/portal/dashboard" 
          class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all"
          :class="route.path === '/portal/dashboard' ? 'bg-[#FFF0E6] text-[#FF5E13]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        >
          <i class="pi pi-home text-lg" :class="route.path === '/portal/dashboard' ? 'text-[#FF5E13]' : ''"></i>
          <span class="text-sm">Overview</span>
        </router-link>

        <!-- <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-all">
          <i class="pi pi-users text-lg"></i>
          <span class="text-sm">Guarantors</span>
        </a> -->

        <!-- <a href="#" class="flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-all">
          <div class="flex items-center gap-3">
            <i class="pi pi-bell text-lg"></i>
            <span class="text-sm">Notifications</span>
          </div>
          <span class="bg-orange-100 text-[#FF5E13] py-0.5 px-2 rounded-full text-xs font-bold">2</span>
        </a> -->

        <!-- <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-all">
          <i class="pi pi-question-circle text-lg"></i>
          <span class="text-sm">Help Center</span>
        </a> -->
      </nav>

      <!-- Need Help Widget (Pushed to bottom) -->
      <div class="mt-auto">
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
          <h4 class="font-bold text-slate-900 text-sm mb-1">Need help?</h4>
          <p class="text-xs text-slate-500 leading-relaxed mb-4">Our support team is here to help you.</p>
          <button class="w-full py-2 px-4 bg-white border border-[#FF5E13]/30 text-[#FF5E13] rounded-xl text-xs font-bold hover:bg-[#FFF0E6] transition-colors flex items-center justify-center gap-2">
            <i class="pi pi-headphones text-sm"></i>
            Contact Support
          </button>
        </div>

        <!-- Sidebar Copyright -->
        <p class="text-[11px] text-slate-400 leading-relaxed">
          © {{ year }} Tricastle International, Inc.<br/>All rights reserved.
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Hide scrollbar for sidebar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>