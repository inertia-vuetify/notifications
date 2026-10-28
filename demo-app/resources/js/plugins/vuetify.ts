import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';

// One instance per app, so server-rendered requests never share theme state
export function createAppVuetify(ssr: boolean) {
    return createVuetify({
        ssr,
        theme: {
            defaultTheme: 'light',
        },
    });
}
