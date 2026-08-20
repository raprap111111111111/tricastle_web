import { useToast } from 'primevue/usetoast'
import { usePubNub } from './usePubNub'
import { PubNubChannels } from './channels'

interface Options {
  onReload?: () => void | Promise<void>
  silent?: boolean   // don't show toasts
}

export function useActivityLogRealtime(options: Options = {}) {
  const toast = useToast()
  const { onReload, silent = false } = options

  usePubNub([PubNubChannels.ACTIVITY_LOGS], (msg) => {
    if (msg.event === 'activity_log.created') {
      if (!silent) {
        toast.add({
          severity: 'info',
          summary: '📝 New Activity',
          detail: msg.payload.description ?? 'A new action was logged',
          life: 3000,
        })
      }
      onReload?.()
    }
  })
}