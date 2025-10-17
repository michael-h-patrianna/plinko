/**
 * Dimensions Platform Adapter - Web Implementation
 *
 * Modern implementation using:
 * - ResizeObserver for efficient resize detection (with fallback to resize events)
 * - window.innerWidth/innerHeight for current dimensions
 */

import type { DimensionsAdapter, DimensionsChangeListener, ViewportDimensions } from './types';
import { trackPlatformError } from '../../telemetry';

class WebDimensionsAdapter implements DimensionsAdapter {
  private resizeObserver: ResizeObserver | null = null;
  private readonly listeners = new Set<DimensionsChangeListener>();

  getWidth(): number {
    return globalThis.window.innerWidth;
  }

  getHeight(): number {
    return globalThis.window.innerHeight;
  }

  getDimensions(): ViewportDimensions {
    return {
      width: globalThis.window.innerWidth,
      height: globalThis.window.innerHeight,
    };
  }

  addChangeListener(listener: DimensionsChangeListener): () => void {
    this.listeners.add(listener);

    // Initialize ResizeObserver on first listener (lazy initialization)
    if (this.listeners.size === 1) {
      this.initializeObserver();
    }

    // Return cleanup function
    return () => {
      this.listeners.delete(listener);

      // Cleanup observer when no listeners remain
      if (this.listeners.size === 0) {
        this.cleanupObserver();
      }
    };
  }

  /**
   * Initialize ResizeObserver (modern approach) with fallback to resize events
   */
  private initializeObserver(): void {
    // Modern approach: Use ResizeObserver for more efficient resize detection
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        // ResizeObserver provides entry.contentRect, but for viewport we use window dimensions
        // This is more accurate for viewport-based layouts
        const dimensions = this.getDimensions();
        this.notifyListeners(dimensions);
      });

      // Observe the document.documentElement (html element) for viewport changes
      this.resizeObserver.observe(document.documentElement);
    } else {
      // Fallback: Use traditional resize event listener
      this.setupResizeEventFallback();
    }
  }

  /**
   * Fallback to traditional resize events (only when ResizeObserver unavailable)
   */
  private setupResizeEventFallback(): void {
    const handleResize = () => {
      const dimensions = this.getDimensions();
      this.notifyListeners(dimensions);
    };

    globalThis.window.addEventListener('resize', handleResize);

    // Store cleanup function with proper typing
    type CleanupFunction = () => void;
    (this as unknown as { _cleanupResize?: CleanupFunction })._cleanupResize = () => {
      globalThis.window.removeEventListener('resize', handleResize);
    };
  }

  /**
   * Notify all registered listeners of dimension changes
   */
  private notifyListeners(dimensions: ViewportDimensions): void {
    this.listeners.forEach((listener) => {
      try {
        listener(dimensions);
      } catch (error) {
        // Prevent one listener error from breaking others
        // Track error via telemetry for production debugging
        trackPlatformError({
          adapter: 'dimensions',
          operation: 'notifyListeners',
          error: error instanceof Error ? error.message : String(error),
          context: { dimensions, listenerCount: this.listeners.size },
        });

        // Also log to console in development for immediate visibility
        if (import.meta.env.DEV) {
          console.error('Error in dimension change listener:', error);
        }
      }
    });
  }

  /**
   * Cleanup observer and event listeners
   */
  private cleanupObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Cleanup fallback resize listener if it exists
    type CleanupFunction = () => void;
    const thisWithCleanup = this as unknown as { _cleanupResize?: CleanupFunction };
    if (thisWithCleanup._cleanupResize) {
      thisWithCleanup._cleanupResize();
      delete thisWithCleanup._cleanupResize;
    }
  }
}

export const dimensionsAdapter: DimensionsAdapter = new WebDimensionsAdapter();
