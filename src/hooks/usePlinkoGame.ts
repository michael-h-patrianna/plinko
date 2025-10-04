/**
 * Main game orchestration hook
 * Manages state machine, animation loop, and game lifecycle
 */

import { useEffect, useReducer, useRef, useMemo, useState } from 'react';
import type { GameState, GameContext, BallPosition, PrizeConfig } from '../game/types';
import { transition, initialContext, type GameEvent } from '../game/stateMachine';
import { selectPrize } from '../game/rng';
import { generateTrajectory } from '../game/trajectory';
import { createValidatedProductionPrizeSet, getPrizeByIndex } from '../config/productionPrizeTable';

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
}

export function usePlinkoGame(options: UsePlinkoGameOptions = {}) {
  const {
    seedOverride,
    boardWidth = 375,
    boardHeight = 500,
    pegRows = 10
  } = options;

  // Generate random prize set for each game session
  const [prizes, setPrizes] = useState<PrizeConfig[]>(() => createValidatedProductionPrizeSet());

  const [gameState, dispatch] = useReducer(gameReducer, {
    state: 'idle',
    context: initialContext
  });

  const animationFrameRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number | null>(null);

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

      const { selectedIndex, seedUsed } = selectPrize(prizes, finalSeed);
      const prize = getPrizeByIndex(prizes, selectedIndex);

      const trajectory = generateTrajectory({
        boardWidth,
        boardHeight,
        pegRows,
        slotCount: prizes.length,
        selectedIndex,
        seed: seedUsed
      });

      dispatch({
        type: 'INITIALIZE',
        payload: { selectedIndex, trajectory, prize, seed: seedUsed }
      });
    } else if (gameState.state !== 'idle') {
      hasInitialized.current = false;
    }
  }, [gameState.state, seedOverride, boardWidth, boardHeight, pegRows, prizes]);

  // Track if animation is already running
  const landingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

        // Update the frame
        dispatch({
          type: 'FRAME_ADVANCED',
          payload: { frame: currentFrameIndex }
        });

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

  // Calculate current ball position
  const ballPosition: BallPosition | null = useMemo(() => {
    if (gameState.state === 'idle' || gameState.state === 'ready') {
      return null;
    }

    const { trajectory, currentFrame } = gameState.context;
    if (trajectory.length === 0 || !trajectory[currentFrame]) {
      return null;
    }

    const point = trajectory[currentFrame];
    return {
      x: point.x,
      y: point.y,
      rotation: point.rotation
    };
  }, [gameState]);

  // Get current trajectory point for peg hit detection
  const currentTrajectoryPoint = useMemo(() => {
    if (gameState.state === 'idle') return null;
    return gameState.context.trajectory[gameState.context.currentFrame] ?? null;
  }, [gameState.state, gameState.context.currentFrame, gameState.context.trajectory]);

  const startGame = () => {
    if (gameState.state === 'ready') {
      dispatch({ type: 'DROP_REQUESTED' });
    }
  };

  const resetGame = () => {
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

  return {
    state: gameState.state,
    prizes,
    selectedPrize: gameState.context.prize,
    selectedIndex: gameState.context.selectedIndex,
    ballPosition,
    currentTrajectoryPoint,
    startGame,
    completeCountdown,
    claimPrize,
    resetGame,
    canClaim: gameState.state === 'revealed'
  };
}
