# Inertia Vuetify Notifications

Display Inertia flash messages as Vuetify snackbar notifications with support for actions.

## Installation

```bash
npm install @gigerit/inertia-vuetify-notifications
```

### Peer Dependencies

This package requires the following peer dependencies:

- `vue` ^3.4.0
- `vuetify` ^3.7.0
- `@inertiajs/vue3` ^2.0.0 (with flash event support, v2.3.3+)

## Setup

### 1. Register the Plugin

```ts
// main.ts
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { inertiaVuetifyNotifications } from 'inertia-vuetify-notifications'
import App from './App.vue'

const app = createApp(App)
const vuetify = createVuetify()

app.use(vuetify)
app.use(inertiaVuetifyNotifications({
  // Optional configuration
  flashKeys: ['success', 'error', 'warning', 'info', 'notification'],
  defaults: {
    timeout: 5000,
    closable: true,
    location: 'bottom',
  },
  colorMap: {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  },
}))

app.mount('#app')
```

### 2. Add the NotificationProvider Component

Place the `NotificationProvider` component in your root layout:

```vue
<!-- App.vue or Layout.vue -->
<script setup lang="ts">
import { NotificationProvider } from 'inertia-vuetify-notifications'
</script>

<template>
  <v-app>
    <NotificationProvider />
    <router-view />
  </v-app>
</template>
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

#### Structured Notifications

For more control, pass an object with additional options:

```php
Inertia::flash('notification', [
    'message' => 'Item deleted',
    'type' => 'warning',        // Maps to snackbar color
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
        // URL action - makes an Inertia request
        [
            'label' => 'View Trash',
            'method' => 'get',
            'url' => '/trash',
        ],
    ],
]);
```

### Frontend

#### Registering Action Handlers

Register handlers at plugin initialization for app-wide actions:

```ts
app.use(inertiaVuetifyNotifications({
  actions: {
    'undo-delete': async (payload) => {
      await router.post('/items/restore', payload)
    },
  },
}))
```

Or register dynamically in components:

```vue
<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useNotifications } from 'inertia-vuetify-notifications'
import { router } from '@inertiajs/vue3'

const { registerAction, unregisterAction } = useNotifications()

// Register a page-specific action
registerAction('undo-delete', async (payload) => {
  await router.post('/items/restore', payload)
})

// Clean up on unmount
onUnmounted(() => {
  unregisterAction('undo-delete')
})
</script>
```

#### Manual Notifications

Trigger notifications programmatically from any component:

```vue
<script setup lang="ts">
import { useNotifications } from 'inertia-vuetify-notifications'

const { notify } = useNotifications()

function showSuccess() {
  notify('Operation completed!', 'success')
}

function showStructured() {
  notify({
    message: 'Custom notification',
    type: 'info',
    timeout: 3000,
    actions: [
      { label: 'Dismiss', name: 'dismiss' },
    ],
  })
}
</script>
```

## Configuration

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `flashKeys` | `string[]` | `['success', 'error', 'warning', 'info', 'notification']` | Flash keys to listen for |
| `defaults.timeout` | `number` | `5000` | Default notification timeout in ms |
| `defaults.closable` | `boolean` | `true` | Show close button by default |
| `defaults.location` | `string` | `'bottom'` | Snackbar position |
| `colorMap` | `Record<string, string>` | `{ success, error, warning, info }` | Map flash keys to Vuetify colors |
| `actions` | `Record<string, ActionHandler>` | `{}` | Initial action handlers |

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

Makes an Inertia request when clicked:

```ts
interface UrlAction {
  label: string
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  url: string
  data?: Record<string, unknown>
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
| `queue` | `InternalSnackbarItem[]` | Reactive notification queue |
| `notify` | `(notification, flashKey?) => void` | Add a notification |
| `registerAction` | `(name, handler) => void` | Register an action handler |
| `unregisterAction` | `(name) => void` | Remove an action handler |
| `executeAction` | `(action) => Promise<void>` | Execute an action (internal) |
| `options` | `NotificationPluginOptions` | Current plugin options |

### `NotificationProvider`

Vue component that renders the `VSnackbarQueue`. Place once in your app layout.

## License

MIT

