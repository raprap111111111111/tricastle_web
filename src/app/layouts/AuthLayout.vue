<template>
  <div class="min-h-screen flex items-center justify-center bg-appleCore-50 relative overflow-hidden">
    <div class="absolute top-0 left-0 w-96 h-96 bg-apricot-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-40" />
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-blueberry-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-40" />

    <div class="w-full max-w-md px-4 relative z-10">
      <div class="text-center mb-8 flex flex-col items-center">
        <img
          src="/tri.png"
          alt="Tricastle"
          class="w-20 h-20 mb-4 drop-shadow-md"
          onerror="this.style.display='none'"
        />
        <h1 class="text-3xl font-serif font-bold text-blueberry-800">
          Tricastle Bacolod
        </h1>
        <p class="text-sm text-blueberry-500 mt-2 tracking-wide uppercase">
          Document Verification System
        </p>
      </div>
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>