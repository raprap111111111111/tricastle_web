import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@':         path.resolve(__dirname, './src'),
      '@app':      path.resolve(__dirname, './src/app'),
      '@shared':   path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@assets':   path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
})
