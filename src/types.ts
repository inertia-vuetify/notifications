import type { InjectionKey, Ref } from 'vue'

/**
 * HTTP methods supported for URL-based actions
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

/**
 * Vuetify snackbar location anchor values
 */
export type SnackbarLocation =
    | 'top'
    | 'bottom'
    | 'start'
    | 'end'
    | 'left'
    | 'right'
    | 'center'
    | 'center center'
    | 'top start'
    | 'top end'
    | 'top left'
    | 'top right'
    | 'top center'
    | 'bottom start'
    | 'bottom end'
    | 'bottom left'
    | 'bottom right'
    | 'bottom center'
    | 'start top'
    | 'start bottom'
    | 'start center'
    | 'end top'
    | 'end bottom'
    | 'end center'
    | 'left top'
    | 'left bottom'
    | 'left center'
    | 'right top'
    | 'right bottom'
    | 'right center'

/**
 * Vuetify snackbar queue overflow strategy
 */
export type SnackbarDisplayStrategy = 'hold' | 'overflow'

/**
 * Built-in notification types. Any other string is used as a Vuetify color.
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

/**
 * JSON-serializable value, as delivered in Inertia flash data
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

/**
 * Named action - calls a registered handler with payload
 */
export interface NamedAction {
    label: string
    name: string
    payload?: Record<string, unknown>
}

/**
 * URL-based action - makes an Inertia visit
 */
export interface UrlAction {
    label: string
    url: string
    /**
     * Defaults to 'get'
     */
    method?: HttpMethod
    data?: Record<string, JsonValue>
}

/**
 * Union type for all action types
 */
export type NotificationAction = NamedAction | UrlAction

/**
 * Type guard for named actions
 */
export function isNamedAction(action: NotificationAction): action is NamedAction {
    return 'name' in action && typeof action.name === 'string'
}

/**
 * Type guard for URL actions
 */
export function isUrlAction(action: NotificationAction): action is UrlAction {
    return 'url' in action && typeof action.url === 'string'
}

/**
 * Structured notification from backend or `notify()`
 */
export interface StructuredNotification {
    message: string
    type?: NotificationType | (string & {})
    timeout?: number
    closable?: boolean
    actions?: NotificationAction[]
}

/**
 * Symbol key for notification data that must not reach VSnackbar as props or attributes.
 * VSnackbarQueue copies symbol keys into each item, but Vue's mergeProps skips them.
 */
export const NOTIFICATION_META: unique symbol = Symbol('inertia-vuetify-notifications:meta')

/**
 * Per-notification behaviour rendered by NotificationProvider
 */
export interface NotificationMeta {
    closable: boolean
    actions: NotificationAction[]
}

/**
 * Normalized notification waiting in the queue. Its string keys are VSnackbar props.
 */
export interface QueuedNotification {
    text: string
    color?: string
    timeout?: number
    [NOTIFICATION_META]?: NotificationMeta
}

/**
 * Action handler function signature
 */
export type ActionHandler = (payload?: Record<string, unknown>) => void | Promise<void>

/**
 * Plugin options
 */
export interface NotificationPluginOptions {
    /**
     * Flash keys to listen for (defaults to ['success', 'error', 'warning', 'info', 'notification'])
     */
    flashKeys?: string[]

    /**
     * Default notification settings
     */
    defaults?: Partial<NotificationDefaults>

    /**
     * Initial action handlers to register
     */
    actions?: Record<string, ActionHandler>

    /**
     * Map flash keys and notification types to Vuetify colors
     */
    colorMap?: Record<string, string>
}

/**
 * Default notification and queue settings
 */
export interface NotificationDefaults {
    timeout: number
    closable: boolean
    location: SnackbarLocation
    totalVisible: number | string
    displayStrategy: SnackbarDisplayStrategy
    gap: number | string
}

/**
 * Plugin options merged with defaults
 */
export interface ResolvedNotificationOptions {
    flashKeys: string[]
    defaults: NotificationDefaults
    actions: Record<string, ActionHandler>
    colorMap: Record<string, string>
}

/**
 * Notification context provided via inject
 */
export interface NotificationContext {
    /**
     * Reactive queue of notifications waiting to be shown
     */
    queue: Ref<QueuedNotification[]>

    /**
     * Add a notification to the queue. `type` picks the color for plain string messages.
     */
    notify: (notification: string | StructuredNotification, type?: string) => void

    /**
     * Register a named action handler. Returns a function that unregisters it.
     */
    registerAction: (name: string, handler: ActionHandler) => () => void

    /**
     * Unregister a named action handler
     */
    unregisterAction: (name: string) => void

    /**
     * Execute an action (used by NotificationProvider and custom renderers)
     */
    executeAction: (action: NotificationAction) => Promise<void>

    /**
     * Plugin options merged with defaults
     */
    options: ResolvedNotificationOptions
}

/**
 * Injection key for the notification context
 */
export const NOTIFICATION_INJECTION_KEY = Symbol('inertia-vuetify-notifications') as InjectionKey<NotificationContext>
