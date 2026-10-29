import axios from 'axios'

export const TOKEN_KEY = 'portal_token'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api/v1'

const portalApi = axios.create({
  baseURL: `${API_BASE_URL}/portal`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Attach Sanctum bearer token automatically with Debug Logging
portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  console.log(
    `%c 🚀 [Portal API Outgoing] ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`,
    'color: #3b82f6; font-weight: bold;',
    { tokenPresent: !!token, payload: config.data }
  )

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-handle response errors cleanly
portalApi.interceptors.response.use(
  (res) => {
    console.log(
      `%c ✅ [Portal API Success] ${res.status} <- ${res.config.url}`,
      'color: #10b981; font-weight: bold;',
      res.data
    )
    return res
  },
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''

    console.error(
      `%c ❌ [Portal API Error] ${status || 'NETWORK_ERROR'} <- ${url}`,
      'color: #ef4444; font-weight: bold;',
      err.response?.data || err.message
    )

    // Only redirect to login on 401 if accessing a protected endpoint (like /me or /profile-updates)
    if (status === 401) {
      const isPublicEndpoint = url.includes('/login') || url.includes('/register') || url.includes('/verify-claim')
      
      if (!isPublicEndpoint) {
        localStorage.removeItem(TOKEN_KEY)
        if (!window.location.pathname.startsWith('/portal/login')) {
          window.location.href = '/portal/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export { portalApi }
export default portalApi