/**
 * Integration tests for deterministic gameplay flows
 *
 * These tests validate end-to-end game flows with predetermined outcomes
 * using fixtures to ensure repeatability and eliminate flakiness.
 */

import { describe, it, expect } from 'vitest';
import { generateTrajectory } from '@game/trajectory';
import { selectPrize } from '@game/rng';
import {
  getTrajectoryFixture,
  getPrizeFixture,
  getDeterministicSeed,
  getDeterministicBatchSeed
} from '../fixtures';

describe('Deterministic Gameplay Integration', () => {
  describe('Ball lands in predetermined slots', () => {
    it('should consistently land in slot 0 with slot0 seed', () => {
      const fixture = getTrajectoryFixture('landInSlot0');

      // Run multiple times to verify consistency
      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);
      }
    });

    it('should consistently land in slot 1 with slot1 seed', () => {
      const fixture = getTrajectoryFixture('landInSlot1');

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);
      }
    });

    it('should consistently land in slot 2 with slot2 seed', () => {
      const fixture = getTrajectoryFixture('landInSlot2');

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);
      }
    });

    it('should consistently land in slot 3 with slot3 seed', () => {
      const fixture = getTrajectoryFixture('landInSlot3');

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);
      }
    });

    it('should consistently land in slot 4 with slot4 seed', () => {
      const fixture = getTrajectoryFixture('landInSlot4');

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);
      }
    });

    it('should consistently land in slot 5 with slot5 seed', () => {
      const fixture = getTrajectoryFixture('landInSlot5');

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);
      }
    });
  });

  describe('Drop zones produce consistent results', () => {
    it('should land in predictable slot when dropping from left zone', () => {
      const fixture = getTrajectoryFixture('leftDropZone');
      const expectedSlot = fixture.landedSlot;

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(expectedSlot);
        expect(result.trajectory.length).toBe(fixture.trajectory.length);
      }
    });

    it('should land in predictable slot when dropping from center zone', () => {
      const fixture = getTrajectoryFixture('centerDropZone');
      const expectedSlot = fixture.landedSlot;

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(expectedSlot);
      }
    });

    it('should land in predictable slot when dropping from right zone', () => {
      const fixture = getTrajectoryFixture('rightDropZone');
      const expectedSlot = fixture.landedSlot;

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(expectedSlot);
      }
    });
  });

  describe('Prize selection is deterministic', () => {
    it('should select same prize with same seed', () => {
      const prizeFixture = getPrizeFixture('deterministicSixSlot');
      const seed = getDeterministicSeed('default');

      const results = Array.from({ length: 10 }, () =>
        selectPrize(prizeFixture.prizes, seed)
      );

      // All results should be identical
      const firstResult = results[0]!;
      results.forEach(result => {
        expect(result.selectedIndex).toBe(firstResult.selectedIndex);
        expect(result.seedUsed).toBe(firstResult.seedUsed);
      });
    });

    it('should produce different prizes with different seeds', () => {
      const prizeFixture = getPrizeFixture('deterministicSixSlot');

      const seeds = [
        getDeterministicSeed('default'),
        getDeterministicSeed('alternate'),
        getDeterministicSeed('purchaseOffer'),
        getDeterministicSeed('freePrize'),
        getDeterministicSeed('noWin'),
      ];

      const results = seeds.map(seed =>
        selectPrize(prizeFixture.prizes, seed)
      );

      // Store all selected indices
      const selectedIndices = results.map(r => r.selectedIndex);

      // At least 2 different prizes should be selected across these seeds
      const uniqueIndices = new Set(selectedIndices);
      expect(uniqueIndices.size).toBeGreaterThanOrEqual(2);
    });

    it('should respect probability distribution with known seeds', () => {
      const prizeFixture = getPrizeFixture('deterministicSixSlot');
      const samples = 1000;
      const counts: number[] = Array(prizeFixture.prizes.length).fill(0);

      // Use deterministic batch seeds for repeatability
      for (let i = 0; i < samples; i++) {
        const seed = getDeterministicBatchSeed(i);
        const result = selectPrize(prizeFixture.prizes, seed);
        const idx = result.selectedIndex;
        const currentCount = counts[idx];
        if (currentCount !== undefined && idx >= 0 && idx < counts.length) {
          counts[idx] = currentCount + 1;
        }
      }

      // Verify observed frequencies match probabilities (±15% tolerance for 1000 samples)
      for (let i = 0; i < prizeFixture.prizes.length; i++) {
        const count = counts[i];
        if (count === undefined) continue;
        const observed = count / samples;
        const prize = prizeFixture.prizes[i];
        if (!prize) continue;
        const expected = prize.probability;
        const error = Math.abs(observed - expected);
        expect(error).toBeLessThan(0.15);
      }
    });
  });

  describe('Complete game flow with predetermined outcome', () => {
    it('should execute full flow: trajectory -> landing -> prize selection', () => {
      // Use fixtures for deterministic flow
      const trajectoryFixture = getTrajectoryFixture('landInSlot2');
      const prizeFixture = getPrizeFixture('deterministicSixSlot');
      const seed = getDeterministicSeed('default');

      // Generate trajectory
      const trajectoryResult = generateTrajectory(trajectoryFixture.params);
      expect(trajectoryResult.landedSlot).toBe(trajectoryFixture.landedSlot);

      // Select prize
      const prizeResult = selectPrize(prizeFixture.prizes, seed);
      expect(prizeResult.selectedIndex).toBeGreaterThanOrEqual(0);
      expect(prizeResult.selectedIndex).toBeLessThan(prizeFixture.prizes.length);

      // Verify trajectory properties
      expect(trajectoryResult.trajectory.length).toBeGreaterThan(100);
      expect(trajectoryResult.trajectory[0]).toMatchObject({
        frame: 0,
        x: expect.any(Number),
        y: expect.any(Number),
        rotation: expect.any(Number),
      });

      // Verify final frame
      const finalFrame = trajectoryResult.trajectory[trajectoryResult.trajectory.length - 1];
      expect(finalFrame).toBeDefined();
      expect(finalFrame?.frame).toBe(trajectoryResult.trajectory.length - 1);
    });

    it('should repeat same flow with same seeds', () => {
      const trajectoryFixture = getTrajectoryFixture('landInSlot3');
      const prizeFixture = getPrizeFixture('deterministicSixSlot');
      const seed = getDeterministicSeed('alternate');

      // Run flow 5 times
      const results = Array.from({ length: 5 }, () => {
        const trajectory = generateTrajectory(trajectoryFixture.params);
        const prize = selectPrize(prizeFixture.prizes, seed);
        return { trajectory, prize };
      });

      // All results should be identical
      const first = results[0]!;
      results.forEach(result => {
        expect(result.trajectory.landedSlot).toBe(first.trajectory.landedSlot);
        expect(result.trajectory.trajectory.length).toBe(first.trajectory.trajectory.length);
        expect(result.prize.selectedIndex).toBe(first.prize.selectedIndex);
      });
    });
  });

  describe('Edge case trajectories are deterministic', () => {
    it('should consistently produce trajectory with many collisions', () => {
      const fixture = getTrajectoryFixture('manyCollisions');

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);

        // Count peg hits
        const pegHits = result.trajectory.filter(p => p.pegHit).length;
        expect(pegHits).toBeGreaterThan(0);
      }
    });

    it('should consistently produce trajectory with few collisions', () => {
      const fixture = getTrajectoryFixture('fewCollisions');

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);
      }
    });

    it('should consistently produce fast drop trajectory', () => {
      const fixture = getTrajectoryFixture('fastDrop');

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);
        expect(result.trajectory.length).toBe(fixture.trajectory.length);
      }
    });

    it('should consistently produce slow bouncy trajectory', () => {
      const fixture = getTrajectoryFixture('slowBouncy');

      for (let i = 0; i < 5; i++) {
        const result = generateTrajectory(fixture.params);
        expect(result.landedSlot).toBe(fixture.landedSlot);
        expect(result.trajectory.length).toBe(fixture.trajectory.length);
      }
    });
  });

  describe('Batch testing with deterministic seeds', () => {
    it('should produce same results when running batch tests multiple times', () => {
      const batchSize = 100;

      // Run batch twice
      const batch1 = Array.from({ length: batchSize }, (_, i) => {
        const seed = getDeterministicBatchSeed(i);
        return generateTrajectory({
          boardWidth: 375,
          boardHeight: 500,
          pegRows: 10,
          slotCount: 6,
          seed,
        });
      });

      const batch2 = Array.from({ length: batchSize }, (_, i) => {
        const seed = getDeterministicBatchSeed(i);
        return generateTrajectory({
          boardWidth: 375,
          boardHeight: 500,
          pegRows: 10,
          slotCount: 6,
          seed,
        });
      });

      // Results should be identical
      for (let i = 0; i < batchSize; i++) {
        expect(batch1[i]!.landedSlot).toBe(batch2[i]!.landedSlot);
        expect(batch1[i]!.trajectory.length).toBe(batch2[i]!.trajectory.length);
      }
    });

    it('should maintain slot distribution consistency across batches', () => {
      const batchSize = 600;
      const slotCounts = Array(6).fill(0);

      // Run deterministic batch
      for (let i = 0; i < batchSize; i++) {
        const seed = getDeterministicBatchSeed(i);
        const result = generateTrajectory({
          boardWidth: 375,
          boardHeight: 500,
          pegRows: 10,
          slotCount: 6,
          seed,
        });

        const slot = result.landedSlot;
        if (slot >= 0 && slot < 6) {
          const currentCount = slotCounts[slot];
          slotCounts[slot] = (typeof currentCount === 'number' ? currentCount : 0) + 1;
        }
      }

      // Each slot should get some hits (rough distribution check)
      slotCounts.forEach((count) => {
        expect(count).toBeGreaterThan(0);
        // Each slot should get between 5% and 30% of drops for 600 samples
        const percentage = count / batchSize;
        expect(percentage).toBeGreaterThan(0.05);
        expect(percentage).toBeLessThan(0.30);
      });
    });
  });
});
