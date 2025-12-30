import { inject, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import {
  NOTIFICATION_INJECTION_KEY,
  type NotificationContext,
  type StructuredNotification,
  type InternalSnackbarItem,
  type ActionHandler,
  type ActionRegistry,
  type NotificationPluginOptions,
  type NotificationAction,
  isNamedAction,
  isUrlAction,
} from '../types'

const DEFAULT_OPTIONS: Required<NotificationPluginOptions> = {
  flashKeys: ['success', 'error', 'warning', 'info', 'notification'],
  defaults: {
    timeout: 5000,
    closable: true,
    location: 'top middle',
  },
  actions: {},
  colorMap: {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  },
}

/**
 * Create notification context (internal use by plugin)
 */
export function createNotificationContext(
  userOptions: NotificationPluginOptions = {}
): NotificationContext {
  const options: Required<NotificationPluginOptions> = {
    ...DEFAULT_OPTIONS,
    ...userOptions,
    defaults: { ...DEFAULT_OPTIONS.defaults, ...userOptions.defaults },
    colorMap: { ...DEFAULT_OPTIONS.colorMap, ...userOptions.colorMap },
    actions: { ...userOptions.actions },
  }

  const queue = ref<InternalSnackbarItem[]>([])
  const actionRegistry: ActionRegistry = new Map()

  // Register initial actions from options
  for (const [name, handler] of Object.entries(options.actions)) {
    actionRegistry.set(name, handler)
  }

  /**
   * Convert a flash value to a notification item
   */
  function parseNotification(
    value: string | StructuredNotification,
    flashKey?: string
  ): InternalSnackbarItem {
    // Simple string notification
    if (typeof value === 'string') {
      return {
        text: value,
        color: flashKey ? options.colorMap[flashKey] : undefined,
        timeout: options.defaults.timeout,
        closable: options.defaults.closable,
      }
    }

    // Structured notification
    const color = value.type
      ? options.colorMap[value.type] || value.type
      : flashKey
        ? options.colorMap[flashKey]
        : undefined

    return {
      text: value.message,
      color,
      timeout: value.timeout ?? options.defaults.timeout,
      closable: value.closable ?? options.defaults.closable,
      actions: value.actions,
    }
  }

  /**
   * Add notification to queue
   */
  function notify(notification: string | StructuredNotification, flashKey?: string): void {
    const item = parseNotification(notification, flashKey)
    queue.value.push(item)
  }

  /**
   * Register a named action handler
   */
  function registerAction(name: string, handler: ActionHandler): void {
    actionRegistry.set(name, handler)
  }

  /**
   * Unregister a named action handler
   */
  function unregisterAction(name: string): void {
    actionRegistry.delete(name)
  }

  /**
   * Execute an action
   */
  async function executeAction(action: NotificationAction): Promise<void> {
    if (isNamedAction(action)) {
      const handler = actionRegistry.get(action.name)
      if (handler) {
        await handler(action.payload)
      } else {
        console.warn(`[inertia-vuetify-notifications] No handler registered for action: ${action.name}`)
      }
    } else if (isUrlAction(action)) {
      // Use Inertia router for URL-based actions
      const method = action.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.visit(action.url, {
        method,
        data: action.data as any,
      })
    }
  }

  return {
    queue,
    notify,
    registerAction,
    unregisterAction,
    executeAction,
    options,
  }
}

/**
 * Composable to access notification context
 */
export function useNotifications(): NotificationContext {
  const context = inject(NOTIFICATION_INJECTION_KEY)

  if (!context) {
    throw new Error(
      '[inertia-vuetify-notifications] useNotifications() must be used within a component tree that has the notification plugin installed. Did you forget to call app.use(inertiaVuetifyNotifications())?'
    )
  }

  return context
}

