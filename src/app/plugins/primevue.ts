import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

// ─── Services ────────────────────────────────────────────
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

// ─── Directives ──────────────────────────────────────────
import Tooltip from 'primevue/tooltip'
import Ripple from 'primevue/ripple'
import FocusTrap from 'primevue/focustrap'
import StyleClass from 'primevue/styleclass'

import 'primeicons/primeicons.css'

const TricastlePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f3f5f7',
      100: '#e2e7ec',
      200: '#c6d0d9',
      300: '#a1b0bf',
      400: '#8291a3',
      500: '#6B7A8F',
      600: '#556377',
      700: '#455060',
      800: '#3a4351',
      900: '#333a45',
      950: '#1f242c',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#6B7A8F',
          contrastColor: '#ffffff',
          hoverColor: '#556377',
          activeColor: '#455060',
        },
        highlight: {
          background: '#F7882F',
          focusBackground: '#e5731a',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
    },
  },
})

export function registerPrimeVue(app: App) {
  // ─── Core ─────────────────────────────────────────────
  app.use(PrimeVue, {
    theme: {
      preset: TricastlePreset,
      options: {
        prefix: 'p',
        darkModeSelector: '.dark',
        cssLayer: false,
      },
    },
    ripple: true,
  })

  // ─── Services ─────────────────────────────────────────
  app.use(ToastService)
  app.use(ConfirmationService)

  // ─── Directives ───────────────────────────────────────
  app.directive('tooltip', Tooltip)
  app.directive('ripple', Ripple)
  app.directive('focustrap', FocusTrap)
  app.directive('styleclass', StyleClass)
}