// src/shared/utils/ais/assets.ts

let cachedLogoBase64:     string | null = null
let cachedWordmarkBase64: string | null = null

/**
 * Fetch a URL and return its base64-encoded data URL.
 * Automatically converts insecure http:// -> https:// to prevent Mixed Content errors.
 */
export async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    // 🎯 Auto-upgrade http:// to https://
    const secureUrl = url.replace(/^http:\/\//i, 'https://')

    const response = await fetch(secureUrl, { mode: 'cors' })
    if (!response.ok) return null

    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror   = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn(`[AIS] Could not load ${url}:`, err)
    return null
  }
}

/** Load company logo (cached after first call). */
export async function loadLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64
  cachedLogoBase64 = await fetchAsBase64('/tri.png')
  return cachedLogoBase64
}

/** Load company wordmark image (cached after first call). */
export async function loadWordmarkBase64(): Promise<string | null> {
  if (cachedWordmarkBase64) return cachedWordmarkBase64
  cachedWordmarkBase64 = await fetchAsBase64('/internation.png')
  return cachedWordmarkBase64
}

/** Load an applicant's photo from URL as base64. */
export async function loadPhotoBase64(url: string): Promise<string | null> {
  return fetchAsBase64(url)
}