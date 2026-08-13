import type { App } from 'vue'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

// Prevent duplicate plugin registration in dev / HMR / accidental re-entry
let installed = false

export function registerToast(app: App) {
  if (installed) return

  app.use(ToastService)
  app.use(ConfirmationService)

  installed = true
}