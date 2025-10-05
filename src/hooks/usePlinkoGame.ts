/**
 * Main game orchestration hook
 * Manages state machine, animation loop, and game lifecycle
 */

import { useEffect, useReducer, useRef, useMemo, useState, useCallback } from 'react';
import type { GameState, GameContext, BallPosition, PrizeConfig, DropZone } from '../game/types';
import { transition, initialContext, type GameEvent } from '../game/stateMachine';
import { selectPrize } from '../game/rng';
import { createValidatedProductionPrizeSet } from '../config/productionPrizeTable';
import { generateTrajectory } from '../game/trajectory';
import type { ChoiceMechanic } from '../dev-tools';

// Frame store for efficient per-frame updates without re-rendering entire tree
interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getCurrentFrame: () => number;
}

interface PlinkoGameState {
  state: GameState;
  context: GameContext;
}

function gameReducer(state: PlinkoGameState, event: GameEvent): PlinkoGameState {
  const result = transition(state.state, state.context, event);
  return result;
}

interface UsePlinkoGameOptions {
  seedOverride?: number;
  boardWidth?: number;
  boardHeight?: number;
  pegRows?: number;
  choiceMechanic?: ChoiceMechanic;
}

export function usePlinkoGame(options: UsePlinkoGameOptions = {}) {
  const { seedOverride, boardWidth = 375, boardHeight = 500, pegRows = 10, choiceMechanic = 'none' } = options;

  // Generate random prize set for each game session
  const [prizes, setPrizes] = useState<PrizeConfig[]>(() => createValidatedProductionPrizeSet());

  const [gameState, dispatch] = useReducer(gameReducer, {
    state: 'idle',
    context: initialContext,
  });

  const animationFrameRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number | null>(null);

  // Frame store: holds current frame in ref, notifies subscribers without causing re-renders
  const currentFrameRef = useRef(0);
  const frameListenersRef = useRef<Set<() => void>>(new Set());

  const frameStore: FrameStore = useMemo(
    () => ({
      subscribe: (listener: () => void) => {
        frameListenersRef.current.add(listener);
        return () => {
          frameListenersRef.current.delete(listener);
        };
      },
      getSnapshot: () => currentFrameRef.current,
      getCurrentFrame: () => currentFrameRef.current,
    }),
    []
  );

  // Initialize game: select prize and generate trajectory
  // Only run once on mount or when game is explicitly reset to idle
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (gameState.state === 'idle' && !hasInitialized.current) {
      hasInitialized.current = true;

      // Read seed from URL query params if available
      const urlParams = new URLSearchParams(window.location.search);
      const urlSeed = urlParams.get('seed');
      const finalSeed = seedOverride ?? (urlSeed ? parseInt(urlSeed, 10) : undefined);

      // NEW APPROACH: Generate trajectory first (random landing slot)
      const { selectedIndex: winningPrizeIndex, seedUsed } = selectPrize(prizes, finalSeed);

      const { trajectory, landedSlot } = generateTrajectory({
        boardWidth,
        boardHeight,
        pegRows,
        slotCount: prizes.length,
        seed: seedUsed,
      });

      // Rearrange prizes: swap winning prize to landed slot position
      const rearrangedPrizes = [...prizes];
      if (landedSlot !== winningPrizeIndex) {
        // Swap: put winning prize in landed slot, move landed slot prize to winning position
        const temp = rearrangedPrizes[landedSlot]!;
        rearrangedPrizes[landedSlot] = rearrangedPrizes[winningPrizeIndex]!;
        rearrangedPrizes[winningPrizeIndex] = temp;
      }

      // Update prizes state with rearranged array
      setPrizes(rearrangedPrizes);

      // The winning prize is now at landedSlot position
      const prize = rearrangedPrizes[landedSlot]!;

      dispatch({
        type: 'INITIALIZE',
        payload: { selectedIndex: landedSlot, trajectory, prize, seed: seedUsed },
      });
    } else if (gameState.state !== 'idle') {
      hasInitialized.current = false;
    }
  }, [gameState.state, seedOverride, boardWidth, boardHeight, pegRows, prizes]);

  // Track if animation is already running
  const landingTimeoutRef = useRef<number | null>(null);

  // Animation loop for dropping state - only runs when state changes to 'dropping'
  useEffect(() => {
    if (gameState.state === 'dropping') {
      const FPS = 60;
      const frameInterval = 1000 / FPS;
      const totalDuration = (gameState.context.trajectory.length / FPS) * 1000;

      const animate = (timestamp: number) => {
        if (startTimestampRef.current === null) {
          startTimestampRef.current = timestamp;
        }

        const elapsed = timestamp - startTimestampRef.current;
        const currentFrameIndex = Math.min(
          Math.floor(elapsed / frameInterval),
          gameState.context.trajectory.length - 1
        );

        // Update frame in ref (not state!) and notify subscribers
        currentFrameRef.current = currentFrameIndex;
        frameListenersRef.current.forEach((listener) => listener());

        if (currentFrameIndex < gameState.context.trajectory.length - 1) {
          // Continue animation
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      // Set timeout for landing based on total duration
      landingTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'LANDING_COMPLETED' });
      }, totalDuration + 500);

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (landingTimeoutRef.current !== null) {
          clearTimeout(landingTimeoutRef.current);
          landingTimeoutRef.current = null;
        }
        startTimestampRef.current = null;
        // Don't reset frame on cleanup - keep ball at last position
        // currentFrameRef.current = 0;
      };
    }
  }, [gameState.state, gameState.context.trajectory.length]);

  // Auto-reveal prize after landing
  useEffect(() => {
    if (gameState.state === 'landed') {
      const timer = setTimeout(() => {
        dispatch({ type: 'REVEAL_CONFIRMED' });
      }, 300);
      return () => clearTimeout(timer);
    }
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

  const startGame = () => {
    if (gameState.state === 'ready') {
      // If drop position mechanic is enabled, transition to selecting-position state
      if (choiceMechanic === 'drop-position') {
        dispatch({ type: 'START_POSITION_SELECTION' });
      } else {
        dispatch({ type: 'DROP_REQUESTED' });
      }
    }
  };

  const selectDropPosition = useCallback((dropZone: DropZone) => {
    if (gameState.state === 'selecting-position') {
      // Regenerate trajectory with the selected drop zone
      // Use the existing seed from context
      const currentSeed = gameState.context.seed || Date.now();

      const { trajectory, landedSlot } = generateTrajectory({
        boardWidth,
        boardHeight,
        pegRows,
        slotCount: prizes.length,
        seed: currentSeed,
        dropZone, // Pass the selected drop zone
      });

      // Rearrange prizes to match landed slot
      const rearrangedPrizes = [...prizes];
      const currentWinningIndex = gameState.context.selectedIndex;

      if (landedSlot !== currentWinningIndex) {
        const temp = rearrangedPrizes[landedSlot]!;
        rearrangedPrizes[landedSlot] = rearrangedPrizes[currentWinningIndex]!;
        rearrangedPrizes[currentWinningIndex] = temp;
      }

      setPrizes(rearrangedPrizes);
      const prize = rearrangedPrizes[landedSlot]!;

      // Dispatch position selected with new trajectory data
      dispatch({
        type: 'POSITION_SELECTED',
        payload: {
          dropZone,
          trajectory,
          selectedIndex: landedSlot,
          prize,
        },
      });
    }
  }, [gameState.state, gameState.context.seed, gameState.context.selectedIndex, prizes, boardWidth, boardHeight, pegRows]);

  const resetGame = () => {
    // Reset frame to 0 for new game
    currentFrameRef.current = 0;
    // Generate new random prize set for next game
    setPrizes(createValidatedProductionPrizeSet());
    dispatch({ type: 'RESET_REQUESTED' });
  };

  const claimPrize = () => {
    // In real app, this would call backend API
    // TODO: Integrate with backend prize claiming endpoint
    dispatch({ type: 'CLAIM_REQUESTED' });
  };

  const completeCountdown = () => {
    dispatch({ type: 'COUNTDOWN_COMPLETED' });
  };

  // Provide backwards-compatible computed values (but they're derived from refs, not state)
  // These will still cause re-renders in tests, but not in production with the subscription pattern
  const ballPosition = getBallPosition();
  const currentTrajectoryPoint = getCurrentTrajectoryPoint();

  return {
    state: gameState.state,
    prizes,
    selectedPrize: gameState.context.prize,
    selectedIndex: gameState.context.selectedIndex,
    trajectory: gameState.context.trajectory,
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
    canClaim: gameState.state === 'revealed',
  };
}
