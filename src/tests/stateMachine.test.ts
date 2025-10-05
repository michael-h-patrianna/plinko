/**
 * Tests for game state machine
 */

import { describe, it, expect } from 'vitest';
import { transition, initialContext } from '../game/stateMachine';
import type { GameContext } from '../game/types';

describe('State Machine', () => {
  const mockContext: GameContext = {
    selectedIndex: 2,
    trajectory: [
      { frame: 0, x: 100, y: 0, rotation: 0 },
      { frame: 1, x: 110, y: 10, rotation: 5 },
    ],
    currentFrame: 0,
    prize: {
      id: 'p1',
      type: 'free',
      label: 'Test Prize',
      title: 'Test Prize',
      description: 'Test',
      probability: 1.0,
      color: '#000',
      slotIcon: '',
      slotColor: '#000',
    },
    seed: 12345,
  };

  describe('idle -> ready transition', () => {
    it('should transition to ready on INITIALIZE', () => {
      const result = transition('idle', initialContext, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: mockContext.selectedIndex,
          trajectory: mockContext.trajectory,
          prize: mockContext.prize!,
          seed: mockContext.seed,
        },
      });

      expect(result.state).toBe('ready');
      expect(result.context.selectedIndex).toBe(mockContext.selectedIndex);
      expect(result.context.prize).toEqual(mockContext.prize);
    });

    it('should reject other events from idle', () => {
      expect(() => transition('idle', initialContext, { type: 'DROP_REQUESTED' })).toThrow(
        /Invalid event/
      );
    });
  });

  describe('ready -> countdown transition', () => {
    it('should transition to countdown on DROP_REQUESTED', () => {
      const result = transition('ready', mockContext, {
        type: 'DROP_REQUESTED',
      });

      expect(result.state).toBe('countdown');
      expect(result.context.currentFrame).toBe(0);
    });

    it('should transition to idle on RESET_REQUESTED', () => {
      const result = transition('ready', mockContext, {
        type: 'RESET_REQUESTED',
      });

      expect(result.state).toBe('idle');
      expect(result.context).toEqual(initialContext);
    });

    it('should reject invalid events from ready', () => {
      expect(() => transition('ready', mockContext, { type: 'LANDING_COMPLETED' })).toThrow(
        /Invalid event/
      );
    });
  });

  describe('countdown state transitions', () => {
    it('should transition to dropping on COUNTDOWN_COMPLETED', () => {
      const result = transition('countdown', mockContext, {
        type: 'COUNTDOWN_COMPLETED',
      });

      expect(result.state).toBe('dropping');
    });

    it('should transition to idle on RESET_REQUESTED', () => {
      const result = transition('countdown', mockContext, {
        type: 'RESET_REQUESTED',
      });

      expect(result.state).toBe('idle');
    });

    it('should reject invalid events from countdown', () => {
      expect(() => transition('countdown', mockContext, { type: 'LANDING_COMPLETED' })).toThrow(
        /Invalid event/
      );
    });
  });

  describe('dropping state transitions', () => {
    it('should transition to landed on LANDING_COMPLETED', () => {
      const result = transition('dropping', mockContext, {
        type: 'LANDING_COMPLETED',
      });

      expect(result.state).toBe('landed');
    });

    it('should reject invalid events from dropping', () => {
      expect(() => transition('dropping', mockContext, { type: 'DROP_REQUESTED' })).toThrow(
        /Invalid event/
      );
    });
  });

  describe('landed -> revealed transition', () => {
    it('should transition to revealed on REVEAL_CONFIRMED', () => {
      const result = transition('landed', mockContext, {
        type: 'REVEAL_CONFIRMED',
      });

      expect(result.state).toBe('revealed');
    });

    it('should transition to idle on RESET_REQUESTED', () => {
      const result = transition('landed', mockContext, {
        type: 'RESET_REQUESTED',
      });

      expect(result.state).toBe('idle');
    });

    it('should reject invalid events from landed', () => {
      expect(() => transition('landed', mockContext, { type: 'DROP_REQUESTED' })).toThrow(
        /Invalid event/
      );
    });
  });

  describe('revealed state transitions', () => {
    it('should transition to idle on RESET_REQUESTED', () => {
      const result = transition('revealed', mockContext, {
        type: 'RESET_REQUESTED',
      });

      expect(result.state).toBe('idle');
      expect(result.context).toEqual(initialContext);
    });

    it('should reject invalid events from revealed', () => {
      expect(() => transition('revealed', mockContext, { type: 'DROP_REQUESTED' })).toThrow(
        /Invalid event/
      );
    });
  });

  describe('context preservation', () => {
    it('should preserve context during state transitions', () => {
      let state: typeof result.state = 'idle';
      let context = initialContext;

      // idle -> ready
      let result = transition(state, context, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: mockContext.selectedIndex,
          trajectory: mockContext.trajectory,
          prize: mockContext.prize!,
          seed: mockContext.seed,
        },
      });
      state = result.state;
      context = result.context;
      expect(context.prize).toEqual(mockContext.prize);

      // ready -> countdown
      result = transition(state, context, { type: 'DROP_REQUESTED' });
      state = result.state;
      context = result.context;
      expect(context.prize).toEqual(mockContext.prize);

      // countdown -> dropping
      result = transition(state, context, { type: 'COUNTDOWN_COMPLETED' });
      state = result.state;
      context = result.context;
      expect(context.prize).toEqual(mockContext.prize);

      // dropping -> landed
      result = transition(state, context, { type: 'LANDING_COMPLETED' });
      state = result.state;
      context = result.context;
      expect(context.prize).toEqual(mockContext.prize);

      // landed -> revealed
      result = transition(state, context, { type: 'REVEAL_CONFIRMED' });
      state = result.state;
      context = result.context;
      expect(context.prize).toEqual(mockContext.prize);
    });
  });
});
