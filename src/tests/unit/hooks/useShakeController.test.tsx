/**
 * Tests for shake controller hook
 * Verifies state machine transitions and shake effect triggering
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShakeController } from '../../../hooks/useShakeController';
import type { GameState, PrizeConfig } from '../../../game/types';
import { ANIMATION_DURATION } from '../../../constants';

// Mock telemetry
vi.mock('../../../utils/telemetry', () => ({
  trackStateTransition: vi.fn(),
}));

describe('useShakeController', () => {
  const mockWinPrize: PrizeConfig = {
    id: 'win-1',
    type: 'free',
    probability: 0.1,
    slotIcon: '💰',
    slotColor: '#FFD700',
    title: 'Cash Prize',
    description: 'You won!',
    freeReward: {
      gc: 100,
    },
  };

  const mockNoWinPrize: PrizeConfig = {
    id: 'no-win-1',
    type: 'no_win',
    probability: 0.5,
    slotIcon: '😢',
    slotColor: '#666666',
    title: 'Try Again',
    description: 'Better luck next time',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with shake inactive', () => {
      const { result } = renderHook(() =>
        useShakeController({
          gameState: 'idle',
          selectedPrize: null,
        })
      );

      expect(result.current.shakeActive).toBe(false);
    });

    it('should not shake on mount', () => {
      const { result } = renderHook(() =>
        useShakeController({
          gameState: 'idle',
          selectedPrize: null,
        })
      );

      expect(result.current.shakeActive).toBe(false);
    });
  });

  describe('Auto Shake on Win', () => {
    it('should activate shake when ball lands on winning prize', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'dropping' as GameState, prize: null as PrizeConfig | null } }
      );

      expect(result.current.shakeActive).toBe(false);

      // Ball lands on winning prize
      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(true);
    });

    it('should not shake for no_win prize', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'dropping' as GameState, prize: null as PrizeConfig | null } }
      );

      // Ball lands on no_win prize
      rerender({ gameState: 'landed' as GameState, prize: mockNoWinPrize as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should stop shake after duration', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
            duration: 500,
          }),
        { initialProps: { gameState: 'dropping' as GameState, prize: null as PrizeConfig | null } }
      );

      // Ball lands on winning prize
      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(true);

      // Advance timers
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should use default duration from constants', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'dropping' as GameState, prize: null as PrizeConfig | null } }
      );

      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(true);

      // Advance by default duration
      act(() => {
        vi.advanceTimersByTime(ANIMATION_DURATION.SLOW);
      });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should reset shake when returning to idle', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null } }
      );

      expect(result.current.shakeActive).toBe(true);

      // Return to idle
      rerender({ gameState: 'idle' as GameState, prize: null as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should cleanup timer on unmount', () => {
      const { result, rerender, unmount } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
            duration: 1000,
          }),
        { initialProps: { gameState: 'dropping' as GameState, prize: null as PrizeConfig | null } }
      );

      // Ball lands on winning prize
      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(true);

      // Unmount before timer completes
      unmount();

      // Should not throw when timer would have fired
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    });
  });

  describe('Manual Shake Control', () => {
    it('should allow manual shake trigger', () => {
      const { result } = renderHook(() =>
        useShakeController({
          gameState: 'idle',
          selectedPrize: null,
          duration: 300,
        })
      );

      expect(result.current.shakeActive).toBe(false);

      act(() => {
        result.current.triggerShake();
      });

      expect(result.current.shakeActive).toBe(true);
    });

    it('should stop manual shake after duration', () => {
      const { result } = renderHook(() =>
        useShakeController({
          gameState: 'idle',
          selectedPrize: null,
          duration: 300,
        })
      );

      act(() => {
        result.current.triggerShake();
      });

      expect(result.current.shakeActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should allow manual stop', () => {
      const { result } = renderHook(() =>
        useShakeController({
          gameState: 'idle',
          selectedPrize: null,
        })
      );

      act(() => {
        result.current.triggerShake();
      });

      expect(result.current.shakeActive).toBe(true);

      act(() => {
        result.current.stopShake();
      });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should handle stop when not shaking', () => {
      const { result } = renderHook(() =>
        useShakeController({
          gameState: 'idle',
          selectedPrize: null,
        })
      );

      expect(result.current.shakeActive).toBe(false);

      act(() => {
        result.current.stopShake();
      });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should not start shake if already shaking', () => {
      const { result } = renderHook(() =>
        useShakeController({
          gameState: 'idle',
          selectedPrize: null,
          duration: 500,
        })
      );

      // First trigger
      act(() => {
        result.current.triggerShake();
      });

      expect(result.current.shakeActive).toBe(true);

      // Try to trigger again while shaking
      act(() => {
        result.current.triggerShake();
      });

      // Should still be shaking but not reset timer
      expect(result.current.shakeActive).toBe(true);

      // Original duration should still apply
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.shakeActive).toBe(false);
    });
  });

  describe('State Transitions', () => {
    it('should handle idle -> ready -> countdown -> dropping -> landed -> revealed cycle', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'idle' as GameState, prize: null as PrizeConfig | null } }
      );

      // Start game
      rerender({ gameState: 'ready' as GameState, prize: null as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      // Countdown
      rerender({ gameState: 'countdown' as GameState, prize: null as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      // Dropping
      rerender({ gameState: 'dropping' as GameState, prize: null as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      // Landed on win
      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(true);

      // Advance time to stop shake
      act(() => {
        vi.advanceTimersByTime(ANIMATION_DURATION.SLOW);
      });

      // Revealed
      rerender({ gameState: 'revealed' as GameState, prize: mockWinPrize as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);
    });

    it('should handle rapid state changes', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'idle' as GameState, prize: null as PrizeConfig | null } }
      );

      // Rapid transitions
      rerender({ gameState: 'ready' as GameState, prize: null as PrizeConfig | null });
      rerender({ gameState: 'countdown' as GameState, prize: null as PrizeConfig | null });
      rerender({ gameState: 'dropping' as GameState, prize: null as PrizeConfig | null });
      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(true);
    });

    it('should handle landed -> idle without revealed state', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null } }
      );

      expect(result.current.shakeActive).toBe(true);

      // Jump directly to idle (reset)
      rerender({ gameState: 'idle' as GameState, prize: null as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null prize gracefully', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'dropping' as GameState, prize: null as PrizeConfig | null } }
      );

      rerender({ gameState: 'landed' as GameState, prize: null as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should handle custom short duration', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
            duration: 100,
          }),
        { initialProps: { gameState: 'dropping' as GameState, prize: null as PrizeConfig | null } }
      );

      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should handle custom long duration', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
            duration: 2000,
          }),
        { initialProps: { gameState: 'dropping' as GameState, prize: null as PrizeConfig | null } }
      );

      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1999);
      });

      expect(result.current.shakeActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(result.current.shakeActive).toBe(false);
    });

    it('should handle selecting-position state', () => {
      const { result } = renderHook(() =>
        useShakeController({
          gameState: 'selecting-position',
          selectedPrize: null,
        })
      );

      expect(result.current.shakeActive).toBe(false);
    });

    it('should not crash on unmount during active shake', () => {
      const { result, rerender, unmount } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'dropping' as GameState, prize: null as PrizeConfig | null } }
      );

      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });

      expect(result.current.shakeActive).toBe(true);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work with realistic game flow', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'idle' as GameState, prize: null as PrizeConfig | null } }
      );

      // Full game cycle
      rerender({ gameState: 'ready' as GameState, prize: null as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      rerender({ gameState: 'countdown' as GameState, prize: null as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      rerender({ gameState: 'dropping' as GameState, prize: null as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(ANIMATION_DURATION.SLOW);
      });

      rerender({ gameState: 'revealed' as GameState, prize: mockWinPrize as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      rerender({ gameState: 'claimed' as GameState, prize: mockWinPrize as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      rerender({ gameState: 'idle' as GameState, prize: null as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);
    });

    it('should handle win -> lose -> win sequence', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
          }),
        { initialProps: { gameState: 'idle' as GameState, prize: null as PrizeConfig | null } }
      );

      // First game - win
      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(ANIMATION_DURATION.SLOW);
      });

      rerender({ gameState: 'idle' as GameState, prize: null as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      // Second game - lose
      rerender({ gameState: 'landed' as GameState, prize: mockNoWinPrize as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      rerender({ gameState: 'idle' as GameState, prize: null as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(false);

      // Third game - win again
      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(true);
    });

    it('should combine auto shake with manual control', () => {
      const { result, rerender } = renderHook(
        ({ gameState, prize }: { gameState: GameState; prize: PrizeConfig | null }) =>
          useShakeController({
            gameState,
            selectedPrize: prize,
            duration: 500,
          }),
        { initialProps: { gameState: 'idle' as GameState, prize: null as PrizeConfig | null } }
      );

      // Manual trigger
      act(() => {
        result.current.triggerShake();
      });

      expect(result.current.shakeActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.shakeActive).toBe(false);

      // Auto trigger
      rerender({ gameState: 'landed' as GameState, prize: mockWinPrize as PrizeConfig | null });
      expect(result.current.shakeActive).toBe(true);
    });
  });
});
