/**
 * SSR-safe timing utilities
 * Provides performance.now() alternative that works in all environments
 */

/**
 * Get high-resolution timestamp in milliseconds
 * Falls back to Date.now() in environments without performance.now()
 */
export function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/**
 * Measure execution time of a function
 */
export function measureTime<T>(fn: () => T): { result: T; duration: number } {
  const start = now();
  const result = fn();
  const duration = now() - start;
  return { result, duration };
}

/**
 * Async version of measureTime
 */
export async function measureTimeAsync<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = now();
  const result = await fn();
  const duration = now() - start;
  return { result, duration };
}
