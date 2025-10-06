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
import { navigationAdapter, animationAdapter } from '../utils/platform';

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
  // Force fresh seed on resets (ignores URL/prop seed overrides) - using ref to avoid triggering effects
  const forceFreshSeedRef = useRef(false);

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
    // When forceFreshSeedRef is true (automatic reset), return undefined to force new random seed
    if (forceFreshSeedRef.current) {
      return undefined;
    }

    if (typeof seedOverride === 'number') {
      return seedOverride;
    }

    const urlSeed = navigationAdapter.getParam('seed');
    if (!urlSeed) {
      return undefined;
    }

    const parsed = Number.parseInt(urlSeed, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [seedOverride]);

  // Single async load pattern - no more dual loading
  const [prizeSession, setPrizeSession] = useState<PrizeProviderResult | null>(null);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Track which session has been initialized by its seed (not a boolean)
  const initializedSessionId = useRef<number | null>(null);

  // Guard to prevent overwriting locked winning prize
  const winningPrizeLockedRef = useRef(false);

  // Single async load effect with retry and timeout
  useEffect(() => {
    let cancelled = false;
    setIsLoadingSession(true);
    setLoadError(null);

    const finalSeedOverride = resolveSeedOverride();

    // Constants for retry and timeout
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;
    const LOAD_TIMEOUT_MS = 10000; // 10 seconds

    // Timeout wrapper
    function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Provider load timeout')), timeoutMs)
        ),
      ]);
    }

    // Retry wrapper
    async function loadWithRetry(attempt = 1): Promise<PrizeProviderResult> {
      try {
        const result = await prizeProvider.load({ seedOverride: finalSeedOverride });
        return result;
      } catch (error) {
        if (attempt >= MAX_RETRIES) {
          throw error; // Final failure
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        return loadWithRetry(attempt + 1);
      }
    }

    // Execute load with timeout and retry
    withTimeout(loadWithRetry(), LOAD_TIMEOUT_MS)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setPrizeSession(result);
        // DON'T set prizes here - let the initialization effect handle swapping
        setIsLoadingSession(false);
        // Reset forceFreshSeed ref after successful load
        forceFreshSeedRef.current = false;
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
        // Reset forceFreshSeed ref even on error
        forceFreshSeedRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [prizeProvider, resolveSeedOverride, sessionKey]);

  // Store the winning prize object separately - this is what the user will actually win
  // This is immutable and independent of any prize array swaps
  const [winningPrize, setWinningPrize] = useState<PrizeConfig | null>(null);

  // Track the current position of the winning prize after swaps (for visual indicator only)
  const [currentWinningIndex, setCurrentWinningIndex] = useState<number | undefined>(undefined);

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
      const trajectoryResult = generateTrajectory({
        boardWidth,
        boardHeight,
        pegRows,
        slotCount: sessionPrizes.length,
        seed: prizeSession.seed,
        precomputedTrajectory: prizeSession.deterministicTrajectory,
      });

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
  }, [boardWidth, boardHeight, pegRows, gameState.state, prizeSession?.seed, prizeSession?.prizes.length, prizeSession?.winningIndex]);

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
          animationFrameRef.current = animationAdapter.requestFrame(animate);
        }
      };

      animationFrameRef.current = animationAdapter.requestFrame(animate);

      // Set timeout for landing based on total duration
      landingTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'LANDING_COMPLETED' });
      }, totalDuration + 500);

      return () => {
        if (animationFrameRef.current !== null) {
          animationAdapter.cancelFrame(animationFrameRef.current);
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
      if (gameState.state === 'selecting-position' && prizeSession) {
        const currentSeed = gameState.context.seed || Date.now();

        // Reset prizes to original session order
        const freshPrizes = [...prizeSession.prizes];
        const winningIndex = prizeSession.winningIndex;

        // STEP 1: The winning prize is already stored in state, don't change it
        // winningPrize remains immutable

        // STEP 2: Generate new trajectory with drop zone - let ball land wherever it naturally lands
        // Do NOT pass targetSlot - that causes thousands of attempts
        const trajectoryResult = generateTrajectory({
          boardWidth,
          boardHeight,
          pegRows,
          slotCount: freshPrizes.length,
          seed: currentSeed,
          dropZone,
          precomputedTrajectory: prizeSession.deterministicTrajectory,
        });

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
    ]
  );

  const resetGame = useCallback(() => {
    // AUTOMATIC RESET: After claiming prize, reset game with fresh random prize table
    // This is called automatically when user closes prize popup to allow replay

    // Reset frame to 0 for new game
    currentFrameRef.current = 0;
    // Reset session ID to allow initialization of new session
    initializedSessionId.current = null;
    // Reset winning prize lock (allows new winning prize to be set)
    winningPrizeLockedRef.current = false;
    // Clear error state
    setLoadError(null);
    // Clear winning prize state
    setWinningPrize(null);
    setCurrentWinningIndex(undefined);
    // Clear prize session to prevent initialization with stale data
    setPrizeSession(null);
    setPrizes([]);
    // Force fresh random seed (ignores URL ?seed= parameter for automatic reset)
    forceFreshSeedRef.current = true;

    // Reset game state machine
    dispatch({ type: 'RESET_REQUESTED' });

    // Trigger new session load with fresh seed
    setSessionKey((key) => key + 1);
  }, []);

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
    selectedPrize: winningPrize, // ALWAYS use the stored winning prize, not derived from swapped array
    selectedIndex: gameState.context.selectedIndex,
    winningIndex: currentWinningIndex,
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
