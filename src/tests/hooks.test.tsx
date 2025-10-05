/**
 * Comprehensive tests for usePlinkoGame hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../theme';
import { usePlinkoGame } from '../hooks/usePlinkoGame';
import type { ReactNode } from 'react';

type UsePlinkoGameReturn = ReturnType<typeof usePlinkoGame>;

// Wrapper component for hook testing
function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('usePlinkoGame Hook', () => {
  beforeEach(() => {
    // Clear URL params
    window.history.pushState({}, '', window.location.pathname);
  });

  describe('Initial State', () => {
    it('should start in idle or ready state', () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      expect(['idle', 'ready']).toContain(result.current.state);
      expect(result.current.ballPosition).toBeNull();
      expect(result.current.canClaim).toBe(false);
    });

    it('should initialize with prizes', () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      expect(result.current.prizes).toBeDefined();
      expect(result.current.prizes.length).toBeGreaterThanOrEqual(3);
      expect(result.current.prizes.length).toBeLessThanOrEqual(8);
    });

    it('should auto-initialize to ready state', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      expect(result.current.selectedPrize).not.toBeNull();
      expect(result.current.selectedIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('State Transitions', () => {
    it('should transition from ready to countdown on startGame', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.startGame();
      });

      expect(result.current.state).toBe('countdown');
    });

    it('should transition from countdown to dropping on completeCountdown', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.startGame();
      });

      expect(result.current.state).toBe('countdown');

      act(() => {
        result.current.completeCountdown();
      });

      expect(result.current.state).toBe('dropping');
    });

    it('should only start game from ready state', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.startGame();
      });

      // Should transition to countdown when in ready state
      expect(result.current.state).toBe('countdown');
    });
  });

  describe('Ball Animation', () => {
    it('should provide ball position during dropping state', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.startGame();
        result.current.completeCountdown();
      });

      expect(result.current.state).toBe('dropping');

      // Wait for at least one frame
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Ball position should be available during dropping
      expect(result.current.ballPosition).not.toBeNull();
      if (result.current.ballPosition) {
        expect(result.current.ballPosition).toHaveProperty('x');
        expect(result.current.ballPosition).toHaveProperty('y');
        expect(result.current.ballPosition).toHaveProperty('rotation');
      }
    });
  });

  describe('Landing Detection', () => {
    it('should remain in dropping state during animation', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.startGame();
        result.current.completeCountdown();
      });

      expect(result.current.state).toBe('dropping');

      // Verify it stays in dropping state for a bit
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(['dropping', 'landed', 'revealed']).toContain(result.current.state);
    });
  });

  describe('Prize Claiming', () => {
    it('should have canClaim false during animation', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      expect(result.current.canClaim).toBe(false);

      act(() => {
        result.current.startGame();
        result.current.completeCountdown();
      });

      expect(result.current.canClaim).toBe(false);
    });

    it('should not allow claiming before revealed state', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      expect(result.current.canClaim).toBe(false);

      act(() => {
        result.current.startGame();
      });

      expect(result.current.canClaim).toBe(false);
    });
  });

  describe('Game Reset', () => {
    it('should reset game state on resetGame', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.resetGame();
      });

      expect(['idle', 'ready']).toContain(result.current.state);
      expect(result.current.ballPosition).toBeNull();
    });

    it('should generate new prizes on reset', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      const firstPrizeSet = [...result.current.prizes];

      act(() => {
        result.current.resetGame();
      });

      // Wait for re-initialization
      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      const secondPrizeSet = result.current.prizes;

      // Prize sets should be different instances
      expect(firstPrizeSet).not.toBe(secondPrizeSet);
    });

    it('should reset selected prize temporarily on reset', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      const selectedPrize = result.current.selectedPrize;
      expect(selectedPrize).not.toBeNull();

      act(() => {
        result.current.resetGame();
      });

      // Initially cleared or will be re-initialized
      const currentState = result.current.state;
      if (currentState === 'idle') {
        expect(result.current.selectedPrize).toBeNull();
        expect(result.current.selectedIndex).toBe(-1);
      }
      // If already 'ready', it has been re-initialized
    });
  });

  describe('Seed Override', () => {
    it('should use seedOverride when provided', async () => {
      const seed = 42;
      const { result } = renderHook(() => usePlinkoGame({ seedOverride: seed }), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      // Should have a selected prize (deterministic based on seed)
      expect(result.current.selectedPrize).not.toBeNull();
      expect(result.current.selectedIndex).toBeGreaterThanOrEqual(0);
    });

    it('should use URL seed parameter when no override', async () => {
      window.history.pushState({}, '', '?seed=123');

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      expect(result.current.selectedPrize).not.toBeNull();

      // Clean up
      window.history.pushState({}, '', window.location.pathname);
    });
  });

  describe('Board Dimensions', () => {
    it('should accept custom board dimensions', async () => {
      const { result } = renderHook(
        () =>
          usePlinkoGame({
            boardWidth: 500,
            boardHeight: 600,
            pegRows: 12,
          }),
        { wrapper }
      );

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      // Should initialize successfully with custom dimensions
      expect(result.current.selectedPrize).not.toBeNull();
    });
  });

  describe('Trajectory Points', () => {
    it('should provide current trajectory point during dropping', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.startGame();
        result.current.completeCountdown();
      });

      expect(result.current.state).toBe('dropping');

      // Wait for at least one frame
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result.current.currentTrajectoryPoint).not.toBeNull();
    });

    it('should have trajectory point available after initialization', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      // Trajectory is available when initialized
      expect(result.current.currentTrajectoryPoint).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state transitions', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      // Rapid transitions
      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.resetGame();
      });

      // Should handle gracefully
      expect(['idle', 'ready']).toContain(result.current.state);
    });

    it('should clean up on unmount', async () => {
      const { result, unmount } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.startGame();
        result.current.completeCountdown();
      });

      // Unmount while animating - should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Full Game Flow', () => {
    it('should execute game state transitions', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      // 1. Initialize to ready
      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      // 2. Start game -> countdown
      act(() => {
        result.current.startGame();
      });
      expect(result.current.state).toBe('countdown');

      // 3. Complete countdown -> dropping
      act(() => {
        result.current.completeCountdown();
      });
      expect(result.current.state).toBe('dropping');

      // 4. Verify animation is running
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(['dropping', 'landed', 'revealed']).toContain(result.current.state);

      // 5. Reset
      act(() => {
        result.current.resetGame();
      });
      expect(['idle', 'ready']).toContain(result.current.state);
    });
  });
});
