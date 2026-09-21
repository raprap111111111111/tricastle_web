import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@':         path.resolve(import.meta.dirname, './src'),
      '@app':      path.resolve(import.meta.dirname, './src/app'),
      '@shared':   path.resolve(import.meta.dirname, './src/shared'),
      '@features': path.resolve(import.meta.dirname, './src/features'),
      '@assets':   path.resolve(import.meta.dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
})
