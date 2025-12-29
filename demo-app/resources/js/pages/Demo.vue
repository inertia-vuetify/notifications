<script setup lang="ts">
import { NotificationProvider, useNotifications } from '@inertia-vuetify/notifications';
import { router } from '@inertiajs/vue3';
import { onMounted, onUnmounted, ref } from 'vue';

const { notify, registerAction, unregisterAction, queue, options } = useNotifications();

// Backend flash demo state
const isFlashing = ref(false);

function flashFromBackend(route: string) {
    isFlashing.value = true;
    router.post(route, {}, {
        preserveScroll: true,
        onFinish: () => {
            isFlashing.value = false;
        },
    });
}

const deletedItems = ref<{ id: number; name: string }[]>([]);
const itemIdCounter = ref(1);

// Position demo state
type SnackbarLocation = 'top' | 'bottom' | 'top start' | 'top end' | 'bottom start' | 'bottom end';
const positionSnackbars = ref<Record<SnackbarLocation, boolean>>({
    'top': false,
    'bottom': false,
    'top start': false,
    'top end': false,
    'bottom start': false,
    'bottom end': false,
});

const positionLabels: Record<SnackbarLocation, string> = {
    'top': 'Top',
    'bottom': 'Bottom',
    'top start': 'Top Start',
    'top end': 'Top End',
    'bottom start': 'Bottom Start',
    'bottom end': 'Bottom End',
};

function showPositionDemo(position: SnackbarLocation) {
    positionSnackbars.value[position] = true;
}

// Register a page-specific action for undo functionality
onMounted(() => {
    registerAction('undo-delete', (payload) => {
        if (payload?.id && payload?.name) {
            deletedItems.value = deletedItems.value.filter(item => item.id !== payload.id);
            notify({
                message: `Restored "${payload.name}"`,
                type: 'success',
                timeout: 3000,
            });
        }
    });

    registerAction('dismiss', () => {
        // Just dismiss - the notification auto-closes when action is clicked
    });

    registerAction('view-details', (payload) => {
        alert(`Viewing details for item: ${JSON.stringify(payload)}`);
    });
});

onUnmounted(() => {
    unregisterAction('undo-delete');
    unregisterAction('dismiss');
    unregisterAction('view-details');
});

// Simple notification demos
function showSuccess() {
    notify('Operation completed successfully!', 'success');
}

function showError() {
    notify('Something went wrong. Please try again.', 'error');
}

function showWarning() {
    notify('Please review your input before continuing.', 'warning');
}

function showInfo() {
    notify('New features are now available!', 'info');
}

// Structured notification demos
function showCustomTimeout() {
    notify({
        message: 'This notification stays for 10 seconds',
        type: 'info',
        timeout: 10000,
    });
}

function showNonClosable() {
    notify({
        message: 'This notification cannot be manually closed (3s timeout)',
        type: 'warning',
        timeout: 3000,
        closable: false,
    });
}

function showCustomType() {
    notify({
        message: 'Custom purple notification',
        type: 'purple',
        timeout: 5000,
    });
}

// Action notification demos
function showWithDismissAction() {
    notify({
        message: 'Notification with dismiss action',
        type: 'info',
        actions: [
            { label: 'Got it', name: 'dismiss' },
        ],
    });
}

function showWithMultipleActions() {
    const id = itemIdCounter.value++;
    const name = `Item #${id}`;
    
    deletedItems.value.push({ id, name });
    
    notify({
        message: `"${name}" moved to trash`,
        type: 'warning',
        timeout: 8000,
        actions: [
            { 
                label: 'Undo', 
                name: 'undo-delete', 
                payload: { id, name } 
            },
            { 
                label: 'View Details', 
                name: 'view-details', 
                payload: { id, name } 
            },
        ],
    });
}

function showWithGlobalAction() {
    notify({
        message: 'Triggers a globally registered action',
        type: 'success',
        actions: [
            { 
                label: 'Execute Global', 
                name: 'global-action', 
                payload: { source: 'demo-page', timestamp: Date.now() } 
            },
        ],
    });
}

function showWithUrlAction() {
    notify({
        message: 'URL action navigates to a route',
        type: 'info',
        timeout: 8000,
        actions: [
            { 
                label: 'Go Home', 
                method: 'get', 
                url: '/' 
            },
        ],
    });
}

// Burst demo
function showBurst() {
    const types = ['success', 'error', 'warning', 'info'] as const;
    types.forEach((type, index) => {
        setTimeout(() => {
            notify({
                message: `Burst notification #${index + 1} (${type})`,
                type,
                timeout: 4000,
            });
        }, index * 300);
    });
}
</script>

