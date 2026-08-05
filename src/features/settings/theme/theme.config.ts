export type ThemeName = 'default' | 'dark' | 'christmas' | 'halloween' | 'valentines'

export interface ThemeDefinition {
  name: ThemeName
  label: string
  icon: string
  description: string
  effect: 'none' | 'snow' | 'spiders' | 'hearts'

  colors: {
    bg: string
    bgSurface: string
    bgAccent: string
    text: string
    textMuted: string
    primary: string
    primaryHover: string
    accent: string
    sidebar: string
    sidebarBorder: string
    success: string
    warning: string
    danger: string
  }

  fonts: {
    heading: string
    body: string
  }
}

export const THEMES: Record<ThemeName, ThemeDefinition> = {
  default: {
    name: 'default',
    label: 'Default',
    icon: 'pi pi-sun',
    description: 'Clean and professional',
    effect: 'none',
    colors: {
      bg:            '#FDFAF5',
      bgSurface:     '#FFFFFF',
      bgAccent:      '#FEF6EC',
      text:          '#1F2937',
      textMuted:     '#6B7280',
      primary:       '#F7882F',
      primaryHover:  '#E5731A',
      accent:        '#F59E0B',
      sidebar:       '#FFFFFF',
      sidebarBorder: '#E5E7EB',
      success:       '#10B981',
      warning:       '#F59E0B',
      danger:        '#EF4444',
    },
    fonts: {
      heading: '"Playfair Display", serif',
      body: '"Inter", sans-serif',
    },
  },

  // ─── 🌙 DARK MODE ─────────────────────────────
  dark: {
    name: 'dark',
    label: 'Dark Mode',
    icon: 'pi pi-moon',
    description: 'Easy on the eyes 🌙',
    effect: 'none',
    colors: {
      bg:            '#0F172A',           // slate-900
      bgSurface:     '#1E293B',           // slate-800
      bgAccent:      '#334155',           // slate-700
      text:          '#F1F5F9',           // slate-100
      textMuted:     '#94A3B8',           // slate-400
      primary:       '#F97316',           // orange-500 (keep brand)
      primaryHover:  '#EA580C',
      accent:        '#38BDF8',           // sky-400
      sidebar:       '#1E293B',
      sidebarBorder: '#334155',
      success:       '#22C55E',
      warning:       '#EAB308',
      danger:        '#EF4444',
    },
    fonts: {
      heading: '"Playfair Display", serif',
      body: '"Inter", sans-serif',
    },
  },

  christmas: {
    name: 'christmas',
    label: 'Christmas',
    icon: 'pi pi-star',
    description: 'Festive red & green with falling snow ❄️',
    effect: 'snow',
    colors: {
      bg:            '#FFF5F5',
      bgSurface:     '#FFFFFF',
      bgAccent:      '#FEE2E2',
      text:          '#1F2937',
      textMuted:     '#6B7280',
      primary:       '#DC2626',
      primaryHover:  '#B91C1C',
      accent:        '#059669',
      sidebar:       '#FFFFFF',
      sidebarBorder: '#FECACA',
      success:       '#059669',
      warning:       '#F59E0B',
      danger:        '#991B1B',
    },
    fonts: {
      heading: '"Playfair Display", serif',
      body: '"Inter", sans-serif',
    },
  },

  halloween: {
    name: 'halloween',
    label: 'Halloween',
    icon: 'pi pi-moon',
    description: 'Spooky black & orange with spiders 🕷️',
    effect: 'spiders',
    colors: {
      bg:            '#0F0F0F',
      bgSurface:     '#1A1A1A',
      bgAccent:      '#2A1810',
      text:          '#F5F5F5',
      textMuted:     '#9CA3AF',
      primary:       '#F97316',
      primaryHover:  '#EA580C',
      accent:        '#A855F7',
      sidebar:       '#1A1A1A',
      sidebarBorder: '#3F1E10',
      success:       '#22C55E',
      warning:       '#F97316',
      danger:        '#DC2626',
    },
    fonts: {
      heading: '"Creepster", "Playfair Display", serif',
      body: '"Inter", sans-serif',
    },
  },

  valentines: {
    name: 'valentines',
    label: "Valentine's",
    icon: 'pi pi-heart-fill',
    description: 'Romantic pink & rose with floating hearts 💕',
    effect: 'hearts',
    colors: {
      bg:            '#1F0A15',
      bgSurface:     '#2D1220',
      bgAccent:      '#3D1A2C',
      text:          '#FFF0F5',
      textMuted:     '#D8A5B8',
      primary:       '#EC4899',
      primaryHover:  '#DB2777',
      accent:        '#F43F5E',
      sidebar:       '#2D1220',
      sidebarBorder: '#4C1D3B',
      success:       '#22C55E',
      warning:       '#F59E0B',
      danger:        '#EF4444',
    },
    fonts: {
      heading: '"Great Vibes", "Playfair Display", cursive',
      body: '"Inter", sans-serif',
    },
  },
}

export function getTheme(name: string): ThemeDefinition {
  return THEMES[name as ThemeName] ?? THEMES.default
}