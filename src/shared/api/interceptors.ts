import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { useAuthStore } from '@features/auth/stores/auth.store'
import router from '@app/router'

export function registerInterceptors(http: AxiosInstance) {
  http.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const authStore = useAuthStore()
      const token = authStore.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: AxiosError) => Promise.reject(error),
  )

  http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        const authStore = useAuthStore()
        authStore.clearAuth()
        if (!router.currentRoute.value.path.startsWith('/auth')) {
          await router.push({ name: 'Login' })
        }
      }
      return Promise.reject(error)
    },
  )
}