/**
 * Game state machine management hook
 * Handles state transitions, trajectory management, and prize swapping logic
 */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { ChoiceMechanic } from '../dev-tools';
import type { PrizeProviderResult } from '../game/prizeProvider';
import { initialContext, transition, type GameEvent } from '../game/stateMachine';
import { generateTrajectory } from '../game/trajectory';
import { initializeTrajectoryAndPrizes } from '../game/trajectoryInitialization';
import type { BallPosition, DropZone, GameContext, GameState, PrizeConfig, TrajectoryPoint, TrajectoryCache } from '../game/types';
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

  // Stabilize setState functions to prevent effect re-runs
  // These are passed from parent and may have unstable references
  // Using useCallback here doesn't actually stabilize them, so we use refs instead
  const setWinningPrizeRef = useRef(setWinningPrize);
  const setCurrentWinningIndexRef = useRef(setCurrentWinningIndex);
  const setPrizesRef = useRef(setPrizes);

  // Keep refs up to date
  useEffect(() => {
    setWinningPrizeRef.current = setWinningPrize;
    setCurrentWinningIndexRef.current = setCurrentWinningIndex;
    setPrizesRef.current = setPrizes;
  });

  // Store initialization result to coordinate between effects
  // This ensures trajectory initialization completes before state machine dispatch
  const [initializationResult, setInitializationResult] = useState<{
    selectedIndex: number;
    trajectory: TrajectoryPoint[];
    prize: PrizeConfig;
    seed: number;
    trajectoryCache: TrajectoryCache | null;
    swappedPrizes: PrizeConfig[];
    winningPrizeVisualIndex: number;
  } | null>(null);

  /**
   * INITIALIZATION SEQUENCE:
   *
   * Effect 1 (Session Detection & Prize Locking):
   * - Detects new prize session by comparing seeds
   * - Locks winning prize BEFORE any swaps occur
   * - Guards against overwriting locked prizes
   *
   * Effect 2 (Trajectory Initialization):
   * - Generates trajectory and performs prize swapping
   * - Updates prizes array and visual index
   * - Stores result for state machine dispatch
   *
   * Effect 3 (State Machine Dispatch):
   * - Dispatches INITIALIZE event to state machine
   * - Only runs after trajectory initialization completes
   */

  // Effect 1: Session detection and prize locking
  // Purpose: Lock winning prize when new session detected
  useEffect(() => {
    if (
      prizeSession &&
      gameState.state === 'idle' &&
      initializedSessionId.current !== prizeSession.seed
    ) {
      // Mark this session as initialized
      initializedSessionId.current = prizeSession.seed;

      const sessionPrizes = [...prizeSession.prizes];
      const winningIndex = prizeSession.winningIndex;

      // Store the winning prize BEFORE any swaps
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

      // Lock the winning prize
      setWinningPrizeRef.current(actualWinningPrize);
      winningPrizeLockedRef.current = true;
    }
  }, [prizeSession, gameState.state, winningPrizeLockedRef]);

  // Effect 2: Trajectory initialization
  // Purpose: Generate trajectory and swap prizes when new session is locked
  useEffect(() => {
    if (
      prizeSession &&
      gameState.state === 'idle' &&
      initializedSessionId.current === prizeSession.seed &&
      winningPrizeLockedRef.current &&
      !initializationResult // Only run if not already initialized
    ) {
      const sessionPrizes = [...prizeSession.prizes];
      const winningIndex = prizeSession.winningIndex;

      // Initialize trajectory and arrange prizes
      // In choice mode: DON'T swap prizes! User will see them and select drop position.
      //                 Trajectory will be generated later when user selects drop position.
      // In classic mode: Swap prizes so winning prize appears at landed slot
      const useChoiceMode = choiceMechanic === 'drop-position';

      if (useChoiceMode) {
        // Choice mode: Keep prizes in original order, don't generate trajectory yet
        // User needs to see the actual prizes before choosing drop position
        setPrizesRef.current(sessionPrizes); // Original order!
        setCurrentWinningIndexRef.current(winningIndex); // Original winning index!

        // Store minimal initialization (trajectory will be generated when user selects drop position)
        setInitializationResult({
          selectedIndex: winningIndex, // Will be updated when drop position selected
          trajectory: [], // Will be generated when drop position selected
          prize: sessionPrizes[winningIndex]!,
          seed: prizeSession.seed,
          trajectoryCache: null,
          swappedPrizes: sessionPrizes, // Not swapped!
          winningPrizeVisualIndex: winningIndex,
        });
      } else {
        // Classic mode: Generate trajectory and swap prizes
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
            useChoiceMechanic: false, // Classic mode swaps prizes
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

        // Update prizes array with swapped prizes
        setPrizesRef.current(result.swappedPrizes);
        setCurrentWinningIndexRef.current(result.winningPrizeVisualIndex);

        // Store initialization result
        setInitializationResult({
          selectedIndex: result.landedSlot,
          trajectory: result.trajectory,
          prize: result.prizeAtLandedSlot,
          seed: prizeSession.seed,
          trajectoryCache: result.trajectoryCache,
          swappedPrizes: result.swappedPrizes,
          winningPrizeVisualIndex: result.winningPrizeVisualIndex,
        });
      }
    }
  }, [
    prizeSession,
    gameState.state,
    boardWidth,
    boardHeight,
    pegRows,
    choiceMechanic,
    winningPrizeLockedRef,
    initializationResult,
  ]);

  // Effect 3: State machine dispatch
  // Purpose: Dispatch INITIALIZE event after trajectory is ready
  useEffect(() => {
    if (gameState.state === 'idle' && initializationResult) {
      dispatch({
        type: 'INITIALIZE',
        payload: {
          selectedIndex: initializationResult.selectedIndex,
          trajectory: initializationResult.trajectory,
          prize: initializationResult.prize,
          seed: initializationResult.seed,
          trajectoryCache: initializationResult.trajectoryCache,
        },
      });

      // Clear initialization result after dispatch
      setInitializationResult(null);
    }
  }, [gameState.state, initializationResult]);

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
        // CRITICAL: Use choice mode = true so trajectory targets winning slot without swapping
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
            useChoiceMechanic: true, // USER CHOSE DROP POSITION - must target winning slot!
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

        // In choice mode, prizes are NOT swapped (already in original order)
        // No need to update setPrizes since they haven't changed from initialization
        // setPrizes and setCurrentWinningIndex are already set during initialization

        // Dispatch position selected
        dispatch({
          type: 'POSITION_SELECTED',
          payload: {
            dropZone,
            trajectory: result.trajectory,
            selectedIndex: result.landedSlot,
            prize: result.prizeAtLandedSlot,
            trajectoryCache: result.trajectoryCache,
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
          trajectoryCache: trajectoryResult.cache,
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
