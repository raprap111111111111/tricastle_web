// src/shared/pubnub/usePubNub.ts

import { onBeforeUnmount, onMounted } from 'vue'
import { getPubNub } from './pubnub.client'

export interface PubNubMessage {
  event: string
  payload: Record<string, any>
  timestamp: string
}

type MessageHandler = (message: PubNubMessage) => void

// ─── PubNub event types (defined inline) ─────────────
interface MessageEvent {
  channel: string
  message: any
  timetoken: string
  publisher?: string
}

interface StatusEvent {
  category: string
  operation?: string
  affectedChannels?: string[]
  subscribedChannels?: string[]
}

interface PubNubListener {
  message?: (event: MessageEvent) => void
  status?: (event: StatusEvent) => void
  presence?: (event: any) => void
}

export function usePubNub(
  channels: string[],
  onMessage: MessageHandler,
) {
  const pubnub = getPubNub()

  const listener: PubNubListener = {
    message: (event: MessageEvent) => {
      const msg = event.message as PubNubMessage
      onMessage(msg)
    },
    status: (event: StatusEvent) => {
      if (event.category === 'PNConnectedCategory') {
        console.log('📡 PubNub connected to:', channels)
      }
    },
  }

  onMounted(() => {
    pubnub.addListener(listener)
    pubnub.subscribe({ channels })
  })

  onBeforeUnmount(() => {
    pubnub.unsubscribe({ channels })
    pubnub.removeListener(listener)
  })
}