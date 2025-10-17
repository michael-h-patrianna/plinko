/**
 * DEV TOOLS LOADER
 *
 * Lazy-loaded wrapper for dev tools that ensures they are:
 * 1. Only loaded when feature flag is enabled
 * 2. Code-split into separate chunk
 * 3. Excluded from production builds when flag is disabled
 *
 * This component should be used in App.tsx instead of directly importing DevToolsMenu.
 */

import { lazy, Suspense, useMemo, useState } from 'react';
import { useAppConfig } from '@demo/config/AppConfigContext';
import type { ChoiceMechanic } from './components/DevToolsMenu';
import type { PerformanceMode } from '@demo/config/appConfig';
import type { Prize } from '@plinko/game/prizeTypes';

// Lazy load the DevToolsMenu - this creates a separate chunk
const DevToolsMenu = lazy(() =>
  import('./components/DevToolsMenu').then((module) => ({
    default: module.DevToolsMenu,
  }))
);

// Lazy load the DevToolsStartScreenOverlay
const DevToolsStartScreenOverlay = lazy(() =>
  import('./DevToolsStartScreenOverlay').then((module) => ({
    default: module.DevToolsStartScreenOverlay,
  }))
);

/**
 * Type for the game state returned by usePlinkoGame
 * Contains prize array and internal controls for dev tools
 */
interface GameState {
  prizes: Array<Prize>;
  state: string;
  _internal: {
    setWinningPrize: (prize: Prize) => void;
    setCurrentWinningIndex: (index: number) => void;
    prizeSession: { prizes: Array<Prize>; winningIndex: number } | null;
  };
}

export interface DevToolsLoaderProps {
  viewportWidth: number;
  onViewportChange: (width: number) => void;
  viewportDisabled: boolean;
  choiceMechanic?: ChoiceMechanic;
  onChoiceMechanicChange?: (mechanic: ChoiceMechanic) => void;
  performanceMode?: PerformanceMode;
  onPerformanceModeChange?: (mode: PerformanceMode) => void;
  gameState?: GameState;
  isStartScreen?: boolean;
  showWinner?: boolean;
  onShowWinnerChange?: (show: boolean) => void;
  musicEnabled?: boolean;
  onMusicEnabledChange?: (enabled: boolean) => void;
}

/**
 * Conditionally renders dev tools based on feature flag.
 * Uses lazy loading to ensure dev tools are in a separate chunk.
 */
export function DevToolsLoader(props: DevToolsLoaderProps) {
  const { gameState, isStartScreen, showWinner: showWinnerProp, onShowWinnerChange, musicEnabled: musicEnabledProp, onMusicEnabledChange, ...menuProps } = props;
  const { featureFlags } = useAppConfig();

  // Use local state if not controlled by parent
  const [localShowWinner, setLocalShowWinner] = useState(false);
  const showWinner = showWinnerProp ?? localShowWinner;
  const handleShowWinnerChange = onShowWinnerChange ?? setLocalShowWinner;

  const [localMusicEnabled, setLocalMusicEnabled] = useState(false);
  const musicEnabled = musicEnabledProp ?? localMusicEnabled;
  const handleMusicEnabledChange = onMusicEnabledChange ?? setLocalMusicEnabled;

  // Don't render anything if dev tools are disabled
  if (!featureFlags.devToolsEnabled) {
    return null;
  }

  // Create dev tool wrapper for selecting winner
  // This is memoized to avoid recreating on every render
  const handleSelectWinner = useMemo(() => {
    if (!gameState) return undefined;

    return (visualIndex: number) => {
      const displayedPrizes = gameState.prizes;
      const prizeSession = gameState._internal.prizeSession;

      // Only allow changing winner before game starts
      if (gameState.state !== 'idle' && gameState.state !== 'ready') {
        console.warn(`[DevTools] Can only change winner before game starts. Current state: ${gameState.state}`);
        return;
      }

      if (visualIndex < 0 || visualIndex >= displayedPrizes.length) {
        console.warn(`[DevTools] Invalid prize index: ${visualIndex}. Valid range: 0-${displayedPrizes.length - 1}`);
        return;
      }

      if (!prizeSession) {
        console.warn(`[DevTools] Prize session not loaded yet`);
        return;
      }

      // Get the prize at the visual position (from potentially swapped array)
      const clickedPrize = displayedPrizes[visualIndex];
      if (!clickedPrize) {
        console.warn(`[DevTools] No prize found at visual index ${visualIndex}`);
        return;
      }

      // Find the ORIGINAL index of this prize in the prize session (before any swapping)
      const originalIndex = prizeSession.prizes.findIndex((p) => p.id === clickedPrize.id);

      if (originalIndex === -1) {
        console.warn(`[DevTools] Could not find prize ${clickedPrize.id} in original prize session`);
        return;
      }

      console.log(`[DevTools] Shift+click on visual index ${visualIndex} (${clickedPrize.title || clickedPrize.type})`);
      console.log(`[DevTools] Mapped to original index ${originalIndex} in prize session`);

      // ONLY manipulate prize data - no trajectory generation here!
      // The winning prize is what will be revealed
      gameState._internal.setWinningPrize(clickedPrize);
      // The winning index should be the ORIGINAL index in the prize session
      // This is what PlinkoBoard will use to target the correct slot
      gameState._internal.setCurrentWinningIndex(originalIndex);

      console.log(`[DevTools] Winner set to: ${clickedPrize.title || clickedPrize.type} (prize session index ${originalIndex})`);
      console.log(`[DevTools] PlinkoBoard will generate trajectory to target slot ${originalIndex}`);
    };
  }, [gameState]);

  // Render with Suspense to handle lazy loading
  return (
    <Suspense fallback={null}>
      <DevToolsMenu
        {...menuProps}
        showWinner={showWinner}
        onShowWinnerChange={handleShowWinnerChange}
        musicEnabled={musicEnabled}
        onMusicEnabledChange={handleMusicEnabledChange}
      />
      {handleSelectWinner && isStartScreen && (
        <DevToolsStartScreenOverlay
          isActive={showWinner}
          onSelectWinner={handleSelectWinner}
        />
      )}
    </Suspense>
  );
}
