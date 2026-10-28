import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['tests/**/*.test.ts'],
    // Inlined so vi.resetModules() can give each plugin test a fresh Inertia router
    server: { deps: { inline: ['vuetify', /@inertiajs\//] } },
    environment: 'jsdom',
    globals: true,
  },
})
