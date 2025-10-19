import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetHarnessState } from './fixtures/harness';

// Mock canvas for JSDOM environment
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
  // Only mock if canvas is not already available (JSDOM doesn't implement it)
  if (!HTMLCanvasElement.prototype.getContext) {
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string) {
      if (contextId === '2d') {
        return {
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          getImageData: vi.fn(() => ({ data: [] })),
          putImageData: vi.fn(),
          createImageData: vi.fn(() => ({ data: [] })),
          setTransform: vi.fn(),
          drawImage: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          stroke: vi.fn(),
          translate: vi.fn(),
          scale: vi.fn(),
          rotate: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          measureText: vi.fn(() => ({ width: 0 })),
          transform: vi.fn(),
          rect: vi.fn(),
          clip: vi.fn(),
          createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          canvas: this,
        } as any;
      }
      return null;
    } as any;
  }
}

// Mock storage adapter to avoid localStorage dependency in Node environment
// Note: Tests that specifically test the storage adapter should call vi.unmock()
const mockStorage = new Map<string, string>();

vi.mock('@plinko/utils/platform/storage/index.web.ts', () => {
  return {
    storageAdapter: {
      getItem: vi.fn(async (key: string) => Promise.resolve(mockStorage.get(key) ?? null)),
      setItem: vi.fn(async (key: string, value: string) => {
        mockStorage.set(key, value);
        return Promise.resolve();
      }),
      removeItem: vi.fn(async (key: string) => {
        mockStorage.delete(key);
        return Promise.resolve();
      }),
      clear: vi.fn(async () => {
        mockStorage.clear();
        return Promise.resolve();
      }),
      getAllKeys: vi.fn(async () => Promise.resolve(Array.from(mockStorage.keys()))),
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

  if (
    typeof globalThis !== 'undefined' &&
    'gc' in globalThis &&
    typeof (globalThis as any).gc === 'function'
  ) {
     
    (globalThis as any).gc();
  }
});
