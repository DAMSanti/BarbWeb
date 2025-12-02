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
        manualChunks: {
          // Split vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'vendor-zustand': ['zustand'],
        },
      },
    },
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
    // Exclude Stripe from pre-bundling to allow dynamic import
    exclude: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
  },
})
