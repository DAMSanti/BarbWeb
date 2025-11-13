#!/usr/bin/env node
/**
 * Simple script to generate HTML entry point for esbuild output
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/barbweb2/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bufete Jurídico - Consultas Legales</title>
  <script>
    // Set base URL for React Router
    window.__BASE_URL__ = '/barbweb2/';
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/barbweb2/index.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
console.log('✅ Generated dist/index.html');
