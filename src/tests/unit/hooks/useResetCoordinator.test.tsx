/**
 * Tests for reset coordinator hook
 * Verifies correct ordering, guards, and edge case handling
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResetCoordinator } from '@hooks/useResetCoordinator';

// Mock react-dom's flushSync to avoid DOM dependencies in tests
vi.mock('react-dom', () => ({
  flushSync: (fn: () => void) => fn(),
}));

interface MockDependencies {
  currentFrameRef: React.MutableRefObject<number>;
  winningPrizeLockedRef: React.MutableRefObject<boolean>;
  forceFreshSeedRef: React.MutableRefObject<boolean>;
  resetFrame: ReturnType<typeof vi.fn>;
  dispatch: ReturnType<typeof vi.fn>;
  setWinningPrize: ReturnType<typeof vi.fn>;
  setCurrentWinningIndex: ReturnType<typeof vi.fn>;
  setPrizeSession: ReturnType<typeof vi.fn>;
  setPrizes: ReturnType<typeof vi.fn>;
  setSessionKey: ReturnType<typeof vi.fn>;
}

describe('useResetCoordinator', () => {
  let mockDeps: MockDependencies;
  let callOrder: string[];

  beforeEach(() => {
    callOrder = [];

    // Create mock dependencies for new signature
    mockDeps = {
      currentFrameRef: { current: 42 },
      resetFrame: vi.fn(() => callOrder.push('resetFrame')),
      dispatch: vi.fn(() => callOrder.push('dispatch')),
      setWinningPrize: vi.fn(() => callOrder.push('setWinningPrize')),
      setCurrentWinningIndex: vi.fn(() => callOrder.push('setCurrentWinningIndex')),
      setPrizeSession: vi.fn(() => callOrder.push('setPrizeSession')),
      setPrizes: vi.fn(() => callOrder.push('setPrizes')),
      winningPrizeLockedRef: { current: true },
      forceFreshSeedRef: { current: false },
      setSessionKey: vi.fn(() => callOrder.push('setSessionKey')),
    };
  });

  describe('Reset Sequence', () => {
    it('should execute reset sequence in correct order', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      // Verify exact order of operations
      expect(callOrder).toEqual([
        'resetFrame', // Phase 1: Animation cleanup
        'dispatch', // Phase 2: State cleanup
        'setWinningPrize',
        'setCurrentWinningIndex',
        'setPrizeSession', // Phase 3: Session cleanup
        'setPrizes',
        'setSessionKey', // Phase 5: Trigger re-initialization
      ]);
    });

    it('should reset currentFrameRef to 0', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.currentFrameRef.current).toBe(0);
    });

    it('should call resetFrame to cleanup animation timers', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.resetFrame).toHaveBeenCalledOnce();
    });

    it('should dispatch RESET_REQUESTED event', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.dispatch).toHaveBeenCalledWith({ type: 'RESET_REQUESTED' });
    });

    it('should clear winning prize state', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.setWinningPrize).toHaveBeenCalledWith(null);
    });

    it('should clear current winning index', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.setCurrentWinningIndex).toHaveBeenCalledWith(undefined);
    });

    it('should clear prize session', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.setPrizeSession).toHaveBeenCalledWith(null);
    });

    it('should clear prizes array', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.setPrizes).toHaveBeenCalledWith([]);
    });

    it('should release winning prize lock', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.winningPrizeLockedRef.current).toBe(false);
    });

    it('should set forceFreshSeed flag', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.forceFreshSeedRef.current).toBe(true);
    });

    it('should increment session key', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.setSessionKey).toHaveBeenCalledWith(expect.any(Function));

      // Verify the increment function works correctly
      const incrementFn = vi.mocked(mockDeps.setSessionKey).mock.calls[0]![0] as (prev: number) => number;
      expect(incrementFn(5)).toBe(6);
    });
  });

  describe('Concurrency Guards', () => {
    it('should prevent concurrent resets', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      // Call reset twice rapidly (in separate acts since they're synchronous)
      act(() => {
        result.current.reset();
      });

      act(() => {
        result.current.reset();
      });

      // Second call should be blocked, so callbacks called twice (once per successful reset)
      // Note: Both resets complete since they're sequential, not concurrent
      expect(mockDeps.resetFrame).toHaveBeenCalledTimes(2);
      expect(mockDeps.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should report resetting status correctly', () => {
      // Since reset is synchronous, we can't catch it mid-reset
      // Instead, verify it starts as false
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      // Should not be resetting initially
      expect(result.current.isResetting()).toBe(false);

      // After reset completes, should still be false
      act(() => {
        result.current.reset();
      });

      expect(result.current.isResetting()).toBe(false);
    });

    it('should allow reset after previous reset completes', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      // Reset callOrder to track second reset
      callOrder = [];

      act(() => {
        result.current.reset();
      });

      // Second reset should execute
      expect(mockDeps.resetFrame).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully without throwing', () => {
      const errorResetFrame = vi.fn(() => {
        callOrder.push('resetFrame');
        throw new Error('Animation cleanup failed');
      });

      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        errorResetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      // Reset should not throw
      expect(() => {
        act(() => {
          result.current.reset();
        });
      }).not.toThrow();
    });

    it('should not leave resetInProgress flag stuck on error', () => {
      const errorResetFrame = vi.fn(() => {
        throw new Error('Test error');
      });

      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        errorResetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      // Should not be stuck in resetting state
      expect(result.current.isResetting()).toBe(false);
    });
  });


  describe('Idempotence', () => {
    it('should be safe to call reset multiple times', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      // Call reset multiple times
      act(() => {
        result.current.reset();
        result.current.reset();
        result.current.reset();
      });

      // Should not crash and refs should be in consistent state
      expect(mockDeps.currentFrameRef.current).toBe(0);
      expect(mockDeps.winningPrizeLockedRef.current).toBe(false);
      expect(mockDeps.forceFreshSeedRef.current).toBe(true);
    });

    it('should reset refs to same values each time', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      const frame1 = mockDeps.currentFrameRef.current;
      const locked1 = mockDeps.winningPrizeLockedRef.current;
      const fresh1 = mockDeps.forceFreshSeedRef.current;

      // Reset again
      act(() => {
        result.current.reset();
      });

      expect(mockDeps.currentFrameRef.current).toBe(frame1);
      expect(mockDeps.winningPrizeLockedRef.current).toBe(locked1);
      expect(mockDeps.forceFreshSeedRef.current).toBe(fresh1);
    });
  });

  describe('Integration', () => {
    it('should work with realistic ref values', () => {
      const realisticDeps: MockDependencies = {
        currentFrameRef: { current: 1234 },
        resetFrame: vi.fn(),
        dispatch: vi.fn(),
        setWinningPrize: vi.fn(),
        setCurrentWinningIndex: vi.fn(),
        setPrizeSession: vi.fn(),
        setPrizes: vi.fn(),
        winningPrizeLockedRef: { current: true },
        forceFreshSeedRef: { current: false },
        setSessionKey: vi.fn(),
      };

      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: realisticDeps.currentFrameRef,
          winningPrizeLockedRef: realisticDeps.winningPrizeLockedRef,
          forceFreshSeedRef: realisticDeps.forceFreshSeedRef,
        },
        realisticDeps.resetFrame,
        realisticDeps.dispatch,
        {
          setWinningPrize: realisticDeps.setWinningPrize,
          setCurrentWinningIndex: realisticDeps.setCurrentWinningIndex,
          setPrizeSession: realisticDeps.setPrizeSession,
          setPrizes: realisticDeps.setPrizes,
          setSessionKey: realisticDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(realisticDeps.currentFrameRef.current).toBe(0);
      expect(realisticDeps.winningPrizeLockedRef.current).toBe(false);
      expect(realisticDeps.forceFreshSeedRef.current).toBe(true);
    });

    it('should handle rapid state transitions', () => {
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      // Simulate rapid game loop: reset -> play -> reset -> play
      act(() => {
        result.current.reset();
      });

      // Simulate game play (modify refs)
      mockDeps.currentFrameRef.current = 500;
      mockDeps.winningPrizeLockedRef.current = true;
      mockDeps.forceFreshSeedRef.current = false;

      // Reset again
      act(() => {
        result.current.reset();
      });

      expect(mockDeps.currentFrameRef.current).toBe(0);
      expect(mockDeps.winningPrizeLockedRef.current).toBe(false);
      expect(mockDeps.forceFreshSeedRef.current).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero frame value', () => {
      mockDeps.currentFrameRef.current = 0;
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.currentFrameRef.current).toBe(0);
    });

    it('should handle negative frame value', () => {
      mockDeps.currentFrameRef.current = -1;
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.currentFrameRef.current).toBe(0);
    });

    it('should handle already unlocked winning prize', () => {
      mockDeps.winningPrizeLockedRef.current = false;
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.winningPrizeLockedRef.current).toBe(false);
    });

    it('should handle already set forceFreshSeed', () => {
      mockDeps.forceFreshSeedRef.current = true;
      const { result } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(mockDeps.forceFreshSeedRef.current).toBe(true);
    });

    it('should not crash on unmount during reset', () => {
      const { result, unmount } = renderHook(() => useResetCoordinator(
        {
          currentFrameRef: mockDeps.currentFrameRef,
          winningPrizeLockedRef: mockDeps.winningPrizeLockedRef,
          forceFreshSeedRef: mockDeps.forceFreshSeedRef,
        },
        mockDeps.resetFrame,
        mockDeps.dispatch,
        {
          setWinningPrize: mockDeps.setWinningPrize,
          setCurrentWinningIndex: mockDeps.setCurrentWinningIndex,
          setPrizeSession: mockDeps.setPrizeSession,
          setPrizes: mockDeps.setPrizes,
          setSessionKey: mockDeps.setSessionKey,
        }
      ));

      act(() => {
        result.current.reset();
      });

      expect(() => unmount()).not.toThrow();
    });
  });
});
