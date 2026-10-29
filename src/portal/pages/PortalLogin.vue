<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { useRoute } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { usePortalAuth } from '../composables/usePortalAuth'

const route = useRoute()
const openCompany = inject('openCompany') as ((tab: string) => void) | undefined
const { login, loading } = usePortalAuth()

const form = ref({ email: '', password: '' })
const errorMessage = ref('')

const isConfirmed = computed(() => route.query.confirmed === 'true')

async function handleLogin() {
  errorMessage.value = ''
  try {
    await login(form.value.email, form.value.password)
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message ?? 'Login failed. Please check your credentials.'
  }
}
</script>

<template>
  <div class="w-full max-w-md mx-auto animate-fadeIn relative z-10">

    <!-- ═══════════════ BRAND HEADER ═══════════════ -->
    <div class="text-center mb-6 flex flex-col items-center">
      <button type="button" class="mb-3" @click="openCompany?.('about')">
        <img 
          src="/tri.png" 
          alt="Tricastle" 
          class="w-16 h-16 drop-shadow-md hover:scale-105 transition-transform" 
        />
      </button>
      <h1 class="text-2xl font-serif font-bold text-blueberry-800 tracking-tight">
        Welcome Back
      </h1>
      <p class="text-xs text-blueberry-500 mt-1.5 tracking-wider uppercase font-semibold">
        Tricastle Applicant Portal
      </p>
    </div>

    <!-- ═══════════════ IDENTITY CONFIRMED BANNER (compact) ═══════════════ -->
    <div 
      v-if="isConfirmed" 
      class="mb-4 flex items-start gap-3 bg-green-50/80 backdrop-blur-sm p-3 rounded-xl border border-green-200/80 text-sm shadow-sm"
    >
      <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
        <i class="pi pi-check text-xs font-bold" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-green-800 text-sm leading-tight">Identity confirmed</p>
        <p class="text-xs text-green-700 mt-0.5">
          An account exists for this record. Sign in below to continue.
        </p>
      </div>
    </div>

    <!-- ═══════════════ LOGIN CARD ═══════════════ -->
    <div class="bg-white/95 backdrop-blur-md p-7 rounded-[1.5rem] shadow-medium border border-appleCore-100">
      <h2 class="text-xl font-serif font-semibold text-blueberry-800 mb-5">Sign In</h2>

      <form class="space-y-4" @submit.prevent="handleLogin">
        
        <!-- Error -->
        <div 
          v-if="errorMessage" 
          class="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium"
        >
          <i class="pi pi-exclamation-circle text-sm shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-blueberry-700 mb-1.5">Email</label>
          <InputText
            v-model="form.email"
            type="email"
            class="w-full !bg-[#eef3f7] !border-transparent focus:!border-apricot-400 !rounded-xl !px-4 !py-3 !text-sm"
            placeholder="you@email.com"
          />
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-sm font-semibold text-blueberry-700">Password</label>
            <router-link 
              to="/portal/forgot-password" 
              class="text-xs font-medium text-blueberry-500 hover:text-apricot-500"
            >
              Forgot?
            </router-link>
          </div>
          <Password
            v-model="form.password"
            toggle-mask
            :feedback="false"
            input-class="w-full !bg-[#eef3f7] !border-transparent focus:!border-apricot-400 !rounded-xl !px-4 !py-3 !text-sm"
            class="w-full"
            placeholder="••••••••"
          />
        </div>

        <!-- Submit -->
        <div class="pt-2">
          <Button
            type="submit"
            label="Sign In"
            class="w-full !bg-apricot-500 hover:!bg-apricot-600 !border-none !rounded-xl !py-3.5 !font-bold !text-sm"
            :loading="loading"
          />
        </div>
      </form>
    </div>

    <!-- ═══════════════ FIRST-TIME CTA (clean & inviting) ═══════════════ -->
    <div class="mt-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 overflow-hidden shadow-sm">
      
      <!-- Top: Headline + Icon -->
      <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-100/80">
        <div class="w-9 h-9 rounded-full bg-apricot-100 text-apricot-600 flex items-center justify-center shrink-0">
          <i class="pi pi-sparkles text-sm" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-bold text-blueberry-800 leading-tight">
            First time here?
          </p>
          <p class="text-xs text-blueberry-500 mt-0.5">
            Verify your identity to activate your account
          </p>
        </div>
      </div>

      <!-- Steps -->
      <div class="px-5 py-4 space-y-2">
        <div class="flex items-center gap-2 text-xs text-blueberry-600">
          <span class="w-5 h-5 rounded-full bg-blueberry-50 text-blueberry-500 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
          <span>Enter your First Name, Last Name & Date of Birth</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-blueberry-600">
          <span class="w-5 h-5 rounded-full bg-blueberry-50 text-blueberry-500 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
          <span>We confirm you exist in our records</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-blueberry-600">
          <span class="w-5 h-5 rounded-full bg-blueberry-50 text-blueberry-500 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
          <span>Set your email & password to log in</span>
        </div>
      </div>

      <!-- CTA Button -->
      <router-link 
        to="/portal/verify" 
        class="flex items-center justify-center gap-2 w-full py-3 px-5 bg-apricot-50 hover:bg-apricot-100 text-apricot-600 text-sm font-bold transition-colors border-t border-apricot-100/80"
      >
        <span>Verify &amp; Register</span>
        <i class="pi pi-arrow-right text-xs" />
      </router-link>
    </div>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

:deep(.p-password i) {
  color: #64748b !important;
  right: 1rem !important;
}

:deep(.p-password input) {
  width: 100%;
}
</style>