<script setup lang="ts">
import { NotificationProvider, useNotificationAction, useNotifications } from '@inertia-vuetify/notifications';
import { router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';
import { useTheme } from 'vuetify';

const { notify, queue, options } = useNotifications();
const queueCount = computed(() => queue.value.length);
const theme = useTheme();
const isDarkTheme = computed(() => theme.global.current.value.dark);
const themeToggleIcon = computed(() => (isDarkTheme.value ? 'mdi-weather-sunny' : 'mdi-weather-night'));
const themeToggleLabel = computed(() => (isDarkTheme.value ? 'Switch to light mode' : 'Switch to dark mode'));

function toggleTheme() {
    theme.global.name.value = isDarkTheme.value ? 'light' : 'dark';
}

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

// Page-specific actions, registered while this page is mounted
useNotificationAction('undo-delete', (payload) => {
    if (payload?.id && payload?.name) {
        deletedItems.value = deletedItems.value.filter((item) => item.id !== payload.id);
        notify({
            message: `Restored "${payload.name}"`,
            type: 'success',
            timeout: 3000,
        });
    }
});

useNotificationAction('view-details', (payload) => {
    alert(`Viewing details for item: ${JSON.stringify(payload)}`);
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

// Inertia client-side flash demos (no server request)
function inertiaFlashFooBar() {
    router.flash('foo', 'bar');
}

function inertiaFlashSuccess() {
    router.flash('success', 'Client-side flash via Inertia router.flash()');
}

function inertiaFlashStructured() {
    router.flash('notification', {
        message: 'Structured client-side flash via router.flash()',
        type: 'info',
        timeout: 5000,
    });
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
        message: 'Custom teal notification',
        type: 'teal',
        timeout: 5000,
    });
}

// Action notification demos
// function showWithDismissAction() {
//     notify({
//         message: 'Notification with dismiss action',
//         type: 'info',
//         actions: [
//             { label: 'Got it', name: 'dismiss' },
//         ],
//     });
// }

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

const deletedCount = computed(() => deletedItems.value.length);

const backendFlashButtons = [
    { label: 'Success', route: '/demo/flash/success', icon: 'mdi-check-circle', color: 'success' },
    { label: 'Error', route: '/demo/flash/error', icon: 'mdi-alert-circle', color: 'error' },
    { label: 'Warning', route: '/demo/flash/warning', icon: 'mdi-alert', color: 'warning' },
    { label: 'Info', route: '/demo/flash/info', icon: 'mdi-information', color: 'info' },
    { label: 'Structured', route: '/demo/flash/structured', icon: 'mdi-cog-outline', color: 'secondary' },
    { label: 'With Actions', route: '/demo/flash/with-actions', icon: 'mdi-gesture-tap', color: 'primary' },
] as const;

const inertiaFlashButtons = [
    { label: "router.flash('foo', 'bar')", icon: 'mdi-code-tags', color: 'primary', action: inertiaFlashFooBar },
    { label: 'Flash Success', icon: 'mdi-check-circle', color: 'success', action: inertiaFlashSuccess },
    { label: 'Flash Structured', icon: 'mdi-cog-outline', color: 'info', action: inertiaFlashStructured },
] as const;

const composableButtons = [
    { label: 'Success', icon: 'mdi-check-circle', color: 'success', action: showSuccess },
    { label: 'Error', icon: 'mdi-alert-circle', color: 'error', action: showError },
    { label: 'Warning', icon: 'mdi-alert', color: 'warning', action: showWarning },
    { label: 'Info', icon: 'mdi-information', color: 'info', action: showInfo },
    { label: '10 Second Timeout', icon: 'mdi-clock-outline', color: 'info', action: showCustomTimeout },
    { label: 'Non-Closable (3s)', icon: 'mdi-lock-outline', color: 'warning', action: showNonClosable },
    { label: 'Custom Color (Teal)', icon: 'mdi-palette-outline', color: 'teal', action: showCustomType },
] as const;

const actionDemoButtons = [
    { label: 'Undo + Details', icon: 'mdi-undo-variant', color: 'warning', action: showWithMultipleActions },
    { label: 'Global Action', icon: 'mdi-earth-arrow-right', color: 'success', action: showWithGlobalAction },
    { label: 'URL Action', icon: 'mdi-open-in-new', color: 'primary', action: showWithUrlAction },
] as const;

const positionOrder: SnackbarLocation[] = ['top start', 'top', 'top end', 'bottom start', 'bottom', 'bottom end'];
</script>

<template>
    <v-app>
        <NotificationProvider />

        <v-app-bar border density="comfortable" elevation="0">
            <template #prepend>
                <v-avatar color="primary" rounded="lg" size="34">
                    <v-icon size="18">mdi-bell-badge-outline</v-icon>
                </v-avatar>
            </template>

            <v-app-bar-title class="text-subtitle-1 font-weight-medium">
                Inertia Vuetify Notifications
            </v-app-bar-title>

            <template #append>
                <v-chip class="mr-2" color="primary" size="small" variant="tonal">
                    {{ queueCount }} queued
                </v-chip>
                <v-btn
                    :aria-label="themeToggleLabel"
                    :title="themeToggleLabel"
                    icon
                    variant="text"
                    @click="toggleTheme"
                >
                    <v-icon>{{ themeToggleIcon }}</v-icon>
                </v-btn>
            </template>
        </v-app-bar>

        <v-main class="demo-page">
            <v-container class="py-6 py-md-10">
                <v-sheet border class="hero-surface pa-5 pa-md-8 mb-6" rounded="xl">
                    <v-row align="center">
                        <v-col cols="12" md="8">

                            <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
                                Notification system playground
                            </h1>
                            <p class="text-body-1 text-medium-emphasis mb-0">
                                Validate backend flash payloads, client-side notifications, and action handling in one clean view.
                            </p>
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-card class="section-card" color="surface" rounded="lg" elevation="0">
                                <v-card-text>
                                    <div class="d-flex align-center justify-space-between mb-3">
                                        <span class="text-body-2 text-medium-emphasis">Default position</span>
                                        <v-chip size="small" variant="tonal">{{ options.defaults.location }}</v-chip>
                                    </div>
                                    <v-btn
                                        block
                                        color="primary"
                                        prepend-icon="mdi-rocket-launch-outline"
                                        class="mb-2"
                                        variant="flat"
                                        @click="showBurst"
                                    >
                                        Trigger burst test
                                    </v-btn>
                                    <v-btn
                                        block
                                        color="success"
                                        prepend-icon="mdi-check-circle-outline"
                                        variant="tonal"
                                        @click="showSuccess"
                                    >
                                        Send sample success
                                    </v-btn>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-sheet>

                <v-alert :type="queueCount > 0 ? 'info' : 'success'" border="start" class="mb-6" variant="tonal">
                    <div class="d-flex align-center justify-space-between flex-wrap ga-2">
                        <span>
                            <strong>{{ queueCount }}</strong> notification{{ queueCount === 1 ? '' : 's' }} currently in the queue.
                        </span>
                        <v-chip size="small" variant="outlined">
                            Deleted demo items: {{ deletedCount }}
                        </v-chip>
                    </div>
                </v-alert>

                <v-row>
                    <v-col cols="12" lg="7">
                        <v-card class="section-card h-100" rounded="xl" elevation="0">
                            <v-card-item>
                                <template #prepend>
                                    <v-avatar color="primary" rounded="lg" size="34">
                                        <v-icon size="18">mdi-server-network</v-icon>
                                    </v-avatar>
                                </template>
                                <v-card-title>Server flash messages</v-card-title>
                                <v-card-subtitle>
                                    Laravel <code>Inertia::flash()</code> demos for the plugin's primary workflow.
                                </v-card-subtitle>
                            </v-card-item>

                            <v-card-text>
                                <v-alert class="mb-4" density="compact" type="info" variant="tonal">
                                    Each button sends a POST request and lets the server return flash payloads.
                                </v-alert>

                                <v-row density="compact">
                                    <v-col
                                        v-for="button in backendFlashButtons"
                                        :key="button.route"
                                        cols="6"
                                        sm="4"
                                        md="3"
                                    >
                                        <v-btn
                                            block
                                            :color="button.color"
                                            :loading="isFlashing"
                                            :prepend-icon="button.icon"
                                            variant="flat"
                                            @click="flashFromBackend(button.route)"
                                        >
                                            {{ button.label }}
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-btn
                                            block
                                            color="primary"
                                            :loading="isFlashing"
                                            prepend-icon="mdi-flash-outline"
                                            variant="outlined"
                                            @click="flashFromBackend('/demo/flash/multiple')"
                                        >
                                            Multiple flash (2 at once)
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>

                            <v-card-text class="pt-0">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <p class="text-caption text-medium-emphasis mb-1">Simple flash</p>
                                        <v-code class="d-block pa-3 text-caption">
Inertia::flash('success', 'Item saved successfully!');
return back();
                                        </v-code>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <p class="text-caption text-medium-emphasis mb-1">Structured flash</p>
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

                    <v-col cols="12" lg="5">
                        <v-card class="section-card h-100" rounded="xl" elevation="0">
                            <v-card-item>
                                <template #prepend>
                                    <v-avatar color="warning" rounded="lg" size="34">
                                        <v-icon size="18">mdi-gesture-tap-button</v-icon>
                                    </v-avatar>
                                </template>
                                <v-card-title>Action workflows</v-card-title>
                                <v-card-subtitle>
                                    Test named handlers, global handlers, and URL navigation actions.
                                </v-card-subtitle>
                            </v-card-item>

                            <v-card-text>
                                <v-row density="compact">
                                    <v-col
                                        v-for="button in actionDemoButtons"
                                        :key="button.label"
                                        cols="12"
                                    >
                                        <v-btn
                                            block
                                            :color="button.color"
                                            :prepend-icon="button.icon"
                                            variant="tonal"
                                            @click="button.action"
                                        >
                                            {{ button.label }}
                                        </v-btn>
                                    </v-col>
                                </v-row>

                                <v-divider class="my-4" />

                                <p class="text-caption text-medium-emphasis mb-2">Deleted items (for undo demo)</p>
                                <div class="d-flex flex-wrap ga-2">
                                    <v-chip
                                        v-for="item in deletedItems"
                                        :key="item.id"
                                        size="small"
                                        variant="outlined"
                                    >
                                        {{ item.name }}
                                    </v-chip>
                                    <span v-if="deletedItems.length === 0" class="text-caption text-medium-emphasis">
                                        No deleted items yet.
                                    </span>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <v-row class="mt-1">
                    <v-col cols="12" md="6">
                        <v-card class="section-card h-100" rounded="xl" elevation="0">
                            <v-card-item>
                                <template #prepend>
                                    <v-avatar color="info" rounded="lg" size="34">
                                        <v-icon size="18">mdi-flash-outline</v-icon>
                                    </v-avatar>
                                </template>
                                <v-card-title>Client flash via Inertia</v-card-title>
                                <v-card-subtitle>
                                    Uses <code>router.flash()</code> directly with no backend request.
                                </v-card-subtitle>
                            </v-card-item>

                            <v-card-text>
                                <v-row density="compact">
                                    <v-col
                                        v-for="button in inertiaFlashButtons"
                                        :key="button.label"
                                        cols="12"
                                    >
                                        <v-btn
                                            block
                                            :color="button.color"
                                            :prepend-icon="button.icon"
                                            variant="tonal"
                                            @click="button.action"
                                        >
                                            {{ button.label }}
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>

                            <v-card-text class="pt-0">
                                <v-code class="d-block pa-3 text-caption">
router.flash('foo', 'bar')
router.flash('success', '...')
router.flash('notification', { message: '...', type: 'info' })
                                </v-code>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-card class="section-card h-100" rounded="xl" elevation="0">
                            <v-card-item>
                                <template #prepend>
                                    <v-avatar color="success" rounded="lg" size="34">
                                        <v-icon size="18">mdi-bell-ring-outline</v-icon>
                                    </v-avatar>
                                </template>
                                <v-card-title>Client notifications via composable</v-card-title>
                                <v-card-subtitle>
                                    Uses <code>useNotifications()</code> and direct <code>notify()</code> calls.
                                </v-card-subtitle>
                            </v-card-item>

                            <v-card-text>
                                <v-row density="compact">
                                    <v-col
                                        v-for="button in composableButtons"
                                        :key="button.label"
                                        cols="12"
                                        sm="6"
                                    >
                                        <v-btn
                                            block
                                            :color="button.color"
                                            :prepend-icon="button.icon"
                                            variant="tonal"
                                            @click="button.action"
                                        >
                                            {{ button.label }}
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>

                            <v-card-text class="pt-0">
                                <v-code class="d-block pa-3 text-caption">
notify('Operation completed!', 'success')
notify({ message: '...', type: 'info', timeout: 10000 })
                                </v-code>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <v-row class="mt-1">
                    <v-col cols="12">
                        <v-card class="section-card" rounded="xl" elevation="0">
                            <v-card-item>
                                <template #prepend>
                                    <v-avatar color="teal" rounded="lg" size="34">
                                        <v-icon size="18">mdi-arrow-all</v-icon>
                                    </v-avatar>
                                </template>
                                <v-card-title>Position options</v-card-title>
                                <v-card-subtitle>
                                    Preview each snackbar location while keeping your plugin-level default.
                                </v-card-subtitle>
                            </v-card-item>

                            <v-card-text>
                                <v-row density="compact">
                                    <v-col
                                        v-for="position in positionOrder"
                                        :key="position"
                                        cols="6"
                                        sm="4"
                                        md="2"
                                    >
                                        <v-btn
                                            block
                                            color="teal"
                                            size="small"
                                            variant="tonal"
                                            @click="showPositionDemo(position)"
                                        >
                                            {{ positionLabels[position] }}
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>

                            <v-card-text class="pt-0">
                                <v-code class="d-block pa-3 text-caption">
app.use(inertiaVuetifyNotifications({
  defaults: { location: 'bottom end' }
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
            v-for="position in positionOrder"
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

<style scoped>
.demo-page {
    background:
        radial-gradient(circle at 10% 0%, rgba(var(--v-theme-primary), 0.09), transparent 42%),
        radial-gradient(circle at 92% 8%, rgba(var(--v-theme-info), 0.09), transparent 40%),
        rgb(var(--v-theme-surface));
}

.hero-surface {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-info), 0.05));
}

.section-card {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
