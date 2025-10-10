/**
 * Viewport manager hook with state machine
 * Manages viewport dimensions, mobile detection, and board width locking
 */

import { useEffect, useReducer, useCallback } from 'react';
import { dimensionsAdapter, deviceInfoAdapter } from '../utils/platform';
import { VIEWPORT } from '../constants';
import type { GameState } from '../game/types';
import { trackStateTransition } from '../utils/telemetry';

// ============================================================================
// Types
// ============================================================================

export interface ViewportState {
  isMobile: boolean;
  viewportWidth: number;
  lockedBoardWidth: number;
  isLocked: boolean;
}

export type ViewportEvent =
  | { type: 'MOBILE_DETECTED'; payload: { isMobile: boolean } }
  | { type: 'VIEWPORT_RESIZED'; payload: { width: number } }
  | { type: 'BOARD_LOCKED'; payload: { width: number } }
  | { type: 'BOARD_UNLOCKED' }
  | { type: 'VIEWPORT_CHANGED'; payload: { width: number } };

// ============================================================================
// State Machine
// ============================================================================

const initialState: ViewportState = {
  isMobile: false,
  viewportWidth: VIEWPORT.DEFAULT_MOBILE,
  lockedBoardWidth: VIEWPORT.DEFAULT_MOBILE,
  isLocked: false,
};

function viewportReducer(state: ViewportState, event: ViewportEvent): ViewportState {
  const prevState = state;

  switch (event.type) {
    case 'MOBILE_DETECTED': {
      const nextState = {
        ...state,
        isMobile: event.payload.isMobile,
      };

      trackStateTransition({
        fromState: JSON.stringify(prevState),
        toState: JSON.stringify(nextState),
        event: event.type,
      });

      return nextState;
    }

    case 'VIEWPORT_RESIZED': {
      // Only update viewport width if mobile and not locked
      if (!state.isMobile || state.isLocked) {
        return state;
      }

      const nextState = {
        ...state,
        viewportWidth: event.payload.width,
        lockedBoardWidth: event.payload.width,
      };

      trackStateTransition({
        fromState: JSON.stringify(prevState),
        toState: JSON.stringify(nextState),
        event: event.type,
      });

      return nextState;
    }

    case 'BOARD_LOCKED': {
      const nextState = {
        ...state,
        isLocked: true,
        lockedBoardWidth: event.payload.width,
      };

      trackStateTransition({
        fromState: JSON.stringify(prevState),
        toState: JSON.stringify(nextState),
        event: event.type,
      });

      return nextState;
    }

    case 'BOARD_UNLOCKED': {
      const nextState = {
        ...state,
        isLocked: false,
      };

      trackStateTransition({
        fromState: JSON.stringify(prevState),
        toState: JSON.stringify(nextState),
        event: event.type,
      });

      return nextState;
    }

    case 'VIEWPORT_CHANGED': {
      // Manual viewport change (from dev tools)
      // Only allowed when not locked
      if (state.isLocked) {
        return state;
      }

      const nextState = {
        ...state,
        viewportWidth: event.payload.width,
        lockedBoardWidth: event.payload.width,
      };

      trackStateTransition({
        fromState: JSON.stringify(prevState),
        toState: JSON.stringify(nextState),
        event: event.type,
      });

      return nextState;
    }

    default:
      return state;
  }
}

// ============================================================================
// Hook
// ============================================================================

export interface UseViewportManagerOptions {
  /** Current game state for determining lock/unlock behavior */
  gameState: GameState;
}

export interface UseViewportManagerResult {
  isMobile: boolean;
  viewportWidth: number;
  lockedBoardWidth: number;
  isViewportLocked: boolean;
  handleViewportChange: (newWidth: number) => boolean;
}

export function useViewportManager(
  options: UseViewportManagerOptions
): UseViewportManagerResult {
  const { gameState } = options;
  const [state, dispatch] = useReducer(viewportReducer, initialState);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = deviceInfoAdapter.isMobileDevice();
      const isTouchDevice = deviceInfoAdapter.isTouchDevice();
      const width = dimensionsAdapter.getWidth();
      return isMobileUA || (isTouchDevice && width <= VIEWPORT.TABLET);
    };

    dispatch({
      type: 'MOBILE_DETECTED',
      payload: { isMobile: checkMobile() },
    });
  }, []);

  // Handle mobile viewport resizing
  useEffect(() => {
    if (state.isMobile) {
      const updateMobileWidth = () => {
        const width = Math.min(dimensionsAdapter.getWidth(), VIEWPORT.MAX_MOBILE);
        dispatch({
          type: 'VIEWPORT_RESIZED',
          payload: { width },
        });
      };

      updateMobileWidth();
      const cleanup = dimensionsAdapter.addChangeListener(() => {
        updateMobileWidth();
      });

      return cleanup;
    }
  }, [state.isMobile]);

  // Lock/unlock board width based on game state
  useEffect(() => {
    const shouldLock = gameState === 'countdown' || gameState === 'dropping' || gameState === 'landed';

    if (shouldLock && !state.isLocked) {
      dispatch({
        type: 'BOARD_LOCKED',
        payload: { width: state.viewportWidth },
      });
    } else if (!shouldLock && state.isLocked) {
      dispatch({
        type: 'BOARD_UNLOCKED',
      });
    }
  }, [gameState, state.isLocked, state.viewportWidth]);

  // Handle manual viewport change (from dev tools)
  const handleViewportChange = useCallback(
    (newWidth: number): boolean => {
      const canChange =
        gameState === 'idle' ||
        gameState === 'ready' ||
        gameState === 'revealed' ||
        gameState === 'claimed';

      if (canChange && !state.isLocked) {
        dispatch({
          type: 'VIEWPORT_CHANGED',
          payload: { width: newWidth },
        });
        return true;
      }

      return false;
    },
    [gameState, state.isLocked]
  );

  return {
    isMobile: state.isMobile,
    viewportWidth: state.viewportWidth,
    lockedBoardWidth: state.lockedBoardWidth,
    isViewportLocked: state.isLocked,
    handleViewportChange,
  };
}
