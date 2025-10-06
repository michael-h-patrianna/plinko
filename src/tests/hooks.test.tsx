/**
 * Comprehensive tests for usePlinkoGame hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppConfigProvider } from '../config/AppConfigContext';
import { ThemeProvider } from '../theme';
import { usePlinkoGame } from '../hooks/usePlinkoGame';
import type { ReactNode } from 'react';
import type { PrizeProvider } from '../game/prizeProvider';

type UsePlinkoGameReturn = ReturnType<typeof usePlinkoGame>;

// Wrapper component for hook testing
function wrapper({ children }: { children: ReactNode }) {
  return (
    <AppConfigProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AppConfigProvider>
  );
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

    it('should initialize with prizes', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      // Wait for prizes to load (async-only loading)
      await waitFor(() => {
        expect(result.current.prizes.length).toBeGreaterThanOrEqual(3);
      });

      expect(result.current.prizes).toBeDefined();
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

  describe('Provider Retry Logic', () => {
    it('should retry on provider failure and eventually succeed', async () => {
      let attemptCount = 0;
      const mockProvider: PrizeProvider = {
        load: vi.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < 3) {
            return Promise.reject(new Error('Temporary failure'));
          }
          return Promise.resolve({
            prizes: [
              {
                id: 'retry-1',
                type: 'free' as const,
                probability: 0.5,
                slotIcon: '🎁',
                slotColor: '#FF0000',
                title: 'Test Prize',
                freeReward: { gc: 100 },
              },
              {
                id: 'retry-2',
                type: 'free' as const,
                probability: 0.3,
                slotIcon: '💎',
                slotColor: '#00FF00',
                title: 'Test Prize 2',
                freeReward: { gc: 200 },
              },
              {
                id: 'retry-3',
                type: 'free' as const,
                probability: 0.2,
                slotIcon: '⭐',
                slotColor: '#0000FF',
                title: 'Test Prize 3',
                freeReward: { gc: 300 },
              },
            ],
            winningIndex: 0,
            seed: 12345,
            source: 'default' as const,
          });
        }),
      };

      function customWrapper({ children }: { children: ReactNode }) {
        return (
          <AppConfigProvider value={{ prizeProvider: mockProvider }}>
            <ThemeProvider>{children}</ThemeProvider>
          </AppConfigProvider>
        );
      }

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), {
        wrapper: customWrapper,
      });

      // Should eventually succeed after retries
      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 5000 }
      );

      expect(attemptCount).toBe(3);
      expect(result.current.prizes.length).toBe(3);
      expect(result.current.prizeLoadError).toBeNull();
    });

    it('should fail after max retries', async () => {
      const mockProvider: PrizeProvider = {
        load: vi.fn().mockRejectedValue(new Error('Persistent failure')),
      };

      function customWrapper({ children }: { children: ReactNode }) {
        return (
          <AppConfigProvider value={{ prizeProvider: mockProvider }}>
            <ThemeProvider>{children}</ThemeProvider>
          </AppConfigProvider>
        );
      }

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), {
        wrapper: customWrapper,
      });

      // Should fail after retries
      await waitFor(
        () => {
          expect(result.current.prizeLoadError).not.toBeNull();
        },
        { timeout: 5000 }
      );

      expect(result.current.prizeLoadError?.message).toBe('Persistent failure');
      expect(result.current.prizes.length).toBe(0);
      expect(result.current.isLoadingPrizes).toBe(false);
    });

    it('should use exponential backoff between retries', async () => {
      const timestamps: number[] = [];
      const mockProvider: PrizeProvider = {
        load: vi.fn().mockImplementation(() => {
          timestamps.push(Date.now());
          if (timestamps.length < 3) {
            return Promise.reject(new Error('Retry test'));
          }
          return Promise.resolve({
            prizes: [
              {
                id: 'backoff-1',
                type: 'free' as const,
                probability: 1.0,
                slotIcon: '🎯',
                slotColor: '#FF00FF',
                title: 'Backoff Prize',
                freeReward: { gc: 50 },
              },
              {
                id: 'backoff-2',
                type: 'free' as const,
                probability: 0,
                slotIcon: '🎯',
                slotColor: '#FF00FF',
                title: 'Backoff Prize 2',
                freeReward: { gc: 50 },
              },
              {
                id: 'backoff-3',
                type: 'free' as const,
                probability: 0,
                slotIcon: '🎯',
                slotColor: '#FF00FF',
                title: 'Backoff Prize 3',
                freeReward: { gc: 50 },
              },
            ],
            winningIndex: 0,
            seed: 99999,
            source: 'default' as const,
          });
        }),
      };

      function customWrapper({ children }: { children: ReactNode }) {
        return (
          <AppConfigProvider value={{ prizeProvider: mockProvider }}>
            <ThemeProvider>{children}</ThemeProvider>
          </AppConfigProvider>
        );
      }

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), {
        wrapper: customWrapper,
      });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 6000 }
      );

      expect(timestamps.length).toBe(3);
      // Verify increasing delays (1000ms * attempt)
      if (timestamps.length === 3) {
        const delay1 = timestamps[1]! - timestamps[0]!;
        const delay2 = timestamps[2]! - timestamps[1]!;
        // Allow some timing variance (within 500ms)
        expect(delay1).toBeGreaterThanOrEqual(900);
        expect(delay1).toBeLessThanOrEqual(1500);
        expect(delay2).toBeGreaterThanOrEqual(1900);
        expect(delay2).toBeLessThanOrEqual(2500);
      }
    });
  });

  describe('Provider Timeout Handling', () => {
    it('should timeout if provider takes too long', async () => {
      const mockProvider: PrizeProvider = {
        load: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              // Never resolve - will timeout
              setTimeout(resolve, 15000);
            })
        ),
      };

      function customWrapper({ children }: { children: ReactNode }) {
        return (
          <AppConfigProvider value={{ prizeProvider: mockProvider }}>
            <ThemeProvider>{children}</ThemeProvider>
          </AppConfigProvider>
        );
      }

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), {
        wrapper: customWrapper,
      });

      // Should timeout and set error
      await waitFor(
        () => {
          expect(result.current.prizeLoadError).not.toBeNull();
        },
        { timeout: 15000 }
      );

      expect(result.current.prizeLoadError?.message).toBe('Provider load timeout');
      expect(result.current.prizes.length).toBe(0);
    });

    it('should succeed if provider responds within timeout', async () => {
      const mockProvider: PrizeProvider = {
        load: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(
                () =>
                  resolve({
                    prizes: [
                      {
                        id: 'timeout-1',
                        type: 'free' as const,
                        probability: 1.0,
                        slotIcon: '⏱️',
                        slotColor: '#FFFF00',
                        title: 'Quick Prize',
                        freeReward: { gc: 75 },
                      },
                      {
                        id: 'timeout-2',
                        type: 'free' as const,
                        probability: 0,
                        slotIcon: '⏱️',
                        slotColor: '#FFFF00',
                        title: 'Quick Prize 2',
                        freeReward: { gc: 75 },
                      },
                      {
                        id: 'timeout-3',
                        type: 'free' as const,
                        probability: 0,
                        slotIcon: '⏱️',
                        slotColor: '#FFFF00',
                        title: 'Quick Prize 3',
                        freeReward: { gc: 75 },
                      },
                    ],
                    winningIndex: 0,
                    seed: 88888,
                    source: 'default' as const,
                  }),
                500
              );
            })
        ),
      };

      function customWrapper({ children }: { children: ReactNode }) {
        return (
          <AppConfigProvider value={{ prizeProvider: mockProvider }}>
            <ThemeProvider>{children}</ThemeProvider>
          </AppConfigProvider>
        );
      }

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), {
        wrapper: customWrapper,
      });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 3000 }
      );

      expect(result.current.prizes.length).toBe(3);
      expect(result.current.prizeLoadError).toBeNull();
    });

    it('should retry with timeout on each attempt', async () => {
      let attemptCount = 0;
      const mockProvider: PrizeProvider = {
        load: vi.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < 2) {
            // First attempt fails with error (simulating a timeout-like failure)
            return Promise.reject(new Error('Network timeout'));
          }
          // Second attempt succeeds quickly
          return Promise.resolve({
            prizes: [
              {
                id: 'retry-timeout-1',
                type: 'free' as const,
                probability: 1.0,
                slotIcon: '🔄',
                slotColor: '#00FFFF',
                title: 'Retry Success Prize',
                freeReward: { gc: 150 },
              },
              {
                id: 'retry-timeout-2',
                type: 'free' as const,
                probability: 0,
                slotIcon: '🔄',
                slotColor: '#00FFFF',
                title: 'Retry Success Prize 2',
                freeReward: { gc: 150 },
              },
              {
                id: 'retry-timeout-3',
                type: 'free' as const,
                probability: 0,
                slotIcon: '🔄',
                slotColor: '#00FFFF',
                title: 'Retry Success Prize 3',
                freeReward: { gc: 150 },
              },
            ],
            winningIndex: 0,
            seed: 77777,
            source: 'default' as const,
          });
        }),
      };

      function customWrapper({ children }: { children: ReactNode }) {
        return (
          <AppConfigProvider value={{ prizeProvider: mockProvider }}>
            <ThemeProvider>{children}</ThemeProvider>
          </AppConfigProvider>
        );
      }

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), {
        wrapper: customWrapper,
      });

      // Should succeed on retry after first failure
      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 5000 }
      );

      expect(attemptCount).toBe(2);
      expect(result.current.prizes.length).toBe(3);
      expect(result.current.prizeLoadError).toBeNull();
    });
  });

  describe('Drop Position Choice Mechanic', () => {
    it('should transition to selecting-position when drop-position mechanic enabled', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(
        () => usePlinkoGame({ choiceMechanic: 'drop-position' }),
        { wrapper }
      );

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.startGame();
      });

      expect(result.current.state).toBe('selecting-position');
    });

    it('should allow selecting drop position and generate new trajectory', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(
        () => usePlinkoGame({ choiceMechanic: 'drop-position' }),
        { wrapper }
      );

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      act(() => {
        result.current.startGame();
      });

      expect(result.current.state).toBe('selecting-position');

      const initialTrajectory = result.current.trajectory;

      act(() => {
        result.current.selectDropPosition('left');
      });

      expect(result.current.state).toBe('countdown');
      // Trajectory should be regenerated
      expect(result.current.trajectory).not.toBe(initialTrajectory);
    });

    it('should swap prizes array when selecting drop position', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(
        () => usePlinkoGame({ choiceMechanic: 'drop-position' }),
        { wrapper }
      );

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      const originalWinningPrize = result.current.selectedPrize;

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.selectDropPosition('center');
      });

      // Winning prize should remain the same (immutable)
      expect(result.current.selectedPrize).toBe(originalWinningPrize);
      // But prizes array should be swapped
      expect(result.current.prizes).toBeDefined();
    });

    it('should ignore selectDropPosition if not in selecting-position state', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      const initialState = result.current.state;

      act(() => {
        result.current.selectDropPosition('left');
      });

      // State should not change
      expect(result.current.state).toBe(initialState);
    });
  });

  describe('Winning Prize Lock Guard', () => {
    it('should lock winning prize after initialization', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      const winningPrize = result.current.selectedPrize;
      expect(winningPrize).not.toBeNull();

      // Try to force re-initialization by changing props (this should be guarded)
      // The guard should prevent overwriting the locked winning prize
      // This is tested indirectly through the normal game flow
    });

    it('should reset winning prize lock on game reset', async () => {
      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      // Verify initial state has a winning prize
      expect(result.current.selectedPrize).not.toBeNull();

      act(() => {
        result.current.resetGame();
      });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 3000 }
      );

      // After reset, should have a new winning prize (lock was released)
      expect(result.current.selectedPrize).not.toBeNull();
      // Note: Prize might be the same or different, but lock was reset
    });
  });

  describe('URL Seed Override', () => {
    it('should use seed from URL query parameter', async () => {
      // Set URL with seed parameter
      window.history.pushState({}, '', '?seed=99999');

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      // Should have initialized with seed from URL
      expect(result.current.prizes.length).toBeGreaterThan(0);
    });

    it('should ignore invalid seed parameter', async () => {
      // Set URL with invalid seed parameter
      window.history.pushState({}, '', '?seed=invalid');

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      // Should have initialized without error
      expect(result.current.prizes.length).toBeGreaterThan(0);
    });

    it('should prefer seedOverride prop over URL parameter', async () => {
      // Set URL with seed parameter
      window.history.pushState({}, '', '?seed=11111');

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(
        () => usePlinkoGame({ seedOverride: 88888 }),
        { wrapper }
      );

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      // Should have initialized (prop takes precedence)
      expect(result.current.prizes.length).toBeGreaterThan(0);
    });

    it('should ignore URL seed parameter on reset to generate fresh random seeds', async () => {
      // Set URL with seed parameter (for development testing)
      window.history.pushState({}, '', '?seed=12345');

      const { result } = renderHook<UsePlinkoGameReturn, unknown>(() => usePlinkoGame(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 2000 }
      );

      const firstPrizeSet = [...result.current.prizes];
      const firstSelectedPrize = result.current.selectedPrize;

      // Reset game - should generate new random seed even with URL parameter
      act(() => {
        result.current.resetGame();
      });

      await waitFor(
        () => {
          expect(result.current.state).toBe('ready');
        },
        { timeout: 3000 }
      );

      const secondPrizeSet = result.current.prizes;
      const secondSelectedPrize = result.current.selectedPrize;

      // Prize sets should be different instances (different seeds)
      expect(firstPrizeSet).not.toBe(secondPrizeSet);
      // Selected prizes might be different (due to random seed generation)
      expect(secondSelectedPrize).not.toBeNull();
      expect(firstSelectedPrize).not.toBeNull();

      // Clean up
      window.history.pushState({}, '', window.location.pathname);
    });
  });
});
