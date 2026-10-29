// src/portal/composables/usePortalAuth.ts
import { ref, computed, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { portalApi, TOKEN_KEY } from '../services/portalApi'

const applicant = ref<any>(null)
const account = ref<any>(null)
const missingFields = ref<string[]>([])
const pendingRequest = ref<any>(null)
const loading = ref(false)

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  applicant.value = null
  account.value = null
  missingFields.value = []
  pendingRequest.value = null
}

export function usePortalAuth() {
  const router = useRouter()
  const isAuthenticated = computed(() => !!localStorage.getItem(TOKEN_KEY))

  async function fetchMe() {
    try {
      const { data } = await portalApi.get('/me')
      account.value = data.account
      applicant.value = data.applicant
      missingFields.value = data.missing_fields ?? []
      pendingRequest.value = data.pending_request ?? null

      console.log('👤 [Portal User Loaded]:', {
        account: toRaw(account.value),
        applicant: toRaw(applicant.value),
        missingFields: toRaw(missingFields.value),
      })

      return data
    } catch (err: any) {
      console.error(
        '❌ [fetchMe Failed]: Clearing session locally.',
        err.response?.data || err.message,
      )
      clearSession()
      throw err
    }
  }

  async function verifyClaim(
    firstName: string,
    lastName: string,
    dateOfBirth: string,
  ) {
    loading.value = true
    try {
      const { data } = await portalApi.post('/verify-claim', {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
      })
      console.log('🔍 [Verify Claim Result]:', data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function register(payload: {
    first_name: string
    last_name: string
    date_of_birth: string
    email: string
    password: string
    password_confirmation: string
  }) {
    loading.value = true
    try {
      const { data } = await portalApi.post('/register', payload)

      if (!data?.token) {
        throw new Error('Registration succeeded but no token was returned.')
      }

      localStorage.setItem(TOKEN_KEY, data.token)
      console.log('🔑 [Register Successful] Token saved.')

      await fetchMe()
      router.push('/portal/dashboard')
      return data
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const { data } = await portalApi.post('/login', { email, password })

      if (!data?.token) {
        throw new Error('Login succeeded but no token was returned.')
      }

      localStorage.setItem(TOKEN_KEY, data.token)
      console.log('🔑 [Login Successful] Token saved.')

      await fetchMe()
      router.push('/portal/dashboard')
      return data
    } finally {
      loading.value = false
    }
  }

  async function submitProfileUpdate(payload: Record<string, any>) {
    loading.value = true
    try {
      const { data } = await portalApi.post('/profile-updates', payload)
      console.log('📝 [Profile Update Submitted]:', data)
      await fetchMe()
      return data
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await portalApi.post('/logout')
    } catch {
      // ignore network errors on logout
    } finally {
      clearSession()
      router.push('/portal/login')
    }
  }

  return {
    applicant,
    account,
    missingFields,
    pendingRequest,
    loading,
    isAuthenticated,
    verifyClaim,
    register,
    login,
    fetchMe,
    submitProfileUpdate,
    logout,
  }
}