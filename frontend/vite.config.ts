import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    (vuetify as any)({ autoImport: true }),
  ],
  resolve: {
    alias: {
    '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: true
    }
})
