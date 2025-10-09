/**
 * Deterministic Trajectory Generation for Plinko
 *
 * This implementation:
 * 1. Uses deterministic physics simulation (same inputs = same output)
 * 2. Tries different initial conditions until finding a trajectory that lands in target slot
 * 3. Returns that predetermined trajectory for replay
 *
 * The ball movement is completely realistic - no guidance forces or manipulation.
 * We simply find the right starting conditions that naturally lead to the desired outcome.
 */

import { clampSlotIndexFromX, generatePegLayout, getDropZoneRange } from '../boardGeometry';
import type { DeterministicTrajectoryPayload, DropZone, TrajectoryPoint, TrajectoryCache } from '../types';
import { runSimulation, type SimulationParams } from './simulation';
import { generateTrajectoryCache } from '../trajectoryCache';

export type PrecomputedTrajectoryInput = DeterministicTrajectoryPayload;

export interface GenerateTrajectoryParams {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  seed?: number;
  dropZone?: DropZone;
  /** Explicit landing slot requested by upstream system. */
  targetSlot?: number;
  /** Precomputed deterministic path supplied by provider/server. */
  precomputedTrajectory?: PrecomputedTrajectoryInput;
  /** Override for maximum deterministic search attempts. */
  maxAttempts?: number;
}

export interface GenerateTrajectoryResult {
  trajectory: TrajectoryPoint[];
  landedSlot: number;
  /** Indicates whether the resulting slot matched the requested target slot. */
  matchedTarget: boolean;
  /** Count of simulation attempts performed (0 for precomputed trajectories). */
  attempts: number;
  /** Histogram of landed slots observed during search, useful for debugging target mismatches. */
  slotHistogram: Record<number, number>;
  /** Optional metadata for callers to inspect when targets are not satisfied. */
  failure?: {
    reason: 'invalid-precomputed-path' | 'max-attempts-exceeded' | 'target-out-of-range';
    targetSlot?: number;
  };
  source: 'precomputed' | 'simulated';
  /** Pre-calculated cache for performance optimization (generated during simulation). */
  cache: TrajectoryCache;
}

function computeLandingSlotFromTrajectory(
  trajectory: TrajectoryPoint[],
  boardWidth: number,
  slotCount: number
): number {
  if (trajectory.length === 0) {
    return -1;
  }
  const finalPoint = trajectory[trajectory.length - 1]!;
  return clampSlotIndexFromX(finalPoint.x, boardWidth, slotCount);
}

/**
 * Main trajectory generation function
 * Generates a random trajectory and returns which slot it landed in
 * Uses brute-force retry to ensure ball never gets stuck
 * The caller is responsible for rearranging prizes to match the landing slot
 */
