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

      // Listen for Inertia flash events (v2.3.3+)
      router.on('flash', (event) => {
        const flash = event.detail.flash as Record<string, unknown>

        if (!flash || typeof flash !== 'object') return

        for (const key of context.options.flashKeys) {
          const value = flash[key]
          if (value !== undefined && value !== null) {
            context.notify(value as string | Parameters<typeof context.notify>[0], key)
          }
        }
      })
    },
  }
}


