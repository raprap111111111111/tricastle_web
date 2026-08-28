import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { profileApi } from '../api/profile.api'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { parseApiError } from '@shared/api/errors'
import type { UpdateProfilePayload, ChangePasswordPayload } from '../types'

export function useProfile() {
  const toast = useToast()
  const router = useRouter()
  const auth = useAuthStore()

  const isSaving = ref(false)
  const error = ref<string | null>(null)

  async function handleUpdateProfile(payload: UpdateProfilePayload) {
    isSaving.value = true
    error.value = null
    try {
      await profileApi.updateProfile(payload)
      // Refresh global auth state so the navbar/avatar updates instantly
      await auth.fetchProfile() 
      
      toast.add({
        severity: 'success',
        summary: 'Profile Updated',
        detail: 'Your profile has been updated successfully.',
        life: 4000,
      })
      router.push({ name: 'Profile' })
      return true
    } catch (err: any) {
      error.value = parseApiError(err).message
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: error.value ?? 'Could not update profile.',
        life: 5000,
      })
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function handleChangePassword(payload: ChangePasswordPayload) {
    isSaving.value = true
    error.value = null
    try {
      await profileApi.changePassword(payload)
      toast.add({
        severity: 'success',
        summary: 'Password Changed',
        detail: 'Your password has been successfully updated.',
        life: 4000,
      })
      router.push({ name: 'Profile' })
      return true
    } catch (err: any) {
      error.value = parseApiError(err).message
      return false
    } finally {
      isSaving.value = false
    }
  }

  return {
    isSaving,
    error,
    handleUpdateProfile,
    handleChangePassword,
  }
}