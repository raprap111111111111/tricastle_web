import { ref, computed } from 'vue'
import { geoApi, type CountryData, type StateData } from '@shared/api/geo.api'

// ─── Global caches ──────────────────────────────────
const countriesCache = ref<CountryData[]>([])
const statesCache    = ref<Map<string, StateData[]>>(new Map())
const citiesCache    = ref<Map<string, string[]>>(new Map())

const loadingCountries = ref(false)
const loadingStates    = ref(false)
const loadingCities    = ref(false)

export function useGeo() {
  // ─── Countries ─────────────────────────────────
  async function fetchCountries(): Promise<CountryData[]> {
    if (countriesCache.value.length) return countriesCache.value

    loadingCountries.value = true
    try {
      const data = await geoApi.getAllCountries()
      countriesCache.value = data
      return data
    } catch (err) {
      console.error('[useGeo] fetchCountries failed:', err)
      return []
    } finally {
      loadingCountries.value = false
    }
  }

  // ─── States/Prefectures/Provinces ──────────────
  async function fetchStates(countryName: string): Promise<StateData[]> {
    if (!countryName) return []

    if (statesCache.value.has(countryName)) {
      return statesCache.value.get(countryName)!
    }

    loadingStates.value = true
    try {
      const data = await geoApi.getStates(countryName)
      statesCache.value.set(countryName, data)
      return data
    } catch (err) {
      console.error('[useGeo] fetchStates failed:', err)
      return []
    } finally {
      loadingStates.value = false
    }
  }

  // ─── Cities ─────────────────────────────────────
  async function fetchCities(
    countryName: string,
    stateName: string,
  ): Promise<string[]> {
    if (!countryName || !stateName) return []

    const key = `${countryName}::${stateName}`

    if (citiesCache.value.has(key)) {
      return citiesCache.value.get(key)!
    }

    loadingCities.value = true
    try {
      const data = await geoApi.getCities(countryName, stateName)
      citiesCache.value.set(key, data)
      return data
    } catch (err) {
      console.error('[useGeo] fetchCities failed:', err)
      return []
    } finally {
      loadingCities.value = false
    }
  }

  return {
    // state
    countries:        computed(() => countriesCache.value),
    loadingCountries,
    loadingStates,
    loadingCities,

    // actions
    fetchCountries,
    fetchStates,
    fetchCities,
  }
}