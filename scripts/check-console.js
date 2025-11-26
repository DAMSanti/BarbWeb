#!/usr/bin/env node
/**
 * Script para verificar console.log y console.error en código de producción
 * Uso: node scripts/check-console.js
 */

const fs = require('fs');
const path = require('path');

const PROD_DIRECTORIES = [
  'backend/src',
  'frontend/src',
];

const IGNORE_PATTERNS = [
  /scripts[/\\]/,
  /test[/\\]/,
  /\.config\./,
  /node_modules[/\\]/,
  /dist[/\\]/,
  /generate-secrets\.js/,
  /test-import\.mjs/,
];

const CONSOLE_REGEX = /console\.(log|error|warn|debug)\(/g;

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function findConsoleStatements(directory) {
  const results = [];

  function walkDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (shouldIgnore(fullPath)) continue;

      if (file.isDirectory()) {
        walkDir(fullPath);
      } else if (file.isFile() && /\.(ts|tsx)$/.test(file.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');

          lines.forEach((line, index) => {
            // Skip commented lines
            if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
              return;
            }

            const match = line.match(CONSOLE_REGEX);
            if (match) {
              results.push({
                file: fullPath,
                line: index + 1,
                content: line.trim(),
              });
            }
          });
        } catch (err) {
          console.error(`Error reading file ${fullPath}:`, err.message);
        }
      }
    }
  }

  walkDir(directory);
  return results;
}

console.log('🔍 Verificando console.log/error en código de producción...\n');

let totalFound = 0;

for (const dir of PROD_DIRECTORIES) {
  if (!fs.existsSync(dir)) continue;

  console.log(`📍 Revisando ${dir}...`);
  const results = findConsoleStatements(dir);

  if (results.length > 0) {
    console.log(`  ❌ Encontrados ${results.length} console statement(s):`);
    results.forEach(result => {
      console.log(
        `     ${result.file}:${result.line}`
      );
      console.log(`     > ${result.content.substring(0, 80)}${result.content.length > 80 ? '...' : ''}`);
    });
    totalFound += results.length;
  } else {
    console.log(`  ✅ Sin console statements`);
  }
  console.log();
}

if (totalFound === 0) {
  console.log('✅ ¡Excelente! No se encontraron console.log/error en código de producción');
  process.exit(0);
} else {
  console.log(`❌ Se encontraron ${totalFound} console statement(s) en total`);
  process.exit(1);
}