export function generateTrajectory(params: GenerateTrajectoryParams): GenerateTrajectoryResult {
  const {
    boardWidth,
    boardHeight,
    pegRows,
    slotCount,
    seed = Date.now(),
    dropZone,
    targetSlot,
    precomputedTrajectory,
    maxAttempts = 50000,
  } = params;

  if (slotCount <= 0) {
    throw new Error('slotCount must be greater than zero.');
  }

  if (typeof targetSlot === 'number' && (targetSlot < 0 || targetSlot >= slotCount)) {
    throw new Error(`Target slot ${targetSlot} is out of bounds for slot count ${slotCount}.`);
  }

  if (precomputedTrajectory) {
    const trajectory = precomputedTrajectory.points.map((point) => ({ ...point }));
    const computedSlot = computeLandingSlotFromTrajectory(trajectory, boardWidth, slotCount);
    const providedSlot = precomputedTrajectory.landingSlot;
    const effectiveTarget = typeof targetSlot === 'number' ? targetSlot : providedSlot;
    const matchedTarget =
      typeof effectiveTarget === 'number' ? computedSlot === effectiveTarget : computedSlot >= 0;

    const slotHistogram: Record<number, number> = {};
    if (computedSlot >= 0) {
      slotHistogram[computedSlot] = 1;
    }

    const failure =
      computedSlot < 0 || (typeof effectiveTarget === 'number' && computedSlot !== effectiveTarget)
        ? {
            reason: 'invalid-precomputed-path' as const,
            targetSlot: effectiveTarget,
          }
        : undefined;

    return {
      trajectory,
      landedSlot: computedSlot,
      matchedTarget,
      attempts: 0,
      slotHistogram,
      failure,
      source: 'precomputed',
      cache: generateTrajectoryCache(trajectory),
    };
  }

  const pegs = generatePegLayout({ boardWidth, boardHeight, pegRows });

  const slotHistogram: Record<number, number> = {};
  let bestCandidate: {
    trajectory: TrajectoryPoint[];
    landedSlot: number;
    attempts: number;
  } | null = null;

  // Determine search range based on drop zone
  let searchCenterX: number;
  let searchRangeX: number;

  if (dropZone) {
    // User selected a specific drop zone - constrain search to that zone
    const { min, max } = getDropZoneRange(dropZone, boardWidth);
    searchCenterX = (min + max) / 2;
    searchRangeX = (max - min) / 2;
  } else {
    // Classic mode - search center area
    searchCenterX = boardWidth / 2;
    searchRangeX = 2.5; // Small range around center
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Microscopic variations that are imperceptible but change entire trajectory
    // Use different patterns to explore the space efficiently
    const pattern = attempt % 7;
    let microOffset: number;
    if (pattern === 0)
      microOffset = 0; // Dead center of zone
    else if (pattern === 1)
      microOffset = searchRangeX * 0.3; // Slightly right
    else if (pattern === 2)
      microOffset = -searchRangeX * 0.3; // Slightly left
    else if (pattern === 3) microOffset = searchRangeX * 0.6;
    else if (pattern === 4) microOffset = -searchRangeX * 0.6;
    else if (pattern === 5)
      microOffset = Math.sin(attempt * 0.618) * searchRangeX * 0.8; // Sine wave pattern
    else microOffset = Math.cos(attempt * 1.414) * searchRangeX * 0.8; // Cosine wave pattern

    const startX = searchCenterX + microOffset;
    const startVx = 0; // ALWAYS zero initial velocity - ball drops from rest

    // Vary bounce randomness systematically
    const bounceRandomness = 0.2 + ((attempt % 100) / 100) * 0.6; // 0.2 to 0.8 range

    const simulationParams: SimulationParams = {
      startX,
      startVx,
      bounceRandomness,
    };

    // Run deterministic simulation
    const simulationSeed = seed * 65537 + attempt * 31337;
    const { trajectory, landedSlot } = runSimulation({
      params: simulationParams,
      boardWidth,
      boardHeight,
      pegs,
      slotCount,
      rngSeed: simulationSeed,
    });

    if (landedSlot >= 0 && landedSlot < slotCount) {
      slotHistogram[landedSlot] = (slotHistogram[landedSlot] ?? 0) + 1;

      if (!bestCandidate) {
        bestCandidate = { trajectory, landedSlot, attempts: attempt + 1 };
      }

      if (typeof targetSlot !== 'number' || landedSlot === targetSlot) {
        return {
          trajectory,
          landedSlot,
          matchedTarget: typeof targetSlot !== 'number' ? true : landedSlot === targetSlot,
          attempts: attempt + 1,
          slotHistogram,
          source: 'simulated',
          cache: generateTrajectoryCache(trajectory),
        };
      }
    }
  }

  if (bestCandidate) {
    return {
      trajectory: bestCandidate.trajectory,
      landedSlot: bestCandidate.landedSlot,
      matchedTarget:
        typeof targetSlot !== 'number' ? true : bestCandidate.landedSlot === targetSlot,
      attempts: maxAttempts,
      slotHistogram,
      failure:
        typeof targetSlot === 'number'
          ? ({ reason: 'max-attempts-exceeded', targetSlot } as const)
          : undefined,
      source: 'simulated',
      cache: generateTrajectoryCache(bestCandidate.trajectory),
    };
  }

  console.error(`Failed to generate valid trajectory after ${maxAttempts} attempts`);
  throw new Error(`Could not generate valid trajectory after ${maxAttempts} attempts`);
}

// Re-export types and utilities for convenience
export type { SimulationParams, SimulationResult } from './simulation';
export { runSimulation } from './simulation';
export { detectAndHandlePegCollisions, preventPegOverlaps } from './collision';
export { handleBucketPhysics, calculateBucketDimensions, determineLandedSlot, isInBucketZone } from './bucket';
