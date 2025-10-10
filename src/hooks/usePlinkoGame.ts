/**
 * Main game orchestration hook
 * Manages state machine, animation loop, and game lifecycle
 *
 * This hook composes three specialized hooks:
 * - usePrizeSession: Prize loading and session management
 * - useGameAnimation: Frame store and animation loop
 * - useGameState: State machine transitions and game logic
 */

import { useCallback, useRef, useState } from 'react';
import type { ChoiceMechanic } from '../dev-tools';
import { usePrizeSession } from './usePrizeSession';
import { useGameAnimation } from './useGameAnimation';
import { useGameState } from './useGameState';
import { useResetCoordinator } from './useResetCoordinator';

interface UsePlinkoGameOptions {
  seedOverride?: number;
  boardWidth?: number;
  boardHeight?: number;
  pegRows?: number;
  choiceMechanic?: ChoiceMechanic;
}

export function usePlinkoGame(options: UsePlinkoGameOptions = {}) {
  const {
    seedOverride,
    boardWidth = 375,
    boardHeight = 500,
    pegRows = 10,
    choiceMechanic = 'none',
  } = options;

  const [sessionKey, setSessionKey] = useState(0);
  // Force fresh seed on resets (ignores URL/prop seed overrides) - using ref to avoid triggering effects
  const forceFreshSeedRef = useRef(false);
  const currentFrameRef = useRef(0);

  // Prize session management
  const {
    prizeSession,
    prizes,
    isLoading: isLoadingSession,
    error: loadError,
    winningPrize,
    currentWinningIndex,
    winningPrizeLockedRef,
    setPrizes,
    setWinningPrize,
    setCurrentWinningIndex,
    setPrizeSession,
  } = usePrizeSession({
    seedOverride,
    forceFreshSeedRef,
    sessionKey,
  });

  // Game state machine
  const {
    state,
    context,
    trajectory,
    selectedIndex,
    startGame,
    selectDropPosition,
    completeCountdown,
    claimPrize,
    dispatch,
    getBallPosition,
    getCurrentTrajectoryPoint,
    _regenerateTrajectoryForSlot,
  } = useGameState({
    prizeSession,
    boardWidth,
    boardHeight,
    pegRows,
    choiceMechanic,
    currentFrameRef,
    winningPrize,
    winningPrizeLockedRef,
    setWinningPrize,
    setCurrentWinningIndex,
    setPrizes,
  });

  // Frame store for animation synchronization
  // NOTE: Actual animation loop is now in ballAnimationDriver (consolidated to single RAF loop)
  const { frameStore, resetFrame } = useGameAnimation({
    currentFrameRef,
  });

  // Reset coordinator - centralized, ordered reset logic
  // Uses stable references to prevent unnecessary re-renders
  const resetCoordinator = useResetCoordinator(
    {
      currentFrameRef,
      winningPrizeLockedRef,
      forceFreshSeedRef,
    },
    resetFrame,
    dispatch,
    {
      setWinningPrize,
      setCurrentWinningIndex,
      setPrizeSession,
      setPrizes,
      setSessionKey,
    }
  );

  const resetGame = useCallback(() => {
    // Uses centralized reset coordinator to ensure all state is cleaned up
    // in the correct order. See docs/RESET_ORCHESTRATION.md for details.
    resetCoordinator.reset();
  }, [resetCoordinator]);

  const onLandingComplete = useCallback(() => {
    dispatch({ type: 'LANDING_COMPLETED' });
  }, [dispatch]);

  // Computed values derived from refs for convenience
  // Used by components that need current ball position/trajectory
  const ballPosition = getBallPosition();
  const currentTrajectoryPoint = getCurrentTrajectoryPoint();

  return {
    state,
    prizes,
    selectedPrize: winningPrize, // ALWAYS use the stored winning prize, not derived from swapped array
    selectedIndex,
    winningIndex: currentWinningIndex,
    trajectory,
    trajectoryCache: context.trajectoryCache,
    frameStore,
    currentFrameRef,
    getBallPosition,
    getCurrentTrajectoryPoint,
    ballPosition,
    currentTrajectoryPoint,
    startGame,
    selectDropPosition,
    completeCountdown,
    claimPrize,
    resetGame,
    onLandingComplete,
    canClaim: state === 'revealed',
    isLoadingPrizes: isLoadingSession,
    prizeLoadError: loadError,
    /**
     * Internal API - Not for production use
     *
     * These are low-level state setters exposed only for:
     * - Unit tests that need to set up specific game states
     * - Dev tools that manipulate game behavior during development
     *
     * Production code should NEVER access _internal methods.
     * Use the public API (startGame, claimPrize, etc.) instead.
     */
    _internal: {
      setWinningPrize,
      setCurrentWinningIndex,
      regenerateTrajectoryForSlot: _regenerateTrajectoryForSlot,
    },
  };
}
