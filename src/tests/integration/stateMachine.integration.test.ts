/**
 * Integration tests for State Machine Transitions
 *
 * Tests the full game flow through the state machine, including:
 * - Complete game lifecycle: idle → ready → countdown → dropping → landed → revealed → claimed
 * - Reset from each state
 * - Invalid transition error handling
 * - Drop position selection flow
 * - Context preservation through transitions
 * - Telemetry tracking for transitions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transition, initialContext } from '@game/stateMachine';
import type { GameContext, GameState, PrizeConfig } from '@game/types';
import * as telemetry from '@utils/telemetry';
import { generateTrajectoryCache } from '@game/trajectoryCache';

// Mock telemetry to avoid side effects
vi.mock('../../utils/telemetry', () => ({
  trackStateTransition: vi.fn(),
  trackStateError: vi.fn(),
}));

describe('State Machine Integration Tests', () => {
  const mockPrize: PrizeConfig = {
    id: 'prize-1',
    type: 'free',
    title: 'Test Prize',
    probability: 0.5,
    slotIcon: '🎁',
    slotColor: '#FF0000',
    freeReward: { gc: 100 },
  };

  const mockTrajectory = [
    { frame: 0, x: 100, y: 0, rotation: 0, vx: 0, vy: 100, pegHit: false },
    { frame: 1, x: 105, y: 10, rotation: 5, vx: 5, vy: 100, pegHit: false },
    { frame: 2, x: 110, y: 20, rotation: 10, vx: 5, vy: 100, pegHit: true },
  ];

  const mockContext: GameContext = {
    selectedIndex: 2,
    trajectory: mockTrajectory,
    trajectoryCache: generateTrajectoryCache(mockTrajectory),
    currentFrame: 0,
    prize: mockPrize,
    seed: 12345,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Full Game Flow Without Drop Position Selection', () => {
    it('should complete full game lifecycle: idle → ready → countdown → dropping → landed → revealed → claimed → idle', () => {
      let state: GameState = 'idle';
      let context = initialContext;

      // 1. idle → ready (INITIALIZE)
      const step1 = transition(state, context, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: mockContext.selectedIndex,
          trajectory: mockContext.trajectory,
          trajectoryCache: mockContext.trajectoryCache!,
          prize: mockContext.prize!,
          seed: mockContext.seed,
        },
      });
      state = step1.state;
      context = step1.context;
      expect(state).toBe('ready');
      expect(context.prize).toEqual(mockPrize);
      expect(context.selectedIndex).toBe(2);
      expect(context.trajectory).toEqual(mockTrajectory);
      expect(context.seed).toBe(12345);
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          fromState: 'idle',
          toState: 'ready',
          event: 'INITIALIZE',
        })
      );

      // 2. ready → countdown (DROP_REQUESTED)
      const step2 = transition(state, context, { type: 'DROP_REQUESTED' });
      state = step2.state;
      context = step2.context;
      expect(state).toBe('countdown');
      expect(context.currentFrame).toBe(0);
      expect(context.prize).toEqual(mockPrize); // Context preserved
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          fromState: 'ready',
          toState: 'countdown',
          event: 'DROP_REQUESTED',
        })
      );

      // 3. countdown → dropping (COUNTDOWN_COMPLETED)
      const step3 = transition(state, context, { type: 'COUNTDOWN_COMPLETED' });
      state = step3.state;
      context = step3.context;
      expect(state).toBe('dropping');
      expect(context.prize).toEqual(mockPrize); // Context preserved
      expect(context.trajectory).toEqual(mockTrajectory); // Trajectory preserved
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          fromState: 'countdown',
          toState: 'dropping',
          event: 'COUNTDOWN_COMPLETED',
        })
      );

      // 4. dropping → landed (LANDING_COMPLETED)
      const step4 = transition(state, context, { type: 'LANDING_COMPLETED' });
      state = step4.state;
      context = step4.context;
      expect(state).toBe('landed');
      expect(context.prize).toEqual(mockPrize); // Context preserved
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          fromState: 'dropping',
          toState: 'landed',
          event: 'LANDING_COMPLETED',
        })
      );

      // 5. landed → revealed (REVEAL_CONFIRMED)
      const step5 = transition(state, context, { type: 'REVEAL_CONFIRMED' });
      state = step5.state;
      context = step5.context;
      expect(state).toBe('revealed');
      expect(context.prize).toEqual(mockPrize); // Context preserved
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          fromState: 'landed',
          toState: 'revealed',
          event: 'REVEAL_CONFIRMED',
        })
      );

      // 6. revealed → claimed (CLAIM_REQUESTED)
      const step6 = transition(state, context, { type: 'CLAIM_REQUESTED' });
      state = step6.state;
      context = step6.context;
      expect(state).toBe('claimed');
      expect(context.prize).toEqual(mockPrize); // Context preserved
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          fromState: 'revealed',
          toState: 'claimed',
          event: 'CLAIM_REQUESTED',
        })
      );

      // 7. claimed → idle (RESET_REQUESTED)
      const step7 = transition(state, context, { type: 'RESET_REQUESTED' });
      state = step7.state;
      context = step7.context;
      expect(state).toBe('idle');
      expect(context).toEqual(initialContext); // Context reset
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          fromState: 'claimed',
          toState: 'idle',
          event: 'RESET_REQUESTED',
        })
      );

      // Verify telemetry was called for each transition
      expect(telemetry.trackStateTransition).toHaveBeenCalledTimes(7);
    });

    it('should preserve context data through all transitions', () => {
      let state: GameState = 'idle';
      let context = initialContext;

      // Initialize with specific context data
      const initResult = transition(state, context, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: 3,
          trajectory: mockTrajectory,
          prize: mockPrize,
          seed: 99999,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
        },
      });
      state = initResult.state;
      context = initResult.context;

      // Verify initial context
      expect(context.selectedIndex).toBe(3);
      expect(context.seed).toBe(99999);
      expect(context.prize).toEqual(mockPrize);

      // Transition through all states and verify context is preserved
      const transitions = [
        { type: 'DROP_REQUESTED' as const },
        { type: 'COUNTDOWN_COMPLETED' as const },
        { type: 'LANDING_COMPLETED' as const },
        { type: 'REVEAL_CONFIRMED' as const },
      ];

      for (const event of transitions) {
        const result = transition(state, context, event);
        state = result.state;
        context = result.context;

        // Verify critical context is preserved
        expect(context.selectedIndex).toBe(3);
        expect(context.seed).toBe(99999);
        expect(context.prize).toEqual(mockPrize);
        expect(context.trajectory).toEqual(mockTrajectory);
      }
    });
  });

  describe('Drop Position Selection Flow', () => {
    it('should complete flow: idle → ready → selecting-position → countdown → dropping → landed', () => {
      let state: GameState = 'idle';
      let context = initialContext;

      // 1. idle → ready
      const step1 = transition(state, context, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: mockContext.selectedIndex,
          trajectory: mockContext.trajectory,
          trajectoryCache: mockContext.trajectoryCache!,
          prize: mockContext.prize!,
          seed: mockContext.seed,
        },
      });
      state = step1.state;
      context = step1.context;
      expect(state).toBe('ready');

      // 2. ready → selecting-position (START_POSITION_SELECTION)
      const step2 = transition(state, context, { type: 'START_POSITION_SELECTION' });
      state = step2.state;
      context = step2.context;
      expect(state).toBe('selecting-position');
      expect(context.prize).toEqual(mockPrize); // Context preserved
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          fromState: 'ready',
          toState: 'selecting-position',
          event: 'START_POSITION_SELECTION',
        })
      );

      // 3. selecting-position → countdown (POSITION_SELECTED)
      const newTrajectory = [
        { frame: 0, x: 50, y: 0, rotation: 0, vx: 0, vy: 100, pegHit: false },
      ];
      const step3 = transition(state, context, {
        type: 'POSITION_SELECTED',
        payload: {
          dropZone: 'left',
          trajectory: newTrajectory,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
          selectedIndex: 1,
          prize: mockPrize,
        },
      });
      state = step3.state;
      context = step3.context;
      expect(state).toBe('countdown');
      expect(context.dropZone).toBe('left');
      expect(context.trajectory).toEqual(newTrajectory); // Trajectory updated
      expect(context.selectedIndex).toBe(1); // Index updated
      expect(context.currentFrame).toBe(0); // Frame reset
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          fromState: 'selecting-position',
          toState: 'countdown',
          event: 'POSITION_SELECTED',
        })
      );

      // 4. countdown → dropping
      const step4 = transition(state, context, { type: 'COUNTDOWN_COMPLETED' });
      state = step4.state;
      context = step4.context;
      expect(state).toBe('dropping');
      expect(context.dropZone).toBe('left'); // Drop zone preserved
      expect(context.trajectory).toEqual(newTrajectory); // New trajectory preserved

      // 5. dropping → landed
      const step5 = transition(state, context, { type: 'LANDING_COMPLETED' });
      state = step5.state;
      context = step5.context;
      expect(state).toBe('landed');
      expect(context.dropZone).toBe('left'); // Drop zone still preserved
    });

    it('should update trajectory and index when position is selected', () => {
      const state: GameState = 'selecting-position';
      const originalTrajectory = mockTrajectory;
      const context: GameContext = {
        ...mockContext,
        trajectory: originalTrajectory,
      };

      const newTrajectory = [
        { frame: 0, x: 200, y: 0, rotation: 0, vx: 0, vy: 100, pegHit: false },
        { frame: 1, x: 195, y: 10, rotation: -5, vx: -5, vy: 100, pegHit: false },
      ];

      const result = transition(state, context, {
        type: 'POSITION_SELECTED',
        payload: {
          dropZone: 'right',
          trajectory: newTrajectory,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
          selectedIndex: 4,
          prize: mockPrize,
        },
      });

      expect(result.state).toBe('countdown');
      expect(result.context.trajectory).toEqual(newTrajectory);
      expect(result.context.trajectory).not.toBe(originalTrajectory);
      expect(result.context.selectedIndex).toBe(4);
      expect(result.context.dropZone).toBe('right');
    });
  });

  describe('Reset From Each State', () => {
    const states: Array<{ state: GameState; context: GameContext }> = [
      { state: 'ready', context: mockContext },
      { state: 'selecting-position', context: mockContext },
      { state: 'countdown', context: mockContext },
      { state: 'dropping', context: mockContext },
      { state: 'landed', context: mockContext },
      { state: 'revealed', context: mockContext },
      { state: 'claimed', context: mockContext },
    ];

    states.forEach(({ state, context }) => {
      it(`should reset from ${state} to idle`, () => {
        const result = transition(state, context, { type: 'RESET_REQUESTED' });

        expect(result.state).toBe('idle');
        expect(result.context).toEqual(initialContext);
        expect(result.context.prize).toBeNull();
        expect(result.context.selectedIndex).toBe(-1);
        expect(result.context.trajectory).toEqual([]);
        expect(result.context.currentFrame).toBe(0);

        expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
          expect.objectContaining({
            fromState: state,
            toState: 'idle',
            event: 'RESET_REQUESTED',
          })
        );
      });
    });

    it('should not allow reset from idle state', () => {
      expect(() => {
        transition('idle', initialContext, { type: 'RESET_REQUESTED' });
      }).toThrow(/Invalid event RESET_REQUESTED for state idle/);

      expect(telemetry.trackStateError).toHaveBeenCalledWith(
        expect.objectContaining({
          currentState: 'idle',
          event: 'RESET_REQUESTED',
        })
      );
    });
  });

  describe('Invalid Transitions', () => {
    it('should throw error for invalid event in idle state', () => {
      expect(() => {
        transition('idle', initialContext, { type: 'DROP_REQUESTED' });
      }).toThrow(/Invalid event DROP_REQUESTED for state idle/);

      expect(telemetry.trackStateError).toHaveBeenCalled();
    });

    it('should throw error for invalid event in ready state', () => {
      expect(() => {
        transition('ready', mockContext, { type: 'LANDING_COMPLETED' });
      }).toThrow(/Invalid event LANDING_COMPLETED for state ready/);
    });

    it('should throw error for invalid event in countdown state', () => {
      expect(() => {
        transition('countdown', mockContext, { type: 'REVEAL_CONFIRMED' });
      }).toThrow(/Invalid event REVEAL_CONFIRMED for state countdown/);
    });

    it('should throw error for invalid event in dropping state', () => {
      expect(() => {
        transition('dropping', mockContext, { type: 'DROP_REQUESTED' });
      }).toThrow(/Invalid event DROP_REQUESTED for state dropping/);
    });

    it('should throw error for invalid event in landed state', () => {
      expect(() => {
        transition('landed', mockContext, { type: 'COUNTDOWN_COMPLETED' });
      }).toThrow(/Invalid event COUNTDOWN_COMPLETED for state landed/);
    });

    it('should throw error for invalid event in revealed state', () => {
      expect(() => {
        transition('revealed', mockContext, { type: 'DROP_REQUESTED' });
      }).toThrow(/Invalid event DROP_REQUESTED for state revealed/);
    });

    it('should throw error for invalid event in claimed state', () => {
      expect(() => {
        transition('claimed', mockContext, { type: 'CLAIM_REQUESTED' });
      }).toThrow(/Invalid event CLAIM_REQUESTED for state claimed/);
    });

    it('should throw error for invalid event in selecting-position state', () => {
      expect(() => {
        transition('selecting-position', mockContext, { type: 'DROP_REQUESTED' });
      }).toThrow(/Invalid event DROP_REQUESTED for state selecting-position/);
    });
  });

  describe('Context Preservation', () => {
    it('should preserve currentFrame during countdown → dropping transition', () => {
      const context: GameContext = {
        ...mockContext,
        currentFrame: 0,
      };

      const result = transition('countdown', context, { type: 'COUNTDOWN_COMPLETED' });

      expect(result.context.currentFrame).toBe(0);
      expect(result.context.prize).toEqual(mockPrize);
    });

    it('should reset currentFrame when initializing from idle', () => {
      const result = transition('idle', initialContext, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: 2,
          trajectory: mockTrajectory,
          prize: mockPrize,
          seed: 12345,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
        },
      });

      expect(result.context.currentFrame).toBe(0);
    });

    it('should reset currentFrame when transitioning ready → countdown', () => {
      const context: GameContext = {
        ...mockContext,
        currentFrame: 100, // Simulate mid-animation frame
      };

      const result = transition('ready', context, { type: 'DROP_REQUESTED' });

      expect(result.context.currentFrame).toBe(0); // Frame reset for new drop
    });

    it('should preserve all context fields through landed → revealed → claimed', () => {
      const context: GameContext = {
        selectedIndex: 3,
        trajectory: mockTrajectory,
        trajectoryCache: generateTrajectoryCache(mockTrajectory),
        currentFrame: 150,
        prize: mockPrize,
        seed: 54321,
        dropZone: 'center',
      };

      // landed → revealed
      const revealed = transition('landed', context, { type: 'REVEAL_CONFIRMED' });
      expect(revealed.context.selectedIndex).toBe(3);
      expect(revealed.context.trajectory).toEqual(mockTrajectory);
      expect(revealed.context.currentFrame).toBe(150);
      expect(revealed.context.prize).toEqual(mockPrize);
      expect(revealed.context.seed).toBe(54321);
      expect(revealed.context.dropZone).toBe('center');

      // revealed → claimed
      const claimed = transition(revealed.state, revealed.context, { type: 'CLAIM_REQUESTED' });
      expect(claimed.context.selectedIndex).toBe(3);
      expect(claimed.context.trajectory).toEqual(mockTrajectory);
      expect(claimed.context.currentFrame).toBe(150);
      expect(claimed.context.prize).toEqual(mockPrize);
      expect(claimed.context.seed).toBe(54321);
      expect(claimed.context.dropZone).toBe('center');
    });
  });

  describe('Telemetry Tracking', () => {
    it('should track duration for each transition', () => {
      const result = transition('idle', initialContext, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: 0,
          trajectory: mockTrajectory,
          prize: mockPrize,
          seed: 123,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
        },
      });

      expect(result.state).toBe('ready');
      expect(telemetry.trackStateTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: expect.any(Number),
        })
      );

      const call = vi.mocked(telemetry.trackStateTransition).mock.calls[0]![0];
      expect(call.duration).toBeGreaterThanOrEqual(0);
      expect(call.duration).toBeLessThan(100); // Should be very fast
    });

    it('should track error when invalid transition attempted', () => {
      expect(() => {
        transition('dropping', mockContext, { type: 'REVEAL_CONFIRMED' });
      }).toThrow();

      expect(telemetry.trackStateError).toHaveBeenCalledWith({
        currentState: 'dropping',
        event: 'REVEAL_CONFIRMED',
        error: expect.stringContaining('Invalid event'),
      });
    });

    it('should track all transitions in a complete game flow', () => {
      let state: GameState = 'idle';
      let context = initialContext;

      const transitions = [
        { type: 'INITIALIZE' as const, payload: { selectedIndex: 0, trajectory: mockTrajectory, prize: mockPrize, seed: 123, trajectoryCache: generateTrajectoryCache(mockTrajectory) } },
        { type: 'DROP_REQUESTED' as const },
        { type: 'COUNTDOWN_COMPLETED' as const },
        { type: 'LANDING_COMPLETED' as const },
        { type: 'REVEAL_CONFIRMED' as const },
        { type: 'CLAIM_REQUESTED' as const },
        { type: 'RESET_REQUESTED' as const },
      ];

      for (const event of transitions) {
        if ('payload' in event) {
          const result = transition(state, context, event);
          state = result.state;
          context = result.context;
        } else {
          const result = transition(state, context, event);
          state = result.state;
          context = result.context;
        }
      }

      expect(telemetry.trackStateTransition).toHaveBeenCalledTimes(7);
      expect(telemetry.trackStateError).not.toHaveBeenCalled();
    });
  });

  describe('Re-initialization', () => {
    it('should allow re-initialization from ready state', () => {
      const newPrize: PrizeConfig = {
        ...mockPrize,
        id: 'prize-2',
        title: 'New Prize',
      };

      const newTrajectory = [
        { frame: 0, x: 150, y: 0, rotation: 0, vx: 0, vy: 100, pegHit: false },
      ];

      const result = transition('ready', mockContext, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: 4,
          trajectory: newTrajectory,
          prize: newPrize,
          seed: 99999,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
        },
      });

      expect(result.state).toBe('ready');
      expect(result.context.prize).toEqual(newPrize);
      expect(result.context.trajectory).toEqual(newTrajectory);
      expect(result.context.selectedIndex).toBe(4);
      expect(result.context.seed).toBe(99999);
    });

    it('should overwrite previous context on re-initialization', () => {
      const originalContext: GameContext = {
        selectedIndex: 0,
        trajectory: mockTrajectory,
        trajectoryCache: generateTrajectoryCache(mockTrajectory),
        currentFrame: 50,
        prize: mockPrize,
        seed: 111,
        dropZone: 'left',
      };

      const newPrize: PrizeConfig = {
        ...mockPrize,
        id: 'new-prize',
      };
      const newTrajectory = [
        { frame: 0, x: 200, y: 0, rotation: 0, vx: 0, vy: 100, pegHit: false },
      ];

      const result = transition('ready', originalContext, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: 5,
          trajectory: newTrajectory,
          prize: newPrize,
          seed: 222,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
        },
      });

      expect(result.context.selectedIndex).toBe(5);
      expect(result.context.trajectory).toEqual(newTrajectory);
      expect(result.context.prize).toEqual(newPrize);
      expect(result.context.seed).toBe(222);
      expect(result.context.currentFrame).toBe(0); // Reset
      expect(result.context.dropZone).toBeUndefined(); // Not included in initialization
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty trajectory array', () => {
      const result = transition('idle', initialContext, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: 0,
          trajectory: [],
          prize: mockPrize,
          seed: 123,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
        },
      });

      expect(result.state).toBe('ready');
      expect(result.context.trajectory).toEqual([]);
    });

    it('should handle selectedIndex of 0', () => {
      const result = transition('idle', initialContext, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: 0,
          trajectory: mockTrajectory,
          prize: mockPrize,
          seed: 123,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
        },
      });

      expect(result.context.selectedIndex).toBe(0);
    });

    it('should handle seed of 0', () => {
      const result = transition('idle', initialContext, {
        type: 'INITIALIZE',
        payload: {
          selectedIndex: 1,
          trajectory: mockTrajectory,
          prize: mockPrize,
          seed: 0,
          trajectoryCache: generateTrajectoryCache(mockTrajectory),
        },
      });

      expect(result.context.seed).toBe(0);
    });

    it('should handle multiple consecutive resets', () => {
      const state: GameState = 'ready';
      const context = mockContext;

      // First reset
      const reset1 = transition(state, context, { type: 'RESET_REQUESTED' });
      expect(reset1.state).toBe('idle');
      expect(reset1.context).toEqual(initialContext);

      // Cannot reset from idle
      expect(() => {
        transition(reset1.state, reset1.context, { type: 'RESET_REQUESTED' });
      }).toThrow();
    });
  });
});
