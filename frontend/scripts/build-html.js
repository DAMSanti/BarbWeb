#!/usr/bin/env node
/**
 * Build script for esbuild with CSS handling
 */

import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const distDir = path.join(projectRoot, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  console.log('🔨 Building frontend...');

  // Step 1: Process CSS with PostCSS + Tailwind
  console.log('📦 Processing CSS with Tailwind...');
  const cssPath = path.join(srcDir, 'styles', 'globals.css');
  const cssInput = fs.readFileSync(cssPath, 'utf8');

  const result = await postcss([
    tailwindcss,
    autoprefixer,
  ]).process(cssInput, {
    from: cssPath,
    to: path.join(distDir, 'index.css'),
  });

  fs.writeFileSync(path.join(distDir, 'index.css'), result.css);
  console.log(`✅ CSS generated: ${(result.css.length / 1024).toFixed(2)}KB`);

  // Step 2: Define environment variables for esbuild
  console.log('🔐 Preparing environment variables...');
  const envVars = {
    VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
    VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || '',
    VITE_MICROSOFT_CLIENT_ID: process.env.VITE_MICROSOFT_CLIENT_ID || '',
    VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN || '',
    VITE_FRONTEND_URL: process.env.VITE_FRONTEND_URL || '',
  };
  
  // Helper function to redact sensitive values
  const redactValue = (value, type = 'generic') => {
    if (!value) return '[not configured]';
    if (type === 'key' && value.length > 10) {
      return value.substring(0, 8) + '...' + value.substring(value.length - 4);
    }
    return value;
  };
  
  console.log('  ✓ VITE_STRIPE_PUBLISHABLE_KEY:', redactValue(envVars.VITE_STRIPE_PUBLISHABLE_KEY, 'key'));
  console.log('  ✓ VITE_API_URL:', redactValue(envVars.VITE_API_URL, 'url'));
  console.log('  ✓ VITE_SENTRY_DSN:', envVars.VITE_SENTRY_DSN ? '✅ configured' : '❌ not set');

  // Step 3: Bundle JavaScript with esbuild
  console.log('📦 Bundling JavaScript...');
  const define = {
    // Define import.meta.env as an object with all properties
    'import.meta.env': JSON.stringify({
      ...envVars,
      DEV: false,
      PROD: true,
      MODE: 'production',
      BASE_URL: '/',
      SSR: false,
    }),
    // Also define individual properties for direct access
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
    'import.meta.env.MODE': '"production"',
    'import.meta.env.BASE_URL': '"/"',
    'import.meta.env.SSR': 'false',
  };
  
  // Add each VITE_ variable individually
  Object.entries(envVars).forEach(([key, value]) => {
    define[`import.meta.env.${key}`] = JSON.stringify(value);
    define[`process.env.${key}`] = JSON.stringify(value);
  });

  await esbuild.build({
    entryPoints: [path.join(srcDir, 'main.tsx')],
    bundle: true,
    outdir: distDir,
    outbase: srcDir,
    format: 'esm',
    platform: 'browser',
    minify: true,
    sourcemap: false,
    external: ['node_modules'],
    define,
  });
  console.log('✅ JavaScript bundled');

  // Step 3: Generate HTML with embedded CSS
  console.log('📄 Generating HTML...');
  const cssContent = fs.readFileSync(path.join(distDir, 'index.css'), 'utf8');
  
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bufete Jurídico - Consultas Legales</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/main.js"></script>
</body>
</html>
`;

  fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
  console.log('✅ HTML generated with embedded styles');

  // Calculate file sizes
  const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
  let totalJs = 0;
  jsFiles.forEach(f => {
    totalJs += fs.statSync(path.join(distDir, f)).size;
  });

  console.log(`\n📊 Build Summary:`);
  console.log(`  💾 JavaScript: ${(totalJs / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  🎨 CSS: ${(cssContent.length / 1024).toFixed(2)}KB`);
  console.log(`  📄 HTML with embedded styles`);
  console.log(`✨ Build complete!`);

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

