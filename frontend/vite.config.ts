import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Plugin to add critical CSS inline and make stylesheet non-render-blocking
function criticalCssPlugin(): Plugin {
  return {
    name: 'critical-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Critical CSS for above-the-fold content (header, hero, initial layout)
      const criticalCss = `
        *, *::before, *::after { box-sizing: border-box; }
        html { line-height: 1.5; -webkit-text-size-adjust: 100%; font-family: ui-sans-serif, system-ui, sans-serif; }
        body { margin: 0; background: #1a1a2e; color: #e2e8f0; min-height: 100vh; }
        #root { min-height: 100vh; display: flex; flex-direction: column; }
        .app-shell { display: flex; flex-direction: column; min-height: 100vh; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-grow { flex-grow: 1; }
        .min-h-screen { min-height: 100vh; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rounded-full { border-radius: 9999px; }
        .h-12 { height: 3rem; }
        .w-12 { width: 3rem; }
        .border-b-2 { border-bottom-width: 2px; border-style: solid; }
        .border-primary-500 { border-color: #0ea5e9; }
      `
      
      // Insert critical CSS inline before </head>
      let result = html.replace(
        '</head>',
        `<style id="critical-css">${criticalCss.replace(/\s+/g, ' ').trim()}</style>\n</head>`
      )
      
      // Convert CSS links to non-render-blocking using media="print" trick
      // Pattern: <link rel="stylesheet" ... href="...css">
      result = result.replace(
        /<link\s+rel="stylesheet"([^>]*)\s+href="([^"]+\.css)"([^>]*)>/g,
        (match, before, href, after) => {
          // Skip if already has media attribute
          if (before.includes('media=') || after.includes('media=')) {
            return match
          }
          return `<link rel="stylesheet"${before} href="${href}"${after} media="print" onload="this.media='all'">`
        }
      )
      
      return result
    }
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), criticalCssPlugin()],
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
