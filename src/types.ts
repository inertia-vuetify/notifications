import type { InjectionKey, Ref } from 'vue'

/**
 * HTTP methods supported for URL-based actions
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

/**
 * Named action - calls a registered handler with payload
 */
export interface NamedAction {
    label: string
    name: string
    payload?: Record<string, unknown>
}

/**
 * URL-based action - makes an Inertia request
 */
export interface UrlAction {
    label: string
    method: HttpMethod
    url: string
    data?: Record<string, unknown>
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
    return 'url' in action && 'method' in action
}

/**
 * Structured notification from backend
 */
export interface StructuredNotification {
    message: string
    type?: 'success' | 'error' | 'warning' | 'info' | string
    timeout?: number
    closable?: boolean
    actions?: NotificationAction[]
}

/**
 * Internal notification item used by the queue
 */
export interface NotificationItem {
    text: string
    color?: string
    timeout?: number
    closable?: boolean
    actions?: NotificationAction[]
}

/**
 * Internal snackbar item with our custom properties
 */
export interface InternalSnackbarItem {
    text: string
    color?: string
    timeout?: number
    closable?: boolean
    actions?: NotificationAction[]
}

/**
 * Snackbar queue item - simplified to avoid complex Vuetify type inference
 */
export type SnackbarQueueItem = string | InternalSnackbarItem

/**
 * Action handler function signature
 */
export type ActionHandler = (payload?: Record<string, unknown>) => void | Promise<void>

/**
 * Registry of named action handlers
 */
export type ActionRegistry = Map<string, ActionHandler>

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
    defaults?: {
        timeout?: number
        closable?: boolean
        location?: 'top' | 'bottom' | 'top start' | 'top end' | 'bottom start' | 'bottom end'
    }

    /**
     * Initial action handlers to register
     */
    actions?: Record<string, ActionHandler>

    /**
     * Map flash keys to notification colors
     */
    colorMap?: Record<string, string>
}

/**
 * Notification context provided via inject
 */
export interface NotificationContext {
    /**
     * Reactive queue of notifications
     */
    queue: Ref<InternalSnackbarItem[]>

    /**
     * Add a notification to the queue
     */
    notify: (notification: string | StructuredNotification, flashKey?: string) => void

    /**
     * Register a named action handler
     */
    registerAction: (name: string, handler: ActionHandler) => void

    /**
     * Unregister a named action handler
     */
    unregisterAction: (name: string) => void

    /**
     * Execute an action (internal use)
     */
    executeAction: (action: NotificationAction) => Promise<void>

    /**
     * Plugin options
     */
    options: Required<NotificationPluginOptions>
}

/**
 * Injection key for the notification context
 */
export const NOTIFICATION_INJECTION_KEY = Symbol('inertia-vuetify-notifications') as InjectionKey<NotificationContext>

