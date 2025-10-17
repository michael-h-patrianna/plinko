import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetHarnessState } from './fixtures/harness';

// Mock storage adapter to avoid localStorage dependency in Node environment
// Note: Tests that specifically test the storage adapter should call vi.unmock()
const mockStorage = new Map<string, string>();

vi.mock('@plinko/utils/platform/storage/index.web.ts', () => {
  return {
    storageAdapter: {
      getItem: vi.fn(async (key: string) => mockStorage.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        mockStorage.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        mockStorage.delete(key);
      }),
      clear: vi.fn(async () => {
        mockStorage.clear();
      }),
      getAllKeys: vi.fn(async () => Array.from(mockStorage.keys())),
    },
  };
});

// Mock matchMedia for animation drivers, theme tests, and device detection
// This MUST return a proper MediaQueryList object, never undefined
const mockMatchMedia = (query: string) => {
  const mediaQueryList = {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  return mediaQueryList;
};

// Set matchMedia on global object (for Node environment)
global.matchMedia = mockMatchMedia as any;

// Also set on window if it exists (JSDOM environment)
if (typeof window !== 'undefined') {
  window.matchMedia = mockMatchMedia as any;
}

// Ensure globalThis.window also has matchMedia if it exists
if (typeof globalThis !== 'undefined' && globalThis.window) {
  globalThis.window.matchMedia = mockMatchMedia as any;
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
  if (
    typeof globalThis !== 'undefined' &&
    'gc' in globalThis &&
    typeof (globalThis as any).gc === 'function'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    (globalThis as any).gc();
  }
});
