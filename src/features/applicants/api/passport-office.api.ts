import http from '@/shared/api/http'
import type { GroupedPassportOffices } from '../types'

export const passportOfficeApi = {
  /**
   * Fetch all active passport offices grouped by region
   */
  async listGrouped(): Promise<GroupedPassportOffices> {
    const res: any = await http.get('/passport-offices')
    // Safely unwrap data whether Axios interceptor returns response or response.data
    return res?.data?.data ?? res?.data ?? res ?? {}
  },
}