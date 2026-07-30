import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'
import { authApi } from '../api/auth.api'
import { parseApiError } from '@shared/api/errors'
import type { LoginInput, RegisterInput } from '../schemas/auth.schema'

const TOKEN_KEY = 'access_token'

export const useAuthStore = defineStore('auth', () => {
  const user      = ref<User | null>(null)
  const token     = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const isLoading = ref(false)
  const error     = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name} ${user.value.last_name}`.trim()
  })

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  function clearAuth() {
    user.value  = null
    token.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function login(credentials: LoginInput) {
    isLoading.value = true
    error.value     = null
    try {
      const data = await authApi.login(credentials)
      setToken(data.access_token)
      await fetchProfile()
      return data
    } catch (err: any) {
      clearAuth()
      error.value = parseApiError(err).message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterInput) {
    isLoading.value = true
    error.value     = null
    try {
      const data = await authApi.register(payload)
      setToken(data.access_token)
      await fetchProfile()
      return data
    } catch (err: any) {
      clearAuth()
      error.value = parseApiError(err).message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (e) {
      console.warn('Logout API failed — clearing locally')
    } finally {
      clearAuth()
    }
  }

  async function fetchProfile() {
    if (!token.value) return null
    try {
      const data = await authApi.getProfile()
      user.value = data
      return data
    } catch (err) {
      clearAuth()
      throw err
    }
  }

  async function initialize() {
    if (token.value && !user.value) {
      try {
        await fetchProfile()
      } catch {
        clearAuth()
      }
    }
  }

  return {
    user, token, isLoading, error,
    isAuthenticated, fullName,
    login, register, logout, fetchProfile, initialize, clearAuth,
  }
})