import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.ts'],
            refresh: true,
        }),
        inertia({
            ssr: {
                cluster: true,
            },
        }),
        tailwindcss(),
        vue({
            template: {
                transformAssetUrls,
            },
        }),
        vuetify({
            autoImport: true,
        }),
        wayfinder({
            formVariants: true,
        }),
    ],
    resolve: {
        // The file-linked package must use the demo's initialized Inertia router.
        dedupe: ['@inertiajs/vue3'],
    },
    ssr: {
        // Vuetify components import CSS, which Node cannot load; the package imports Vuetify components.
        noExternal: ['vuetify', '@inertia-vuetify/notifications'],
    },
    optimizeDeps: {
        exclude: ['@inertia-vuetify/notifications'],
    },
    server: {
        watch: {
            ignored: ['!**/node_modules/@inertia-vuetify/notifications/**'],
        },
    },
});
