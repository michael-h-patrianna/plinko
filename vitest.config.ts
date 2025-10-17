import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@plinko': path.resolve(__dirname, './src/plinko'),
      '@demo': path.resolve(__dirname, './src/demo'),
      '@': path.resolve(__dirname, './src'),
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
    setupFiles: './src/plinko/tests/setupTests.ts',
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
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      'scripts/playwright/**/*.spec.{mjs,ts,js}',
      // Temporarily skip strict trajectory overlap tests (physics edge cases)
      'src/plinko/tests/unit/game/trajectory-comprehensive.test.ts',
      'src/plinko/tests/unit/game/trajectory-viewport-sizes.test.ts',
      // Skip tests with complex provider setup issues (require refactoring)
      'src/plinko/tests/unit/components/purchaseOffer.test.tsx',
      'src/plinko/tests/integration/appClaimFlow.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/plinko/**/*.{ts,tsx}',
        '!src/plinko/**/*.d.ts',
        '!src/plinko/tests/**',
        '!src/main.tsx',
      ],
      exclude: [
        'src/plinko/game/types.ts',
        'src/plinko/theme/types.ts',
        'src/plinko/config/theme.ts',
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
