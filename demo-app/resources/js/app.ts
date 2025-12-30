import '../css/app.css';

import { createInertiaApp } from '@inertiajs/vue3';
import { inertiaVuetifyNotifications } from '@inertia-vuetify/notifications';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { DefineComponent } from 'vue';
import { createApp, h } from 'vue';
import vuetify from './plugins/vuetify';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.vue`, import.meta.glob<DefineComponent>('./pages/**/*.vue')),
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(vuetify)
            .use(inertiaVuetifyNotifications({
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
            }))
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
