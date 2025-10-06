/**
 * Performance Platform Adapter - Web Implementation
 *
 * Uses the Performance API (performance.now(), performance.mark(), etc.)
 */

import type { PerformanceAdapter } from './types';

class WebPerformanceAdapter implements PerformanceAdapter {
  now(): number {
    return performance.now();
  }

  mark(name: string): void {
    try {
      performance.mark(name);
    } catch (error) {
      // Fallback for environments where mark() is not supported
      console.warn('[Performance] mark() not supported:', error);
    }
  }

  measure(name: string, startMark: string, endMark?: string): number {
    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }

      const entries = performance.getEntriesByName(name, 'measure');
      const lastEntry = entries[entries.length - 1];
      return lastEntry?.duration ?? 0;
    } catch (error) {
      console.warn('[Performance] measure() failed:', error);
      // Fallback: calculate manually if marks exist
      const startEntries = performance.getEntriesByName(startMark, 'mark');
      const startEntry = startEntries[startEntries.length - 1];

      if (startEntry) {
        if (endMark) {
          const endEntries = performance.getEntriesByName(endMark, 'mark');
          const endEntry = endEntries[endEntries.length - 1];
          if (endEntry) {
            return endEntry.startTime - startEntry.startTime;
          }
        }
        return performance.now() - startEntry.startTime;
      }

      return 0;
    }
  }

  clearMarks(): void {
    try {
      performance.clearMarks();
      performance.clearMeasures();
    } catch (error) {
      console.warn('[Performance] clearMarks() not supported:', error);
    }
  }

  getMemoryInfo(): { usedJSHeapSize?: number; totalJSHeapSize?: number } | null {
    // Chrome-specific memory info
    const perfWithMemory = performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };

    if (perfWithMemory.memory) {
      return {
        usedJSHeapSize: perfWithMemory.memory.usedJSHeapSize,
        totalJSHeapSize: perfWithMemory.memory.totalJSHeapSize,
      };
    }

    return null;
  }
}

export const performanceAdapter: PerformanceAdapter = new WebPerformanceAdapter();
