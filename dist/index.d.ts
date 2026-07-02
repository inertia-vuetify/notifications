import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { DefineComponent } from 'vue';
import { Plugin as Plugin_2 } from 'vue';
import { PublicProps } from 'vue';
import { Ref } from 'vue';

/**
 * Action handler function signature
 */
export declare type ActionHandler = (payload?: Record<string, unknown>) => void | Promise<void>;

/**
 * Registry of named action handlers
 */
export declare type ActionRegistry = Map<string, ActionHandler>;

/**
 * HTTP methods supported for URL-based actions
 */
export declare type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Create the Inertia Vuetify Notifications plugin
 */
export declare function inertiaVuetifyNotifications(options?: NotificationPluginOptions): Plugin_2;

/**
 * Internal snackbar item with our custom properties
 */
export declare interface InternalSnackbarItem {
    text: string;
    color?: string;
    timeout?: number;
    closable?: boolean;
    actions?: NotificationAction[];
}

/**
 * Type guard for named actions
 */
export declare function isNamedAction(action: NotificationAction): action is NamedAction;

/**
 * Type guard for URL actions
 */
export declare function isUrlAction(action: NotificationAction): action is UrlAction;

/**
 * Named action - calls a registered handler with payload
 */
export declare interface NamedAction {
    label: string;
    name: string;
    payload?: Record<string, unknown>;
}

/**
 * Union type for all action types
 */
export declare type NotificationAction = NamedAction | UrlAction;

/**
 * Notification context provided via inject
 */
export declare interface NotificationContext {
    /**
     * Reactive queue of notifications
     */
    queue: Ref<InternalSnackbarItem[]>;
    /**
     * Add a notification to the queue
     */
    notify: (notification: string | StructuredNotification, flashKey?: string) => void;
    /**
     * Register a named action handler
     */
    registerAction: (name: string, handler: ActionHandler) => void;
    /**
     * Unregister a named action handler
     */
    unregisterAction: (name: string) => void;
    /**
     * Execute an action (internal use)
     */
    executeAction: (action: NotificationAction) => Promise<void>;
    /**
     * Plugin options
     */
    options: Required<NotificationPluginOptions>;
}

/**
 * Internal notification item used by the queue
 */
export declare interface NotificationItem {
    text: string;
    color?: string;
    timeout?: number;
    closable?: boolean;
    actions?: NotificationAction[];
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
    defaults?: {
        timeout?: number;
        closable?: boolean;
        location?: SnackbarLocation;
        totalVisible?: number | string;
        displayStrategy?: SnackbarDisplayStrategy;
        gap?: number | string;
    };
    /**
     * Initial action handlers to register
     */
    actions?: Record<string, ActionHandler>;
    /**
     * Map flash keys to notification colors
     */
    colorMap?: Record<string, string>;
}

export declare const NotificationProvider: DefineComponent<    {}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

/**
 * Vuetify snackbar queue overflow strategy
 */
export declare type SnackbarDisplayStrategy = 'hold' | 'overflow';

/**
 * Vuetify snackbar location anchor values
 */
export declare type SnackbarLocation = 'top' | 'bottom' | 'start' | 'end' | 'left' | 'right' | 'center' | 'center center' | 'top start' | 'top end' | 'top left' | 'top right' | 'top center' | 'bottom start' | 'bottom end' | 'bottom left' | 'bottom right' | 'bottom center' | 'start top' | 'start bottom' | 'start center' | 'end top' | 'end bottom' | 'end center' | 'left top' | 'left bottom' | 'left center' | 'right top' | 'right bottom' | 'right center';

/**
 * Snackbar queue item - simplified to avoid complex Vuetify type inference
 */
export declare type SnackbarQueueItem = string | InternalSnackbarItem;

/**
 * Structured notification from backend
 */
export declare interface StructuredNotification {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info' | string;
    timeout?: number;
    closable?: boolean;
    actions?: NotificationAction[];
}

/**
 * URL-based action - makes an Inertia request
 */
export declare interface UrlAction {
    label: string;
    method: HttpMethod;
    url: string;
    data?: Record<string, unknown>;
}

/**
 * Composable to access notification context
 */
export declare function useNotifications(): NotificationContext;

export { }
