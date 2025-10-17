/**
 * Async utilities with proper cleanup and cancellation support
 */

export interface AsyncOperationOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  retries?: number;
  retryDelayMs?: number;
}

/**
 * Execute async operation with timeout and optional retry logic
 * Uses AbortController for proper cleanup - no dangling timers
 */
export async function executeWithTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: AsyncOperationOptions = {}
): Promise<T> {
  const { timeoutMs, signal: externalSignal, retries = 0, retryDelayMs = 1000 } = options;

  // Combine external signal with internal timeout signal
  const abortController = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  // Listen to external abort signal
  if (externalSignal) {
    if (externalSignal.aborted) {
      throw new Error('Operation aborted before start');
    }
    externalSignal.addEventListener('abort', () => abortController.abort());
  }

  try {
    // Set up timeout if specified
    if (timeoutMs) {
      timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeoutMs);
    }

    // Execute with retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Check if already aborted
        if (abortController.signal.aborted) {
          throw new Error('Operation aborted');
        }

        const result = await operation(abortController.signal);

        // Success - clear timeout and return
        if (timeoutId) clearTimeout(timeoutId);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry if aborted or on last attempt
        if (abortController.signal.aborted || attempt === retries) {
          throw lastError;
        }

        // Wait before retry (with exponential backoff)
        const delay = retryDelayMs * (attempt + 1);
        await new Promise<void>((resolve, reject) => {
          const retryTimeoutId = setTimeout(resolve, delay);

          // Cancel retry wait if aborted
          abortController.signal.addEventListener('abort', () => {
            clearTimeout(retryTimeoutId);
            reject(new Error('Operation aborted during retry wait'));
          });
        });
      }
    }

    throw lastError || new Error('Operation failed');
  } finally {
    // Always clean up timeout
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Create a Promise that can be aborted via AbortSignal
 */
export function abortablePromise<T>(
  executor: (resolve: (value: T) => void, reject: (reason?: Error) => void, signal: AbortSignal) => void,
  signal?: AbortSignal
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Operation aborted'));
      return;
    }

    const abortHandler = () => reject(new Error('Operation aborted'));
    signal?.addEventListener('abort', abortHandler);

    try {
      executor(
        (value) => {
          signal?.removeEventListener('abort', abortHandler);
          resolve(value);
        },
        (reason) => {
          signal?.removeEventListener('abort', abortHandler);
          reject(reason instanceof Error ? reason : new Error(String(reason)));
        },
        signal || new AbortController().signal
      );
    } catch (error) {
      signal?.removeEventListener('abort', abortHandler);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
