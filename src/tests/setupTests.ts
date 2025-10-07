import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { resetHarnessState } from './fixtures/harness';

// Type declaration for global.gc
declare global {
  var gc: (() => void) | undefined;
}

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
  if (typeof globalThis !== 'undefined' && 'gc' in globalThis && typeof globalThis.gc === 'function') {
    globalThis.gc();
  }
});
