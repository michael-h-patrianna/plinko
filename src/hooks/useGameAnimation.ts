/**
 * Game animation management hook
 * Handles frame store, animation loop control, and frame progression
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppConfig } from '../config/AppConfigContext';
import { getPerformanceSetting } from '../config/appConfig';
import type { GameState, TrajectoryPoint } from '../game/types';
import { animationAdapter } from '../utils/platform';

// Frame store for efficient per-frame updates without re-rendering entire tree
interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getCurrentFrame: () => number;
}

interface UseGameAnimationOptions {
  gameState: GameState;
  trajectory: TrajectoryPoint[];
  onLandingComplete: () => void;
  currentFrameRef: React.MutableRefObject<number>;
}

interface UseGameAnimationResult {
  frameStore: FrameStore;
  currentFrame: number;
  resetFrame: () => void;
}

export function useGameAnimation(options: UseGameAnimationOptions): UseGameAnimationResult {
  const { gameState, trajectory, onLandingComplete, currentFrameRef } = options;
  const { performance } = useAppConfig();

  const animationFrameRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const landingTimeoutRef = useRef<number | null>(null);

  // Frame store: holds current frame in ref, notifies subscribers without causing re-renders
  // NOTE: currentFrameRef is now passed in from parent to ensure synchronization
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

  const resetFrame = useCallback(() => {
    currentFrameRef.current = 0;
  }, []);

  // Animation loop for dropping state - only runs when state changes to 'dropping'
  useEffect(() => {
    if (gameState === 'dropping') {
      // PERFORMANCE: Trajectories are always generated at 60 FPS
      // The FPS setting controls display refresh rate, not playback speed
      const TRAJECTORY_FPS = 60;
      const DISPLAY_FPS = getPerformanceSetting(performance, 'fps') ?? 60;
      const frameInterval = 1000 / TRAJECTORY_FPS; // Always use trajectory's native FPS for timing
      const totalDuration = (trajectory.length / TRAJECTORY_FPS) * 1000;

      // Throttle rendering at lower FPS for battery savings
      const renderInterval = 1000 / DISPLAY_FPS;
      let lastRenderTime = 0;

      const animate = (timestamp: number) => {
        if (startTimestampRef.current === null) {
          startTimestampRef.current = timestamp;
          lastRenderTime = timestamp;
        }

        const elapsed = timestamp - startTimestampRef.current;
        const currentFrameIndex = Math.min(
          Math.floor(elapsed / frameInterval),
          trajectory.length - 1
        );

        // Throttle updates based on DISPLAY_FPS for battery savings
        const timeSinceLastRender = timestamp - lastRenderTime;
        if (timeSinceLastRender >= renderInterval) {
          // Update frame in ref (not state!) and notify subscribers
          currentFrameRef.current = currentFrameIndex;
          frameListenersRef.current.forEach((listener) => listener());
          lastRenderTime = timestamp;
        }

        if (currentFrameIndex < trajectory.length - 1) {
          // Continue animation
          animationFrameRef.current = animationAdapter.requestFrame(animate);
        }
      };

      animationFrameRef.current = animationAdapter.requestFrame(animate);

      // Set timeout for landing based on total duration
      landingTimeoutRef.current = setTimeout(() => {
        onLandingComplete();
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
  }, [gameState, trajectory, performance, onLandingComplete]);

  return {
    frameStore,
    currentFrame: currentFrameRef.current,
    resetFrame,
  };
}
