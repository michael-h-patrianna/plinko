/**
 * Tests for viewport manager hook
 * Verifies state machine transitions, mobile detection, and viewport locking
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useViewportManager } from '@hooks/useViewportManager';
import { dimensionsAdapter, deviceInfoAdapter } from '@utils/platform';
import type { GameState } from '@game/types';

// Mock platform adapters
vi.mock('../../../utils/platform', () => ({
  dimensionsAdapter: {
    getWidth: vi.fn(() => 375),
    addChangeListener: vi.fn(() => vi.fn()),
  },
  deviceInfoAdapter: {
    isMobileDevice: vi.fn(() => false),
    isTouchDevice: vi.fn(() => false),
  },
}));

// Mock telemetry
vi.mock('../../../utils/telemetry', () => ({
  trackStateTransition: vi.fn(),
}));

describe('useViewportManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      expect(result.current.isMobile).toBe(false);
      expect(result.current.viewportWidth).toBe(375);
      expect(result.current.lockedBoardWidth).toBe(375);
      expect(result.current.isViewportLocked).toBe(false);
    });

    it('should detect mobile device on mount', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(true);

      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      expect(result.current.isMobile).toBe(true);
    });

    it('should detect touch device within tablet breakpoint', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(false);
      vi.mocked(deviceInfoAdapter.isTouchDevice).mockReturnValue(true);
      vi.mocked(dimensionsAdapter.getWidth).mockReturnValue(768);

      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      expect(result.current.isMobile).toBe(true);
    });

    it('should not detect desktop as mobile', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(false);
      vi.mocked(deviceInfoAdapter.isTouchDevice).mockReturnValue(false);
      vi.mocked(dimensionsAdapter.getWidth).mockReturnValue(1920);

      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      expect(result.current.isMobile).toBe(false);
    });
  });

  describe('Mobile Viewport Resizing', () => {
    it('should update viewport width on mobile resize', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(true);
      let resizeCallback: ((dimensions: { width: number; height: number }) => void) | null = null;
      vi.mocked(dimensionsAdapter.addChangeListener).mockImplementation((cb) => {
        resizeCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      // Simulate resize
      vi.mocked(dimensionsAdapter.getWidth).mockReturnValue(400);
      act(() => {
        resizeCallback?.({ width: 400, height: 800 });
      });

      expect(result.current.viewportWidth).toBe(400);
      expect(result.current.lockedBoardWidth).toBe(400);
    });

    it('should cap viewport width at MAX_MOBILE', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(true);
      let resizeCallback: ((dimensions: { width: number; height: number }) => void) | null = null;
      vi.mocked(dimensionsAdapter.addChangeListener).mockImplementation((cb) => {
        resizeCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      // Simulate resize beyond max mobile width
      vi.mocked(dimensionsAdapter.getWidth).mockReturnValue(500);
      act(() => {
        resizeCallback?.({ width: 500, height: 800 });
      });

      expect(result.current.viewportWidth).toBe(414); // MAX_MOBILE
    });

    it('should not resize on desktop', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(false);

      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      const initialWidth = result.current.viewportWidth;

      // Simulate resize (should be ignored)
      vi.mocked(dimensionsAdapter.getWidth).mockReturnValue(800);

      expect(result.current.viewportWidth).toBe(initialWidth);
    });

    it('should cleanup resize listener on unmount', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(true);
      const cleanup = vi.fn();
      vi.mocked(dimensionsAdapter.addChangeListener).mockReturnValue(cleanup);

      const { unmount } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      unmount();

      expect(cleanup).toHaveBeenCalledOnce();
    });
  });

  describe('Board Width Locking', () => {
    it('should lock board width during countdown', () => {
      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'idle' as GameState } }
      );

      expect(result.current.isViewportLocked).toBe(false);

      rerender({ gameState: 'countdown' as GameState });

      expect(result.current.isViewportLocked).toBe(true);
    });

    it('should lock board width during dropping', () => {
      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'idle' as GameState } }
      );

      rerender({ gameState: 'dropping' as GameState });

      expect(result.current.isViewportLocked).toBe(true);
    });

    it('should lock board width during landed', () => {
      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'idle' as GameState } }
      );

      rerender({ gameState: 'landed' as GameState });

      expect(result.current.isViewportLocked).toBe(true);
    });

    it('should unlock board width when returning to idle', () => {
      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'countdown' as GameState } }
      );

      expect(result.current.isViewportLocked).toBe(true);

      rerender({ gameState: 'idle' as GameState });

      expect(result.current.isViewportLocked).toBe(false);
    });

    it('should maintain locked width value during lock', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(true);
      vi.mocked(dimensionsAdapter.getWidth).mockReturnValue(375);

      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'idle' as GameState } }
      );

      const widthBeforeLock = result.current.viewportWidth;

      // Lock by changing to countdown
      rerender({ gameState: 'countdown' as GameState });

      expect(result.current.lockedBoardWidth).toBe(widthBeforeLock);
    });

    it('should not update locked width while locked', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(true);
      let resizeCallback: ((dimensions: { width: number; height: number }) => void) | null = null;
      vi.mocked(dimensionsAdapter.addChangeListener).mockImplementation((cb) => {
        resizeCallback = cb;
        return vi.fn();
      });

      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'idle' as GameState } }
      );

      const widthBeforeLock = result.current.lockedBoardWidth;

      // Lock board
      rerender({ gameState: 'dropping' as GameState });

      // Try to resize
      vi.mocked(dimensionsAdapter.getWidth).mockReturnValue(400);
      act(() => {
        resizeCallback?.({ width: 400, height: 800 });
      });

      // Locked width should not change
      expect(result.current.lockedBoardWidth).toBe(widthBeforeLock);
    });
  });

  describe('Manual Viewport Change', () => {
    it('should allow viewport change when idle', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      let changed: boolean = false;
      act(() => {
        changed = result.current.handleViewportChange(400);
      });

      expect(changed).toBe(true);
      expect(result.current.viewportWidth).toBe(400);
      expect(result.current.lockedBoardWidth).toBe(400);
    });

    it('should allow viewport change when ready', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'ready',
        })
      );

      let changed: boolean = false;
      act(() => {
        changed = result.current.handleViewportChange(400);
      });

      expect(changed).toBe(true);
      expect(result.current.viewportWidth).toBe(400);
    });

    it('should allow viewport change when revealed', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'revealed',
        })
      );

      let changed: boolean = false;
      act(() => {
        changed = result.current.handleViewportChange(400);
      });

      expect(changed).toBe(true);
    });

    it('should allow viewport change when claimed', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'claimed',
        })
      );

      let changed: boolean = false;
      act(() => {
        changed = result.current.handleViewportChange(400);
      });

      expect(changed).toBe(true);
    });

    it('should block viewport change when locked', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'countdown',
        })
      );

      let changed: boolean = false;
      act(() => {
        changed = result.current.handleViewportChange(400);
      });

      expect(changed).toBe(false);
      expect(result.current.viewportWidth).toBe(375); // Unchanged
    });

    it('should block viewport change during dropping', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'dropping',
        })
      );

      let changed: boolean = false;
      act(() => {
        changed = result.current.handleViewportChange(400);
      });

      expect(changed).toBe(false);
    });

    it('should block viewport change during landed', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'landed',
        })
      );

      let changed: boolean = false;
      act(() => {
        changed = result.current.handleViewportChange(400);
      });

      expect(changed).toBe(false);
    });
  });

  describe('State Transitions', () => {
    it('should transition from unlocked to locked smoothly', () => {
      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'ready' as GameState } }
      );

      expect(result.current.isViewportLocked).toBe(false);

      rerender({ gameState: 'countdown' as GameState });

      expect(result.current.isViewportLocked).toBe(true);
      expect(result.current.lockedBoardWidth).toBe(result.current.viewportWidth);
    });

    it('should handle rapid state transitions', () => {
      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'idle' as GameState } }
      );

      // Rapid transitions
      rerender({ gameState: 'ready' as GameState });
      rerender({ gameState: 'countdown' as GameState });
      rerender({ gameState: 'dropping' as GameState });
      rerender({ gameState: 'landed' as GameState });
      rerender({ gameState: 'revealed' as GameState });
      rerender({ gameState: 'idle' as GameState });

      expect(result.current.isViewportLocked).toBe(false);
    });

    it('should maintain viewport width through state cycle', () => {
      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'idle' as GameState } }
      );

      const initialWidth = result.current.viewportWidth;

      // Full game cycle
      rerender({ gameState: 'ready' as GameState });
      rerender({ gameState: 'countdown' as GameState });
      rerender({ gameState: 'dropping' as GameState });
      rerender({ gameState: 'landed' as GameState });
      rerender({ gameState: 'revealed' as GameState });
      rerender({ gameState: 'claimed' as GameState });
      rerender({ gameState: 'idle' as GameState });

      expect(result.current.viewportWidth).toBe(initialWidth);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid viewport width gracefully', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      act(() => result.current.handleViewportChange(0));

      expect(result.current.viewportWidth).toBe(0);
    });

    it('should handle negative viewport width', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      act(() => result.current.handleViewportChange(-100));

      expect(result.current.viewportWidth).toBe(-100);
    });

    it('should handle very large viewport width', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'idle',
        })
      );

      act(() => result.current.handleViewportChange(10000));

      expect(result.current.viewportWidth).toBe(10000);
    });

    it('should not crash on unmount during locked state', () => {
      const { unmount } = renderHook(() =>
        useViewportManager({
          gameState: 'dropping',
        })
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should handle selecting-position state correctly', () => {
      const { result } = renderHook(() =>
        useViewportManager({
          gameState: 'selecting-position',
        })
      );

      // Should not be locked during position selection
      expect(result.current.isViewportLocked).toBe(false);

      let changed: boolean = false;
      act(() => {
        changed = result.current.handleViewportChange(400);
      });
      expect(changed).toBe(false); // Not in allowed states
    });
  });

  describe('Integration', () => {
    it('should work with realistic game flow', () => {
      vi.mocked(deviceInfoAdapter.isMobileDevice).mockReturnValue(true);
      vi.mocked(dimensionsAdapter.getWidth).mockReturnValue(375);

      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'idle' as GameState } }
      );

      // Start game
      rerender({ gameState: 'ready' as GameState });
      expect(result.current.isViewportLocked).toBe(false);

      // Begin countdown
      rerender({ gameState: 'countdown' as GameState });
      expect(result.current.isViewportLocked).toBe(true);

      // Ball dropping
      rerender({ gameState: 'dropping' as GameState });
      expect(result.current.isViewportLocked).toBe(true);

      // Ball landed
      rerender({ gameState: 'landed' as GameState });
      expect(result.current.isViewportLocked).toBe(true);

      // Prize revealed
      rerender({ gameState: 'revealed' as GameState });
      expect(result.current.isViewportLocked).toBe(false);

      // Reset to idle
      rerender({ gameState: 'idle' as GameState });
      expect(result.current.isViewportLocked).toBe(false);
    });

    it('should handle dev tools viewport change with game reset', () => {
      const { result, rerender } = renderHook(
        ({ gameState }: { gameState: GameState }) =>
          useViewportManager({ gameState }),
        { initialProps: { gameState: 'ready' as GameState } }
      );

      // User changes viewport in dev tools
      let changed: boolean = false;
      act(() => {
        changed = result.current.handleViewportChange(414);
      });
      expect(changed).toBe(true);
      expect(result.current.viewportWidth).toBe(414);

      // Game should be able to reset with new width
      rerender({ gameState: 'idle' as GameState });
      rerender({ gameState: 'ready' as GameState });

      expect(result.current.lockedBoardWidth).toBe(414);
    });
  });
});
