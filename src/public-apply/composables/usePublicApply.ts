import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { publicApplyApi } from '../services/publicApplyApi'

export function usePublicApply() {
  const router = useRouter()
  const loading = ref(false)
  const errorMessage = ref('')
  const registeredData = ref<{ applicant_code: string; full_name: string; id: number } | null>(null)

  async function submitApplication(payload: Record<string, any>) {
    loading.value = true
    errorMessage.value = ''

    try {
      // POSTs to: /api/v1/public/apply
      const { data } = await publicApplyApi.post('/apply', payload)

      registeredData.value = data?.applicant ?? null

      // Navigate to success page passing applicant code & name
      await router.push({
        name: 'public.apply.success',
        query: {
          code: data?.applicant?.applicant_code,
          name: data?.applicant?.full_name,
        },
      })

      return data
    } catch (err: any) {
      errorMessage.value =
        err.response?.data?.message ??
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : 'Failed to submit application. Please check your details.')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    registeredData,
    submitApplication,
  }
}