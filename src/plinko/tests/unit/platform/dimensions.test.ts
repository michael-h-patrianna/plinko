/**
 * Unit tests for modern dimensionsAdapter implementation
 * Tests ResizeObserver, fallback to resize events, and listener management
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Dimensions Adapter (Web)', () => {
  let resizeObserverCallback: ResizeObserverCallback | null = null;
  let observedElements: Element[] = [];

  beforeEach(() => {
    // Reset state
    resizeObserverCallback = null;
    observedElements = [];

    // Mock ResizeObserver
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = vi.fn((callback: ResizeObserverCallback) => {
      resizeObserverCallback = callback;
      return {
        observe: vi.fn((element: Element) => {
          observedElements.push(element);
        }),
        unobserve: vi.fn((element: Element) => {
          observedElements = observedElements.filter((el) => el !== element);
        }),
        disconnect: vi.fn(() => {
          observedElements = [];
          resizeObserverCallback = null;
        }),
      };
    });

    // Mock window dimensions
    Object.defineProperty(globalThis, 'innerWidth', { writable: true, configurable: true, value: 1920 });
    Object.defineProperty(globalThis, 'innerHeight', { writable: true, configurable: true, value: 1080 });

    vi.spyOn(globalThis.window, 'addEventListener');
    vi.spyOn(globalThis.window, 'removeEventListener');

    // Reset modules to get fresh adapter instance
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Modern API - ResizeObserver', () => {
    it('should use ResizeObserver for dimension changes', async () => {
      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener = vi.fn();
      const cleanup = dimensionsAdapter.addChangeListener(listener);

      // Verify ResizeObserver was created and observing
      type WindowWithMockRO1 = { ResizeObserver: { toHaveBeenCalledTimes: (n: number) => void } };
      expect((globalThis.window as unknown as WindowWithMockRO1).ResizeObserver).toHaveBeenCalledTimes(1);
      expect(observedElements).toHaveLength(1);
      expect(observedElements[0]).toBe(document.documentElement);

      cleanup();
    });

    it('should notify listeners on ResizeObserver callback', async () => {
      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener = vi.fn();
      dimensionsAdapter.addChangeListener(listener);

      // Simulate ResizeObserver callback
      if (resizeObserverCallback) {
        resizeObserverCallback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
      }

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        width: 1920,
        height: 1080,
      });
    });

    it('should lazy initialize ResizeObserver on first listener', async () => {
      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      // No observer created yet
      type WindowWithMockRO2 = { ResizeObserver: { toHaveBeenCalledTimes: (n: number) => void; not: { toHaveBeenCalled: () => void } } };
      expect((globalThis.window as unknown as WindowWithMockRO2).ResizeObserver).not.toHaveBeenCalled();

      const listener1 = vi.fn();
      dimensionsAdapter.addChangeListener(listener1);

      // Observer created on first listener
      expect((globalThis.window as unknown as WindowWithMockRO2).ResizeObserver).toHaveBeenCalledTimes(1);

      const listener2 = vi.fn();
      dimensionsAdapter.addChangeListener(listener2);

      // Still only one observer
      expect((globalThis.window as unknown as WindowWithMockRO2).ResizeObserver).toHaveBeenCalledTimes(1);
    });

    it('should cleanup ResizeObserver when all listeners removed', async () => {
      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const cleanup1 = dimensionsAdapter.addChangeListener(listener1);
      const cleanup2 = dimensionsAdapter.addChangeListener(listener2);

      // Get the observer instance
      type MockedResizeObserver = { mock: { results: Array<{ value: { disconnect: () => void } }> } };
      const ResizeObserverMock = (globalThis.window as unknown as { ResizeObserver: MockedResizeObserver }).ResizeObserver;
      const observerInstance = ResizeObserverMock.mock.results[0]?.value;

      // Remove first listener - observer should still exist
      cleanup1();
      expect(observerInstance?.disconnect).not.toHaveBeenCalled();

      // Remove second listener - observer should be disconnected
      cleanup2();
      expect(observerInstance?.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should notify all registered listeners', async () => {
      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      dimensionsAdapter.addChangeListener(listener1);
      dimensionsAdapter.addChangeListener(listener2);
      dimensionsAdapter.addChangeListener(listener3);

      // Trigger resize
      if (resizeObserverCallback) {
        resizeObserverCallback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
      }

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it('should handle listener errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const successListener = vi.fn();

      dimensionsAdapter.addChangeListener(errorListener);
      dimensionsAdapter.addChangeListener(successListener);

      // Trigger resize
      if (resizeObserverCallback) {
        resizeObserverCallback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
      }

      // Error listener threw, but success listener should still be called
      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(successListener).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Fallback - Resize Events', () => {
    it('should fallback to window resize events when ResizeObserver unavailable', async () => {
      // Remove ResizeObserver
      (globalThis.window as unknown as { ResizeObserver?: unknown }).ResizeObserver = undefined;

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener = vi.fn();
      dimensionsAdapter.addChangeListener(listener);

      // Should have added resize event listener
      expect(globalThis.window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should cleanup resize event listener when using fallback', async () => {
      (globalThis.window as unknown as { ResizeObserver?: unknown }).ResizeObserver = undefined;

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener = vi.fn();
      const cleanup = dimensionsAdapter.addChangeListener(listener);

      // Cleanup should remove event listener
      cleanup();

      expect(globalThis.window.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    it('should notify listeners on resize event in fallback mode', async () => {
      (globalThis.window  as unknown as { ResizeObserver?: unknown }).ResizeObserver = undefined;

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener = vi.fn();
      dimensionsAdapter.addChangeListener(listener);

      // Change window dimensions
      Object.defineProperty(globalThis.window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
      Object.defineProperty(globalThis.window, 'innerHeight', { writable: true, configurable: true, value: 768 });

      // Manually trigger the resize event
      const resizeEvent = new Event('resize');
      globalThis.window.dispatchEvent(resizeEvent);

      expect(listener).toHaveBeenCalledWith({
        width: 1024,
        height: 768,
      });
    });
  });

  describe('Dimension Getters', () => {
    it('should return current width', async () => {
      globalThis.window.innerWidth = 1366;

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      expect(dimensionsAdapter.getWidth()).toBe(1366);
    });

    it('should return current height', async () => {
      globalThis.window.innerHeight = 768;

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      expect(dimensionsAdapter.getHeight()).toBe(768);
    });

    it('should return both dimensions', async () => {
      globalThis.window.innerWidth = 1920;
      globalThis.window.innerHeight = 1080;

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      expect(dimensionsAdapter.getDimensions()).toEqual({
        width: 1920,
        height: 1080,
      });
    });

    it('should return updated dimensions after window resize', async () => {
      globalThis.window.innerWidth = 1920;
      globalThis.window.innerHeight = 1080;

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      expect(dimensionsAdapter.getDimensions()).toEqual({
        width: 1920,
        height: 1080,
      });

      // Simulate resize
      globalThis.window.innerWidth = 1024;
      globalThis.window.innerHeight = 768;

      expect(dimensionsAdapter.getDimensions()).toEqual({
        width: 1024,
        height: 768,
      });
    });
  });

  describe('Listener Management', () => {
    it('should return cleanup function when adding listener', async () => {
      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener = vi.fn();
      const cleanup = dimensionsAdapter.addChangeListener(listener);

      expect(typeof cleanup).toBe('function');
    });

    it('should remove specific listener when cleanup called', async () => {
      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const cleanup1 = dimensionsAdapter.addChangeListener(listener1);
      dimensionsAdapter.addChangeListener(listener2);

      // Trigger resize
      if (resizeObserverCallback) {
        resizeObserverCallback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
      }

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      // Remove listener1
      cleanup1();
      listener1.mockClear();
      listener2.mockClear();

      // Trigger resize again
      if (resizeObserverCallback) {
        resizeObserverCallback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
      }

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should allow same listener to be added multiple times', async () => {
      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener = vi.fn();

      // Add same listener twice (Set should deduplicate, but that's implementation detail)
      dimensionsAdapter.addChangeListener(listener);
      dimensionsAdapter.addChangeListener(listener);

      // Trigger resize
      if (resizeObserverCallback) {
        resizeObserverCallback([] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
      }

      // Set deduplication means it's only called once
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should handle cleanup being called multiple times', async () => {
      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      const listener = vi.fn();
      const cleanup = dimensionsAdapter.addChangeListener(listener);

      // Call cleanup multiple times - should be idempotent
      expect(() => {
        cleanup();
        cleanup();
        cleanup();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero dimensions', async () => {
      globalThis.window.innerWidth = 0;
      globalThis.window.innerHeight = 0;

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      expect(dimensionsAdapter.getDimensions()).toEqual({
        width: 0,
        height: 0,
      });
    });

    it('should handle very large dimensions', async () => {
      globalThis.window.innerWidth = 7680; // 8K width
      globalThis.window.innerHeight = 4320; // 8K height

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      expect(dimensionsAdapter.getDimensions()).toEqual({
        width: 7680,
        height: 4320,
      });
    });

    it('should handle fractional dimensions', async () => {
      globalThis.window.innerWidth = 1920.5;
      globalThis.window.innerHeight = 1080.75;

      const { dimensionsAdapter } = await import(
        '../../../utils/platform/dimensions/index.web'
      );

      expect(dimensionsAdapter.getDimensions()).toEqual({
        width: 1920.5,
        height: 1080.75,
      });
    });
  });
});
