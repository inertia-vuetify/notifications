# Inertia Vuetify Notifications

Display Inertia flash messages as Vuetify snackbar notifications with support for actions.

![Inertia Vuetify Notifications](./docs/screenshots/example1.png)
![Inertia Vuetify Notifications](./docs/screenshots/example2.png)


## Installation

```bash
npm install @inertia-vuetify/notifications
```

### Peer Dependencies

This package requires the following peer dependencies:

- `vue` ^3.5.0
- `vuetify` ^4.0.0
- `@inertiajs/vue3` ^3.0.0

The package is published as ESM only, like Vuetify 4 and Inertia 3.

## Setup

### 1. Register the Plugin

Register the plugin in `withApp`. This example uses the [`@inertiajs/vite` plugin](https://inertiajs.com/docs/v3/installation/client-side-setup), which resolves your pages; without it, pass a `resolve` callback to `createInertiaApp` as well.

```ts
// vite.config.ts
import inertia from '@inertiajs/vite'
import laravel from 'laravel-vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    laravel({ input: ['resources/js/app.ts'], refresh: true }),
    inertia(),
    vue(),
  ],
})
```

```ts
// resources/js/app.ts
import { createInertiaApp } from '@inertiajs/vue3'
import { createVuetify } from 'vuetify'
import { inertiaVuetifyNotifications } from '@inertia-vuetify/notifications'

createInertiaApp({
  withApp(app, { ssr }) {
    app.use(createVuetify({ ssr }))
    app.use(inertiaVuetifyNotifications({
      // Optional configuration
      flashKeys: ['success', 'error', 'warning', 'info', 'notification'],
      defaults: {
        timeout: 5000,
        closable: true,
        location: 'top',
        totalVisible: 1,
        displayStrategy: 'hold',
        gap: 8,
      },
      colorMap: {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info',
      },
    }))
  },
})
```

### 2. Add the NotificationProvider Component

Place the `NotificationProvider` component once in your root layout:

```vue
<!-- resources/js/layouts/AppLayout.vue -->
<script setup lang="ts">
import { NotificationProvider } from '@inertia-vuetify/notifications'
</script>

<template>
  <v-app>
    <NotificationProvider />
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>
```

Attributes on `NotificationProvider` are passed to Vuetify's `VSnackbarQueue`, so you can style every snackbar or override a default per layout:

```vue
<NotificationProvider variant="tonal" location="bottom end" />
```

### Server-Side Rendering

The plugin is safe to install in the SSR app; it only listens for flash data in the browser.

Vuetify components import CSS, which Node cannot load, so Vite must bundle Vuetify and this package into the SSR build:

```ts
// vite.config.ts
export default defineConfig({
  ssr: {
    noExternal: ['vuetify', '@inertia-vuetify/notifications'],
  },
})
```

## Usage

### Backend (Laravel)

#### Simple Notifications

Flash a simple string message using a key that maps to a color:

```php
// In your controller
Inertia::flash('success', 'Item saved successfully');
Inertia::flash('error', 'Something went wrong');
Inertia::flash('warning', 'Please review your input');
Inertia::flash('info', 'New features available');
```

Each flash value is queued once per delivery:

- Every server response that carries flash data queues its values, even when they repeat an earlier message or arrive from concurrent requests.
- Client-side `router.flash()` merges into the current flash data, so only keys whose value changed are queued; retained values are not replayed.
- Prefetching, deferred prop reloads, and cancelled visits do not replay the current flash data.
- Once a key leaves the flash data, for example through `router.flash(() => ({}))` or a response without it, its value can be shown again.

Values that are neither a string nor an object with a string `message` are skipped with a console warning.

For more information, see the [Inertia Flash Data documentation](https://inertiajs.com/docs/v3/data-props/flash-data).

#### Structured Notifications

For more control, pass an object with additional options:

```php
Inertia::flash('notification', [
    'message' => 'Item deleted',
    'type' => 'warning',        // Maps to snackbar color; unmapped values are used as a Vuetify color
    'timeout' => 8000,          // Custom timeout in ms
    'closable' => true,         // Show close button
]);
```

#### Notifications with Actions

Actions allow users to respond to notifications:

```php
Inertia::flash('notification', [
    'message' => 'Item moved to trash',
    'type' => 'info',
    'actions' => [
        // Named action - calls a registered handler
        [
            'label' => 'Undo',
            'name' => 'undo-delete',
            'payload' => ['id' => 123],
        ],
        // URL action - makes an Inertia visit (method defaults to 'get')
        [
            'label' => 'View Trash',
            'url' => '/trash',
        ],
    ],
]);
```

When an action button is clicked, the registered handler or URL action runs and the snackbar is dismissed, also when the handler throws.

### Frontend

#### Registering Action Handlers

Register handlers at plugin initialization for app-wide actions:

```ts
app.use(inertiaVuetifyNotifications({
  actions: {
    'undo-delete': (payload) => {
      router.post('/items/restore', payload)
    },
  },
}))
```

Or register a handler for the lifetime of a component. It is removed automatically when the component unmounts:

```vue
<script setup lang="ts">
import { useNotificationAction } from '@inertia-vuetify/notifications'
import { router } from '@inertiajs/vue3'

useNotificationAction('undo-delete', (payload) => {
  router.post('/items/restore', payload)
})
</script>
```

Outside components, `registerAction()` returns a function that removes the handler again.

#### Manual Notifications

Trigger client side notifications programmatically from any component:

```vue
<script setup lang="ts">
import { useNotifications } from '@inertia-vuetify/notifications'

const { notify } = useNotifications()

function showSuccess() {
  notify('Operation completed!', 'success')
}

function showStructured() {
  notify({
    message: 'Report generated',
    type: 'info',
    timeout: 3000,
    actions: [
      { label: 'Open', url: '/reports/latest' },
    ],
  })
}
</script>
```

#### Typing Flash Data

Inertia 3 types flash data through `InertiaConfig`. Reuse this package's types to describe the keys you flash:

```ts
// resources/js/types/globals.d.ts
import type { StructuredNotification } from '@inertia-vuetify/notifications'

declare module '@inertiajs/core' {
  export interface InertiaConfig {
    flashDataType: {
      success?: string
      error?: string
      warning?: string
      info?: string
      notification?: StructuredNotification
    }
  }
}
```

## Configuration

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `flashKeys` | `string[]` | `['success', 'error', 'warning', 'info', 'notification']` | Flash keys to listen for |
| `defaults.timeout` | `number` | `5000` | Default notification timeout in ms |
| `defaults.closable` | `boolean` | `true` | Show close button by default |
| `defaults.location` | `SnackbarLocation` | `'top'` | Snackbar position |
| `defaults.totalVisible` | `number \| string` | `1` | Number of visible snackbars |
| `defaults.displayStrategy` | `'hold' \| 'overflow'` | `'hold'` | How new snackbars behave when the visible queue is full |
| `defaults.gap` | `number \| string` | `8` | Gap between visible queued snackbars |
| `colorMap` | `Record<string, string>` | `{ success, error, warning, info }` | Map flash keys and notification types to Vuetify colors |
| `actions` | `Record<string, ActionHandler>` | `{}` | Initial action handlers |

The provider renders Vuetify 4 `VSnackbarQueue`. `defaults.location` accepts Vuetify 4 snackbar anchor values, including `top`, `bottom end`, `top center`, `left top`, and `center`. The close button uses Vuetify's `$close` icon alias, so it follows your configured icon set.

### Action Types

#### Named Actions

Calls a registered handler with an optional payload:

```ts
interface NamedAction {
  label: string
  name: string
  payload?: Record<string, unknown>
}
```

#### URL Actions

Makes an Inertia visit when clicked:

```ts
interface UrlAction {
  label: string
  url: string
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete' // defaults to 'get'
  data?: Record<string, JsonValue>
}
```

## API

### `inertiaVuetifyNotifications(options?)`

Creates the Vue plugin. Returns a `Plugin` instance.

### `useNotifications()`

Composable to access the notification context. Must be used within a component tree where the plugin is installed.

Returns:

| Property | Type | Description |
|----------|------|-------------|
| `queue` | `Ref<QueuedNotification[]>` | Reactive queue of notifications waiting to be shown |
| `notify` | `(notification, type?) => void` | Add a notification; `type` picks the color of plain string messages |
| `registerAction` | `(name, handler) => () => void` | Register an action handler; returns a function that removes it |
| `unregisterAction` | `(name) => void` | Remove an action handler |
| `executeAction` | `(action) => Promise<void>` | Execute an action, for custom renderers |
| `options` | `ResolvedNotificationOptions` | Plugin options merged with defaults |

### `useNotificationAction(name, handler)`

Registers an action handler until the current component or effect scope is disposed.

### `NotificationProvider`

Vue component that renders the `VSnackbarQueue`. Place once in your app layout.

### Custom Renderers

Queue items are Vuetify snackbar props (`text`, `color`, `timeout`). Their closable flag and actions are stored under the exported `NOTIFICATION_META` symbol key, which keeps them out of the rendered snackbar attributes.

## Upgrading from 2.x

- Upgrade to `@inertiajs/vue3` 3 and `inertiajs/inertia-laravel` 3.
- The CommonJS build was removed; the package is ESM only.
- `InternalSnackbarItem` was renamed to `QueuedNotification`. Its `closable` and `actions` moved to the `NOTIFICATION_META` symbol key. The unused `NotificationItem`, `SnackbarQueueItem`, and `ActionRegistry` types were removed.
- `UrlAction.data` accepts JSON values (`Record<string, JsonValue>`), matching what Inertia can send.
- `options` on the notification context is typed as `ResolvedNotificationOptions`, with all defaults present.
- Malformed flash values are skipped with a warning instead of showing an empty snackbar.
- Replace `registerAction` in `onMounted` plus `unregisterAction` in `onUnmounted` with `useNotificationAction()`.

## License

MIT
