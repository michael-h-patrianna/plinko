/**
 * Performance Budgets and Monitoring
 *
 * Defines performance thresholds and provides monitoring utilities
 * to ensure the application meets performance targets.
 */

import { telemetry } from './telemetry';

// ============================================================================
// PERFORMANCE BUDGETS
// ============================================================================

/**
 * Performance budget thresholds (in milliseconds)
 */
export const PERFORMANCE_BUDGETS = {
  /** Target frame time for 60 FPS (16.67ms) */
  FRAME_TIME_60FPS: 16.67,

  /** Warning threshold for frame time (13ms - leaves 3ms margin) */
  FRAME_TIME_WARNING: 13,

  /** Maximum acceptable frame time before dropping frames */
  FRAME_TIME_MAX: 20,

  /** Physics simulation should complete within this time */
  PHYSICS_SIMULATION_MAX: 50,

  /** State transition should complete within this time */
  STATE_TRANSITION_MAX: 5,

  /** Animation transition should complete within this time */
  ANIMATION_TRANSITION_MAX: 10,

  /** Component render should complete within this time */
  COMPONENT_RENDER_MAX: 10,

  /** Total interaction response time (perceived as instant) */
  INTERACTION_RESPONSE_MAX: 100,

  /** First Contentful Paint target */
  FCP_TARGET: 1800,

  /** Largest Contentful Paint target */
  LCP_TARGET: 2500,

  /** Time to Interactive target */
  TTI_TARGET: 3800,

  /** Cumulative Layout Shift threshold */
  CLS_THRESHOLD: 0.1,
} as const;

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration?: number;
  budget: number;
}

class PerformanceMonitor {
  private entries: Map<string, PerformanceEntry> = new Map();
  private violations: Array<{ name: string; duration: number; budget: number }> = [];

  /**
   * Start tracking a performance metric
   */
  start(name: string, budget: number): void {
    this.entries.set(name, {
      name,
      startTime: performance.now(),
      budget,
    });
  }

  /**
   * End tracking and check against budget
   */
  end(name: string): number {
    const entry = this.entries.get(name);
    if (!entry) {
      console.warn(`Performance entry "${name}" not found`);
      return 0;
    }

    const duration = performance.now() - entry.startTime;
    entry.duration = duration;

    // Check budget violation
    if (duration > entry.budget) {
      this.violations.push({
        name,
        duration,
        budget: entry.budget,
      });

      // Warn in development
      if (import.meta.env.DEV) {
        console.warn(
          `⚠️ Performance budget exceeded: ${name} took ${duration.toFixed(2)}ms (budget: ${entry.budget}ms)`
        );
      }

      // Track in telemetry
      telemetry.track({
        type: 'perf.animation_lag',
        data: {
          expectedDuration: entry.budget,
          actualDuration: duration,
          lagAmount: duration - entry.budget,
        },
      });
    }

    this.entries.delete(name);
    return duration;
  }

  /**
   * Measure a synchronous operation
   */
  measure<T>(name: string, budget: number, fn: () => T): T {
    this.start(name, budget);
    const result = fn();
    this.end(name);
    return result;
  }

  /**
   * Measure an async operation
   */
  async measureAsync<T>(name: string, budget: number, fn: () => Promise<T>): Promise<T> {
    this.start(name, budget);
    const result = await fn();
    this.end(name);
    return result;
  }

  /**
   * Get all budget violations
   */
  getViolations(): Array<{ name: string; duration: number; budget: number }> {
    return [...this.violations];
  }

