<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] flex flex-col justify-between">
    <!-- Clean Minimalist Header -->
    <header class="w-full max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/tri.png" alt="Tricastle Logo" class="w-9 h-9 object-contain" />
        <span class="font-serif font-bold text-blueberry-900 text-lg">TRICASTLE</span>
      </div>
      <button 
        type="button" 
        class="text-xs font-semibold text-blueberry-600 hover:text-apricot-500 transition-colors flex items-center gap-1.5"
        @click="router.push('/portal/login')"
      >
        <i class="pi pi-sign-in" />
        Already have an account? Sign In
      </button>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 flex items-center justify-center px-4">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="text-center py-4 text-xs text-slate-400">
      &copy; {{ new Date().getFullYear() }} Tricastle International, Inc. All rights reserved.
    </footer>
  </div>
</template>