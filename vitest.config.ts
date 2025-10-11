import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@game': path.resolve(__dirname, './src/game'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config'),
      '@theme': path.resolve(__dirname, './src/theme'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@components': path.resolve(__dirname, './src/components'),
      '@audio': path.resolve(__dirname, './src/audio'),
      '@animation': path.resolve(__dirname, './src/animation'),
    },
  },
  test: {
    globals: true,
    // Use lightweight Node.js environment by default
    // Only component/integration tests will use JSDOM (via environmentMatchGlobs)
    environment: 'node',
    // Environment-specific configuration - only load JSDOM where needed
    // This reduces memory overhead from ~200MB per worker to ~20MB for physics tests
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],              // Component tests need DOM
      ['**/integration/**/*.test.ts', 'jsdom'], // Integration tests need DOM
      ['**/components/**/*.test.ts', 'jsdom'],  // Component unit tests need DOM
      // All other tests (physics, utils, game logic) use Node.js environment
    ],
    setupFiles: './src/tests/setupTests.ts',
    testTimeout: 20000,
    // Worker configuration to prevent memory exhaustion
    // Limit concurrent workers to prevent spawning 13 processes (one per CPU core)
    maxWorkers: 4,  // Maximum 4 concurrent test workers (down from 13)
    minWorkers: 1,  // Start with 1 worker, scale up as needed
    // Use threads pool instead of forks for better memory sharing
    pool: 'threads',
    poolOptions: {
      threads: {
        // Single thread mode for heavy physics tests to prevent memory spikes
        // Can be overridden with --pool=forks for faster CI builds if needed
        singleThread: false,  // Allow parallelism within limit
        // Isolate tests to prevent state leakage
        isolate: true,
      },
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/tests/**',
        '!src/main.tsx',
      ],
      exclude: [
        'src/game/types.ts',
        'src/theme/types.ts',
        'src/config/theme.ts',
        '**/node_modules/**',
        '**/dist/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
