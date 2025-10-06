import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetHarnessState } from './fixtures/harness';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.resetModules();
  resetHarnessState();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});
