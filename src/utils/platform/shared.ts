/**
 * Shared Platform Adapter Utilities
 *
 * Common helpers and error handling for platform-specific implementations
 */

import { telemetry } from '../telemetry';

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Standard error handler for platform adapter operations
 */
export function handlePlatformError(
  operation: string,
  error: unknown,
  options: {
    /** Whether to rethrow the error */
    rethrow?: boolean;
    /** Default value to return on error */
    defaultValue?: unknown;
    /** Additional context for telemetry */
    context?: Record<string, unknown>;
  } = {}
): unknown {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Log to console
  console.error(`[Platform:${operation}] Error:`, errorMessage);

  // Track in telemetry
  telemetry.track({
    type: 'error.physics_violation',
    data: {
      violationType: 'escape',
      details: {
        operation,
        error: errorMessage,
        ...options.context,
      },
    },
  });

  // Rethrow or return default
  if (options.rethrow) {
    throw error;
  }

  return options.defaultValue;
}

/**
 * Async operation wrapper with error handling
 */
export async function withErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>,
  options: {
    defaultValue?: T;
    rethrow?: boolean;
    context?: Record<string, unknown>;
  } = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    return handlePlatformError(operation, error, options) as T;
  }
}

/**
 * Sync operation wrapper with error handling
 */
export function withErrorHandlingSync<T>(
  operation: string,
  fn: () => T,
  options: {
    defaultValue?: T;
    rethrow?: boolean;
    context?: Record<string, unknown>;
  } = {}
): T {
  try {
    return fn();
  } catch (error) {
    return handlePlatformError(operation, error, options) as T;
  }
}

// ============================================================================
// ADAPTER BASE CLASS
// ============================================================================

/**
 * Base class for platform adapters with common functionality
 */
export abstract class PlatformAdapter {
  protected readonly adapterName: string;

  constructor(adapterName: string) {
    this.adapterName = adapterName;
  }

  /**
   * Handle adapter operation errors consistently
   */
  protected handleError<T>(
    operation: string,
    error: unknown,
    options: {
      defaultValue?: T;
      rethrow?: boolean;
    } = {}
  ): T {
    return handlePlatformError(operation, error, {
      ...options,
      context: { adapter: this.adapterName },
    }) as T;
  }

  /**
   * Execute async operation with error handling
   */
  protected async executeAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    options: {
      defaultValue?: T;
      rethrow?: boolean;
    } = {}
  ): Promise<T> {
    return withErrorHandling(`${this.adapterName}.${operation}`, fn, options);
  }

  /**
   * Execute sync operation with error handling
   */
  protected executeSync<T>(
    operation: string,
    fn: () => T,
    options: {
      defaultValue?: T;
      rethrow?: boolean;
    } = {}
  ): T {
    return withErrorHandlingSync(`${this.adapterName}.${operation}`, fn, options);
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that a value is not null/undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  name: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`${name} is required but was ${String(value)}`);
  }
}

/**
 * Validate platform API availability
 */
export function assertPlatformAPI(
  api: unknown,
  apiName: string,
  platform: 'web' | 'native'
): void {
  if (!api) {
    throw new Error(
      `${apiName} is not available on ${platform}. This may indicate a platform detection issue.`
    );
  }
}

// ============================================================================
// FEATURE DETECTION
// ============================================================================

/**
 * Check if a feature is available
 */
export function hasFeature(feature: string): boolean {
  switch (feature) {
    case 'localStorage':
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    case 'crypto':
      return typeof window !== 'undefined' && typeof window.crypto !== 'undefined';
    case 'performance':
      return typeof performance !== 'undefined';
    case 'requestAnimationFrame':
      return typeof requestAnimationFrame !== 'undefined';
    default:
      return false;
  }
}

/**
 * Get feature or throw error
 */
export function requireFeature<T>(
  feature: string,
  getter: () => T
): T {
  if (!hasFeature(feature)) {
    throw new Error(`Required feature "${feature}" is not available on this platform`);
  }
  return getter();
}

// ============================================================================
// ASYNC HELPERS
// ============================================================================

/**
 * Convert callback-based API to Promise
 */
export function promisify<T>(
  fn: (callback: (error: Error | null, result?: T) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result as T);
      }
    });
  });
}

/**
 * Add timeout to a promise with proper cleanup
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Operation "${operation}" timed out after ${timeoutMs}ms`)),
      timeoutMs
    );
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise
  ]);
}

// ============================================================================
// MEMOIZATION
// ============================================================================

/**
 * Memoize platform detection results
 */
const memoCache = new Map<string, unknown>();

export function memoize<T>(key: string, fn: () => T): T {
  if (memoCache.has(key)) {
    return memoCache.get(key) as T;
  }
  const result = fn();
  memoCache.set(key, result);
  return result;
}

/**
 * Clear memoization cache (useful for testing)
 */
export function clearMemoCache(): void {
  memoCache.clear();
}
