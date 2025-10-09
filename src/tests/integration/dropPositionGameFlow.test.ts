/**
 * Integration tests for drop position choice mechanic game flow
 * Tests the complete flow from ready -> selecting-position -> countdown -> dropping -> landed
 */

import { describe, it, expect } from 'vitest';
import { transition, initialContext, type GameEvent } from '../../game/stateMachine';
import type { GameContext, GameState, DropZone } from '../../game/types';
import { generateTrajectory } from '../../game/trajectory';

describe('Drop Position Game Flow Integration', () => {
  const mockTrajectory = generateTrajectory({
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    slotCount: 7,
    seed: 12345,
  });

  const mockContext: GameContext = {
    selectedIndex: 0,
    trajectory: mockTrajectory.trajectory,
    trajectoryCache: mockTrajectory.cache,
    currentFrame: 0,
    prize: {
      id: 'test-prize',
      type: 'free' as const,
      probability: 0.1,
      slotIcon: '/test.png',
      slotColor: '#FFD700',
      title: 'Test Prize',
      freeReward: {
        gc: 100,
      },
    },
    seed: 12345,
  };

  describe('State transitions with drop position mechanic', () => {
    it('should transition from ready to selecting-position when START_POSITION_SELECTION is triggered', () => {
      const result = transition('ready', mockContext, {
        type: 'START_POSITION_SELECTION',
      });

      expect(result.state).toBe('selecting-position');
      expect(result.context).toEqual(mockContext);
    });

    it('should transition from selecting-position to countdown when position is selected', () => {
      const dropZone: DropZone = 'center';

      const result = transition('selecting-position', mockContext, {
        type: 'POSITION_SELECTED',
        payload: {
          dropZone,
          trajectory: mockContext.trajectory,
          trajectoryCache: mockContext.trajectoryCache!,
          selectedIndex: mockContext.selectedIndex,
          prize: mockContext.prize!,
        },
      });

      expect(result.state).toBe('countdown');
      expect(result.context.dropZone).toBe('center');
    });

    it('should allow reset from selecting-position state', () => {
      const result = transition('selecting-position', mockContext, {
        type: 'RESET_REQUESTED',
      });

      expect(result.state).toBe('idle');
      expect(result.context).toEqual(initialContext);
    });

    it('should transition through complete drop position flow', () => {
      // Start: ready state
      let state: GameState = 'ready';
      let context = mockContext;

      // Step 1: Start position selection
      const step1 = transition(state, context, { type: 'START_POSITION_SELECTION' });
      expect(step1.state).toBe('selecting-position');
      state = step1.state;
      context = step1.context;

      // Step 2: User selects position
      const step2 = transition(state, context, {
        type: 'POSITION_SELECTED',
        payload: {
          dropZone: 'left',
          trajectory: context.trajectory,
          trajectoryCache: context.trajectoryCache!,
          selectedIndex: context.selectedIndex,
          prize: context.prize!,
        },
      });
      expect(step2.state).toBe('countdown');
      expect(step2.context.dropZone).toBe('left');
      state = step2.state;
      context = step2.context;

      // Step 3: Countdown completes
      const step3 = transition(state, context, { type: 'COUNTDOWN_COMPLETED' });
      expect(step3.state).toBe('dropping');
      state = step3.state;
      context = step3.context;

      // Step 4: Ball lands
      const step4 = transition(state, context, { type: 'LANDING_COMPLETED' });
      expect(step4.state).toBe('landed');
      state = step4.state;
      context = step4.context;

      // Step 5: Prize revealed
      const step5 = transition(state, context, { type: 'REVEAL_CONFIRMED' });
      expect(step5.state).toBe('revealed');
    });
  });

  describe('Drop zone preservation through state transitions', () => {
    it('should preserve drop zone through countdown -> dropping transitions', () => {
      const contextWithZone: GameContext = {
        ...mockContext,
        dropZone: 'right',
      };

      // Transition to dropping
      const result = transition('countdown', contextWithZone, {
        type: 'COUNTDOWN_COMPLETED',
      });

      expect(result.state).toBe('dropping');
      expect(result.context.dropZone).toBe('right');
    });

    it('should preserve drop zone through dropping -> landed transitions', () => {
      const contextWithZone: GameContext = {
        ...mockContext,
        dropZone: 'left-center',
      };

      const result = transition('dropping', contextWithZone, {
        type: 'LANDING_COMPLETED',
      });

      expect(result.state).toBe('landed');
      expect(result.context.dropZone).toBe('left-center');
    });
  });

  describe('Classic mode (no drop position) flow', () => {
    it('should transition directly from ready to countdown without position selection', () => {
      const result = transition('ready', mockContext, {
        type: 'DROP_REQUESTED',
      });

      expect(result.state).toBe('countdown');
      expect(result.context.dropZone).toBeUndefined();
    });

    it('should complete full game without drop zone in context', () => {
      let state: GameState = 'ready';
      let context = mockContext;

      // Classic mode: skip position selection
      const step1 = transition(state, context, { type: 'DROP_REQUESTED' });
      expect(step1.state).toBe('countdown');
      expect(step1.context.dropZone).toBeUndefined();

      state = step1.state;
      context = step1.context;

      // Rest of flow should work normally
      const step2 = transition(state, context, { type: 'COUNTDOWN_COMPLETED' });
      expect(step2.state).toBe('dropping');

      const step3 = transition(step2.state, step2.context, { type: 'LANDING_COMPLETED' });
      expect(step3.state).toBe('landed');
    });
  });

  describe('Error handling', () => {
    it('should throw error if invalid event sent to selecting-position state', () => {
      // COUNTDOWN_COMPLETED is a valid event type but invalid for selecting-position state
      expect(() => {
        transition('selecting-position', mockContext, { type: 'COUNTDOWN_COMPLETED' } as Extract<GameEvent, { type: 'COUNTDOWN_COMPLETED' }>);
      }).toThrow();
    });

    it('should throw error if invalid event sent to ready state', () => {
      // LANDING_COMPLETED is a valid event type but invalid for ready state
      expect(() => {
        transition('ready', mockContext, { type: 'LANDING_COMPLETED' } as Extract<GameEvent, { type: 'LANDING_COMPLETED' }>);
      }).toThrow();
    });
  });

  describe('All drop zones integration', () => {
    const DROP_ZONES: DropZone[] = ['left', 'left-center', 'center', 'right-center', 'right'];

    DROP_ZONES.forEach((dropZone) => {
      it(`should complete full flow with drop zone: ${dropZone}`, () => {
        // Generate trajectory for this drop zone
        const zoneTrajectory = generateTrajectory({
          boardWidth: 375,
          boardHeight: 500,
          pegRows: 10,
          slotCount: 7,
          seed: 12345,
          dropZone,
        });

        const contextWithZone: GameContext = {
          ...mockContext,
          trajectory: zoneTrajectory.trajectory,
          trajectoryCache: zoneTrajectory.cache,
          selectedIndex: zoneTrajectory.landedSlot,
          dropZone,
        };

        // Flow through all states
        const state: GameState = 'selecting-position';
        const context = contextWithZone;

        // Select position
        const step1 = transition(state, context, {
          type: 'POSITION_SELECTED',
          payload: {
            dropZone,
            trajectory: context.trajectory,
            trajectoryCache: context.trajectoryCache!,
            selectedIndex: context.selectedIndex,
            prize: context.prize!,
          },
        });
        expect(step1.state).toBe('countdown');

        // Complete countdown
        const step2 = transition(step1.state, step1.context, {
          type: 'COUNTDOWN_COMPLETED',
        });
        expect(step2.state).toBe('dropping');

        // Land
        const step3 = transition(step2.state, step2.context, {
          type: 'LANDING_COMPLETED',
        });
        expect(step3.state).toBe('landed');
        expect(step3.context.dropZone).toBe(dropZone);
      });
    });
  });

  describe('Trajectory consistency', () => {
    it('should maintain trajectory integrity through state transitions with drop zone', () => {
      const dropZone: DropZone = 'center';

      const zoneTrajectory = generateTrajectory({
        boardWidth: 375,
        boardHeight: 500,
        pegRows: 10,
        slotCount: 7,
        seed: 99999,
        dropZone,
      });

      const contextWithZone: GameContext = {
        ...mockContext,
        trajectory: zoneTrajectory.trajectory,
        trajectoryCache: zoneTrajectory.cache,
        selectedIndex: zoneTrajectory.landedSlot,
        dropZone,
      };

      // Transition through states
      const step1 = transition('selecting-position', contextWithZone, {
        type: 'POSITION_SELECTED',
        payload: {
          dropZone,
          trajectory: contextWithZone.trajectory,
          trajectoryCache: contextWithZone.trajectoryCache!,
          selectedIndex: contextWithZone.selectedIndex,
          prize: contextWithZone.prize!,
        },
      });

      const step2 = transition(step1.state, step1.context, {
        type: 'COUNTDOWN_COMPLETED',
      });

      const step3 = transition(step2.state, step2.context, {
        type: 'LANDING_COMPLETED',
      });

      // Trajectory should remain unchanged
      expect(step3.context.trajectory).toBe(zoneTrajectory.trajectory);
      expect(step3.context.trajectory.length).toBe(zoneTrajectory.trajectory.length);
    });
  });
});
