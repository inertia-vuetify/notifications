// Plugin
export { inertiaVuetifyNotifications } from './plugin'

// Composable
export { useNotifications } from './composables/useNotifications'

// Component
export { default as NotificationProvider } from './components/NotificationProvider.vue'

// Types
export {
  type HttpMethod,
  type SnackbarLocation,
  type SnackbarDisplayStrategy,
  type NamedAction,
  type UrlAction,
  type NotificationAction,
  type StructuredNotification,
  type NotificationItem,
  type InternalSnackbarItem,
  type SnackbarQueueItem,
  type ActionHandler,
  type ActionRegistry,
  type NotificationPluginOptions,
  type NotificationContext,
  isNamedAction,
  isUrlAction,
} from './types'
