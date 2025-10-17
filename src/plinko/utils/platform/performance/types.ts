/**
 * Performance Platform Adapter Types
 *
 * Provides high-resolution timing for performance monitoring
 * across web and React Native platforms
 */

export interface PerformanceMark {
  name: string;
  startTime: number;
}

export interface PerformanceMeasure {
  name: string;
  startTime: number;
  duration: number;
}

export interface PerformanceAdapter {
  /**
   * Gets current high-resolution timestamp
   * Monotonic clock, suitable for measuring durations
   *
   * @returns Current timestamp in milliseconds (high precision)
   */
  now(): number;

  /**
   * Creates a named performance mark at the current time
   *
   * @param name - Name for the performance mark
   */
  mark(name: string): void;

  /**
   * Measures duration between two performance marks
   *
   * @param name - Name for the measurement
   * @param startMark - Start mark name
   * @param endMark - End mark name (optional, defaults to now)
   * @returns The measured duration in milliseconds
   */
  measure(name: string, startMark: string, endMark?: string): number;

  /**
   * Clears all performance marks and measures
   */
  clearMarks(): void;

  /**
   * Gets memory usage information (if available)
   *
   * @returns Memory info object or null if not available
   */
  getMemoryInfo(): { usedJSHeapSize?: number; totalJSHeapSize?: number } | null;
}