<template>
    <v-app>
        <NotificationProvider />
        
        <v-app-bar color="primary" density="comfortable">
            <v-app-bar-title>
                <v-icon class="mr-2">mdi-bell-ring</v-icon>
                Inertia Vuetify Notifications Demo
            </v-app-bar-title>
        </v-app-bar>

        <v-main>
            <v-container class="py-8">
                <!-- Header -->
                <v-row class="mb-6">
                    <v-col cols="12">
                        <h1 class="text-h4 font-weight-bold mb-2">
                            @inertia-vuetify/notifications
                        </h1>
                        <p class="text-body-1 text-medium-emphasis">
                            Display Inertia flash messages as Vuetify snackbar notifications with support for actions.
                        </p>
                    </v-col>
                </v-row>

                <!-- Queue status -->
                <v-row class="mb-6">
                    <v-col cols="12">
                        <v-alert
                            :type="queue.length > 0 ? 'info' : 'success'"
                            variant="tonal"
                            density="compact"
                        >
                            <strong>Queue Status:</strong> {{ queue.length }} notification{{ queue.length === 1 ? '' : 's' }} in queue
                        </v-alert>
                    </v-col>
                </v-row>

                <!-- Inertia Flash Messages (Main Feature) -->
                <v-row class="mb-6">
                    <v-col cols="12">
                        <v-card color="primary" variant="tonal">
                            <v-card-title class="d-flex align-center">
                                <v-icon class="mr-2">mdi-server</v-icon>
                                Inertia Flash Messages
                                <v-chip class="ml-2" size="small" color="primary" variant="flat">Main Feature</v-chip>
                            </v-card-title>
                            <v-card-subtitle>
                                Backend-triggered notifications using Inertia::flash() — the core functionality of this package
                            </v-card-subtitle>
                            <v-card-text>
                                <v-alert type="info" variant="outlined" density="compact" class="mb-4">
                                    <div class="d-flex align-center">
                                        <span>These buttons send POST requests to Laravel. The backend uses <code>Inertia::flash()</code> to send notifications.</span>
                                    </div>
                                </v-alert>
                                <v-row dense>
                                    <v-col cols="6" sm="4" md="2">
                                        <v-btn 
                                            color="success" 
                                            variant="flat" 
                                            block
                                            :loading="isFlashing"
                                            @click="flashFromBackend('/demo/flash/success')"
                                        >
                                            <v-icon start>mdi-check-circle</v-icon>
                                            Success
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6" sm="4" md="2">
                                        <v-btn 
                                            color="error" 
                                            variant="flat" 
                                            block
                                            :loading="isFlashing"
                                            @click="flashFromBackend('/demo/flash/error')"
                                        >
                                            <v-icon start>mdi-alert-circle</v-icon>
                                            Error
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6" sm="4" md="2">
                                        <v-btn 
                                            color="warning" 
                                            variant="flat" 
                                            block
                                            :loading="isFlashing"
                                            @click="flashFromBackend('/demo/flash/warning')"
                                        >
                                            <v-icon start>mdi-alert</v-icon>
                                            Warning
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6" sm="4" md="2">
                                        <v-btn 
                                            color="info" 
                                            variant="flat" 
                                            block
                                            :loading="isFlashing"
                                            @click="flashFromBackend('/demo/flash/info')"
                                        >
                                            <v-icon start>mdi-information</v-icon>
                                            Info
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6" sm="4" md="2">
                                        <v-btn 
                                            color="secondary" 
                                            variant="flat" 
                                            block
                                            :loading="isFlashing"
                                            @click="flashFromBackend('/demo/flash/structured')"
                                        >
                                            <v-icon start>mdi-cog</v-icon>
                                            Structured
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6" sm="4" md="2">
                                        <v-btn 
                                            color="deep-purple" 
                                            variant="flat" 
                                            block
                                            :loading="isFlashing"
                                            @click="flashFromBackend('/demo/flash/with-actions')"
                                        >
                                            <v-icon start>mdi-gesture-tap</v-icon>
                                            With Actions
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-row dense class="mt-2">
                                    <v-col cols="12" sm="6" md="4">
                                        <v-btn 
                                            color="primary" 
                                            variant="outlined" 
                                            block
                                            :loading="isFlashing"
                                            @click="flashFromBackend('/demo/flash/multiple')"
                                        >
                                            <v-icon start>mdi-flash</v-icon>
                                            Multiple Flash (2 at once)
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-text class="pt-0">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <p class="text-caption text-medium-emphasis mb-1">Simple Flash (Laravel):</p>
                                        <v-code class="d-block pa-3 text-caption">
Inertia::flash('success', 'Item saved successfully!');
return back();
                                        </v-code>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <p class="text-caption text-medium-emphasis mb-1">Structured Flash (Laravel):</p>
                                        <v-code class="d-block pa-3 text-caption">
