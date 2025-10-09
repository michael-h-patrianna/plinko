/**
 * Centralized reset orchestration for the Plinko game
 *
 * Provides a unified reset mechanism that ensures game state,
 * refs, and animations are properly cleaned up in sequence.
 */

import { useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { GameEvent } from '../game/stateMachine';
import type { PrizeProviderResult } from '../game/prizeProvider';
import type { PrizeConfig } from '../game/types';

/**
 * Context required to execute a complete game reset
 * All refs and setters needed to cleanup game state
 */
export interface ResetContext {
  // Animation cleanup
  currentFrameRef: React.MutableRefObject<number>;
  resetFrame: () => void;

  // State machine
  dispatch: React.Dispatch<GameEvent>;

  // Prize state
  setWinningPrize: React.Dispatch<React.SetStateAction<PrizeConfig | null>>;
  setCurrentWinningIndex: React.Dispatch<React.SetStateAction<number | undefined>>;

  // Session state
  setPrizeSession: React.Dispatch<React.SetStateAction<PrizeProviderResult | null>>;
  setPrizes: React.Dispatch<React.SetStateAction<PrizeConfig[]>>;

  // Lock guards
  winningPrizeLockedRef: React.MutableRefObject<boolean>;
  forceFreshSeedRef: React.MutableRefObject<boolean>;

  // Session trigger
  setSessionKey: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Hook providing centralized reset orchestration
 */
export interface UseResetCoordinatorResult {
  /** Execute full reset sequence - idempotent and guarded */
  reset: () => void;

  /** Check if reset is currently in progress */
  isResetting: () => boolean;
}

export function useResetCoordinator(context: ResetContext): UseResetCoordinatorResult {
  const resetInProgressRef = useRef(false);

  /**
   * Execute the complete reset sequence
   * Uses flushSync to batch state updates for consistency
   */
  const reset = useCallback(() => {
    // Guard against concurrent resets
    if (resetInProgressRef.current) {
      if (import.meta.env.DEV) {
        console.warn('[ResetCoordinator] Reset already in progress');
      }
      return;
    }

    resetInProgressRef.current = true;

    try {
      // Phase 1: Animation cleanup
      context.currentFrameRef.current = 0;
      context.resetFrame();

      // Phase 2-3: Batch state updates for consistency
      // flushSync ensures all updates happen synchronously
      flushSync(() => {
        context.dispatch({ type: 'RESET_REQUESTED' });
        context.setWinningPrize(null);
        context.setCurrentWinningIndex(undefined);
        context.setPrizeSession(null);
        context.setPrizes([]);
      });

      // Phase 4: Release locks
      context.winningPrizeLockedRef.current = false;
      context.forceFreshSeedRef.current = true;

      // Phase 5: Trigger re-initialization
      context.setSessionKey((key) => key + 1);
    } catch (error) {
      console.error('[ResetCoordinator] Reset failed:', error);
    } finally {
      resetInProgressRef.current = false;
    }
  }, [context]);

  const isResetting = useCallback(() => {
    return resetInProgressRef.current;
  }, []);

  return {
    reset,
    isResetting,
  };
}
