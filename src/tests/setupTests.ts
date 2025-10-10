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

  // Force garbage collection if running with --expose-gc flag
  // This helps prevent memory accumulation in long test runs
  // Run tests with: node --expose-gc ./node_modules/.bin/vitest
  // Type assertion for gc which is available with --expose-gc
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  if (typeof globalThis !== 'undefined' && 'gc' in globalThis && typeof (globalThis as any).gc === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    (globalThis as any).gc();
  }
});