Inertia::flash('notification', [
    'message' => 'Item deleted',
    'type' => 'warning',
    'actions' => [...],
]);
                                        </v-code>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Simple Notifications -->
                <v-row>
                    <v-col cols="12" md="6">
                        <v-card>
                            <v-card-title class="d-flex align-center">
                                <v-icon class="mr-2" color="primary">mdi-message-text</v-icon>
                                Client Side Notifications
                            </v-card-title>
                            <v-card-subtitle>
                                Basic notifications using flash keys that map to colors
                            </v-card-subtitle>
                            <v-card-text>
                                <v-row dense>
                                    <v-col cols="6">
                                        <v-btn 
                                            color="success" 
                                            variant="tonal" 
                                            block 
                                            @click="showSuccess"
                                        >
                                            <v-icon start>mdi-check-circle</v-icon>
                                            Success
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-btn 
                                            color="error" 
                                            variant="tonal" 
                                            block 
                                            @click="showError"
                                        >
                                            <v-icon start>mdi-alert-circle</v-icon>
                                            Error
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-btn 
                                            color="warning" 
                                            variant="tonal" 
                                            block 
                                            @click="showWarning"
                                        >
                                            <v-icon start>mdi-alert</v-icon>
                                            Warning
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-btn 
                                            color="info" 
                                            variant="tonal" 
                                            block 
                                            @click="showInfo"
                                        >
                                            <v-icon start>mdi-information</v-icon>
                                            Info
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-text class="pt-0">
                                <v-code class="d-block pa-3 text-caption">
notify('Operation completed!', 'success')
                                </v-code>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <!-- Structured Notifications -->
                    <v-col cols="12" md="6">
                        <v-card>
                            <v-card-title class="d-flex align-center">
                                <v-icon class="mr-2" color="secondary">mdi-cog</v-icon>
                                Structured Client Side Notifications
                            </v-card-title>
                            <v-card-subtitle>
                                Custom timeout, closable, and type options
                            </v-card-subtitle>
                            <v-card-text>
                                <v-row dense>
                                    <v-col cols="12">
                                        <v-btn 
                                            color="info" 
                                            variant="tonal" 
                                            block 
                                            @click="showCustomTimeout"
                                        >
                                            <v-icon start>mdi-clock-outline</v-icon>
                                            10 Second Timeout
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-btn 
                                            color="warning" 
                                            variant="tonal" 
                                            block 
                                            @click="showNonClosable"
                                        >
                                            <v-icon start>mdi-lock</v-icon>
                                            Non-Closable (3s)
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-btn 
                                            color="purple" 
                                            variant="tonal" 
                                            block 
                                            @click="showCustomType"
                                        >
                                            <v-icon start>mdi-palette</v-icon>
                                            Custom Color (Purple)
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-text class="pt-0">
                                <v-code class="d-block pa-3 text-caption">
notify({ message: '...', type: 'info', timeout: 10000 })
                                </v-code>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Position Options -->
                <v-row class="mt-4">
                    <v-col cols="12">
                        <v-card>
                            <v-card-title class="d-flex align-center">
                                <v-icon class="mr-2" color="teal">mdi-arrow-all</v-icon>
                                Position Options
                            </v-card-title>
                            <v-card-subtitle>
                                Configure where notifications appear on screen (set at plugin level)
                            </v-card-subtitle>
                            <v-card-text>
                                <v-alert type="info" variant="tonal" density="compact" class="mb-4">
                                    <strong>Current Position:</strong> {{ options.defaults.location }}
                                    <span class="text-caption ml-2">(configured in app.ts)</span>
                                </v-alert>
                                <v-row dense>
                                    <v-col cols="4" sm="2">
                                        <v-btn 
                                            color="teal" 
                                            variant="tonal" 
                                            block
                                            size="small"
                                            @click="showPositionDemo('top start')"
                                        >
                                            Top Start
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="4" sm="2">
                                        <v-btn 
                                            color="teal" 
                                            variant="tonal" 
                                            block
                                            size="small"
                                            @click="showPositionDemo('top')"
                                        >
                                            Top
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="4" sm="2">
                                        <v-btn 
                                            color="teal" 
                                            variant="tonal" 
                                            block
                                            size="small"
                                            @click="showPositionDemo('top end')"
                                        >
                                            Top End
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="4" sm="2">
                                        <v-btn 
                                            color="teal" 
                                            variant="tonal" 
                                            block
                                            size="small"
                                            @click="showPositionDemo('bottom start')"
                                        >
                                            Bottom Start
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="4" sm="2">
                                        <v-btn 
                                            color="teal" 
                                            variant="tonal" 
                                            block
                                            size="small"
                                            @click="showPositionDemo('bottom')"
                                        >
                                            Bottom
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="4" sm="2">
                                        <v-btn 
                                            color="teal" 
                                            variant="tonal" 
                                            block
                                            size="small"
                                            @click="showPositionDemo('bottom end')"
                                        >
                                            Bottom End
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-card-text class="pt-0">
                                <v-code class="d-block pa-3 text-caption">
app.use(inertiaVuetifyNotifications({
  defaults: { location: 'bottom end' }  // or 'top', 'bottom', 'top start', 'top end', 'bottom start'
}))
                                </v-code>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

        </v-container>
      </v-main>

        <!-- Position Demo Snackbars -->
        <v-snackbar
            v-for="position in (['top', 'bottom', 'top start', 'top end', 'bottom start', 'bottom end'] as const)"
            :key="position"
            v-model="positionSnackbars[position]"
            :location="position"
            color="teal"
            :timeout="3000"
        >
            {{ positionLabels[position] }} position
            <template #actions>
                <v-btn variant="text" @click="positionSnackbars[position] = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-app>
  </template>
