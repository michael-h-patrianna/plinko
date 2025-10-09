/**
 * Game state machine management hook
 * Handles state transitions, trajectory management, and prize swapping logic
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { ChoiceMechanic } from '../dev-tools';
import type { PrizeProviderResult } from '../game/prizeProvider';
import { initialContext, transition, type GameEvent } from '../game/stateMachine';
import { generateTrajectory } from '../game/trajectory';
import { initializeTrajectoryAndPrizes } from '../game/trajectoryInitialization';
import type { BallPosition, DropZone, GameContext, GameState, PrizeConfig, TrajectoryPoint } from '../game/types';
import { GAME_TIMEOUT } from '../constants';
import { trackStateError } from '../utils/telemetry';

interface PlinkoGameState {
  state: GameState;
  context: GameContext;
}

function gameReducer(state: PlinkoGameState, event: GameEvent): PlinkoGameState {
  const result = transition(state.state, state.context, event);
  return result;
}

interface UseGameStateOptions {
  prizeSession: PrizeProviderResult | null;
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  choiceMechanic: ChoiceMechanic;
  currentFrameRef: React.MutableRefObject<number>;
  winningPrize: PrizeConfig | null;
  winningPrizeLockedRef: React.MutableRefObject<boolean>;
  setWinningPrize: React.Dispatch<React.SetStateAction<PrizeConfig | null>>;
  setCurrentWinningIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
  setPrizes: React.Dispatch<React.SetStateAction<PrizeConfig[]>>;
}

interface UseGameStateResult {
  state: GameState;
  context: GameContext;
  trajectory: TrajectoryPoint[];
  selectedIndex: number;

  // State transition functions
  startGame: () => void;
  selectDropPosition: (dropZone: DropZone) => void;
  completeCountdown: () => void;
  claimPrize: () => void;
  dispatch: React.Dispatch<GameEvent>;

  // Helper functions
  getBallPosition: () => BallPosition | null;
  getCurrentTrajectoryPoint: () => TrajectoryPoint | null;

  // Dev tools / testing
  _regenerateTrajectoryForSlot: (targetSlotIndex: number) => void;
}

export function useGameState(options: UseGameStateOptions): UseGameStateResult {
  const {
    prizeSession,
    boardWidth,
    boardHeight,
    pegRows,
    choiceMechanic,
    currentFrameRef,
    winningPrizeLockedRef,
    setWinningPrize,
    setCurrentWinningIndex,
    setPrizes,
  } = options;

  const [gameState, dispatch] = useReducer(gameReducer, {
    state: 'idle',
    context: initialContext,
  });

  // Track which session has been initialized by its seed (not a boolean)
  const initializedSessionId = useRef<number | null>(null);

  // Initialization effect - runs once per unique session
  useEffect(() => {
    if (
      prizeSession &&
      gameState.state === 'idle' &&
      initializedSessionId.current !== prizeSession.seed
    ) {
      initializedSessionId.current = prizeSession.seed;

      const sessionPrizes = [...prizeSession.prizes];
      const winningIndex = prizeSession.winningIndex;

      // STEP 1: Store the winning prize BEFORE any swaps
      const actualWinningPrize = sessionPrizes[winningIndex]!;

      // Guard against overwriting locked winning prize
      if (winningPrizeLockedRef.current) {
        trackStateError({
          currentState: gameState.state,
          event: 'INITIALIZE',
          error: 'Attempted to overwrite locked winning prize',
        });
        return;
      }
      setWinningPrize(actualWinningPrize);
      winningPrizeLockedRef.current = true;

      // STEP 2: Initialize trajectory and swap prizes
      let result;
      try {
        result = initializeTrajectoryAndPrizes({
          boardWidth,
          boardHeight,
          pegRows,
          prizes: sessionPrizes,
          winningIndex,
          seed: prizeSession.seed,
          precomputedTrajectory: prizeSession.deterministicTrajectory,
        });
      } catch (error) {
        trackStateError({
          currentState: gameState.state,
          event: 'INITIALIZE',
          error: `Failed to initialize trajectory: ${error instanceof Error ? error.message : String(error)}`,
        });
        dispatch({ type: 'RESET_REQUESTED' });
        return;
      }

      // STEP 3: Update state with swapped prizes
      setPrizes(result.swappedPrizes);
      setCurrentWinningIndex(result.winningPrizeVisualIndex);

      // Initialize game state
      dispatch({
        type: 'INITIALIZE',
        payload: {
          selectedIndex: result.landedSlot,
          trajectory: result.trajectory,
          prize: result.prizeAtLandedSlot,
          seed: prizeSession.seed,
        },
      });
    }
  }, [
    boardWidth,
    boardHeight,
    pegRows,
    gameState.state,
    prizeSession,
    winningPrizeLockedRef,
    setWinningPrize,
    setCurrentWinningIndex,
    setPrizes,
  ]);

  // Auto-reveal prize after landing
  useEffect(() => {
    if (gameState.state === 'landed') {
      const timer = setTimeout(() => {
        dispatch({ type: 'REVEAL_CONFIRMED' });
      }, GAME_TIMEOUT.AUTO_REVEAL);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [gameState.state]);

  // Helper functions to get current position/trajectory without causing re-renders
  const getBallPosition = useCallback((): BallPosition | null => {
    if (gameState.state === 'idle' || gameState.state === 'ready') {
      return null;
    }

    const { trajectory } = gameState.context;
    const currentFrame = currentFrameRef.current;
    if (trajectory.length === 0 || !trajectory[currentFrame]) {
      return null;
    }

    const point = trajectory[currentFrame];
    return {
      x: point.x,
      y: point.y,
      rotation: point.rotation,
    };
  }, [gameState.state, gameState.context]);

  const getCurrentTrajectoryPoint = useCallback(() => {
    if (gameState.state === 'idle') return null;
    return gameState.context.trajectory[currentFrameRef.current] ?? null;
  }, [gameState.state, gameState.context.trajectory]);

  const startGame = useCallback(() => {
    if (gameState.state === 'ready') {
      // If drop position mechanic is enabled, transition to selecting-position state
      if (choiceMechanic === 'drop-position') {
        dispatch({ type: 'START_POSITION_SELECTION' });
      } else {
        dispatch({ type: 'DROP_REQUESTED' });
      }
    }
  }, [gameState.state, choiceMechanic]);

  const selectDropPosition = useCallback(
    (dropZone: DropZone) => {
      if (gameState.state === 'selecting-position' && prizeSession) {
        const currentSeed = gameState.context.seed || Date.now();

        // Re-initialize trajectory with drop zone
        let result;
        try {
          result = initializeTrajectoryAndPrizes({
            boardWidth,
            boardHeight,
            pegRows,
            prizes: [...prizeSession.prizes],
            winningIndex: prizeSession.winningIndex,
            seed: currentSeed,
            dropZone,
            precomputedTrajectory: prizeSession.deterministicTrajectory,
          });
        } catch (error) {
          trackStateError({
            currentState: gameState.state,
            event: 'POSITION_SELECTED',
            error: `Failed to initialize trajectory with drop zone: ${error instanceof Error ? error.message : String(error)}`,
          });
          dispatch({ type: 'RESET_REQUESTED' });
          return;
        }

        // Update state with swapped prizes
        setPrizes(result.swappedPrizes);
        setCurrentWinningIndex(result.winningPrizeVisualIndex);

        // Dispatch position selected
        dispatch({
          type: 'POSITION_SELECTED',
          payload: {
            dropZone,
            trajectory: result.trajectory,
            selectedIndex: result.landedSlot,
            prize: result.prizeAtLandedSlot,
          },
        });
      }
    },
    [
      gameState.state,
      gameState.context.seed,
      boardWidth,
      boardHeight,
      pegRows,
      prizeSession,
      setPrizes,
      setCurrentWinningIndex,
    ]
  );

  const completeCountdown = useCallback(() => {
    dispatch({ type: 'COUNTDOWN_COMPLETED' });
  }, []);

  const claimPrize = useCallback(() => {
    dispatch({ type: 'CLAIM_REQUESTED' });
  }, []);

  /**
   * Internal dev tool method: Regenerate trajectory to target a specific slot
   * This is used by dev tools to force the ball to land at a chosen slot
   */
  const regenerateTrajectoryForSlot = useCallback(
    (targetSlotIndex: number) => {
      if (!prizeSession) {
        if (import.meta.env.DEV) {
          console.error('[DevTools] Cannot regenerate trajectory: no prize session');
        }
        return;
      }

      if (gameState.state !== 'ready') {
        if (import.meta.env.DEV) {
          console.error(`[DevTools] Can only regenerate trajectory in 'ready' state, current: ${gameState.state}`);
        }
        return;
      }

      const currentSeed = gameState.context.seed || Date.now();

      // Generate trajectory targeting the specific slot
      let trajectoryResult;
      try {
        trajectoryResult = generateTrajectory({
          boardWidth,
          boardHeight,
          pegRows,
          slotCount: prizeSession.prizes.length,
          seed: currentSeed + targetSlotIndex, // Vary seed to get different trajectory
          targetSlot: targetSlotIndex, // Force it to land at this slot
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('[DevTools] Failed to generate targeted trajectory:', error);
        }
        return;
      }

      // Update game context with new trajectory and selectedIndex
      dispatch({
        type: 'INITIALIZE',
        payload: {
          selectedIndex: targetSlotIndex,
          trajectory: trajectoryResult.trajectory,
          prize: prizeSession.prizes[targetSlotIndex]!,
          seed: currentSeed + targetSlotIndex,
        },
      });

      if (import.meta.env.DEV) {
        console.log(`[DevTools] Regenerated trajectory to target slot ${targetSlotIndex}`);
      }
    },
    [gameState.state, gameState.context.seed, prizeSession, boardWidth, boardHeight, pegRows]
  );

  return {
    state: gameState.state,
    context: gameState.context,
    trajectory: gameState.context.trajectory,
    selectedIndex: gameState.context.selectedIndex,
    startGame,
    selectDropPosition,
    completeCountdown,
    claimPrize,
    dispatch,
    getBallPosition,
    getCurrentTrajectoryPoint,
    _regenerateTrajectoryForSlot: regenerateTrajectoryForSlot,
  };
}
