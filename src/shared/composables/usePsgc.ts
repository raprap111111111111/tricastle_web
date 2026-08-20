// src/shared/composables/usePsgc.ts
import { ref, computed } from 'vue'
import { psgcApi } from '@shared/api/psgc.api'
import type {
  PsgcRegion,
  PsgcProvince,
  PsgcCity,
  PsgcBarangay,
} from '@features/applicants/types'

// ─── Global cache (survives across component mounts) ──
const regionsCache   = ref<PsgcRegion[]>([])
const provincesCache = ref<PsgcProvince[]>([])
const citiesCache    = ref<Map<string, PsgcCity[]>>(new Map())
const barangaysCache = ref<Map<string, PsgcBarangay[]>>(new Map())

const loadingRegions   = ref(false)
const loadingProvinces = ref(false)
const loadingCities    = ref(false)
const loadingBarangays = ref(false)

export function usePsgc() {
  // ─── Fetch Regions ────────────────────────────────
  async function fetchRegions(): Promise<PsgcRegion[]> {
    if (regionsCache.value.length) return regionsCache.value

    loadingRegions.value = true
    try {
      const data = await psgcApi.regions()
      regionsCache.value = data
      return data
    } catch (err) {
      console.error('[usePsgc] Failed to fetch regions:', err)
      return []
    } finally {
      loadingRegions.value = false
    }
  }

  // ─── Fetch ALL Provinces (for filter dropdown) ────
  async function fetchAllProvinces(): Promise<PsgcProvince[]> {
    if (provincesCache.value.length) return provincesCache.value

    loadingProvinces.value = true
    try {
      const data = await psgcApi.allProvinces()
      provincesCache.value = data
      return data
    } catch (err) {
      console.error('[usePsgc] Failed to fetch provinces:', err)
      return []
    } finally {
      loadingProvinces.value = false
    }
  }

  // ─── Fetch Provinces by Region (for cascading form) ─
  async function fetchProvincesByRegion(
    regionCode: string,
  ): Promise<PsgcProvince[]> {
    if (!regionCode) return []

    loadingProvinces.value = true
    try {
      return await psgcApi.provinces(regionCode)
    } catch (err) {
      console.error('[usePsgc] Failed to fetch provinces by region:', err)
      return []
    } finally {
      loadingProvinces.value = false
    }
  }

  // ─── Fetch Cities by Province ─────────────────────
  async function fetchCitiesByProvince(
    provinceCode: string,
  ): Promise<PsgcCity[]> {
    if (!provinceCode) return []

    // Cache hit
    if (citiesCache.value.has(provinceCode)) {
      return citiesCache.value.get(provinceCode)!
    }

    loadingCities.value = true
    try {
      const data = await psgcApi.cities(provinceCode)

      // Tag each with clear city/municipality flags
      const tagged: PsgcCity[] = data.map((c: any) => {
        const classification = c.classification ?? ''
        return {
          ...c,
          isCity:         c.isCity === true         || classification === 'City',
          isMunicipality: c.isMunicipality === true || classification === 'Municipality',
        }
      })

      citiesCache.value.set(provinceCode, tagged)
      return tagged
    } catch (err) {
      console.error('[usePsgc] Failed to fetch cities:', err)
      return []
    } finally {
      loadingCities.value = false
    }
  }

  // ─── Fetch Barangays by City ──────────────────────
  async function fetchBarangaysByCity(
    cityCode: string,
  ): Promise<PsgcBarangay[]> {
    if (!cityCode) return []

    if (barangaysCache.value.has(cityCode)) {
      return barangaysCache.value.get(cityCode)!
    }

    loadingBarangays.value = true
    try {
      const data = await psgcApi.barangays(cityCode)
      barangaysCache.value.set(cityCode, data)
      return data
    } catch (err) {
      console.error('[usePsgc] Failed to fetch barangays:', err)
      return []
    } finally {
      loadingBarangays.value = false
    }
  }

  // ─── Helpers ──────────────────────────────────────
  const provinces = computed(() => provincesCache.value)
  const regions   = computed(() => regionsCache.value)

  function findProvinceByName(name: string): PsgcProvince | undefined {
    return provincesCache.value.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    )
  }

  function findProvinceByCode(code: string): PsgcProvince | undefined {
    return provincesCache.value.find((p) => p.code === code)
  }

  return {
    // State
    regions,
    provinces,
    loadingRegions,
    loadingProvinces,
    loadingCities,
    loadingBarangays,

    // Actions
    fetchRegions,
    fetchAllProvinces,
    fetchProvincesByRegion,
    fetchCitiesByProvince,
    fetchBarangaysByCity,

    // Helpers
    findProvinceByName,
    findProvinceByCode,
  }
}