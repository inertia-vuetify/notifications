import type { App, Plugin } from 'vue'
import { router } from '@inertiajs/vue3'
import { createNotificationContext } from './composables/useNotifications'
import { NOTIFICATION_INJECTION_KEY, type NotificationPluginOptions } from './types'

/**
 * Create the Inertia Vuetify Notifications plugin
 */
export function inertiaVuetifyNotifications(options: NotificationPluginOptions = {}): Plugin {
  return {
    install(app: App) {
      const context = createNotificationContext(options)

      // Provide context for useNotifications composable
      app.provide(NOTIFICATION_INJECTION_KEY, context)

      // Compare each key because router.flash() retains other flash values.
      let previousFlash = new Map<string, string | undefined>()

      router.on('before', () => {
        previousFlash.clear()
      })

      // Listen to flash events for both server-side flash and client-side router.flash()
      // The flash event (v2.3.3+) fires for all flash data
      router.on('flash', (event) => {
        const flash = event.detail.flash
        if (!flash || typeof flash !== 'object') return

        const currentFlash = new Map<string, string | undefined>()
        for (const key of context.options.flashKeys) {
          const value = flash[key]
          if (value === undefined || value === null) continue

          const snapshot = JSON.stringify(value)
          currentFlash.set(key, snapshot)
          if (!previousFlash.has(key) || previousFlash.get(key) !== snapshot) {
            context.notify(value as Parameters<typeof context.notify>[0], key)
          }
        }
        previousFlash = currentFlash
      })
    },
  }
}


