/**
 * Game animation management hook
 * Provides frameStore for synchronization across components
 *
 * ARCHITECTURE CHANGE (2025-10-10):
 * - Previously this hook managed the RAF loop for frame progression
 * - RAF loop caused duplicate animation loops (this + ballAnimationDriver.schedule)
 * - Now the driver is the SINGLE source of animation timing
 * - This hook just provides the frameStore interface for subscribers (pegs, slots)
 * - See: ballAnimationDriver.web.ts for consolidated animation loop
 */

import type { ValueRef } from '@/types/ref';
import { useCallback, useMemo, useRef } from 'react';

// Frame store for efficient per-frame updates without re-rendering entire tree
interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getCurrentFrame: () => number;
  notifyListeners: () => void;
}

interface UseGameAnimationOptions {
  currentFrameRef: ValueRef<number>;
}

interface UseGameAnimationResult {
  frameStore: FrameStore;
  currentFrame: number;
  resetFrame: () => void;
}

export function useGameAnimation(options: UseGameAnimationOptions): UseGameAnimationResult {
  const { currentFrameRef } = options;

  // Frame store: holds current frame in ref, notifies subscribers without causing re-renders
  // NOTE: currentFrameRef is updated by ballAnimationDriver during animation
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
      notifyListeners: () => {
        frameListenersRef.current.forEach((listener) => listener());
      },
    }),
    [currentFrameRef]
  );

  const resetFrame = useCallback(() => {
    currentFrameRef.current = 0;
  }, [currentFrameRef]);

  return {
    frameStore,
    currentFrame: currentFrameRef.current,
    resetFrame,
  };
}
