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

import { lazy, Suspense, useMemo } from 'react';
import { useAppConfig } from '../config/AppConfigContext';
import type { ChoiceMechanic } from './components/DevToolsMenu';
import type { PerformanceMode } from '../config/appConfig';

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

// Type for the game state returned by usePlinkoGame
interface GameState {
  prizes: Array<any>;
  state: string;
  _internal: {
    setWinningPrize: (prize: any) => void;
    setCurrentWinningIndex: (index: number) => void;
    regenerateTrajectoryForSlot: (targetSlotIndex: number) => void;
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
}

/**
 * Conditionally renders dev tools based on feature flag.
 * Uses lazy loading to ensure dev tools are in a separate chunk.
 */
export function DevToolsLoader(props: DevToolsLoaderProps) {
  const { gameState, isStartScreen, ...menuProps } = props;
  const { featureFlags } = useAppConfig();

  // Don't render anything if dev tools are disabled
  if (!featureFlags.devToolsEnabled) {
    return null;
  }

  // Create dev tool wrapper for selecting winner
  // This is memoized to avoid recreating on every render
  const handleSelectWinner = useMemo(() => {
    if (!gameState) return undefined;

    return (index: number) => {
      const prizes = gameState.prizes;

      // Only allow changing winner before game starts
      if (gameState.state !== 'idle' && gameState.state !== 'ready') {
        console.warn(`[DevTools] Can only change winner before game starts. Current state: ${gameState.state}`);
        return;
      }

      if (index < 0 || index >= prizes.length) {
        console.warn(`[DevTools] Invalid prize index: ${index}. Valid range: 0-${prizes.length - 1}`);
        return;
      }

      const prize = prizes[index];
      if (prize) {
        // Set the winning prize (this is what will be revealed)
        gameState._internal.setWinningPrize(prize);
        // Set the visual indicator to show which prize is selected
        gameState._internal.setCurrentWinningIndex(index);
        // Regenerate trajectory to target this slot so ball lands correctly
        gameState._internal.regenerateTrajectoryForSlot(index);
        console.log(`[DevTools] Winner set to prize at index ${index}: ${prize.label || prize.type}`);
      }
    };
  }, [gameState]);

  // Render with Suspense to handle lazy loading
  return (
    <Suspense fallback={null}>
      <DevToolsMenu {...menuProps} />
      {handleSelectWinner && isStartScreen && (
        <DevToolsStartScreenOverlay isActive={true} onSelectWinner={handleSelectWinner} />
      )}
    </Suspense>
  );
}
