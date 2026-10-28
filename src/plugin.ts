import { watch, type App, type Plugin } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import { createNotificationContext } from './composables/useNotifications'
import {
  NOTIFICATION_INJECTION_KEY,
  type NotificationContext,
  type NotificationPluginOptions,
  type StructuredNotification,
} from './types'

/**
 * Create the Inertia Vuetify Notifications plugin
 */
export function inertiaVuetifyNotifications(options: NotificationPluginOptions = {}): Plugin {
  return {
    install(app: App) {
      const context = createNotificationContext(options)

      // Provide context for useNotifications composable
      app.provide(NOTIFICATION_INJECTION_KEY, context)

      // Flash events only fire in the browser; on the server the page state is shared between requests
      if (typeof window !== 'undefined') {
        app.onUnmount(subscribeToFlash(context))
      }
    },
  }
}

/**
 * Queue each flash value once per delivery.
 *
 * A response or visit replaces the page props together with the flash, so every value it
 * carries is new, even when it repeats an earlier message. router.flash() only replaces the
 * flash and re-sends retained keys, so only values that changed are new.
 */
function subscribeToFlash(context: NotificationContext): () => void {
  const { flashKeys } = context.options
  const page = usePage()

  // JSON snapshot per flash key of the values in the current page flash that were already handled
  let handled = new Map<string, string>()
  // Whether the latest page change replaced the props, as responses and visits do
  let pageReplaced = false

  // Synchronous, because Inertia fires the flash event right after changing the page
  const stopWatching = watch(
    [() => page.props, () => page.flash],
    ([props, flash], [previousProps]) => {
      pageReplaced = props !== previousProps

      // Forget values that left the page flash, e.g. after router.flash(() => ({})), which fires no event
      const current = snapshotFlash(flash, flashKeys)
      handled = new Map(Array.from(handled).filter(([key, json]) => current.get(key)?.json === json))
    },
    { flush: 'sync' },
  )

  const stopListening = router.on('flash', (event) => {
    const current = snapshotFlash(event.detail.flash, flashKeys)

    for (const [key, { value, json }] of current) {
      if (!pageReplaced && handled.get(key) === json) continue

      if (isNotificationValue(value)) {
        context.notify(value, key)
      } else {
        console.warn(
          `[inertia-vuetify-notifications] Ignoring flash "${key}": expected a string or an object with a string "message".`
        )
      }
    }

    handled = new Map(Array.from(current, ([key, { json }]) => [key, json]))
    pageReplaced = false
  })

  return () => {
    stopWatching()
    stopListening()
  }
}

interface FlashEntry {
  value: unknown
  json: string
}

function snapshotFlash(flash: unknown, flashKeys: string[]): Map<string, FlashEntry> {
  const entries = new Map<string, FlashEntry>()
  if (!flash || typeof flash !== 'object') return entries

  for (const key of flashKeys) {
    const value: unknown = (flash as Record<string, unknown>)[key]
    if (value === undefined || value === null || value === '') continue

    entries.set(key, { value, json: JSON.stringify(value) })
  }

  return entries
}

function isNotificationValue(value: unknown): value is string | StructuredNotification {
  if (typeof value === 'string') return true

  return typeof value === 'object'
    && value !== null
    && typeof (value as { message?: unknown }).message === 'string'
}
