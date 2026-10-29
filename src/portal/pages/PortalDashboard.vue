<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { usePortalAuth } from '../composables/usePortalAuth'

const router = useRouter()
const {
  applicant,
  missingFields,
  pendingRequest,
  fetchMe,
} = usePortalAuth()

onMounted(async () => {
  await fetchMe()
})

function goToProfile() {
  router.push('/portal/profile')
}
</script>

<template>
  <div class="w-full space-y-6 animate-fadeIn font-sans text-slate-800 pb-10">

    <!-- ═══════════════ WELCOME HEADER CARD ═══════════════ -->
    <div class="relative bg-white rounded-[24px] p-8 lg:p-10 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      
      <!-- Abstract Wave Background -->
      <div class="absolute inset-y-0 right-0 w-3/4 md:w-1/2 pointer-events-none overflow-hidden z-0 flex justify-end">
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" class="h-full w-full object-cover opacity-60">
          <path d="M400,200 C300,180 200,250 100,150 C50,100 0,200 0,200 L400,200 Z" fill="#F8FAFC" />
          <path d="M400,200 C350,150 250,220 150,120 C80,70 0,150 0,150 L400,200 Z" fill="#FFF0E6" opacity="0.5" />
          <path d="M400,0 C300,20 200,-50 100,50 C50,100 0,0 0,0 L400,0 Z" fill="#F1F5F9" />
        </svg>
      </div>

      <!-- Left: Avatar + Text -->
      <div class="flex items-center gap-6 z-10 min-w-0">
        <div class="w-20 h-20 rounded-full bg-[#0B1B3D] text-white flex items-center justify-center font-serif text-3xl font-bold shadow-lg shadow-blue-900/20 shrink-0">
          {{ applicant?.first_name?.[0] }}{{ applicant?.last_name?.[0] }}
        </div>
        <div class="min-w-0">
          <h1 class="text-3xl font-bold text-slate-900 flex items-center gap-2 flex-wrap tracking-tight">
            <span class="truncate">Hello, {{ applicant?.first_name }}!</span>
            <span aria-hidden="true" class="origin-bottom-right animate-wave">👋</span>
          </h1>
          <div class="flex items-center gap-3 mt-3 flex-wrap">
            <span class="text-sm font-medium text-slate-500">
              Applicant Code:
              <strong class="text-slate-800 font-bold tracking-wide">
                {{ applicant?.applicant_code || 'N/A' }}
              </strong>
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#F0F5FF] text-[#2563EB]">
              {{ applicant?.status || 'PENDING' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Decorative ID card -->
      <div class="relative z-10 hidden lg:block shrink-0 w-64 h-32" aria-hidden="true">
        <div class="absolute right-4 top-1/2 -translate-y-1/2 rotate-[-4deg] bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 w-52 transition-transform hover:rotate-0 duration-500">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-slate-400 shrink-0">
              <i class="pi pi-user text-lg" />
            </div>
            <div class="flex-1 space-y-2 min-w-0">
              <div class="h-2 w-16 bg-slate-200 rounded-full" />
              <div class="h-2 w-24 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div class="space-y-2.5">
            <div class="h-1.5 w-full bg-slate-100 rounded-full" />
            <div class="h-1.5 w-4/5 bg-slate-100 rounded-full" />
          </div>
          <div class="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-[#10B981] border-[3px] border-white text-white flex items-center justify-center shadow-md">
            <i class="pi pi-check text-[12px] font-bold" />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ PENDING REVIEW BANNER ═══════════════ -->
    <div 
      v-if="pendingRequest" 
      class="bg-blue-50/80 border border-blue-100 rounded-[20px] p-5 shadow-sm flex items-start gap-4"
    >
      <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
        <i class="pi pi-hourglass text-lg" />
      </div>
      <div>
        <h3 class="text-blue-900 font-bold text-sm mb-1">Your profile is currently under review!</h3>
        <p class="text-blue-700 text-sm leading-relaxed">
          Our staff is looking over the information you recently submitted. We will notify you as soon as your updates are approved and your application can move forward.
        </p>
      </div>
    </div>

    <!-- ═══════════════ ACTION REQUIRED CARD ═══════════════ -->
    <div
      v-if="missingFields.length > 0"
      class="relative bg-white rounded-[24px] p-8 lg:p-12 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
    >
      <div class="flex flex-col items-start gap-4 z-10 max-w-xl">
        
        <!-- Status Pill -->
        <div class="inline-flex items-center gap-2 bg-orange-50 text-apricot-600 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase border border-orange-100">
          <i class="pi pi-exclamation-circle text-sm" />
          <span>Next Step</span>
        </div>

        <div class="space-y-3 mt-1">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Almost there! Let's complete your profile.
          </h2>
          <p class="text-slate-500 text-base leading-relaxed">
            To officially process your application, we just need a few more pieces of information from you. 
          </p>
          
          <div class="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 w-fit mt-2">
            <i class="pi pi-list text-slate-400" />
            <span>You have <strong class="text-slate-900 font-bold">{{ missingFields.length }} detail(s)</strong> left to fill out.</span>
          </div>

          <div class="pt-5 flex flex-wrap items-center gap-5">
            <Button
              label="Fill in Missing Details"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="!bg-apricot-500 hover:!bg-apricot-600 !border-none !text-white !rounded-xl !px-7 !py-3.5 !font-bold shadow-lg shadow-orange-500/20 transition-all"
              @click="goToProfile"
            />
          </div>
        </div>
      </div>

      <!-- Right Illustration: Clipboard & Plant -->
      <div class="relative z-10 shrink-0 self-center hidden sm:flex items-center justify-center w-64 h-56" aria-hidden="true">
        <!-- Subtle Orange Blob -->
        <div class="absolute right-0 top-2 w-48 h-48 bg-[#FFF0E6] rounded-full blur-sm" />
        
        <!-- Clipboard Base -->
        <div class="relative z-10 w-40 h-52 bg-white rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col p-5">
          <!-- Clipboard Clip -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-[#475569] rounded-md shadow-sm" />
          
          <!-- Clipboard Items -->
          <div class="mt-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded border border-slate-300 flex items-center justify-center text-slate-400"><i class="pi pi-check text-[10px]" /></div>
              <div class="h-2 w-16 bg-slate-200 rounded-full" />
            </div>
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded border border-slate-300 flex items-center justify-center text-slate-400"><i class="pi pi-check text-[10px]" /></div>
              <div class="h-2 w-12 bg-slate-200 rounded-full" />
            </div>
            <!-- Active Orange Item -->
            <div class="flex items-center gap-3 bg-[#FFF0E6] p-1.5 -ml-1.5 rounded-lg border border-orange-100">
              <div class="w-4 h-4 rounded bg-[#FF5E13] flex items-center justify-center text-white shadow-sm"><i class="pi pi-pencil text-[10px]" /></div>
              <div class="h-2.5 w-14 bg-[#FF5E13] rounded-full" />
            </div>
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded border border-slate-300 flex items-center justify-center text-slate-400"><i class="pi pi-check text-[10px]" /></div>
              <div class="h-2 w-20 bg-slate-200 rounded-full" />
            </div>
          </div>
        </div>

        <!-- Mini Potted Plant -->
        <div class="absolute -right-8 -bottom-2 w-16 h-24 z-20">
          <svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
            <path d="M18 64L22 92H42L46 64H18Z" fill="#475569" />
            <path d="M16 58H48V64H16V58Z" fill="#334155" />
            <path d="M32 58V24" stroke="#166534" stroke-width="2.5" stroke-linecap="round" />
            <path d="M32 38C22 30 12 36 10 46C20 46 28 40 32 38Z" fill="#22C55E" />
            <path d="M32 30C42 20 52 26 54 36C44 36 36 32 32 30Z" fill="#15803D" />
            <path d="M32 20C26 10 16 14 14 22C22 24 28 22 32 20Z" fill="#4ADE80" />
            <path d="M32 14C38 4 48 8 50 16C42 18 36 16 32 14Z" fill="#22C55E" />
          </svg>
        </div>
      </div>
    </div>

    <!-- ═══════════════ WHY COMPLETE YOUR PROFILE ═══════════════ -->
    <div
      v-if="missingFields.length > 0"
      class="bg-white rounded-[24px] p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100"
    >
      <div class="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-0">
        
        <!-- Left Title -->
        <div class="lg:w-1/4 lg:border-r border-slate-100 lg:pr-8">
          <h3 class="text-xl font-bold text-slate-900 leading-tight">
            Why is a complete<br class="hidden lg:block"/> profile important?
          </h3>
          <div class="w-8 h-[3px] bg-apricot-500 mt-4 rounded-full" />
        </div>

        <!-- Right Features -->
        <div class="lg:w-3/4 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:pl-8">
          <!-- Feature 1 -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <i class="pi pi-bolt text-xl" />
            </div>
            <div class="pt-1">
              <h4 class="font-bold text-slate-900 text-sm">Speeds up your process</h4>
              <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Our team can process and approve your application much faster.
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="flex items-start gap-4 sm:border-l border-slate-100 sm:pl-8">
            <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <i class="pi pi-briefcase text-xl" />
            </div>
            <div class="pt-1">
              <h4 class="font-bold text-slate-900 text-sm">Finds the right fit</h4>
              <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Accurate skills and experience help us match you to the best jobs.
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="flex items-start gap-4 sm:border-l border-slate-100 sm:pl-8">
            <div class="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <i class="pi pi-bell text-xl" />
            </div>
            <div class="pt-1">
              <h4 class="font-bold text-slate-900 text-sm">Keeps you updated</h4>
              <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Ensure you never miss important deployment notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ COMPLETE DASHBOARD STATE ═══════════════ -->
    <div v-if="missingFields.length === 0 && !pendingRequest" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Success Card -->
      <div class="bg-white p-10 rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-emerald-100 flex flex-col items-center justify-center text-center">
        <div class="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-5 shadow-inner">
          <i class="pi pi-check-circle text-4xl" />
        </div>
        <h3 class="font-bold text-slate-900 text-xl">You're all set!</h3>
        <p class="text-sm text-slate-500 mt-2">
          Your profile is 100% complete and ready for the next phase of your application.
        </p>
        <Button
          label="Review Profile"
          icon="pi pi-user-edit"
          class="!mt-8 !bg-slate-50 hover:!bg-slate-100 !text-slate-700 !border-slate-200 !rounded-xl !text-sm !font-bold px-6"
          @click="goToProfile"
        />
      </div>

      <!-- Placeholder / Coming Soon Card -->
      <div class="bg-white p-10 rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100 md:col-span-2 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-4">
          <i class="pi pi-sparkles text-2xl" />
        </div>
        <h3 class="font-bold text-slate-900 text-xl">More Tools Coming Soon</h3>
        <p class="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
          Soon you'll be able to track your deployment progress, manage your documents, and view your interview schedules directly from this dashboard.
        </p>
      </div>

    </div>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
}
.animate-wave {
  display: inline-block;
  animation: wave 1.5s ease-in-out infinite;
  transform-origin: 70% 70%;
}
</style>