import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/barbweb2/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
  },
})
