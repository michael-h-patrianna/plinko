/**
 * Main game orchestration hook
 * Manages state machine, animation loop, and game lifecycle
 */

import { useEffect, useReducer, useRef, useMemo } from 'react';
import type { GameState, GameContext, BallPosition } from '../game/types';
import { transition, initialContext, type GameEvent } from '../game/stateMachine';
import { selectPrize } from '../game/rng';
import { generateTrajectory } from '../game/trajectory';
import { MOCK_PRIZES, getPrizeByIndex } from '../config/prizeTable';

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

      const { selectedIndex, seedUsed } = selectPrize(MOCK_PRIZES, finalSeed);
      const prize = getPrizeByIndex(selectedIndex);

      const trajectory = generateTrajectory({
        boardWidth,
        boardHeight,
        pegRows,
        slotCount: MOCK_PRIZES.length,
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
  }, [gameState.state, seedOverride, boardWidth, boardHeight, pegRows]);

  // Animation loop for dropping state
  useEffect(() => {
    if (gameState.state === 'dropping') {
      const FPS = 60;
      const frameInterval = 1000 / FPS;

      const animate = (timestamp: number) => {
        if (startTimestampRef.current === null) {
          startTimestampRef.current = timestamp;
        }

        const elapsed = timestamp - startTimestampRef.current;
        const currentFrameIndex = Math.min(
          Math.floor(elapsed / frameInterval),
          gameState.context.trajectory.length - 1
        );

        if (currentFrameIndex < gameState.context.trajectory.length - 1) {
          dispatch({
            type: 'FRAME_ADVANCED',
            payload: { frame: currentFrameIndex }
          });
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Reached final frame
          dispatch({
            type: 'FRAME_ADVANCED',
            payload: { frame: gameState.context.trajectory.length - 1 }
          });

          // Transition to landed state immediately
          setTimeout(() => {
            dispatch({ type: 'LANDING_COMPLETED' });
          }, 100);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        startTimestampRef.current = null;
      };
    }
  }, [gameState.state, gameState.context.trajectory]);

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
  }, [gameState]);

  const startGame = () => {
    if (gameState.state === 'ready') {
      dispatch({ type: 'DROP_REQUESTED' });
    }
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_REQUESTED' });
  };

  const claimPrize = () => {
    // In real app, this would call backend API
    // TODO: Integrate with backend prize claiming endpoint
    resetGame();
  };

  return {
    state: gameState.state,
    prizes: MOCK_PRIZES,
    selectedPrize: gameState.context.prize,
    selectedIndex: gameState.context.selectedIndex,
    ballPosition,
    currentTrajectoryPoint,
    startGame,
    claimPrize,
    resetGame,
    canClaim: gameState.state === 'revealed'
  };
}
