// src/shared/api/psgc.api.ts
import axios from 'axios'
import type {
  PsgcRegion,
  PsgcProvince,
  PsgcCity,
  PsgcBarangay,
} from '@features/applicants/types'   // ← FIXED: use alias path

// Public Philippine PSGC API
const psgc = axios.create({
  baseURL: 'https://psgc.gitlab.io/api',
  timeout: 15000,
})

export const psgcApi = {
  async regions(): Promise<PsgcRegion[]> {
    const { data } = await psgc.get<PsgcRegion[]>('/regions')
    return data.sort((a, b) => a.name.localeCompare(b.name))
  },

  /**
   * Get ALL provinces (used for filter dropdown)
   * Returns all 81 provinces at once
   */
  async allProvinces(): Promise<PsgcProvince[]> {
    const { data } = await psgc.get<PsgcProvince[]>('/provinces')
    return data.sort((a, b) => a.name.localeCompare(b.name))
  },

  /**
   * Get provinces by region (for cascading form)
   */
  async provinces(regionCode: string): Promise<PsgcProvince[]> {
    const { data } = await psgc.get<PsgcProvince[]>(
      `/regions/${regionCode}/provinces`,
    )
    return data.sort((a, b) => a.name.localeCompare(b.name))
  },

  async cities(provinceCode: string): Promise<PsgcCity[]> {
    const { data } = await psgc.get<PsgcCity[]>(
      `/provinces/${provinceCode}/cities-municipalities`,
    )
    return data.sort((a, b) => a.name.localeCompare(b.name))
  },

  async barangays(cityCode: string): Promise<PsgcBarangay[]> {
    const { data } = await psgc.get<PsgcBarangay[]>(
      `/cities-municipalities/${cityCode}/barangays`,
    )
    return data.sort((a, b) => a.name.localeCompare(b.name))
  },
}