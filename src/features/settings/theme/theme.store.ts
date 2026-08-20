import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@shared/api/http'
import { getTheme, THEMES, type ThemeName, type ThemeDefinition } from './theme.config'

interface BrandingConfig {
  logo: string
  logo_login: string
  app_name: string
  app_tagline: string
}

export const useThemeStore = defineStore('theme', () => {
  const activeThemeName = ref<ThemeName>('default')
  const effectsEnabled  = ref(true)
  const branding = ref<BrandingConfig>({
    logo:        '/tricastle.jpg',
    logo_login:  '/tricastle.jpg',
    app_name:    'Tricastle',
    app_tagline: 'BACOLOD',
  })

  const activeTheme = computed<ThemeDefinition>(() => getTheme(activeThemeName.value))
  const availableThemes = computed(() => Object.values(THEMES))

  // ─── Load theme (per-user) + branding (global) ─────────
  async function loadTheme() {
    // 1) Load user preferences from /auth/profile
    try {
      const { data } = await http.get('/auth/profile')
      const user = data?.data ?? data

      activeThemeName.value = (user?.theme_preference as ThemeName) ?? 'default'
      effectsEnabled.value  = user?.effects_enabled !== false
    } catch (e) {
      console.warn('Could not load user preferences, using default:', e)
      activeThemeName.value = 'default'
      effectsEnabled.value  = true
    }

    // 2) Load global branding
    try {
      const { data } = await http.get('/settings', { params: { limit: 100 } })
      const settings = data?.data ?? data ?? []
      const map = new Map(settings.map((s: any) => [s.key, s.value]))

      branding.value = {
        logo:        (map.get('branding.logo') as string)        ?? '/tricastle.jpg',
        logo_login:  (map.get('branding.logo_login') as string)  ?? '/tricastle.jpg',
        app_name:    (map.get('branding.app_name') as string)    ?? 'Tricastle',
        app_tagline: (map.get('branding.app_tagline') as string) ?? 'BACOLOD',
      }
    } catch (e) {
      console.error('Failed to load branding:', e)
    }

    applyTheme()
  }

  // ─── Apply CSS variables ───────────────────────────────
  function applyTheme() {
    const theme = activeTheme.value
    const root = document.documentElement

    root.style.setProperty('--theme-bg',            theme.colors.bg)
    root.style.setProperty('--theme-bg-surface',    theme.colors.bgSurface)
    root.style.setProperty('--theme-bg-accent',     theme.colors.bgAccent)
    root.style.setProperty('--theme-text',          theme.colors.text)
    root.style.setProperty('--theme-text-muted',    theme.colors.textMuted)
    root.style.setProperty('--theme-primary',       theme.colors.primary)
    root.style.setProperty('--theme-primary-hover', theme.colors.primaryHover)
    root.style.setProperty('--theme-accent',        theme.colors.accent)
    root.style.setProperty('--theme-sidebar',       theme.colors.sidebar)
    root.style.setProperty('--theme-sidebar-border',theme.colors.sidebarBorder)
    root.style.setProperty('--theme-success',       theme.colors.success)
    root.style.setProperty('--theme-warning',       theme.colors.warning)
    root.style.setProperty('--theme-danger',        theme.colors.danger)
    root.style.setProperty('--theme-font-heading',  theme.fonts.heading)
    root.style.setProperty('--theme-font-body',     theme.fonts.body)

    if (['dark', 'halloween', 'valentines'].includes(theme.name)) {
      root.classList.add('dark-theme')
    } else {
      root.classList.remove('dark-theme')
    }

    root.setAttribute('data-theme', theme.name)
  }

  // ─── Change theme locally ─────────────────────────────
  function setTheme(name: ThemeName) {
    activeThemeName.value = name
    applyTheme()
  }

  // ─── Save theme PER-USER ──────────────────────────────
  async function saveTheme(name: ThemeName) {
    setTheme(name)
    try {
      await http.put('/auth/preferences', { theme_preference: name })
    } catch (e) {
      console.error('Failed to save theme:', e)
    }
  }

  async function saveEffectsEnabled(enabled: boolean) {
    effectsEnabled.value = enabled
    try {
      await http.put('/auth/preferences', { effects_enabled: enabled })
    } catch (e) {
      console.error('Failed to save effects setting:', e)
    }
  }

  // ─── Save branding (global, admin only) ───────────────
  async function saveBranding(patch: Partial<BrandingConfig>) {
    branding.value = { ...branding.value, ...patch }

    for (const [key, value] of Object.entries(patch)) {
      const settingKey = `branding.${key}`
      try {
        await http.put(`/settings/${await findSettingId(settingKey)}`, {
          value,
        })
      } catch (e) {
        console.error(`Failed to save ${settingKey}:`, e)
      }
    }
  }

  async function findSettingId(key: string): Promise<number> {
    const { data } = await http.get('/settings', { params: { search: key, limit: 5 } })
    const settings = data?.data ?? data ?? []
    const found = settings.find((s: any) => s.key === key)
    if (!found) throw new Error(`Setting ${key} not found`)
    return found.id
  }

  return {
    activeThemeName,
    activeTheme,
    availableThemes,
    effectsEnabled,
    branding,
    loadTheme,
    setTheme,
    saveTheme,
    saveEffectsEnabled,
    saveBranding,
    applyTheme,
  }
})