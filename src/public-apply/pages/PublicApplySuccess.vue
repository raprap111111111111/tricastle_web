<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()

const applicantCode = computed(() => (route.query.code as string) || 'N/A')
const applicantName = computed(() => (route.query.name as string) || 'Applicant')

function goToLogin() {
  router.push('/portal/login')
}
</script>

<template>
  <div class="w-full max-w-lg mx-auto animate-fadeIn relative z-10 py-10">
    <div class="bg-white/95 backdrop-blur-md p-8 rounded-[1.5rem] shadow-medium border border-appleCore-100 text-center">
      <div class="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
        <i class="pi pi-check-circle text-4xl" />
      </div>

      <h1 class="text-2xl font-serif font-bold text-blueberry-800">
        Registration Submitted!
      </h1>

      <p class="text-xs text-blueberry-500 uppercase tracking-wider font-bold mt-1">
        Tricastle International Portal
      </p>

      <div class="my-6 p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100">
        <span class="text-xs text-slate-500 block mb-1 font-medium">Your Official Applicant Code</span>
        <strong class="text-2xl font-black text-blueberry-800 tracking-wider">
          {{ applicantCode }}
        </strong>
      </div>

      <p class="text-sm text-slate-600 leading-relaxed mb-6">
        Thank you, <strong>{{ applicantName }}</strong>. Your application has been successfully submitted and is currently <strong>awaiting staff review and validation</strong>.
      </p>

      <!-- Accurate Notice regarding Approval -->
      <div class="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 text-left mb-6 flex items-start gap-2.5">
        <i class="pi pi-info-circle text-amber-600 text-base shrink-0 mt-0.5" />
        <span class="leading-relaxed">
          Once our recruitment staff verifies your application, your account will be activated. You will then be able to log in to the Applicant Portal to complete your profile documents.
        </span>
      </div>

      <Button
        label="Go to Portal Sign In"
        icon="pi pi-sign-in"
        class="w-full !bg-apricot-500 hover:!bg-apricot-600 !border-none !text-white !rounded-xl !py-3.5 !font-bold !text-sm"
        @click="goToLogin"
      />
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
</style>