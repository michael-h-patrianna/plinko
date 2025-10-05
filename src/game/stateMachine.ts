/**
 * Finite State Machine for Plinko game flow
 * Manages state transitions and prevents invalid operations
 */

import type { GameState, GameContext, TrajectoryPoint, PrizeConfig } from './types';

export type GameEvent =
  | {
      type: 'INITIALIZE';
      payload: {
        selectedIndex: number;
        trajectory: TrajectoryPoint[];
        prize: PrizeConfig;
        seed: number;
      };
    }
  | { type: 'DROP_REQUESTED' }
  | { type: 'COUNTDOWN_COMPLETED' }
  | { type: 'LANDING_COMPLETED' }
  | { type: 'REVEAL_CONFIRMED' }
  | { type: 'CLAIM_REQUESTED' }
  | { type: 'RESET_REQUESTED' };

export const initialContext: GameContext = {
  selectedIndex: -1,
  trajectory: [],
  currentFrame: 0,
  prize: null,
  seed: 0,
};

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
  switch (state) {
    case 'idle':
      if (event.type === 'INITIALIZE') {
        return {
          state: 'ready',
          context: {
            selectedIndex: event.payload.selectedIndex,
            trajectory: event.payload.trajectory,
            currentFrame: 0,
            prize: event.payload.prize,
            seed: event.payload.seed,
          },
        };
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'ready':
      if (event.type === 'DROP_REQUESTED') {
        return {
          state: 'countdown',
          context: { ...context, currentFrame: 0 },
        };
      }
      if (event.type === 'RESET_REQUESTED') {
        return {
          state: 'idle',
          context: initialContext,
        };
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'countdown':
      if (event.type === 'COUNTDOWN_COMPLETED') {
        return {
          state: 'dropping',
          context,
        };
      }
      if (event.type === 'RESET_REQUESTED') {
        return {
          state: 'idle',
          context: initialContext,
        };
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'dropping':
      if (event.type === 'LANDING_COMPLETED') {
        return {
          state: 'landed',
          context,
        };
      }
      if (event.type === 'RESET_REQUESTED') {
        return {
          state: 'idle',
          context: initialContext,
        };
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'landed':
      if (event.type === 'REVEAL_CONFIRMED') {
        return {
          state: 'revealed',
          context,
        };
      }
      if (event.type === 'RESET_REQUESTED') {
        return {
          state: 'idle',
          context: initialContext,
        };
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'revealed':
      if (event.type === 'CLAIM_REQUESTED') {
        return {
          state: 'claimed',
          context,
        };
      }
      if (event.type === 'RESET_REQUESTED') {
        return {
          state: 'idle',
          context: initialContext,
        };
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    case 'claimed':
      if (event.type === 'RESET_REQUESTED') {
        return {
          state: 'idle',
          context: initialContext,
        };
      }
      throw new Error(`Invalid event ${event.type} for state ${state}`);

    default: {
      const _exhaustiveCheck: never = state;
      throw new Error(`Unknown state: ${String(_exhaustiveCheck)}`);
    }
  }
}
