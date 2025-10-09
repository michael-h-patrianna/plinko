/**
 * Centralized reset orchestration for the Plinko game
 *
 * Provides a unified reset mechanism that ensures game state,
 * refs, and animations are properly cleaned up in sequence.
 *
 * REFACTORED: Uses individual stable parameters instead of a context object
 * to prevent unnecessary re-renders when unrelated state changes.
 */

import { useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { GameEvent } from '../game/stateMachine';
import type { PrizeProviderResult } from '../game/prizeProvider';
import type { PrizeConfig } from '../game/types';

/**
 * Hook providing centralized reset orchestration
 *
 * All parameters should be stable references (useCallback, useRef, etc.)
 * to prevent unnecessary re-renders of components using this hook.
 */
export interface UseResetCoordinatorResult {
  /** Execute full reset sequence - idempotent and guarded */
  reset: () => void;

  /** Check if reset is currently in progress */
  isResetting: () => boolean;
}

// Backwards compatibility: Keep ResetContext type for existing tests
export interface ResetContext {
  currentFrameRef: React.MutableRefObject<number>;
  resetFrame: () => void;
  dispatch: React.Dispatch<GameEvent>;
  setWinningPrize: React.Dispatch<React.SetStateAction<PrizeConfig | null>>;
  setCurrentWinningIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
  setPrizeSession: React.Dispatch<React.SetStateAction<PrizeProviderResult | null>>;
  setPrizes: React.Dispatch<React.SetStateAction<PrizeConfig[]>>;
  winningPrizeLockedRef: React.MutableRefObject<boolean>;
  forceFreshSeedRef: React.MutableRefObject<boolean>;
  setSessionKey: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Backwards-compatible overload for old context object signature
 * Automatically converts to new signature
 * @deprecated Use the new signature with separate parameters
 */
export function useResetCoordinator(context: ResetContext): UseResetCoordinatorResult;

/**
 * New signature with stable parameters
 *
 * PERFORMANCE NOTE: All parameters should be stable (wrapped in useCallback or refs)
 * to prevent unnecessary re-renders. The hook itself only re-creates the reset
 * callback if any of the stable references change (which should be never or rare).
 *
 * @param refs - Refs that need to be reset (currentFrameRef, winningPrizeLockedRef, forceFreshSeedRef)
 * @param resetFrame - Stable callback to reset animation frame
 * @param dispatch - State machine dispatch (stable from useReducer)
 * @param setters - State setters for prize/session data (stable from useState)
 */
export function useResetCoordinator(
  refs: {
    currentFrameRef: React.MutableRefObject<number>;
    winningPrizeLockedRef: React.MutableRefObject<boolean>;
    forceFreshSeedRef: React.MutableRefObject<boolean>;
  },
  resetFrame: () => void,
  dispatch: React.Dispatch<GameEvent>,
  setters: {
    setWinningPrize: React.Dispatch<React.SetStateAction<PrizeConfig | null>>;
    setCurrentWinningIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
    setPrizeSession: React.Dispatch<React.SetStateAction<PrizeProviderResult | null>>;
    setPrizes: React.Dispatch<React.SetStateAction<PrizeConfig[]>>;
    setSessionKey: React.Dispatch<React.SetStateAction<number>>;
  }
): UseResetCoordinatorResult;

/**
 * Implementation: handles both signatures
 */
export function useResetCoordinator(
  refsOrContext:
    | ResetContext
    | {
        currentFrameRef: React.MutableRefObject<number>;
        winningPrizeLockedRef: React.MutableRefObject<boolean>;
        forceFreshSeedRef: React.MutableRefObject<boolean>;
      },
  resetFrame?: () => void,
  dispatch?: React.Dispatch<GameEvent>,
  setters?: {
    setWinningPrize: React.Dispatch<React.SetStateAction<PrizeConfig | null>>;
    setCurrentWinningIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
    setPrizeSession: React.Dispatch<React.SetStateAction<PrizeProviderResult | null>>;
    setPrizes: React.Dispatch<React.SetStateAction<PrizeConfig[]>>;
    setSessionKey: React.Dispatch<React.SetStateAction<number>>;
  }
): UseResetCoordinatorResult {
  // Check if old signature (context object) was used
  const isOldSignature = 'resetFrame' in refsOrContext;

  // Extract parameters based on signature
  const refs = isOldSignature
    ? {
        currentFrameRef: (refsOrContext as ResetContext).currentFrameRef,
        winningPrizeLockedRef: (refsOrContext as ResetContext).winningPrizeLockedRef,
        forceFreshSeedRef: (refsOrContext as ResetContext).forceFreshSeedRef,
      }
    : (refsOrContext as {
        currentFrameRef: React.MutableRefObject<number>;
        winningPrizeLockedRef: React.MutableRefObject<boolean>;
        forceFreshSeedRef: React.MutableRefObject<boolean>;
      });

  const actualResetFrame = isOldSignature ? (refsOrContext as ResetContext).resetFrame : resetFrame!;
  const actualDispatch = isOldSignature ? (refsOrContext as ResetContext).dispatch : dispatch!;
  const actualSetters = isOldSignature
    ? {
        setWinningPrize: (refsOrContext as ResetContext).setWinningPrize,
        setCurrentWinningIndex: (refsOrContext as ResetContext).setCurrentWinningIndex,
        setPrizeSession: (refsOrContext as ResetContext).setPrizeSession,
        setPrizes: (refsOrContext as ResetContext).setPrizes,
        setSessionKey: (refsOrContext as ResetContext).setSessionKey,
      }
    : setters!;

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
      refs.currentFrameRef.current = 0;
      actualResetFrame();

      // Phase 2-3: Batch state updates for consistency
      // flushSync ensures all updates happen synchronously
      flushSync(() => {
        actualDispatch({ type: 'RESET_REQUESTED' });
        actualSetters.setWinningPrize(null);
        actualSetters.setCurrentWinningIndex(undefined);
        actualSetters.setPrizeSession(null);
        actualSetters.setPrizes([]);
      });

      // Phase 4: Release locks
      refs.winningPrizeLockedRef.current = false;
      refs.forceFreshSeedRef.current = true;

      // Phase 5: Trigger re-initialization
      actualSetters.setSessionKey((key) => key + 1);
    } catch (error) {
      console.error('[ResetCoordinator] Reset failed:', error);
    } finally {
      resetInProgressRef.current = false;
    }
  }, [refs, actualResetFrame, actualDispatch, actualSetters]);

  const isResetting = useCallback(() => {
    return resetInProgressRef.current;
  }, []);

  return {
    reset,
    isResetting,
  };
}
