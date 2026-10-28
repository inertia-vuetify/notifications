import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      bundleTypes: true,
      beforeWriteFile: (filePath, content) => ({
        filePath,
        content: content.replace(/\r\n/g, '\n'),
      }),
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rolldownOptions: {
      external: [/^vue$/, /^vuetify(\/.*)?$/, /^@inertiajs\/vue3$/],
      // Declaration bundling is expected to dominate build time
      checks: { bundlerTimings: false },
    },
  },
})
