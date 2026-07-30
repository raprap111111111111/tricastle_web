import http from '@shared/api/http'
import type { LoginInput, RegisterInput } from '../schemas/auth.schema'

export const authApi = {
  async login(credentials: LoginInput) {
    const response = await http.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      device_name: credentials.deviceName || 'web',
    })
    return response.data
  },

  async register(data: RegisterInput) {
    const payload = {
      first_name: data.firstName,
      middle_name: data.middleName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      password_confirmation: data.passwordConfirmation,
      phone: data.phone,
      mobile: data.mobile,
      role: data.role,
    }
    const response = await http.post('/auth/register', payload)
    return response.data
  },

  async logout(logoutAll = false) {
    const response = await http.post('/auth/logout', {
      logout_all_devices: logoutAll,
    })
    return response.data
  },

  async getProfile() {
    const response = await http.get('/auth/profile')
    return response.data
  },
}