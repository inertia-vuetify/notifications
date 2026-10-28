import { getCurrentScope, inject, onScopeDispose, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import {
  NOTIFICATION_INJECTION_KEY,
  NOTIFICATION_META,
  type ActionHandler,
  type HttpMethod,
  type NotificationAction,
  type NotificationContext,
  type NotificationPluginOptions,
  type QueuedNotification,
  type ResolvedNotificationOptions,
  type StructuredNotification,
  isNamedAction,
} from '../types'

const DEFAULT_OPTIONS: ResolvedNotificationOptions = {
  flashKeys: ['success', 'error', 'warning', 'info', 'notification'],
  defaults: {
    timeout: 5000,
    closable: true,
    location: 'top',
    totalVisible: 1,
    displayStrategy: 'hold',
    gap: 8,
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
  const options: ResolvedNotificationOptions = {
    flashKeys: userOptions.flashKeys ?? DEFAULT_OPTIONS.flashKeys,
    defaults: { ...DEFAULT_OPTIONS.defaults, ...userOptions.defaults },
    actions: { ...userOptions.actions },
    colorMap: { ...DEFAULT_OPTIONS.colorMap, ...userOptions.colorMap },
  }

  const queue = ref<QueuedNotification[]>([])
  // Each registration is its own object, so unregistering one cannot remove a newer
  // registration of the same handler under the same name
  const actionRegistry = new Map<string, { handler: ActionHandler }>(
    Object.entries(options.actions).map(([name, handler]) => [name, { handler }])
  )

  /**
   * Convert a message to a queued notification
   */
  function toQueuedNotification(
    notification: string | StructuredNotification,
    type?: string
  ): QueuedNotification {
    const structured = typeof notification === 'string' ? { message: notification } : notification

    // A structured type that is not mapped is used as a Vuetify color, e.g. 'teal'
    const color = structured.type
      ? options.colorMap[structured.type] ?? structured.type
      : type
        ? options.colorMap[type]
        : undefined

    return {
      text: structured.message,
      color,
      timeout: structured.timeout ?? options.defaults.timeout,
      [NOTIFICATION_META]: {
        closable: structured.closable ?? options.defaults.closable,
        actions: structured.actions ?? [],
      },
    }
  }

  function notify(notification: string | StructuredNotification, type?: string): void {
    queue.value.push(toQueuedNotification(notification, type))
  }

  function registerAction(name: string, handler: ActionHandler): () => void {
    const registration = { handler }
    actionRegistry.set(name, registration)

    return () => {
      if (actionRegistry.get(name) === registration) {
        actionRegistry.delete(name)
      }
    }
  }

  function unregisterAction(name: string): void {
    actionRegistry.delete(name)
  }

  async function executeAction(action: NotificationAction): Promise<void> {
    if (isNamedAction(action)) {
      const registration = actionRegistry.get(action.name)
      if (registration) {
        await registration.handler(action.payload)
      } else {
        console.warn(`[inertia-vuetify-notifications] No handler registered for action: ${action.name}`)
      }
      return
    }

    // Flash data is untyped JSON, so normalize methods such as 'POST'
    const method = (action.method ?? 'get').toLowerCase() as HttpMethod
    router.visit(action.url, { method, data: action.data })
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

/**
 * Register a named action handler for the lifetime of the current component or effect scope
 */
export function useNotificationAction(name: string, handler: ActionHandler): void {
  const unregister = useNotifications().registerAction(name, handler)

  if (getCurrentScope()) {
    onScopeDispose(unregister)
  }
}
