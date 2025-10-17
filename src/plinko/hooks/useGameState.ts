/**
 * Game state machine management hook
 * Handles state transitions, trajectory management, and prize swapping logic
 */

import type { ValueRef } from '@plinko/types/ref';
import type { PrizeProviderResult } from '@plinko/game/prizeProvider';
import { initialContext, transition, type GameEvent } from '@plinko/game/stateMachine';
import { generateTrajectory } from '@plinko/game/trajectory';
import { initializeTrajectoryAndPrizes } from '@plinko/game/trajectoryInitialization';
import type {
  BallPosition,
  DropZone,
  GameContext,
  GameState,
  PrizeConfig,
  TrajectoryCache,
  TrajectoryPoint,
} from '@plinko/game/types';
import { trackStateError } from '@plinko/utils/telemetry';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { GAME_TIMEOUT } from '@plinko/constants/timing';
import type { ChoiceMechanic } from '@demo/components/DevTools';

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
  currentFrameRef: ValueRef<number>;
  winningPrize: PrizeConfig | null;
  currentWinningIndex: number | undefined;
  winningPrizeLockedRef: ValueRef<boolean>;
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
    winningPrize,
    currentWinningIndex,
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

      // BOTH modes: Just set prizes and winning index, NO trajectory generation yet
      // Trajectory will be generated in startGame() or selectDropPosition()
      // This allows debug tools to modify winningIndex before trajectory is created
      setPrizesRef.current(sessionPrizes); // Original order!
      setCurrentWinningIndexRef.current(winningIndex); // Original winning index!

      // Store minimal initialization (trajectory will be generated when game starts)
      setInitializationResult({
        selectedIndex: winningIndex,
        trajectory: [], // Will be generated in startGame() or selectDropPosition()
        prize: sessionPrizes[winningIndex]!,
        seed: prizeSession.seed,
        trajectoryCache: null,
        swappedPrizes: sessionPrizes, // Not swapped yet!
        winningPrizeVisualIndex: winningIndex,
      });
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

  // Auto-advance from landed → celebrating
  useEffect(() => {
    if (gameState.state === 'landed') {
      const timer = setTimeout(() => {
        dispatch({ type: 'CELEBRATION_COMPLETED' });
      }, 300); // Brief delay before celebration starts
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [gameState.state]);

  // Auto-advance from celebrating → revealed
  useEffect(() => {
    if (gameState.state === 'celebrating') {
      const timer = setTimeout(() => {
        dispatch({ type: 'REVEAL_CONFIRMED' });
      }, GAME_TIMEOUT.AUTO_REVEAL); // Celebration duration handled by overlay
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [gameState.state]);

  // Helper functions to get current position/trajectory without causing re-renders
  const getBallPosition = useCallback((): BallPosition | null => {
    if (gameState.state === 'idle') {
      return null;
    }

    // BUG FIX: During 'ready' state, return default center position for BallLauncher
    // The BallLauncher shows a fake ball in the chamber before countdown starts
    // This ensures the chamber is visible at the top-center of the board
    if (gameState.state === 'ready') {
      return {
        x: boardWidth / 2,
        y: 30, // Top of board, below border
        rotation: 0,
        vx: 0,
        vy: 0,
      };
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
      vx: point.vx,
      vy: point.vy,
    };
  }, [gameState.state, gameState.context, boardWidth]);

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
        // Classic mode: Generate trajectory targeting current winningIndex
        // This respects any debug modifications (shift+click) to the winning prize
        if (!prizeSession || !winningPrize || currentWinningIndex === undefined) {
          trackStateError({
            currentState: gameState.state,
            event: 'CLASSIC_MODE_START',
            error: 'No prize session, winning prize, or winning index found',
          });
          dispatch({ type: 'RESET_REQUESTED' });
          return;
        }

        const currentSeed = gameState.context.seed || Date.now();
        const dropZone: DropZone = 'center';

        // Generate trajectory targeting the CURRENT winningIndex (may have been modified by debug tools)
        // Use choice mechanic = true so trajectory targets the winning slot without swapping
        let result;
        try {
          result = initializeTrajectoryAndPrizes({
            boardWidth,
            boardHeight,
            pegRows,
            prizes: [...prizeSession.prizes],
            winningIndex: currentWinningIndex, // Use current winning index, not original from session!
            seed: currentSeed,
            dropZone,
            precomputedTrajectory: prizeSession.deterministicTrajectory,
            useChoiceMechanic: true, // Target winning slot, no prize swapping
          });
        } catch (error) {
          trackStateError({
            currentState: gameState.state,
            event: 'CLASSIC_MODE_START',
            error: `Failed to generate trajectory: ${error instanceof Error ? error.message : String(error)}`,
          });
          dispatch({ type: 'RESET_REQUESTED' });
          return;
        }

        // Dispatch countdown transition with new trajectory
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
    }
  }, [gameState.state, gameState.context.seed, choiceMechanic, prizeSession, winningPrize, currentWinningIndex, boardWidth, boardHeight, pegRows]);

  const selectDropPosition = useCallback(
    (dropZone: DropZone) => {
      if (gameState.state === 'selecting-position' && prizeSession) {
        const currentSeed = gameState.context.seed || Date.now();

        // CRITICAL: Use currentWinningIndex (respects debug tool modifications)
        // Not prizeSession.winningIndex (original session value)
        if (currentWinningIndex === undefined) {
          trackStateError({
            currentState: gameState.state,
            event: 'POSITION_SELECTED',
            error: 'currentWinningIndex is undefined',
          });
          dispatch({ type: 'RESET_REQUESTED' });
          return;
        }

        // Re-initialize trajectory with drop zone
        // CRITICAL: Use choice mode = true so trajectory targets winning slot without swapping
        let result;
        try {
          result = initializeTrajectoryAndPrizes({
            boardWidth,
            boardHeight,
            pegRows,
            prizes: [...prizeSession.prizes],
            winningIndex: currentWinningIndex, // Use currentWinningIndex, not prizeSession.winningIndex!
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
      currentWinningIndex,
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
          console.error(
            `[DevTools] Can only regenerate trajectory in 'ready' state, current: ${gameState.state}`
          );
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
