import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    // Enable better code splitting for smaller chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor chunks for better caching and smaller main bundle
          if (id.includes('node_modules')) {
            // React ecosystem in one chunk
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            // Stripe in separate chunk (lazy loaded)
            if (id.includes('@stripe')) {
              return 'vendor-stripe'
            }
            // Sentry in separate chunk (lazy loaded)
            if (id.includes('@sentry')) {
              return 'vendor-sentry'
            }
            // Lucide icons in separate chunk
            if (id.includes('lucide')) {
              return 'vendor-icons'
            }
            // Other smaller vendors
            if (id.includes('zustand')) {
              return 'vendor-state'
            }
          }
        },
      },
    },
    // Target modern browsers only - removes legacy polyfills
    // Supports: Chrome 87+, Firefox 78+, Safari 14+, Edge 88+
    target: 'esnext',
    // Minification settings
    minify: 'esbuild',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Source maps only in development
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
    // Exclude heavy libraries from pre-bundling to allow dynamic import
    exclude: ['@stripe/stripe-js', '@stripe/react-stripe-js', '@sentry/react'],
  },
  // CSS optimization
  css: {
    devSourcemap: false,
  },
})
