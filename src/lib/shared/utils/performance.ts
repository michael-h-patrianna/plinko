/**
 * Performance utility functions for UI optimization
 */

/**
 * Debounce function that delays execution until after a wait period of inactivity
 *
 * @description Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked. Useful for rate-limiting
 * expensive operations like API calls or re-renders.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced function with cleanup capability
 *
 * @example
 * ```ts
 * const debouncedSave = debounce((value) => saveToAPI(value), 500);
 * debouncedSave('new value'); // Will only execute after 500ms of no calls
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Throttle function that limits execution rate
 *
 * @description Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * Useful for scroll handlers, resize handlers, and other high-frequency events.
 *
 * @param func - The function to throttle
 * @param wait - The number of milliseconds to throttle invocations to
 * @returns Throttled function
 *
 * @example
 * ```ts
 * const throttledScroll = throttle(() => updateScrollPosition(), 100);
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastArgs: Parameters<T> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          executedFunction(...lastArgs);
          lastArgs = null;
        }
      }, wait);
    } else {
      lastArgs = args;
    }
  };
}
