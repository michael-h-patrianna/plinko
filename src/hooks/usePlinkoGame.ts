/**
 * Main game orchestration hook
 * Manages state machine, animation loop, and game lifecycle
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useAppConfig } from '../config/AppConfigContext';
import type { ChoiceMechanic } from '../dev-tools';
import type { PrizeProviderResult } from '../game/prizeProvider';
import { initialContext, transition, type GameEvent } from '../game/stateMachine';
import { generateTrajectory } from '../game/trajectory';
import type { BallPosition, DropZone, GameContext, GameState, PrizeConfig } from '../game/types';

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
  const {
    seedOverride,
    boardWidth = 375,
    boardHeight = 500,
    pegRows = 10,
    choiceMechanic = 'none',
  } = options;
  const { prizeProvider } = useAppConfig();

  const [sessionKey, setSessionKey] = useState(0);
  const [loadError, setLoadError] = useState<Error | null>(null);

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

  const resolveSeedOverride = useCallback((): number | undefined => {
    if (typeof seedOverride === 'number') {
      return seedOverride;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlSeed = urlParams.get('seed');
    if (!urlSeed) {
      return undefined;
    }

    const parsed = Number.parseInt(urlSeed, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [seedOverride]);

  const initialSyncSession = useMemo(() => {
    if (typeof prizeProvider.loadSync !== 'function') {
      return null;
    }

    try {
      const initialSeed = resolveSeedOverride();
      return prizeProvider.loadSync({ seedOverride: initialSeed });
    } catch (error) {
      console.error('Failed to synchronously load prize session', error);
      return null;
    }
  }, [prizeProvider, resolveSeedOverride]);

  const [prizeSession, setPrizeSession] = useState<PrizeProviderResult | null>(initialSyncSession);
  const [prizes, setPrizes] = useState<PrizeConfig[]>(() => initialSyncSession?.prizes ?? []);
  const [isLoadingSession, setIsLoadingSession] = useState(!initialSyncSession);

  // Initialize game: select prize and generate trajectory
  // Only run once on mount or when game is explicitly reset to idle
  const hasInitialized = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const finalSeedOverride = resolveSeedOverride();

    if (!initialSyncSession || sessionKey > 0) {
      setIsLoadingSession(true);
    }
    setLoadError(null);

    prizeProvider
      .load({ seedOverride: finalSeedOverride })
      .then((result) => {
        if (cancelled) {
          return;
        }
        hasInitialized.current = false;
        setPrizeSession(result);
        setPrizes(result.prizes);
        setIsLoadingSession(false);
      })
      .catch((error: unknown) => {
        console.error('Failed to load prize session', error);
        if (cancelled) {
          return;
        }
        setPrizeSession(null);
        setPrizes([]);
        setLoadError(error instanceof Error ? error : new Error('Failed to load prizes'));
        setIsLoadingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialSyncSession, prizeProvider, resolveSeedOverride, sessionKey]);

  useEffect(() => {
    if (prizeSession && gameState.state === 'idle' && !hasInitialized.current) {
      hasInitialized.current = true;

      const sessionPrizes = [...prizeSession.prizes];
      const { trajectory, landedSlot } = generateTrajectory({
        boardWidth,
        boardHeight,
        pegRows,
        slotCount: sessionPrizes.length,
        seed: prizeSession.seed,
      });

      const winningIndex = prizeSession.winningIndex;
      const rearrangedPrizes = [...sessionPrizes];
      if (landedSlot !== winningIndex) {
        const temp = rearrangedPrizes[landedSlot]!;
        rearrangedPrizes[landedSlot] = rearrangedPrizes[winningIndex]!;
        rearrangedPrizes[winningIndex] = temp;
      }

      setPrizes(rearrangedPrizes);

      const prize = rearrangedPrizes[landedSlot]!;

      dispatch({
        type: 'INITIALIZE',
        payload: { selectedIndex: landedSlot, trajectory, prize, seed: prizeSession.seed },
      });
    } else if (gameState.state !== 'idle') {
      hasInitialized.current = false;
    }
  }, [boardWidth, boardHeight, pegRows, gameState.state, prizeSession, dispatch]);

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

  const selectDropPosition = useCallback(
    (dropZone: DropZone) => {
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
    },
    [
      gameState.state,
      gameState.context.seed,
      gameState.context.selectedIndex,
      prizes,
      boardWidth,
      boardHeight,
      pegRows,
    ]
  );

  const resetGame = () => {
    // Reset frame to 0 for new game
    currentFrameRef.current = 0;
    hasInitialized.current = false;

    const syncSeedOverride = resolveSeedOverride();
    const nextSession = prizeProvider.loadSync?.({ seedOverride: syncSeedOverride });

    if (nextSession) {
      setPrizeSession(nextSession);
      setPrizes(nextSession.prizes);
      setIsLoadingSession(false);
    } else {
      setPrizeSession(null);
      setPrizes([]);
      setIsLoadingSession(true);
    }

    setLoadError(null);
    setSessionKey((key) => key + 1);
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
    isLoadingPrizes: isLoadingSession,
    prizeLoadError: loadError,
  };
}
