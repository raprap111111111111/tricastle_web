import axios from 'axios'

// Remove trailing slash if present
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8089/api/v1'
const API_BASE_URL = rawBase.replace(/\/+$/, '')

export const publicApplyApi = axios.create({
  baseURL: `${API_BASE_URL}/public`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export default publicApplyApi