import { cleanup } from '@testing-library/react';

/**
 * Global registry for harness-scoped cleanup callbacks.
 * Tests can push reset handlers if they introduce additional global state.
 */
const resetHandlers: Array<() => void> = [];

export function registerHarnessReset(handler: () => void): void {
  resetHandlers.push(handler);
}

export function resetHarnessState(): void {
  // Execute in reverse order to respect potential dependency chains
  for (let i = resetHandlers.length - 1; i >= 0; i -= 1) {
    try {
      resetHandlers[i]!();
    } catch (error) {
      console.warn('Harness reset handler failed', error);
    }
  }

  resetHandlers.length = 0;
  cleanup();
}
