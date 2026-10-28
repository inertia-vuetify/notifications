// Plugin
export { inertiaVuetifyNotifications } from './plugin'

// Composables
export { useNotifications, useNotificationAction } from './composables/useNotifications'

// Component
export { default as NotificationProvider } from './components/NotificationProvider.vue'

// Types
export {
  type HttpMethod,
  type SnackbarLocation,
  type SnackbarDisplayStrategy,
  type NotificationType,
  type JsonValue,
  type NamedAction,
  type UrlAction,
  type NotificationAction,
  type StructuredNotification,
  type NotificationMeta,
  type QueuedNotification,
  type ActionHandler,
  type NotificationDefaults,
  type NotificationPluginOptions,
  type ResolvedNotificationOptions,
  type NotificationContext,
  NOTIFICATION_META,
  isNamedAction,
  isUrlAction,
} from './types'
