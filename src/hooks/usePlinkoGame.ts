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

  // Animation loop
  const { frameStore, resetFrame } = useGameAnimation({
    gameState: state,
    trajectory,
    onLandingComplete: () => {
      dispatch({ type: 'LANDING_COMPLETED' });
    },
    currentFrameRef,
  });

  const resetGame = useCallback(() => {
    // AUTOMATIC RESET: After claiming prize, reset game with fresh random prize table
    // This is called automatically when user closes prize popup to allow replay

    // Reset frame to 0 for new game
    resetFrame();
    currentFrameRef.current = 0;
    // Clear error state
    // Clear winning prize state
    setWinningPrize(null);
    setCurrentWinningIndex(undefined);
    // Clear prize session to prevent initialization with stale data
    setPrizeSession(null);
    setPrizes([]);
    // Force fresh random seed (ignores URL ?seed= parameter for automatic reset)
    forceFreshSeedRef.current = true;
    // Reset winning prize lock (allows new winning prize to be set)
    winningPrizeLockedRef.current = false;

    // Reset game state machine
    dispatch({ type: 'RESET_REQUESTED' });

    // Trigger new session load with fresh seed
    setSessionKey((key) => key + 1);
  }, [
    resetFrame,
    setWinningPrize,
    setCurrentWinningIndex,
    setPrizeSession,
    setPrizes,
    winningPrizeLockedRef,
    dispatch,
  ]);

  // Provide backwards-compatible computed values (but they're derived from refs, not state)
  // These will still cause re-renders in tests, but not in production with the subscription pattern
  const ballPosition = getBallPosition();
  const currentTrajectoryPoint = getCurrentTrajectoryPoint();

  return {
    state,
    prizes,
    selectedPrize: winningPrize, // ALWAYS use the stored winning prize, not derived from swapped array
    selectedIndex,
    winningIndex: currentWinningIndex,
    trajectory,
    frameStore,
    getBallPosition,
    getCurrentTrajectoryPoint,
    ballPosition,
    currentTrajectoryPoint,
    startGame,
    selectDropPosition,
    completeCountdown,
    claimPrize,
    resetGame,
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
