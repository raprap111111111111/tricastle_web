import { ref } from 'vue'
import axios from 'axios'

// ─── Types ──────────────────────────────────────────
export interface GeocodingResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    // Street level
    house_number?: string
    road?: string

    // City level
    city?: string
    town?: string
    village?: string
    municipality?: string
    suburb?: string

    // State/Prefecture level
    state?: string
    province?: string
    region?: string

    // Country
    country?: string
    country_code?: string

    // Postal
    postcode?: string
  }
}

export interface NormalizedAddress {
  street: string
  city: string
  prefecture: string
  postal_code: string
  country: string
  full: string
  lat: number
  lon: number
}

// ─── Nominatim client ────────────────────────────────
const nominatim = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

/**
 * Format Japanese Prefecture → -ken / -to / -fu / Hokkaido
 * "Aichi Prefecture" → "Aichi-ken"
 * "Tokyo"            → "Tokyo-to"
 * "Osaka"            → "Osaka-fu"
 * "Hokkaido"         → "Hokkaido"
 */
function formatJapanesePrefecture(pref?: string): string {
  if (!pref) return ''

  let clean = pref.trim().replace(/\s*(prefecture|pref\.|pref)$/i, '').trim()
  if (!clean) return ''

  const lower = clean.toLowerCase()

  // Already has proper suffix
  if (/-(ken|to|fu|do)$/i.test(clean) || /\s+(ken|to|fu|do)$/i.test(clean)) {
    return clean.replace(/\s+(ken|to|fu|do)$/i, '-$1')
  }

  if (lower === 'tokyo' || lower === 'tōkyō') return 'Tokyo-to'
  if (lower === 'osaka' || lower === 'ōsaka') return 'Osaka-fu'
  if (lower === 'kyoto' || lower === 'kyōto') return 'Kyoto-fu'
  if (lower === 'hokkaido' || lower === 'hokkaidō') return 'Hokkaido'

  // Capitalize first letter of each word, then append -ken
  const titled = clean
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-')

  return `${titled}-ken`
}

// ─── Composable ──────────────────────────────────────
export function useGeocoding() {
  const loading = ref(false)
  const results = ref<GeocodingResult[]>([])

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Search addresses worldwide.
   * @param query   free-text search (e.g. "1 Toyota-Cho Aichi")
   * @param country optional ISO 3166-1 alpha-2 code (e.g. 'jp', 'ph')
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
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 8,
          'accept-language': 'en',
          countrycodes: country ?? undefined,
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
   * Debounced version for v-model + autocomplete.
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
   * Japan prefectures are formatted as -ken / -to / -fu.
   */
  function normalize(result: GeocodingResult): NormalizedAddress {
    const a = result.address

    // Street
    const street = [a.house_number, a.road].filter(Boolean).join(' ')

    // City (Japan uses city/town/village/municipality)
    const city =
      a.city ??
      a.town ??
      a.village ??
      a.municipality ??
      a.suburb ??
      ''

    // 🎯 Prefecture: "Aichi Prefecture" → "Aichi-ken"
    const rawPref = a.state ?? a.province ?? a.region ?? ''
    const prefecture = formatJapanesePrefecture(rawPref)

    return {
      street,
      city,
      prefecture,
      postal_code: a.postcode ?? '',
      country: a.country ?? '',
      full: result.display_name,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    }
  }

  return {
    loading,
    results,
    search,
    debouncedSearch,
    normalize,
    formatJapanesePrefecture, // export if you need it elsewhere
  }
}