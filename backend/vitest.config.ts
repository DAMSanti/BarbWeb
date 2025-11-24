import { defineConfig } from 'vitest/config'
import path from 'path'

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
      lines: 70,      // Target 70% line coverage
      functions: 70,  // Target 70% function coverage
      branches: 60,   // Target 60% branch coverage
      statements: 70, // Target 70% statement coverage
      
      // CI-specific options
      ...(isCI && {
        all: true,
        skip: [],
      }),
    },

    // Timeout for tests
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],

    // Global test utilities
    globals: true,

    // Include patterns
    include: ['tests/**/*.test.ts'],
    
    // CI-specific settings
    ...(isCI && {
      // Disable parallelization in CI for stability
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
})
