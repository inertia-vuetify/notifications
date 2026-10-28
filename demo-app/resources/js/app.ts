import '../css/app.css';

import { inertiaVuetifyNotifications } from '@inertia-vuetify/notifications';
import { createInertiaApp } from '@inertiajs/vue3';
import { createAppVuetify } from './plugins/vuetify';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// The @inertiajs/vite plugin resolves ./pages and reuses this entry for SSR
createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    withApp(app, { ssr }) {
        app.use(createAppVuetify(ssr)).use(
            inertiaVuetifyNotifications({
                defaults: {
                    timeout: 5000,
                    closable: true,
                    location: 'top',
                },
                actions: {
                    // Global action handler example
                    'global-action': (payload) => {
                        console.log('Global action triggered with payload:', payload);
                        alert(`Global action executed! Payload: ${JSON.stringify(payload)}`);
                    },
                },
            }),
        );
    },
    progress: {
        color: '#4B5563',
    },
});
