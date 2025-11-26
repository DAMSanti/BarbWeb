import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isCI = !!process.env.CI

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        'src/db/init.ts',
        'src/middleware/*.ts',
        '**/*.d.ts',
        '**/node_modules/**',
      ],
      lines: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
      
      ...(isCI && {
        all: true,
        skip: [],
      }),
    },

    testTimeout: 10000,
    hookTimeout: 10000,
    
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['tests/**/*.test.ts'],
    
    ...(isCI && {
      threads: false,
      isolate: false,
      singleThread: true,
    }),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@src': path.resolve(__dirname, './src'),
      '@schemas': path.resolve(__dirname, './src/schemas'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
} as any)
