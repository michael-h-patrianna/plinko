/**
 * Shake controller hook with state machine
 * Manages screen shake animations based on game state and prize type
 */

import { useEffect, useReducer, useCallback } from 'react';
import type { GameState, PrizeConfig } from '@game/types';
import { ANIMATION_DURATION } from '../constants';
import { trackStateTransition } from '@utils/telemetry';

// ============================================================================
// Types
// ============================================================================

export type ShakeState = 'idle' | 'shaking';

export interface ShakeControllerState {
  state: ShakeState;
  active: boolean;
}

export type ShakeEvent =
  | { type: 'START_SHAKE'; payload: { duration: number } }
  | { type: 'STOP_SHAKE' }
  | { type: 'RESET_SHAKE' };

// ============================================================================
// State Machine
// ============================================================================

const initialState: ShakeControllerState = {
  state: 'idle',
  active: false,
};

function shakeReducer(
  state: ShakeControllerState,
  event: ShakeEvent
): ShakeControllerState {
  const prevState = state;

  switch (event.type) {
    case 'START_SHAKE': {
      // Only start shake if not already shaking
      if (state.state === 'shaking') {
        return state;
      }

      const nextState: ShakeControllerState = {
        state: 'shaking',
        active: true,
      };

      trackStateTransition({
        fromState: JSON.stringify(prevState),
        toState: JSON.stringify(nextState),
        event: event.type,
        duration: event.payload.duration,
      });

      return nextState;
    }

    case 'STOP_SHAKE': {
      // Only stop if currently shaking
      if (state.state !== 'shaking') {
        return state;
      }

      const nextState: ShakeControllerState = {
        state: 'idle',
        active: false,
      };

      trackStateTransition({
        fromState: JSON.stringify(prevState),
        toState: JSON.stringify(nextState),
        event: event.type,
      });

      return nextState;
    }

    case 'RESET_SHAKE': {
      // Force reset to idle
      const nextState: ShakeControllerState = {
        state: 'idle',
        active: false,
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

export interface UseShakeControllerOptions {
  gameState: GameState;
  selectedPrize: PrizeConfig | null;
  duration?: number;
}

export interface UseShakeControllerResult {
  shakeActive: boolean;
  triggerShake: () => void;
  stopShake: () => void;
}

export function useShakeController(
  options: UseShakeControllerOptions
): UseShakeControllerResult {
  const { gameState, selectedPrize, duration = ANIMATION_DURATION.SLOW } = options;
  const [state, dispatch] = useReducer(shakeReducer, initialState);

  // Trigger screen shake when ball lands on a winning prize (not no_win)
  useEffect(() => {
    const isLanded = gameState === 'landed';
    const isIdle = gameState === 'idle';
    const isWin = selectedPrize && selectedPrize.type !== 'no_win';

    if (isLanded && isWin) {
      dispatch({
        type: 'START_SHAKE',
        payload: { duration },
      });

      const timer = setTimeout(() => {
        dispatch({ type: 'STOP_SHAKE' });
      }, duration);

      return () => clearTimeout(timer);
    } else if (isIdle) {
      // Reset shake state when returning to start screen
      dispatch({ type: 'RESET_SHAKE' });
    }
  }, [gameState, selectedPrize, duration]);

  // Manual shake trigger (for dev tools or special effects)
  const triggerShake = useCallback(() => {
    dispatch({
      type: 'START_SHAKE',
      payload: { duration },
    });

    setTimeout(() => {
      dispatch({ type: 'STOP_SHAKE' });
    }, duration);
  }, [duration]);

  // Manual shake stop (for emergency stop)
  const stopShake = useCallback(() => {
    dispatch({ type: 'STOP_SHAKE' });
  }, []);

  return {
    shakeActive: state.active,
    triggerShake,
    stopShake,
  };
}
