/**
 * Global pause context for the Plinko game
 *
 * Provides pause state management and keyboard control:
 * - Press 'P' key to toggle pause (case-insensitive)
 * - Pause affects all game animations and transitions
 * - Demo UI (DevTools, ThemeEditor) is excluded from pause
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface PauseContextValue {
  /** Whether the game is currently paused */
  isPaused: boolean;
  /** Pause the game */
  pause: () => void;
  /** Unpause the game */
  unpause: () => void;
  /** Toggle pause state */
  toggle: () => void;
}

const PauseContext = createContext<PauseContextValue | undefined>(undefined);

interface PauseProviderProps {
  children: ReactNode;
}

export function PauseProvider({ children }: PauseProviderProps) {
  const [isPaused, setIsPaused] = useState(false);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const unpause = useCallback(() => {
    setIsPaused(false);
  }, []);

  const toggle = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Listen for 'P' key to toggle pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggle]);

  // Update document.body attribute for CSS pause control
  useEffect(() => {
    document.body.setAttribute('data-paused', String(isPaused));
    return () => {
      document.body.removeAttribute('data-paused');
    };
  }, [isPaused]);

  const value: PauseContextValue = {
    isPaused,
    pause,
    unpause,
    toggle,
  };

  return <PauseContext.Provider value={value}>{children}</PauseContext.Provider>;
}

/**
 * Hook to access pause context
 * @throws Error if used outside PauseProvider
 */
export function usePause() {
  const context = useContext(PauseContext);
  if (context === undefined) {
    throw new Error('usePause must be used within a PauseProvider');
  }
  return context;
}
