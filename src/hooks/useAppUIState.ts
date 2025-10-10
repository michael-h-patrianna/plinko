/**
 * Composite UI state hook
 * Combines viewport management and shake controller into a single interface
 */

import { useCallback } from 'react';
import type { GameState, PrizeConfig } from '../game/types';
import { useViewportManager } from './useViewportManager';
import { useShakeController } from './useShakeController';

// ============================================================================
// Types
// ============================================================================

export interface UseAppUIStateOptions {
  gameState: GameState;
  selectedPrize: PrizeConfig | null;
  onViewportChangeRequiresReset?: (newWidth: number) => void;
}

export interface UseAppUIStateResult {
  // Viewport state
  isMobile: boolean;
  viewportWidth: number;
  lockedBoardWidth: number;
  isViewportLocked: boolean;

  // Shake state
  shakeActive: boolean;

  // Actions
  handleViewportChange: (newWidth: number, shouldReset: boolean) => void;
  triggerShake: () => void;
  stopShake: () => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Manages consolidated UI state for the app
 * Combines viewport management and shake effects into a single state machine interface
 *
 * @param options - Configuration options
 * @returns Consolidated UI state and control functions
 */
export function useAppUIState(options: UseAppUIStateOptions): UseAppUIStateResult {
  const { gameState, selectedPrize, onViewportChangeRequiresReset } = options;

  // Viewport management state machine
  const viewport = useViewportManager({
    gameState,
  });

  // Shake controller state machine
  const shake = useShakeController({
    gameState,
    selectedPrize,
  });

  // Enhanced viewport change handler that can trigger game reset
  const handleViewportChange = useCallback(
    (newWidth: number, shouldReset: boolean) => {
      const changed = viewport.handleViewportChange(newWidth);

      if (changed && shouldReset && onViewportChangeRequiresReset) {
        onViewportChangeRequiresReset(newWidth);
      }
    },
    [viewport, onViewportChangeRequiresReset]
  );

  return {
    // Viewport state
    isMobile: viewport.isMobile,
    viewportWidth: viewport.viewportWidth,
    lockedBoardWidth: viewport.lockedBoardWidth,
    isViewportLocked: viewport.isViewportLocked,

    // Shake state
    shakeActive: shake.shakeActive,

    // Actions
    handleViewportChange,
    triggerShake: shake.triggerShake,
    stopShake: shake.stopShake,
  };
}
