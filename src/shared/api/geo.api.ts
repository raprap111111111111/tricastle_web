import axios from 'axios'

// ─── Single source: countriesnow.space ───────────────
const geo = axios.create({
  baseURL: 'https://countriesnow.space/api/v0.1',
  timeout: 20000,
})

// ─── Types ───────────────────────────────────────────
export interface CountryData {
  name:    string
  iso2:    string
  iso3:    string
  flag:    string
  unicode: string
}

export interface StateData {
  name:       string
  state_code: string
}

// ─── API ─────────────────────────────────────────────
export const geoApi = {
  /**
   * Fetch all countries with flag emojis.
   * Endpoint: /countries/flag/unicode
   */
  async getAllCountries(): Promise<CountryData[]> {
    const { data } = await geo.get<{
      error: boolean
      data:  Array<{
        name:    string
        iso2:    string
        iso3:    string
        unicodeFlag: string
      }>
    }>('/countries/flag/unicode')

    if (data.error) return []

    return data.data
      .map((c) => ({
        name:    c.name,
        iso2:    c.iso2,
        iso3:    c.iso3,
        flag:    c.unicodeFlag,
        unicode: c.unicodeFlag,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  },

  /**
   * Fetch all states/prefectures/provinces for a country.
   * Endpoint: /countries/states/q?country=X
   */
  async getStates(countryName: string): Promise<StateData[]> {
    const { data } = await geo.get<{
      error: boolean
      msg:   string
      data:  { states: StateData[] }
    }>('/countries/states/q', {
      params: { country: countryName },
    })

    if (data.error) return []
    return (data.data?.states ?? []).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  },

  /**
   * Fetch all cities within a country + state.
   * ⚠️ Uses EXACT state name from getStates() (e.g. "Aichi Prefecture", not "Aichi")
   * Endpoint: /countries/state/cities/q?country=X&state=Y
   */
  async getCities(countryName: string, stateName: string): Promise<string[]> {
    const { data } = await geo.get<{
      error: boolean
      msg:   string
      data:  string[]
    }>('/countries/state/cities/q', {
      params: { country: countryName, state: stateName },
    })

    if (data.error) {
      console.warn(`[geoApi] No cities found for ${stateName}, ${countryName}`)
      return []
    }
    return (data.data ?? []).sort()
  },
}