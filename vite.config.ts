import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      rollupTypes: true,
      beforeWriteFile: (filePath, content) => ({
        filePath,
        content: content.replace(/\r\n/g, '\n'),
      }),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'InertiaVuetifyNotifications',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'vuetify', '@inertiajs/vue3', 'vuetify/components'],
      output: {
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
          '@inertiajs/vue3': 'InertiaVue3',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
