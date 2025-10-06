/**
 * Performance Platform Adapter - React Native Implementation
 *
 * Uses Date.now() or performance.now() polyfill for timing
 *
 * NOTE: React Native has a performance.now() polyfill, but mark()/measure()
 * APIs are not available. This implementation provides a fallback using Date.now()
 */

import { warnPlatformSpecific } from '../detect';
import type { PerformanceAdapter } from './types';

class NativePerformanceAdapter implements PerformanceAdapter {
  private marks: Map<string, number> = new Map();
  private warnedAboutMemory = false;

  now(): number {
    // React Native polyfills performance.now()
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    // Fallback to Date.now()
    return Date.now();
  }

  mark(name: string): void {
    this.marks.set(name, this.now());
  }

  measure(_name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark);

    if (!startTime) {
      console.warn(`[Performance] Start mark "${startMark}" not found`);
      return 0;
    }

    let endTime: number;
    if (endMark) {
      const markTime = this.marks.get(endMark);
      if (!markTime) {
        console.warn(`[Performance] End mark "${endMark}" not found`);
        return 0;
      }
      endTime = markTime;
    } else {
      endTime = this.now();
    }

    const duration = endTime - startTime;
    return duration;
  }

  clearMarks(): void {
    this.marks.clear();
  }

  getMemoryInfo(): { usedJSHeapSize?: number; totalJSHeapSize?: number } | null {
    // Memory info not available in React Native
    if (!this.warnedAboutMemory) {
      warnPlatformSpecific('Memory info is not available in React Native');
      this.warnedAboutMemory = true;
    }
    return null;
  }
}

export const performanceAdapter: PerformanceAdapter = new NativePerformanceAdapter();

/**
 * IMPLEMENTATION NOTES FOR REACT NATIVE:
 *
 * Performance Monitoring Libraries:
 * ---------------------------------
 * For production apps, consider using dedicated performance monitoring:
 *
 * 1. react-native-performance (Recommended)
 *    npm install react-native-performance
 *    Provides performance.mark() and performance.measure() polyfills
 *
 * 2. Flipper Performance Plugin
 *    Built into Flipper debugger
 *    Provides real-time performance metrics
 *
 * 3. React Native Performance Monitor
 *    Press Cmd+D (iOS) or Cmd+M (Android) → Show Perf Monitor
 *    Shows FPS, JS frame rate, and UI frame rate
 *
 * 4. Firebase Performance Monitoring
 *    npm install @react-native-firebase/perf
 *    Production-grade performance monitoring
 *
 * Memory Profiling:
 * ----------------
 * - Use Hermes engine for better memory management
 * - Use Flipper's Memory Inspector
 * - Profile with Xcode Instruments (iOS) or Android Profiler
 */
