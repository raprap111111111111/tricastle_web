// src/shared/composables/usePsgc.ts
import { ref, computed } from 'vue'
import { psgcApi } from '@shared/api/psgc.api'
import type {
  PsgcRegion,
  PsgcProvince,
  PsgcCity,
  PsgcBarangay,
} from '@features/applicants/types'

// ─── Local Storage Keys ──────────────────────────────────────
const PROVINCES_CACHE_KEY = 'tc_psgc_provinces_v1'
const REGIONS_CACHE_KEY   = 'tc_psgc_regions_v1'

// ─── Fallback Provinces List (Used if PSGC API times out or is offline) ───
const FALLBACK_PROVINCES: PsgcProvince[] = [
  { code: '063000000', name: 'Negros Occidental', regionCode: '060000000' },
  { code: '064500000', name: 'Negros Oriental', regionCode: '060000000' },
  { code: '063040000', name: 'Iloilo', regionCode: '060000000' },
  { code: '072200000', name: 'Cebu', regionCode: '070000000' },
  { code: '133900000', name: 'NCR, Metro Manila', regionCode: '130000000' },
  { code: '042100000', name: 'Cavite', regionCode: '040000000' },
  { code: '043400000', name: 'Laguna', regionCode: '040000000' },
  { code: '041000000', name: 'Batangas', regionCode: '040000000' },
  { code: '031400000', name: 'Bulacan', regionCode: '030000000' },
  { code: '035400000', name: 'Pampanga', regionCode: '030000000' },
  { code: '036900000', name: 'Tarlac', regionCode: '030000000' },
  { code: '015500000', name: 'Pangasinan', regionCode: '010000000' },
  { code: '112300000', name: 'Davao del Sur', regionCode: '110000000' },
  { code: '101300000', name: 'Misamis Oriental', regionCode: '100000000' },
  { code: '097300000', name: 'Zamboanga del Sur', regionCode: '090000000' },
]

// ─── Global in-memory cache ───────────────────────────────────
const regionsCache   = ref<PsgcRegion[]>([])
const provincesCache = ref<PsgcProvince[]>([])
const citiesCache    = ref<Map<string, PsgcCity[]>>(new Map())
const barangaysCache = ref<Map<string, PsgcBarangay[]>>(new Map())

const loadingRegions   = ref(false)
const loadingProvinces = ref(false)
const loadingCities    = ref(false)
const loadingBarangays = ref(false)

export function usePsgc() {
  // ─── Fetch Regions (with localStorage Cache) ─────────────
  async function fetchRegions(): Promise<PsgcRegion[]> {
    if (regionsCache.value.length) return regionsCache.value

    // Try localStorage
    const local = localStorage.getItem(REGIONS_CACHE_KEY)
    if (local) {
      try {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed) && parsed.length) {
          regionsCache.value = parsed
          return parsed
        }
      } catch {
        localStorage.removeItem(REGIONS_CACHE_KEY)
      }
    }

    loadingRegions.value = true
    try {
      const data = await psgcApi.regions()
      regionsCache.value = data
      localStorage.setItem(REGIONS_CACHE_KEY, JSON.stringify(data))
      return data
    } catch (err) {
      console.warn('[usePsgc] Failed to fetch regions from API:', err)
      return []
    } finally {
      loadingRegions.value = false
    }
  }

  // ─── Fetch ALL Provinces (with localStorage & Fallback) ──
  async function fetchAllProvinces(): Promise<PsgcProvince[]> {
    // 1. Memory Hit
    if (provincesCache.value.length) return provincesCache.value

    // 2. localStorage Hit
    const local = localStorage.getItem(PROVINCES_CACHE_KEY)
    if (local) {
      try {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed) && parsed.length) {
          provincesCache.value = parsed
          return parsed
        }
      } catch {
        localStorage.removeItem(PROVINCES_CACHE_KEY)
      }
    }

    // 3. Network Fetch
    loadingProvinces.value = true
    try {
      const data = await psgcApi.allProvinces()
      if (Array.isArray(data) && data.length) {
        provincesCache.value = data
        localStorage.setItem(PROVINCES_CACHE_KEY, JSON.stringify(data))
        return data
      }
      throw new Error('Empty province list returned')
    } catch (err) {
      console.warn('[usePsgc] PSGC API network fetch failed/timed out. Using fallback provinces list.', err)
      provincesCache.value = FALLBACK_PROVINCES
      return FALLBACK_PROVINCES
    } finally {
      loadingProvinces.value = false
    }
  }

  // ─── Fetch Provinces by Region ───────────────────────────
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

  // ─── Fetch Cities by Province ───────────────────────────
  async function fetchCitiesByProvince(
    provinceCode: string,
  ): Promise<PsgcCity[]> {
    if (!provinceCode) return []

    if (citiesCache.value.has(provinceCode)) {
      return citiesCache.value.get(provinceCode)!
    }

    loadingCities.value = true
    try {
      const data = await psgcApi.cities(provinceCode)

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

  // ─── Fetch Barangays by City ────────────────────────────
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

  // ─── Helpers ────────────────────────────────────────────
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