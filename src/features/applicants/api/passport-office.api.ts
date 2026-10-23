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

  /**
   * Create a new DFA issuing office on-the-fly
   */
  async create(payload: { office_name: string; region?: string }): Promise<any> {
    const officeName = payload.office_name.trim()
    const regionName = payload.region?.trim() || 'Others'

    const res: any = await http.post('/passport-issuing-offices', {
      name: officeName,        
      office_name: officeName, 
      region: regionName,
      is_active: true,
    })

    return res?.data?.data ?? res?.data ?? res
  },
}