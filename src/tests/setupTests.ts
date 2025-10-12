import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { resetHarnessState } from './fixtures/harness';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.resetModules();
  resetHarnessState();
});

afterEach(() => {
  // Clean up timers
  vi.clearAllTimers();
  vi.useRealTimers();

  // Clean up React Testing Library state (DOM nodes, event listeners)
  cleanup();

  /**
   * JUSTIFIED 'any' USAGE: Force garbage collection if running with --expose-gc flag
   *
   * The global `gc()` function is only available when Node.js is run with the
   * --expose-gc flag. It's not part of standard TypeScript types.
   *
   * This helps prevent memory accumulation in long test runs.
   * Run tests with: node --expose-gc ./node_modules/.bin/vitest
   *
   * Using 'any' is necessary because:
   * 1. TypeScript has no type definition for the Node.js gc() API
   * 2. The property only exists in special Node.js runtime mode
   * 3. This is a test-only optimization, not production code
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  if (typeof globalThis !== 'undefined' && 'gc' in globalThis && typeof (globalThis as any).gc === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    (globalThis as any).gc();
  }
});
