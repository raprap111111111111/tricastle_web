<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import { usePortalAuth } from '../composables/usePortalAuth'

const router = useRouter()
const { verifyClaim, loading } = usePortalAuth()

// Strictly Date | null for PrimeVue Calendar
const form = ref({
  first_name: '',
  last_name: '',
  date_of_birth: null as Date | null
})
const errors = ref<Record<string, string>>({})

function formatDateString(val: Date | null): string | null {
  if (!val || !(val instanceof Date) || isNaN(val.getTime())) return null
  const y = val.getFullYear()
  const m = String(val.getMonth() + 1).padStart(2, '0')
  const d = String(val.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function handleVerify() {
  errors.value = {}

  const dobFormatted = formatDateString(form.value.date_of_birth)
  const firstName = form.value.first_name.trim()
  const lastName = form.value.last_name.trim()

  if (!firstName || !lastName || !dobFormatted) {
    errors.value = { general: 'Please complete all required fields to verify your identity.' }
    return
  }

  try {
    const result = await verifyClaim(firstName, lastName, dobFormatted)

    if (!result.verified) {
      errors.value = {
        general: 'No matching record found. Please check your details or contact staff.',
      }
      return
    }

    if (result.has_account) {
      router.push({ path: '/portal/login', query: { confirmed: 'true' } })
    } else {
      router.push({
        path: '/portal/register',
        query: {
          applicant_id: result.applicant_id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dobFormatted,
        },
      })
    }
  } catch (err: any) {
    errors.value = {
      general: err.response?.data?.message ?? 'Verification failed. Please try again.',
    }
  }
}

function goToLogin() {
  router.push('/portal/login')
}
</script>

<template>
  <div class="max-w-md mx-auto relative z-10 w-full animate-fadeIn">

    <button
      type="button"
      class="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blueberry-500 hover:text-apricot-500 transition-colors group"
      @click="goToLogin"
    >
      <i class="pi pi-arrow-left text-xs group-hover:-translate-x-0.5 transition-transform" />
      <span>Back to Sign In</span>
    </button>

    <div class="text-center mb-6">
      <div class="w-16 h-16 rounded-2xl bg-blueberry-100 flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-shield text-blueberry-600 text-2xl" />
      </div>
      <h1 class="text-3xl font-serif font-bold text-blueberry-800">
        Verify Your Identity
      </h1>
    </div>

    <div class="bg-white/95 backdrop-blur-md p-8 rounded-[1.5rem] shadow-medium border border-appleCore-100">
      
      <div class="mb-6 text-sm text-blueberry-700 bg-blueberry-50/50 p-4 rounded-xl border border-blueberry-100">
        <p class="font-bold mb-1">
          To protect your data, confirm your registered details.
        </p>
        <p class="text-xs text-blueberry-600">
          Enter your First Name (include 2nd name if applicable), Last Name, and Date of Birth.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="handleVerify">
        <div
          v-if="errors.general"
          class="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          <i class="pi pi-exclamation-circle mt-0.5 shrink-0" />
          <span>{{ errors.general }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">First Name <span class="text-red-500">*</span></label>
          <InputText
            v-model="form.first_name"
            class="w-full"
            placeholder="e.g. Juan or Mark Anthony"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Last Name <span class="text-red-500">*</span></label>
          <InputText
            v-model="form.last_name"
            class="w-full"
            placeholder="e.g. Dela Cruz"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Date of Birth <span class="text-red-500">*</span></label>
          <Calendar
            v-model="form.date_of_birth"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="YYYY-MM-DD"
            class="w-full portal-calendar"
          />
        </div>

        <div class="pt-2">
          <Button
            type="submit"
            label="Verify Identity"
            class="w-full !bg-apricot-500 hover:!bg-apricot-600 !border-none !rounded-xl !py-3.5 !font-bold text-white shadow-sm"
            :loading="loading"
          />
        </div>
      </form>
    </div>

    <p class="text-center text-sm text-blueberry-500 mt-6">
      Already have an account?
      <button
        type="button"
        class="text-apricot-500 hover:text-apricot-600 font-bold transition-colors"
        @click="goToLogin"
      >
        Sign In
      </button>
    </p>
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

:deep(.p-inputtext) {
  background-color: #eef3f7 !important;
  border: 1px solid transparent !important;
  border-radius: 0.75rem !important;
  padding: 0.75rem 1rem !important;
  color: #334155 !important;
}
:deep(.p-inputtext:focus) {
  border-color: #fb923c !important;
  outline: none !important;
}

:deep(.portal-calendar) {
  display: flex;
  width: 100%;
}
:deep(.portal-calendar .p-inputtext) {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
:deep(.portal-calendar .p-button) {
  background-color: #e2e8f0 !important;
  border: 1px solid transparent !important;
  color: #475569 !important;
  border-top-right-radius: 0.75rem !important;
  border-bottom-right-radius: 0.75rem !important;
  width: 3.5rem;
}
</style>