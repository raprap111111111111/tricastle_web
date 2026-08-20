<!-- src/shared/ui/map/AppAddressMap.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon paths (Vite issue)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

const props = withDefaults(
  defineProps<{
    address?: string | null
    city?: string | null
    province?: string | null
    postalCode?: string | null
    country?: string | null
    label?: string
    height?: string
    zoom?: number
  }>(),
  {
    country: 'Philippines',
    label: 'Location',
    height: '300px',
    zoom: 15,
  },
)

const mapContainer = ref<HTMLDivElement | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const coords = ref<{ lat: number; lng: number } | null>(null)

let mapInstance: L.Map | null = null
let markerInstance: L.Marker | null = null

// ─── Full address string ────────────────────────
const fullAddress = computed(() => {
  return [
    props.address,
    props.city,
    props.province,
    props.postalCode,
    props.country,
  ]
    .filter(Boolean)
    .join(', ')
})

// ─── Geocode with Nominatim (OpenStreetMap - FREE) ──
async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  if (!query.trim()) return null

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    })

    if (!res.ok) throw new Error('Geocoding failed')

    const data = await res.json()

    if (!data || data.length === 0) return null

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }
  } catch (err) {
    console.error('Geocoding error:', err)
    return null
  }
}

// ─── Initialize / update map ────────────────────
async function initMap(): Promise<void> {
  if (!mapContainer.value) return

  const query = fullAddress.value.trim()

  if (!query) {
    error.value = 'No address provided'
    return
  }

  loading.value = true
  error.value = null

  // Try full address first, fallback to city+country
  let location = await geocode(query)

  if (!location && props.city) {
    location = await geocode(`${props.city}, ${props.country}`)
  }

  if (!location) {
    // Ultimate fallback: country only
    location = await geocode(props.country ?? 'Philippines')
  }

  loading.value = false

  if (!location) {
    error.value = 'Could not locate address on map'
    return
  }

  coords.value = location

  // Create or update map
  if (!mapInstance) {
    mapInstance = L.map(mapContainer.value, {
      center: [location.lat, location.lng],
      zoom: props.zoom,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance)
  } else {
    mapInstance.setView([location.lat, location.lng], props.zoom)
  }

  // Update marker
  if (markerInstance) {
    markerInstance.setLatLng([location.lat, location.lng])
  } else {
    markerInstance = L.marker([location.lat, location.lng]).addTo(mapInstance!)
  }

  markerInstance.bindPopup(`
    <div style="min-width: 180px;">
      <strong style="font-size: 13px;">${props.label}</strong><br>
      <span style="font-size: 12px; color: #666;">${query}</span>
    </div>
  `)
}

// ─── Open in Google Maps (external) ─────────────
function openInGoogleMaps(): void {
  const query = encodeURIComponent(fullAddress.value)
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
}

// ─── Enable/disable scroll zoom on click ────────
function enableScrollZoom(): void {
  mapInstance?.scrollWheelZoom.enable()
}

function disableScrollZoom(): void {
  mapInstance?.scrollWheelZoom.disable()
}

// ─── Lifecycle ──────────────────────────────────
onMounted(() => {
  // Small delay for DOM to settle
  setTimeout(initMap, 100)
})

// Re-initialize when address changes
watch(fullAddress, () => {
  if (mapInstance) initMap()
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs text-blueberry-500">
        <i class="pi pi-map-marker text-apricot-500" />
        <span class="font-medium">{{ label }}</span>
      </div>

      <button
        v-if="fullAddress"
        type="button"
        class="text-xs text-apricot-600 hover:text-apricot-700 hover:underline
               flex items-center gap-1"
        @click="openInGoogleMaps"
      >
        Open in Google Maps
        <i class="pi pi-external-link text-[10px]" />
      </button>
    </div>

    <!-- Address text -->
    <p v-if="fullAddress" class="text-sm text-blueberry-800">
      {{ fullAddress }}
    </p>

    <!-- Map container -->
    <div
      class="relative w-full rounded-xl overflow-hidden ring-1 ring-appleCore-200
             bg-appleCore-50"
      :style="{ height }"
    >
      <!-- Loading overlay -->
      <div
        v-if="loading"
        class="absolute inset-0 z-[400] flex flex-col items-center justify-center
               bg-white/80 backdrop-blur-sm gap-2"
      >
        <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
        <p class="text-xs text-blueberry-500">Loading map...</p>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="absolute inset-0 z-[400] flex flex-col items-center justify-center
               gap-2 p-4 text-center"
      >
        <i class="pi pi-exclamation-circle text-2xl text-red-400" />
        <p class="text-sm text-blueberry-600 font-medium">{{ error }}</p>
        <p class="text-xs text-blueberry-400">{{ fullAddress || 'No address' }}</p>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!fullAddress"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2"
      >
        <i class="pi pi-map text-3xl text-blueberry-300" />
        <p class="text-sm text-blueberry-500">No address to display</p>
      </div>

      <!-- Map -->
      <div
        ref="mapContainer"
        class="w-full h-full"
        @click="enableScrollZoom"
        @mouseleave="disableScrollZoom"
      />

      <!-- Zoom hint -->
      <div
        v-if="coords && !loading && !error"
        class="absolute bottom-2 right-2 z-[400] bg-white/95 backdrop-blur-sm
               rounded-lg px-2 py-1 text-[10px] text-blueberry-500 shadow-sm
               ring-1 ring-appleCore-200 pointer-events-none"
      >
        Click map to enable scroll zoom
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fix Leaflet z-index conflicts with modals */
:deep(.leaflet-container) {
  z-index: 1;
  font-family: inherit;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  padding: 4px 8px;
}
</style>