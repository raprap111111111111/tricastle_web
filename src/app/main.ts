import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { registerPinia } from './plugins/pinia'
import { registerPrimeVue } from './plugins/primevue'
import { registerToast } from './plugins/toast'
import { registerInterceptors } from '@shared/api/interceptors'
import { useAuthStore } from '@features/auth/stores/auth.store'
import http from '@shared/api/http'
import '@assets/css/main.css'

async function bootstrap() {
  const app = createApp(App)

  registerPinia(app)
  registerPrimeVue(app)
  registerToast(app)
  registerInterceptors(http)

  const authStore = useAuthStore()
  await authStore.initialize()

  app.use(router)
  app.mount('#app')
}

bootstrap()