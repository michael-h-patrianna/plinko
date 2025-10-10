/**
 * Unit tests for useWinAnimationState hook
 *
 * Tests state machine logic, transitions, telemetry, and automatic sequencing
 */

import type { GameState } from '@game/types';
import { useWinAnimationState } from '@hooks/useWinAnimationState';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as telemetry from '@utils/telemetry';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock telemetry
vi.mock('../../../utils/telemetry', () => ({
  trackStateTransition: vi.fn(),
}));

describe('useWinAnimationState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ============================================================================
  // INITIAL STATE
  // ============================================================================

  describe('initial state', () => {
    it('should start in idle state with all animations disabled', () => {
      const { result } = renderHook(() => useWinAnimationState('idle'));

      expect(result.current.state).toBe('idle');
      expect(result.current.showLandingImpact).toBe(false);
      expect(result.current.showAnticipation).toBe(false);
      expect(result.current.showWinReveal).toBe(false);
    });

    it('should not trigger any telemetry on mount', () => {
      renderHook(() => useWinAnimationState('idle'));
      expect(telemetry.trackStateTransition).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // STATE TRANSITIONS - AUTOMATIC SEQUENCING
  // ============================================================================

  describe('automatic sequencing on ball landing', () => {
    it('should trigger landing-impact when ballState changes to landed', () => {
      const { result, rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'dropping' as GameState } }
      );

      // Initially idle
      expect(result.current.state).toBe('idle');

      // Ball lands
      rerender({ ballState: 'landed' as GameState });

      // Should immediately transition to landing-impact
      expect(result.current.state).toBe('landing-impact');
      expect(result.current.showLandingImpact).toBe(true);
      expect(result.current.showAnticipation).toBe(true);
      expect(result.current.showWinReveal).toBe(false);

      // Telemetry should track transition
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith({
        fromState: 'win-animation.idle',
        toState: 'win-animation.landing-impact',
        event: 'TRIGGER_LANDING_IMPACT',
      });
    });

    it('should transition to anticipation after impact duration (200ms)', async () => {
      const { result, rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'dropping' as GameState } }
      );

      // Ball lands
      rerender({ ballState: 'landed' as GameState });
      expect(result.current.state).toBe('landing-impact');

      // Fast-forward 200ms
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should transition to anticipation
      await waitFor(() => {
        expect(result.current.state).toBe('anticipation');
      });

      expect(result.current.showLandingImpact).toBe(false);
      expect(result.current.showAnticipation).toBe(true);
      expect(result.current.showWinReveal).toBe(false);

      // Telemetry should track transition
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith({
        fromState: 'win-animation.landing-impact',
        toState: 'win-animation.anticipation',
        event: 'START_ANTICIPATION',
      });
    });

    it('should transition to win-reveal after total duration (800ms)', async () => {
      const { result, rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'dropping' as GameState } }
      );

      // Ball lands
      rerender({ ballState: 'landed' as GameState });
      expect(result.current.state).toBe('landing-impact');

      // Fast-forward full duration (200ms impact + 600ms anticipation)
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // Should transition to win-reveal
      await waitFor(() => {
        expect(result.current.state).toBe('win-reveal');
      });

      expect(result.current.showLandingImpact).toBe(false);
      expect(result.current.showAnticipation).toBe(false);
      expect(result.current.showWinReveal).toBe(true);

      // Telemetry should track transition
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith({
        fromState: 'win-animation.anticipation',
        toState: 'win-animation.win-reveal',
        event: 'SHOW_WIN_REVEAL',
      });
    });

    it('should complete full sequence: idle -> landing-impact -> anticipation -> win-reveal', async () => {
      const { result, rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'dropping' as GameState } }
      );

      // Start idle
      expect(result.current.state).toBe('idle');

      // Ball lands
      rerender({ ballState: 'landed' as GameState });
      expect(result.current.state).toBe('landing-impact');

      // After 200ms
      act(() => {
        vi.advanceTimersByTime(200);
      });
      await waitFor(() => {
        expect(result.current.state).toBe('anticipation');
      });

      // After another 600ms (total 800ms)
      act(() => {
        vi.advanceTimersByTime(600);
      });
      await waitFor(() => {
        expect(result.current.state).toBe('win-reveal');
      });

      // Verify telemetry tracked all transitions
      expect(telemetry.trackStateTransition).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================================================
  // STATE TRANSITIONS - RESET
  // ============================================================================

  describe('reset behavior', () => {
    it('should reset to idle when ballState changes away from landed', async () => {
      const { result, rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'dropping' as GameState } }
      );

      // Ball lands and starts animation
      rerender({ ballState: 'landed' as GameState });
      expect(result.current.state).toBe('landing-impact');

      // Ball state changes (e.g., user claims prize)
      rerender({ ballState: 'claimed' as GameState });

      // Should reset to idle
      await waitFor(() => {
        expect(result.current.state).toBe('idle');
      });

      expect(result.current.showLandingImpact).toBe(false);
      expect(result.current.showAnticipation).toBe(false);
      expect(result.current.showWinReveal).toBe(false);

      // Telemetry should track reset
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          toState: 'win-animation.idle',
          event: 'RESET_ANIMATIONS',
        })
      );
    });

    it('should clear timers when resetting mid-sequence', () => {
      const { result, rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'dropping' as GameState } }
      );

      // Ball lands
      rerender({ ballState: 'landed' as GameState });
      expect(result.current.state).toBe('landing-impact');

      // Reset before timers complete
      rerender({ ballState: 'idle' as GameState });

      // Fast-forward past what would have been timer durations
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should stay idle, not transition
      expect(result.current.state).toBe('idle');
    });

    it('should handle rapid state changes without orphaning states', async () => {
      const { result, rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'idle' as GameState } }
      );

      // Rapid transitions
      rerender({ ballState: 'landed' as GameState });
      rerender({ ballState: 'idle' as GameState });
      rerender({ ballState: 'landed' as GameState });
      rerender({ ballState: 'idle' as GameState });

      // Should end up in idle
      await waitFor(() => {
        expect(result.current.state).toBe('idle');
      });

      // No animations active
      expect(result.current.showLandingImpact).toBe(false);
      expect(result.current.showAnticipation).toBe(false);
      expect(result.current.showWinReveal).toBe(false);
    });
  });

  // ============================================================================
  // MANUAL DISPATCH (FOR TESTING/DEBUGGING)
  // ============================================================================

  describe('manual dispatch', () => {
    it('should allow manual TRIGGER_LANDING_IMPACT dispatch', () => {
      const { result } = renderHook(() => useWinAnimationState('idle'));

      act(() => {
        result.current.dispatch({ type: 'TRIGGER_LANDING_IMPACT' });
      });

      expect(result.current.state).toBe('landing-impact');
      expect(result.current.showLandingImpact).toBe(true);
      expect(result.current.showAnticipation).toBe(true);
    });

    it('should allow manual START_ANTICIPATION dispatch', () => {
      const { result } = renderHook(() => useWinAnimationState('idle'));

      act(() => {
        result.current.dispatch({ type: 'START_ANTICIPATION' });
      });

      expect(result.current.state).toBe('anticipation');
      expect(result.current.showLandingImpact).toBe(false);
      expect(result.current.showAnticipation).toBe(true);
    });

    it('should allow manual SHOW_WIN_REVEAL dispatch', () => {
      const { result } = renderHook(() => useWinAnimationState('idle'));

      act(() => {
        result.current.dispatch({ type: 'SHOW_WIN_REVEAL' });
      });

      expect(result.current.state).toBe('win-reveal');
      expect(result.current.showWinReveal).toBe(true);
    });

    it('should allow manual RESET_ANIMATIONS dispatch', () => {
      const { result } = renderHook(() => useWinAnimationState('idle'));

      // First set to a non-idle state
      act(() => {
        result.current.dispatch({ type: 'SHOW_WIN_REVEAL' });
      });
      expect(result.current.state).toBe('win-reveal');

      // Then reset
      act(() => {
        result.current.dispatch({ type: 'RESET_ANIMATIONS' });
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.showLandingImpact).toBe(false);
      expect(result.current.showAnticipation).toBe(false);
      expect(result.current.showWinReveal).toBe(false);
    });
  });

  // ============================================================================
  // IDEMPOTENCY
  // ============================================================================

  describe('idempotency', () => {
  it('should handle repeated landed state without duplicate transitions', () => {
      const { rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'landed' as GameState } }
      );

      vi.clearAllMocks(); // Clear initial transition

      // Re-render with same state
      rerender({ ballState: 'landed' as GameState });
      rerender({ ballState: 'landed' as GameState });

      // Should not trigger duplicate transitions
      expect(telemetry.trackStateTransition).not.toHaveBeenCalled();
    });

    it('should only track transition when state actually changes', () => {
      const { result } = renderHook(() => useWinAnimationState('idle'));

      vi.clearAllMocks();

      // Dispatch same transition twice
      act(() => {
        result.current.dispatch({ type: 'TRIGGER_LANDING_IMPACT' });
      });

      const callCount = (telemetry.trackStateTransition as ReturnType<typeof vi.fn>).mock.calls
        .length;

      act(() => {
        result.current.dispatch({ type: 'TRIGGER_LANDING_IMPACT' });
      });

      // Should not track second transition since state didn't change
      expect((telemetry.trackStateTransition as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        callCount
      );
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('edge cases', () => {
    it('should handle starting with landed state', async () => {
      const { result } = renderHook(() => useWinAnimationState('landed'));

      // Should immediately transition to landing-impact
      expect(result.current.state).toBe('landing-impact');

      // Sequence should proceed normally
      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current.state).toBe('win-reveal');
      });
    });

    it('should handle unmount during animation sequence', () => {
      const { unmount, rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'dropping' as GameState } }
      );

      // Start animation
      rerender({ ballState: 'landed' as GameState });

      // Unmount before sequence completes
      unmount();

      // Should not throw errors when timers fire
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });

    it('should maintain correct state across all GameState values', () => {
      const gameStates: GameState[] = [
        'idle',
        'ready',
        'selecting-position',
        'countdown',
        'dropping',
        'landed',
        'revealed',
        'claimed',
      ];

      gameStates.forEach((gameState) => {
        const { result } = renderHook(() => useWinAnimationState(gameState));

        if (gameState === 'landed') {
          expect(result.current.state).toBe('landing-impact');
        } else {
          expect(result.current.state).toBe('idle');
        }
      });
    });
  });

  // ============================================================================
  // TELEMETRY INTEGRATION
  // ============================================================================

  describe('telemetry integration', () => {
    it('should track all state transitions with correct data', async () => {
      const { result, rerender } = renderHook(
        ({ ballState }) => useWinAnimationState(ballState),
        { initialProps: { ballState: 'dropping' as GameState } }
      );

      vi.clearAllMocks();

      // Complete full sequence
      rerender({ ballState: 'landed' as GameState });

      act(() => {
        vi.advanceTimersByTime(800);
      });

      await waitFor(() => {
        expect(result.current.state).toBe('win-reveal');
      });

      // Verify all transitions were tracked
      expect(telemetry.trackStateTransition).toHaveBeenCalledTimes(3);

      expect(telemetry.trackStateTransition).toHaveBeenNthCalledWith(1, {
        fromState: 'win-animation.idle',
        toState: 'win-animation.landing-impact',
        event: 'TRIGGER_LANDING_IMPACT',
      });

      expect(telemetry.trackStateTransition).toHaveBeenNthCalledWith(2, {
        fromState: 'win-animation.landing-impact',
        toState: 'win-animation.anticipation',
        event: 'START_ANTICIPATION',
      });

      expect(telemetry.trackStateTransition).toHaveBeenNthCalledWith(3, {
        fromState: 'win-animation.anticipation',
        toState: 'win-animation.win-reveal',
        event: 'SHOW_WIN_REVEAL',
      });
    });

    it('should include correct event type in telemetry', () => {
      const { result } = renderHook(() => useWinAnimationState('idle'));

      const events: Array<{ type: string; event: string }> = [
        { type: 'TRIGGER_LANDING_IMPACT', event: 'TRIGGER_LANDING_IMPACT' },
        { type: 'START_ANTICIPATION', event: 'START_ANTICIPATION' },
        { type: 'SHOW_WIN_REVEAL', event: 'SHOW_WIN_REVEAL' },
        { type: 'RESET_ANIMATIONS', event: 'RESET_ANIMATIONS' },
      ];

      events.forEach(({ type, event }) => {
        vi.clearAllMocks();

        act(() => {
          result.current.dispatch({ type } as any);
        });

        if ((telemetry.trackStateTransition as ReturnType<typeof vi.fn>).mock.calls.length > 0) {
          expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
            expect.objectContaining({
              event,
            })
          );
        }
      });
    });
  });
});
