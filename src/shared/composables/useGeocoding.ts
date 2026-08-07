import { ref } from 'vue'
import axios from 'axios'

// ─── Types ──────────────────────────────────────────
export interface GeocodingResult {
  place_id:      number
  display_name:  string
  lat:           string
  lon:           string
  address: {
    // Street level
    house_number?: string
    road?:         string

    // City level
    city?:         string
    town?:         string
    village?:      string
    municipality?: string
    suburb?:       string

    // State/Prefecture level
    state?:        string
    province?:     string
    region?:       string

    // Country
    country?:      string
    country_code?: string

    // Postal
    postcode?:     string
  }
}

export interface NormalizedAddress {
  street:      string
  city:        string
  prefecture:  string
  postal_code: string
  country:     string
  full:        string
  lat:         number
  lon:         number
}

// ─── Nominatim client ────────────────────────────────
const nominatim = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  timeout: 15000,
  headers: {
    // Nominatim requires a User-Agent identifying your app
    'Accept': 'application/json',
  },
})

// ─── Composable ──────────────────────────────────────
export function useGeocoding() {
  const loading = ref(false)
  const results = ref<GeocodingResult[]>([])

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Search addresses worldwide.
   * @param query   free-text search (e.g. "1 Toyota-Cho Aichi")
   * @param country optional ISO 3166-1 alpha-2 code to bias results (e.g. 'jp', 'ph')
   */
  async function search(
    query: string,
    country?: string,
  ): Promise<GeocodingResult[]> {
    if (!query || query.trim().length < 3) {
      results.value = []
      return []
    }

    loading.value = true
    try {
      const { data } = await nominatim.get<GeocodingResult[]>('/search', {
        params: {
          q:                query,
          format:           'json',
          addressdetails:   1,
          limit:            8,
          'accept-language':'en',
          countrycodes:     country ?? undefined,
        },
      })
      results.value = data
      return data
    } catch (err) {
      console.error('[useGeocoding] Search failed:', err)
      results.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Debounced version for use in v-model + autocomplete.
   */
  function debouncedSearch(
    query: string,
    country?: string,
    delay = 400,
  ): Promise<GeocodingResult[]> {
    return new Promise((resolve) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        const data = await search(query, country)
        resolve(data)
      }, delay)
    })
  }

  /**
   * Normalize Nominatim response into a clean, form-ready object.
   * Handles country-specific quirks (e.g. Japan uses "city" or "town").
   */
  function normalize(result: GeocodingResult): NormalizedAddress {
    const a = result.address

    // Street
    const street = [a.house_number, a.road].filter(Boolean).join(' ')

    // City (fallback chain — Japan uses various fields)
    const city =
      a.city ??
      a.town ??
      a.village ??
      a.municipality ??
      a.suburb ??
      ''

    // Prefecture / State
    const prefecture = a.state ?? a.province ?? a.region ?? ''

    return {
      street,
      city,
      prefecture,
      postal_code: a.postcode ?? '',
      country:     a.country ?? '',
      full:        result.display_name,
      lat:         parseFloat(result.lat),
      lon:         parseFloat(result.lon),
    }
  }

  return {
    loading,
    results,
    search,
    debouncedSearch,
    normalize,
  }
}