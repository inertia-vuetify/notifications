import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { DefineComponent } from 'vue';
import { Plugin as Plugin_2 } from 'vue';
import { PublicProps } from 'vue';
import { Ref } from 'vue';

declare const __VLS_export: DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

/**
 * Action handler function signature
 */
export declare type ActionHandler = (payload?: Record<string, unknown>) => void | Promise<void>;

/**
 * HTTP methods supported for URL-based actions
 */
export declare type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Create the Inertia Vuetify Notifications plugin
 */
export declare function inertiaVuetifyNotifications(options?: NotificationPluginOptions): Plugin_2;

/**
 * Type guard for named actions
 */
export declare function isNamedAction(action: NotificationAction): action is NamedAction;

/**
 * Type guard for URL actions
 */
export declare function isUrlAction(action: NotificationAction): action is UrlAction;

/**
 * JSON-serializable value, as delivered in Inertia flash data
 */
export declare type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};

/**
 * Named action - calls a registered handler with payload
 */
export declare interface NamedAction {
    label: string;
    name: string;
    payload?: Record<string, unknown>;
}

/**
 * Symbol key for notification data that must not reach VSnackbar as props or attributes.
 * VSnackbarQueue copies symbol keys into each item, but Vue's mergeProps skips them.
 */
export declare const NOTIFICATION_META: unique symbol;

/**
 * Union type for all action types
 */
export declare type NotificationAction = NamedAction | UrlAction;

/**
 * Notification context provided via inject
 */
export declare interface NotificationContext {
    /**
     * Reactive queue of notifications waiting to be shown
     */
    queue: Ref<QueuedNotification[]>;
    /**
     * Add a notification to the queue. `type` picks the color for plain string messages.
     */
    notify: (notification: string | StructuredNotification, type?: string) => void;
    /**
     * Register a named action handler. Returns a function that unregisters it.
     */
    registerAction: (name: string, handler: ActionHandler) => () => void;
    /**
     * Unregister a named action handler
     */
    unregisterAction: (name: string) => void;
    /**
     * Execute an action (used by NotificationProvider and custom renderers)
     */
    executeAction: (action: NotificationAction) => Promise<void>;
    /**
     * Plugin options merged with defaults
     */
    options: ResolvedNotificationOptions;
}

/**
 * Default notification and queue settings
 */
export declare interface NotificationDefaults {
    timeout: number;
    closable: boolean;
    location: SnackbarLocation;
    totalVisible: number | string;
    displayStrategy: SnackbarDisplayStrategy;
    gap: number | string;
}

/**
 * Per-notification behaviour rendered by NotificationProvider
 */
export declare interface NotificationMeta {
    closable: boolean;
    actions: NotificationAction[];
}

/**
 * Plugin options
 */
export declare interface NotificationPluginOptions {
    /**
     * Flash keys to listen for (defaults to ['success', 'error', 'warning', 'info', 'notification'])
     */
    flashKeys?: string[];
    /**
     * Default notification settings
     */
    defaults?: Partial<NotificationDefaults>;
    /**
     * Initial action handlers to register
     */
    actions?: Record<string, ActionHandler>;
    /**
     * Map flash keys and notification types to Vuetify colors
     */
    colorMap?: Record<string, string>;
}

export declare const NotificationProvider: typeof __VLS_export;

/**
 * Built-in notification types. Any other string is used as a Vuetify color.
 */
export declare type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Normalized notification waiting in the queue. Its string keys are VSnackbar props.
 */
export declare interface QueuedNotification {
    text: string;
    color?: string;
    timeout?: number;
    [NOTIFICATION_META]?: NotificationMeta;
}

/**
 * Plugin options merged with defaults
 */
export declare interface ResolvedNotificationOptions {
    flashKeys: string[];
    defaults: NotificationDefaults;
    actions: Record<string, ActionHandler>;
    colorMap: Record<string, string>;
}

/**
 * Vuetify snackbar queue overflow strategy
 */
export declare type SnackbarDisplayStrategy = 'hold' | 'overflow';

/**
 * Vuetify snackbar location anchor values
 */
export declare type SnackbarLocation = 'top' | 'bottom' | 'start' | 'end' | 'left' | 'right' | 'center' | 'center center' | 'top start' | 'top end' | 'top left' | 'top right' | 'top center' | 'bottom start' | 'bottom end' | 'bottom left' | 'bottom right' | 'bottom center' | 'start top' | 'start bottom' | 'start center' | 'end top' | 'end bottom' | 'end center' | 'left top' | 'left bottom' | 'left center' | 'right top' | 'right bottom' | 'right center';

/**
 * Structured notification from backend or `notify()`
 */
export declare interface StructuredNotification {
    message: string;
    type?: NotificationType | (string & {});
    timeout?: number;
    closable?: boolean;
    actions?: NotificationAction[];
}

/**
 * URL-based action - makes an Inertia visit
 */
export declare interface UrlAction {
    label: string;
    url: string;
    /**
     * Defaults to 'get'
     */
    method?: HttpMethod;
    data?: Record<string, JsonValue>;
}

/**
 * Register a named action handler for the lifetime of the current component or effect scope
 */
export declare function useNotificationAction(name: string, handler: ActionHandler): void;

/**
 * Composable to access notification context
 */
export declare function useNotifications(): NotificationContext;

export { }
