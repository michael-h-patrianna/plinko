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

import { lazy, Suspense } from 'react';
import { useAppConfig } from '../config/AppConfigContext';
import type { ChoiceMechanic } from './components/DevToolsMenu';
import type { PerformanceMode } from '../config/appConfig';

// Lazy load the DevToolsMenu - this creates a separate chunk
const DevToolsMenu = lazy(() =>
  import('./components/DevToolsMenu').then((module) => ({
    default: module.DevToolsMenu,
  }))
);

export interface DevToolsLoaderProps {
  viewportWidth: number;
  onViewportChange: (width: number) => void;
  viewportDisabled: boolean;
  choiceMechanic?: ChoiceMechanic;
  onChoiceMechanicChange?: (mechanic: ChoiceMechanic) => void;
  performanceMode?: PerformanceMode;
  onPerformanceModeChange?: (mode: PerformanceMode) => void;
}

/**
 * Conditionally renders dev tools based on feature flag.
 * Uses lazy loading to ensure dev tools are in a separate chunk.
 */
export function DevToolsLoader(props: DevToolsLoaderProps) {
  const { featureFlags } = useAppConfig();

  // Don't render anything if dev tools are disabled
  if (!featureFlags.devToolsEnabled) {
    return null;
  }

  // Render with Suspense to handle lazy loading
  return (
    <Suspense fallback={null}>
      <DevToolsMenu {...props} />
    </Suspense>
  );
}
