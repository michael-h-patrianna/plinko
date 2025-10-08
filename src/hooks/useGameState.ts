/**
 * Game state machine management hook
 * Handles state transitions, trajectory management, and prize swapping logic
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { ChoiceMechanic } from '../dev-tools';
import type { PrizeProviderResult } from '../game/prizeProvider';
import { initialContext, transition, type GameEvent } from '../game/stateMachine';
import { generateTrajectory } from '../game/trajectory';
import type { BallPosition, DropZone, GameContext, GameState, PrizeConfig, TrajectoryPoint } from '../game/types';

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
      // This is what the user will actually win - immutable safety net
      const actualWinningPrize = sessionPrizes[winningIndex]!;

      // Guard against overwriting locked winning prize (should only happen if resetGame wasn't called properly)
      if (winningPrizeLockedRef.current) {
        console.error(
          'CRITICAL: Attempted to overwrite locked winning prize. ' +
            'This should not happen - resetGame() should unlock before re-initialization. ' +
            `Current session: ${prizeSession.seed}, Lock status: ${winningPrizeLockedRef.current}`
        );
        return;
      }
      setWinningPrize(actualWinningPrize);
      winningPrizeLockedRef.current = true;

      // STEP 2: Generate trajectory - let ball land wherever it naturally lands (fast - usually 1 attempt)
      // Do NOT pass targetSlot - that causes thousands of attempts
      let trajectoryResult;
      try {
        trajectoryResult = generateTrajectory({
          boardWidth,
          boardHeight,
          pegRows,
          slotCount: sessionPrizes.length,
          seed: prizeSession.seed,
          precomputedTrajectory: prizeSession.deterministicTrajectory,
        });
      } catch (error) {
        console.error('Failed to generate trajectory:', error);
        // Reset to idle state on trajectory generation failure
        dispatch({ type: 'RESET_REQUESTED' });
        return;
      }

      const landedSlot = trajectoryResult.landedSlot;

      // STEP 3: Swap prizes array for visual display only
      // After swap, the winning prize will be at landedSlot position visually
      if (landedSlot !== winningIndex && landedSlot >= 0) {
        const temp = sessionPrizes[landedSlot]!;
        sessionPrizes[landedSlot] = sessionPrizes[winningIndex]!;
        sessionPrizes[winningIndex] = temp;
      }

      setPrizes(sessionPrizes);
      // Track where the winning prize is visually (for red dot indicator)
      setCurrentWinningIndex(landedSlot);

      // Initialize game state with trajectory and selectedIndex
      dispatch({
        type: 'INITIALIZE',
        payload: {
          selectedIndex: landedSlot,
          trajectory: trajectoryResult.trajectory,
          prize: sessionPrizes[landedSlot]!,
          seed: prizeSession.seed,
        },
      });
    }
  }, [
    boardWidth,
    boardHeight,
    pegRows,
    gameState.state,
    prizeSession?.seed,
    prizeSession?.prizes.length,
    prizeSession?.winningIndex,
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
      }, 320);
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

        // Reset prizes to original session order
        const freshPrizes = [...prizeSession.prizes];
        const winningIndex = prizeSession.winningIndex;

        // STEP 1: The winning prize is already stored in state, don't change it
        // winningPrize remains immutable

        // STEP 2: Generate new trajectory with drop zone - let ball land wherever it naturally lands
        // Do NOT pass targetSlot - that causes thousands of attempts
        let trajectoryResult;
        try {
          trajectoryResult = generateTrajectory({
            boardWidth,
            boardHeight,
            pegRows,
            slotCount: freshPrizes.length,
            seed: currentSeed,
            dropZone,
            precomputedTrajectory: prizeSession.deterministicTrajectory,
          });
        } catch (error) {
          console.error('Failed to generate trajectory with drop zone:', error);
          // Reset to ready state on trajectory generation failure
          dispatch({ type: 'RESET_REQUESTED' });
          return;
        }

        const landedSlot = trajectoryResult.landedSlot;

        // STEP 3: Swap prizes array for visual display only
        // After swap, the winning prize will be at landedSlot position visually
        if (landedSlot !== winningIndex && landedSlot >= 0) {
          const temp = freshPrizes[landedSlot]!;
          freshPrizes[landedSlot] = freshPrizes[winningIndex]!;
          freshPrizes[winningIndex] = temp;
        }

        setPrizes(freshPrizes);
        // Track where the winning prize is visually (for red dot indicator)
        setCurrentWinningIndex(landedSlot);

        // Dispatch position selected with new trajectory and selectedIndex
        dispatch({
          type: 'POSITION_SELECTED',
          payload: {
            dropZone,
            trajectory: trajectoryResult.trajectory,
            selectedIndex: landedSlot,
            prize: freshPrizes[landedSlot]!,
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
      prizeSession?.seed,
      prizeSession?.prizes.length,
      prizeSession?.winningIndex,
      setPrizes,
      setCurrentWinningIndex,
    ]
  );

  const completeCountdown = useCallback(() => {
    dispatch({ type: 'COUNTDOWN_COMPLETED' });
  }, []);

  const claimPrize = useCallback(() => {
    // In real app, this would call backend API
    // TODO: Integrate with backend prize claiming endpoint
    dispatch({ type: 'CLAIM_REQUESTED' });
  }, []);

  /**
   * Internal dev tool method: Regenerate trajectory to target a specific slot
   * This is used by dev tools to force the ball to land at a chosen slot
   */
  const regenerateTrajectoryForSlot = useCallback(
    (targetSlotIndex: number) => {
      if (!prizeSession) {
        console.error('[DevTools] Cannot regenerate trajectory: no prize session');
        return;
      }

      if (gameState.state !== 'ready') {
        console.error(`[DevTools] Can only regenerate trajectory in 'ready' state, current: ${gameState.state}`);
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
        console.error('[DevTools] Failed to generate targeted trajectory:', error);
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

      console.log(`[DevTools] Regenerated trajectory to target slot ${targetSlotIndex}`);
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
