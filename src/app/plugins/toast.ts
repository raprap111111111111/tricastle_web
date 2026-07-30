import type { App } from 'vue'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

export function registerToast(app: App) {
  app.use(ToastService)
  app.use(ConfirmationService)
}