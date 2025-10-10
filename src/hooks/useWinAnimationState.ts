/**
 * Win Animation State Machine Hook
 *
 * Manages the sequence of win animations with explicit state transitions:
 * idle -> landing-impact -> anticipation -> win-reveal -> idle
 *
 * Features:
 * - Explicit state transitions with telemetry
 * - Automatic sequencing based on ballState changes
 * - Idempotent state updates
 * - No orphan states (all states have exit paths)
 */

import { useReducer, useEffect, useRef } from 'react';
import type { GameState } from '../game/types';
import { trackStateTransition } from '../utils/telemetry';

// ============================================================================
// STATE MACHINE TYPES
// ============================================================================

/**
 * Win animation states
 */
export type WinAnimationState =
  | 'idle'              // No animations active
  | 'landing-impact'    // Ball has landed, showing impact effect
  | 'anticipation'      // Building suspense with particles
  | 'win-reveal';       // Revealing the win with full animation

/**
 * Events that trigger state transitions
 */
export type WinAnimationEvent =
  | { type: 'TRIGGER_LANDING_IMPACT' }      // Ball state changed to 'landed'
  | { type: 'START_ANTICIPATION' }          // Impact duration complete
  | { type: 'SHOW_WIN_REVEAL' }             // Anticipation duration complete
  | { type: 'RESET_ANIMATIONS' };           // Return to idle state

/**
 * Animation state context
 */
export interface WinAnimationContext {
  state: WinAnimationState;
  showLandingImpact: boolean;
  showAnticipation: boolean;
  showWinReveal: boolean;
}

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================

const ANIMATION_TIMINGS = {
  /** Duration before transitioning from landing-impact to anticipation (ms) */
  IMPACT_DURATION: 200,
  /** Duration before transitioning from anticipation to win-reveal (ms) */
  ANTICIPATION_DURATION: 600,
} as const;

// ============================================================================
// STATE MACHINE REDUCER
// ============================================================================

/**
 * Reducer managing win animation state transitions
 * All transitions are explicit and tracked with telemetry
 */
function winAnimationReducer(
  state: WinAnimationContext,
  event: WinAnimationEvent
): WinAnimationContext {
  const fromState = state.state;
  let nextState: WinAnimationContext;

  switch (event.type) {
    case 'TRIGGER_LANDING_IMPACT':
      // Ball has landed - start impact animation and anticipation
      nextState = {
        state: 'landing-impact',
        showLandingImpact: true,
        showAnticipation: true,
        showWinReveal: false,
      };
      break;

    case 'START_ANTICIPATION':
      // Impact complete - transition to pure anticipation
      nextState = {
        state: 'anticipation',
        showLandingImpact: false,
        showAnticipation: true,
        showWinReveal: false,
      };
      break;

    case 'SHOW_WIN_REVEAL':
      // Anticipation complete - reveal the win
      nextState = {
        state: 'win-reveal',
        showLandingImpact: false,
        showAnticipation: false,
        showWinReveal: true,
      };
      break;

    case 'RESET_ANIMATIONS':
      // Return to idle state
      nextState = {
        state: 'idle',
        showLandingImpact: false,
        showAnticipation: false,
        showWinReveal: false,
      };
      break;

    default:
      return state;
  }

  // Track state transition if state actually changed
  if (nextState.state !== fromState) {
    trackStateTransition({
      fromState: `win-animation.${fromState}`,
      toState: `win-animation.${nextState.state}`,
      event: event.type,
    });
  }

  return nextState;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const INITIAL_STATE: WinAnimationContext = {
  state: 'idle',
  showLandingImpact: false,
  showAnticipation: false,
  showWinReveal: false,
};

// ============================================================================
// HOOK
// ============================================================================

export interface UseWinAnimationStateReturn extends WinAnimationContext {
  /** Manually trigger state transitions (for testing) */
  dispatch: (event: WinAnimationEvent) => void;
}

/**
 * Hook managing win animation sequence state machine
 *
 * Automatically sequences animations based on ballState:
 * - When ballState becomes 'landed': triggers landing-impact
 * - After IMPACT_DURATION: transitions to anticipation
 * - After ANTICIPATION_DURATION: transitions to win-reveal
 * - When ballState is not 'landed': resets to idle
 *
 * @param ballState - Current game state
 * @returns Animation state context and dispatch function
 */
export function useWinAnimationState(
  ballState: GameState
): UseWinAnimationStateReturn {
  const [context, dispatch] = useReducer(winAnimationReducer, INITIAL_STATE);

  // Track previous ballState to detect transitions
  const prevBallStateRef = useRef<GameState>(ballState);

  // Automatic sequencing based on ballState
  useEffect(() => {
    const prevBallState = prevBallStateRef.current;
    prevBallStateRef.current = ballState;

    // Trigger landing impact when ball lands
    if (ballState === 'landed' && prevBallState !== 'landed') {
      dispatch({ type: 'TRIGGER_LANDING_IMPACT' });

      // Schedule transition to anticipation after impact duration
      const anticipationTimer = setTimeout(() => {
        dispatch({ type: 'START_ANTICIPATION' });
      }, ANIMATION_TIMINGS.IMPACT_DURATION);

      // Schedule transition to win reveal after anticipation duration
      const revealTimer = setTimeout(() => {
        dispatch({ type: 'SHOW_WIN_REVEAL' });
      }, ANIMATION_TIMINGS.IMPACT_DURATION + ANIMATION_TIMINGS.ANTICIPATION_DURATION);

      return () => {
        clearTimeout(anticipationTimer);
        clearTimeout(revealTimer);
      };
    }

    // Reset animations when ball state changes away from landed
    if (ballState !== 'landed' && context.state !== 'idle') {
      dispatch({ type: 'RESET_ANIMATIONS' });
    }
  }, [ballState, context.state]);

  return {
    ...context,
    dispatch,
  };
}
