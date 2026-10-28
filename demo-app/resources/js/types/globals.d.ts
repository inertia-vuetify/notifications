import type { StructuredNotification } from '@inertia-vuetify/notifications';
import type { SharedPageProps } from './index';

declare global {
    interface ImportMetaEnv {
        readonly VITE_APP_NAME?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: SharedPageProps;
        // Keys handled by the notifications plugin; other flash keys are allowed and ignored by it
        flashDataType: {
            success?: string;
            error?: string;
            warning?: string;
            info?: string;
            notification?: StructuredNotification;
            [key: string]: unknown;
        };
    }
}
