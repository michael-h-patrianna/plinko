/**
 * Trajectory initialization utilities
 *
 * Handles generating trajectories and coordinating with prize swapping
 */

import { generateTrajectory } from './trajectory';
import type { DropZone, PrizeConfig, TrajectoryPoint, TrajectoryCache, DeterministicTrajectoryPayload } from './types';
import { swapPrizesForDisplay } from './prizeSwapping';

export interface TrajectoryInitOptions {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  prizes: PrizeConfig[];
  winningIndex: number;
  seed: number;
  dropZone?: DropZone;
  precomputedTrajectory?: DeterministicTrajectoryPayload;
}

export interface TrajectoryInitResult {
  /** Generated trajectory points */
  trajectory: TrajectoryPoint[];
  /** Pre-calculated cache for performance optimization */
  trajectoryCache: TrajectoryCache;
  /** Slot where ball landed */
  landedSlot: number;
  /** Prizes swapped for visual display */
  swappedPrizes: PrizeConfig[];
  /** Visual index of winning prize */
  winningPrizeVisualIndex: number;
  /** Prize at the landed slot (for state machine) */
  prizeAtLandedSlot: PrizeConfig;
}

/**
 * Initialize trajectory and swap prizes for display
 *
 * This combines trajectory generation with prize swapping logic.
 * The trajectory determines where the ball lands, then prizes are swapped
 * so the winning prize appears at that position visually.
 *
 * @param options Configuration for trajectory generation
 * @returns Trajectory and swapped prizes
 * @throws Error if trajectory generation fails
 */
export function initializeTrajectoryAndPrizes(
  options: TrajectoryInitOptions
): TrajectoryInitResult {
  const { boardWidth, boardHeight, pegRows, prizes, winningIndex, seed, dropZone, precomputedTrajectory } = options;

  // STEP 1: Generate trajectory - let ball land naturally
  // Do NOT pass targetSlot - that causes excessive attempts
  const trajectoryResult = generateTrajectory({
    boardWidth,
    boardHeight,
    pegRows,
    slotCount: prizes.length,
    seed,
    dropZone,
    precomputedTrajectory,
  });

  const { trajectory, landedSlot, cache } = trajectoryResult;

  // STEP 2: Swap prizes for visual display
  const { swappedPrizes, winningPrizeVisualIndex } = swapPrizesForDisplay(
    prizes,
    winningIndex,
    landedSlot
  );

  // STEP 3: Get the prize at landed slot for state machine
  const prizeAtLandedSlot = swappedPrizes[landedSlot]!;

  return {
    trajectory,
    trajectoryCache: cache,
    landedSlot,
    swappedPrizes,
    winningPrizeVisualIndex,
    prizeAtLandedSlot,
  };
}
