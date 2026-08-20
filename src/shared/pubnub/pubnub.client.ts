import PubNub from 'pubnub'
import { useAuthStore } from '@features/auth/stores/auth.store'

let pubnubInstance: PubNub | null = null

export function getPubNub(): PubNub {
  if (pubnubInstance) return pubnubInstance

  const authStore = useAuthStore()
  const userId = authStore.user?.id ?? 'anonymous'

  pubnubInstance = new PubNub({
    publishKey:   import.meta.env.VITE_PUBNUB_PUBLISH_KEY,
    subscribeKey: import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY,
    userId:       `tricastle-user-${userId}`,
    ssl:          true,
  })

  return pubnubInstance
}

export function destroyPubNub(): void {
  if (pubnubInstance) {
    pubnubInstance.unsubscribeAll()
    pubnubInstance = null
  }
}