  /**
   * Clear violations
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalViolations: number;
    avgOverage: number;
    worstViolation: { name: string; duration: number; budget: number } | null;
  } {
    if (this.violations.length === 0) {
      return {
        totalViolations: 0,
        avgOverage: 0,
        worstViolation: null,
      };
    }

    const totalOverage = this.violations.reduce(
      (sum, v) => sum + (v.duration - v.budget),
      0
    );

    const worstViolation = this.violations.reduce((worst, current) => {
      const currentOverage = current.duration - current.budget;
      const worstOverage = worst.duration - worst.budget;
      return currentOverage > worstOverage ? current : worst;
    });

    return {
      totalViolations: this.violations.length,
      avgOverage: totalOverage / this.violations.length,
      worstViolation,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// FRAME RATE MONITOR
// ============================================================================

class FrameRateMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private droppedFrames = 0;

  /**
   * Call this every frame to track FPS
   */
  tick(): void {
    const now = performance.now();
    const delta = now - this.lastTime;

    this.frameCount++;

    // Update FPS every second
    if (delta >= 1000) {
      this.fps = (this.frameCount * 1000) / delta;
      this.frameCount = 0;
      this.lastTime = now;

      // Track dropped frames
      if (delta > PERFORMANCE_BUDGETS.FRAME_TIME_MAX) {
        this.droppedFrames++;

        telemetry.track({
          type: 'perf.render_frame',
          data: {
            frameDuration: delta,
            frameNumber: this.frameCount,
            droppedFrames: this.droppedFrames,
          },
        });
      }
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Get dropped frame count
   */
  getDroppedFrames(): number {
    return this.droppedFrames;
  }

  /**
   * Reset counters
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.droppedFrames = 0;
  }
}

export const frameRateMonitor = new FrameRateMonitor();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Measure animation frame performance
 */
export function measureFrame(callback: () => void): void {
  const start = performance.now();
  callback();
  const duration = performance.now() - start;

  if (duration > PERFORMANCE_BUDGETS.FRAME_TIME_WARNING) {
    console.warn(`Frame took ${duration.toFixed(2)}ms (target: ${PERFORMANCE_BUDGETS.FRAME_TIME_60FPS}ms)`);

    telemetry.track({
      type: 'perf.render_frame',
      data: {
        frameDuration: duration,
        frameNumber: frameRateMonitor.getFPS(),
      },
    });
  }

  frameRateMonitor.tick();
}

/**
 * Measure physics simulation performance
 */
export function measurePhysics<T>(name: string, fn: () => T): T {
  return performanceMonitor.measure(
    `physics:${name}`,
    PERFORMANCE_BUDGETS.PHYSICS_SIMULATION_MAX,
    fn
  );
}

/**
 * Measure state transition performance
 */
export function measureStateTransition<T>(name: string, fn: () => T): T {
  return performanceMonitor.measure(
    `state:${name}`,
    PERFORMANCE_BUDGETS.STATE_TRANSITION_MAX,
    fn
  );
}

/**
 * Measure animation performance
 */
export function measureAnimation<T>(name: string, fn: () => T): T {
  return performanceMonitor.measure(
    `animation:${name}`,
    PERFORMANCE_BUDGETS.ANIMATION_TRANSITION_MAX,
    fn
  );
}

/**
 * Measure component render performance
 */
export function measureRender<T>(componentName: string, fn: () => T): T {
  return performanceMonitor.measure(
    `render:${componentName}`,
    PERFORMANCE_BUDGETS.COMPONENT_RENDER_MAX,
    fn
  );
}

/**
 * Check if performance is within acceptable range
 */
export function isPerformanceAcceptable(): boolean {
  const summary = performanceMonitor.getSummary();
  const fps = frameRateMonitor.getFPS();

  return (
    summary.totalViolations === 0 &&
    fps >= 55 && // Allow some margin below 60 FPS
    frameRateMonitor.getDroppedFrames() === 0
  );
}

/**
 * Get performance report
 */
export function getPerformanceReport(): {
  fps: number;
  droppedFrames: number;
  budgetViolations: number;
  worstViolation: { name: string; duration: number; budget: number } | null;
} {
  const summary = performanceMonitor.getSummary();

  return {
    fps: frameRateMonitor.getFPS(),
    droppedFrames: frameRateMonitor.getDroppedFrames(),
    budgetViolations: summary.totalViolations,
    worstViolation: summary.worstViolation,
  };
}
