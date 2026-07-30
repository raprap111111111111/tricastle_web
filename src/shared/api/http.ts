// src/shared/api/http.ts
import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8086/api/v1',
  headers: {
    // ✅ FIX 1: Do NOT set Content-Type here.
    //          Let axios choose it per request:
    //          - FormData → multipart/form-data with boundary
    //          - Object   → application/json
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
})

// ─── Request Interceptor — Attach Token + Smart Content-Type ────────────────
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach auth token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // ✅ FIX 2: Set Content-Type based on payload type
    if (config.data instanceof FormData) {
      // Let the browser set: multipart/form-data; boundary=...
      // Delete any pre-existing Content-Type so axios/browser controls it
      delete config.headers['Content-Type']
    } else if (
      config.data &&
      typeof config.data === 'object' &&
      !config.headers['Content-Type']
    ) {
      // Default to JSON for objects
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — Unwrap "data" wrapper ───────────────────────────
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    // If backend wraps as { success, message, data }, unwrap
    if (data?.success !== undefined && data?.data !== undefined) {
      response.data = data.data
    }
    return response
  },
  (error) => {
    console.error('❌ HTTP Error:', error?.response?.status, error?.response?.data)
    return Promise.reject(error)
  }
)

export default http