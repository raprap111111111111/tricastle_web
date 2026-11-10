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

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

portalApi.interceptors.response.use(
  (res) => {
    return res
  },
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''

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