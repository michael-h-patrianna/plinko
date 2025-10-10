/**
 * Finite State Machine for Plinko game flow
 * Manages state transitions and prevents invalid operations
 */

import type { GameContext, GameState, PrizeConfig, TrajectoryPoint, TrajectoryCache } from './types';
import type { DropZone } from './types';
import { trackStateTransition, trackStateError } from '../utils/telemetry';
import { now } from '../utils/time';

export type GameEvent =
  | {
      type: 'INITIALIZE';
      payload: {
        selectedIndex: number;
        trajectory: TrajectoryPoint[];
        trajectoryCache: TrajectoryCache | null;
        prize: PrizeConfig;
        seed: number;
        dropZone?: DropZone;
      };
    }
  | { type: 'DROP_REQUESTED' }
  | { type: 'START_POSITION_SELECTION' }
  | {
      type: 'POSITION_SELECTED';
      payload: {
        dropZone: DropZone;
        trajectory: TrajectoryPoint[];
        trajectoryCache: TrajectoryCache | null;
        selectedIndex: number;
        prize: PrizeConfig;
      };
    }
  | { type: 'COUNTDOWN_COMPLETED' }
  | { type: 'LANDING_COMPLETED' }
  | { type: 'REVEAL_CONFIRMED' }
  | { type: 'CLAIM_REQUESTED' }
  | { type: 'RESET_REQUESTED' };

export const initialContext: GameContext = {
  selectedIndex: -1,
  trajectory: [],
  trajectoryCache: null,
  currentFrame: 0,
  prize: null,
  seed: 0,
};

/**
 * Helper to reset game to initial state
 */
function resetToIdle(): { state: GameState; context: GameContext } {
  return {
    state: 'idle',
    context: initialContext,
  };
}

/**
 * Helper to create state transition with updated context
 */
function transitionTo(
  state: GameState,
  context: GameContext
): { state: GameState; context: GameContext } {
  return { state, context };
}

/**
 * Helper to initialize game with trajectory and prize data
 */
function initializeGame(payload: {
  selectedIndex: number;
  trajectory: TrajectoryPoint[];
  trajectoryCache: TrajectoryCache | null;
  prize: PrizeConfig;
  seed: number;
}): { state: GameState; context: GameContext } {
  return transitionTo('ready', {
    selectedIndex: payload.selectedIndex,
    trajectory: payload.trajectory,
    trajectoryCache: payload.trajectoryCache,
    currentFrame: 0,
    prize: payload.prize,
    seed: payload.seed,
  });
}

/**
 * State machine transition function
 * @param state - Current game state
 * @param context - Current game context
 * @param event - Event triggering transition
 * @returns New state and updated context
 */
export function transition(
  state: GameState,
  context: GameContext,
  event: GameEvent
): { state: GameState; context: GameContext } {
  const startTime = now();

  try {
    const result = executeTransition(state, context, event);

    // Track successful transition
    trackStateTransition({
      fromState: state,
      toState: result.state,
      event: event.type,
      duration: now() - startTime,
    });

    return result;
  } catch (error) {
    // Track transition error
    trackStateError({
      currentState: state,
      event: event.type,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Internal transition logic (extracted for telemetry wrapping)
 */
function executeTransition(
  state: GameState,
  context: GameContext,
  event: GameEvent
): { state: GameState; context: GameContext } {
  switch (state) {
    case 'idle':
      if (event.type === 'INITIALIZE') {
        return initializeGame(event.payload);
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'ready':
      if (event.type === 'INITIALIZE') {
        return initializeGame(event.payload);
      }
      if (event.type === 'DROP_REQUESTED') {
        return transitionTo('countdown', { ...context, currentFrame: 0 });
      }
      if (event.type === 'START_POSITION_SELECTION') {
        return transitionTo('selecting-position', context);
      }
      if (event.type === 'RESET_REQUESTED') {
        return resetToIdle();
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'selecting-position':
      if (event.type === 'POSITION_SELECTED') {
        return transitionTo('countdown', {
          ...context,
          dropZone: event.payload.dropZone,
          trajectory: event.payload.trajectory,
          trajectoryCache: event.payload.trajectoryCache,
          selectedIndex: event.payload.selectedIndex,
          prize: event.payload.prize,
          currentFrame: 0,
        });
      }
      if (event.type === 'RESET_REQUESTED') {
        return resetToIdle();
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'countdown':
      if (event.type === 'COUNTDOWN_COMPLETED') {
        return transitionTo('dropping', context);
      }
      if (event.type === 'RESET_REQUESTED') {
        return resetToIdle();
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'dropping':
      if (event.type === 'LANDING_COMPLETED') {
        return transitionTo('landed', context);
      }
      if (event.type === 'RESET_REQUESTED') {
        return resetToIdle();
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'landed':
      if (event.type === 'REVEAL_CONFIRMED') {
        return transitionTo('revealed', context);
      }
      if (event.type === 'RESET_REQUESTED') {
        return resetToIdle();
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'revealed':
      if (event.type === 'CLAIM_REQUESTED') {
        return transitionTo('claimed', context);
      }
      if (event.type === 'RESET_REQUESTED') {
        return resetToIdle();
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'claimed':
      if (event.type === 'RESET_REQUESTED') {
        return resetToIdle();
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    default: {
      const _exhaustiveCheck: never = state;
      throw new Error(`Unknown state: ${String(_exhaustiveCheck)}`);
    }
  }
}
