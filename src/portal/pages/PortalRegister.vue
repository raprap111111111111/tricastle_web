<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { usePortalAuth } from '../composables/usePortalAuth'

const route = useRoute()
const router = useRouter()
const { register, loading } = usePortalAuth()

const form = ref({
  first_name: '',
  last_name: '',
  date_of_birth: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const errors = ref<Record<string, string>>({})

onMounted(() => {
  form.value.first_name = (route.query.first_name as string) ?? ''
  form.value.last_name = (route.query.last_name as string) ?? ''
  form.value.date_of_birth = (route.query.date_of_birth as string) ?? ''

  if (!route.query.applicant_id || !form.value.first_name) {
    router.replace('/portal/verify')
  }
})

async function handleRegister() {
  errors.value = {}

  if (!form.value.email || !form.value.password) {
    errors.value = { general: 'Please enter a valid email and password.' }
    return
  }

  if (form.value.password !== form.value.password_confirmation) {
    errors.value = { general: 'Passwords do not match.' }
    return
  }

  try {
    await register(form.value)
  } catch (err: any) {
    const data = err.response?.data
    if (data?.errors) {
      const msg = Object.values(data.errors).flat().join(' ')
      errors.value = { general: msg }
    } else {
      errors.value = { general: data?.message ?? 'Registration failed. Please try again.' }
    }
  }
}
</script>

<template>
  <div class="max-w-md mx-auto relative z-10 w-full animate-fadeIn">
    <div class="text-center mb-6">
      <div class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-user-plus text-green-600 text-2xl" />
      </div>
      <h1 class="text-3xl font-serif font-bold text-blueberry-800">Create your account</h1>
    </div>

    <div class="bg-white/95 backdrop-blur-md p-8 rounded-[1.5rem] shadow-medium border border-appleCore-100">
      
      <!-- Verified Badge Card -->
      <div class="bg-green-50 p-4 rounded-xl border border-green-200 mb-6 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold text-green-800 uppercase tracking-wider bg-green-200/60 px-2 py-0.5 rounded-md">
            Verified Record
          </span>
          <p class="text-base font-bold text-blueberry-900 mt-1">
            {{ form.first_name }} {{ form.last_name }}
          </p>
          <p v-if="form.date_of_birth" class="text-xs text-blueberry-600 font-medium">
            DOB: {{ form.date_of_birth }}
          </p>
        </div>
        <i class="pi pi-check-circle text-green-600 text-2xl" />
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div v-if="errors.general" class="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <i class="pi pi-exclamation-circle mt-0.5 shrink-0" />
          <span>{{ errors.general }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Email Address <span class="text-red-500">*</span></label>
          <InputText
            v-model="form.email"
            type="email"
            placeholder="your.email@example.com"
            class="w-full !bg-[#eef3f7] !border-transparent focus:!border-apricot-400 !rounded-xl !px-4 !py-3"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Password <span class="text-red-500">*</span></label>
          <Password
            v-model="form.password"
            toggle-mask
            :feedback="true"
            placeholder="At least 8 characters"
            input-class="w-full !bg-[#eef3f7] !border-transparent focus:!border-apricot-400 !rounded-xl !px-4 !py-3"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Confirm Password <span class="text-red-500">*</span></label>
          <Password
            v-model="form.password_confirmation"
            toggle-mask
            :feedback="false"
            placeholder="Repeat password"
            input-class="w-full !bg-[#eef3f7] !border-transparent focus:!border-apricot-400 !rounded-xl !px-4 !py-3"
            class="w-full"
          />
        </div>

        <div class="pt-2">
          <Button
            type="submit"
            label="Create Account"
            class="w-full !bg-apricot-500 hover:!bg-apricot-600 !border-none !rounded-xl !py-3.5 !font-bold text-white shadow-sm"
            :loading="loading"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
:deep(.p-password i) { color: #64748b !important; right: 1rem !important; }
</style>