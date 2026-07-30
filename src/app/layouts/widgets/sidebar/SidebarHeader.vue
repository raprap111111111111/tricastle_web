<template>
  <div>
    <div class="px-6 pt-6 pb-5 flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg overflow-hidden bg-white border border-appleCore-200 flex items-center justify-center p-1">
        <img
          src="/tricastle.jpg"
          alt="Tricastle"
          class="w-full h-full object-contain"
          onerror="this.parentElement.innerHTML='<i class=&quot;pi pi-building text-apricot-500 text-xl&quot;></i>'"
        />
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-serif font-extrabold text-blueberry-800 truncate">
          Tricastle
        </h1>
        <p class="text-[10px] uppercase tracking-widest text-blueberry-500 -mt-0.5">
          Bacolod
        </p>
      </div>
    </div>
    <div class="mx-4 h-px bg-appleCore-200" />
  </div>
</template>

<script setup lang="ts"></script>