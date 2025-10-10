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
  /**
   * When true, trajectory targets winning slot without swapping prizes (choice mode).
   * When false/undefined, trajectory lands anywhere and prizes are swapped (classic mode).
   */
  useChoiceMechanic?: boolean;
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
 * Initialize trajectory and handle prize arrangement
 *
 * This combines trajectory generation with prize arrangement logic.
 *
 * **Classic Mode** (useChoiceMechanic=false):
 * - Ball lands anywhere (random slot)
 * - Prizes are swapped so winning prize appears at landed slot
 * - User doesn't see slots during countdown (can swap safely)
 *
 * **Choice Mode** (useChoiceMechanic=true):
 * - Ball MUST land in winning slot (no swapping - user sees slots!)
 * - Trajectory bruteforces from chosen drop zone to winning slot
 * - May take longer but happens during countdown animation
 *
 * @param options Configuration for trajectory generation
 * @returns Trajectory and arranged prizes
 * @throws Error if trajectory generation fails
 */
export function initializeTrajectoryAndPrizes(
  options: TrajectoryInitOptions
): TrajectoryInitResult {
  const { boardWidth, boardHeight, pegRows, prizes, winningIndex, seed, dropZone, precomputedTrajectory, useChoiceMechanic = false } = options;

  if (useChoiceMechanic) {
    // CHOICE MODE: Target winning slot directly (no prize swapping)
    // User can see slots, so we MUST land in the actual winning slot
    const trajectoryResult = generateTrajectory({
      boardWidth,
      boardHeight,
      pegRows,
      slotCount: prizes.length,
      seed,
      dropZone,
      targetSlot: winningIndex, // Bruteforce to winning slot
      precomputedTrajectory,
    });

    const { trajectory, landedSlot, cache } = trajectoryResult;

    // Verify we hit the target (should always succeed with enough attempts)
    if (landedSlot !== winningIndex) {
      throw new Error(
        `Choice mode trajectory failed: landed in slot ${landedSlot} but expected ${winningIndex}`
      );
    }

    // No prize swapping - return original prizes in original order
    return {
      trajectory,
      trajectoryCache: cache,
      landedSlot: winningIndex,
      swappedPrizes: [...prizes], // Original order
      winningPrizeVisualIndex: winningIndex, // Same as winning index
      prizeAtLandedSlot: prizes[winningIndex]!,
    };
  } else {
    // CLASSIC MODE: Let ball land anywhere, then swap prizes
    // User doesn't see individual slots during countdown, so swapping is invisible
    const trajectoryResult = generateTrajectory({
      boardWidth,
      boardHeight,
      pegRows,
      slotCount: prizes.length,
      seed,
      dropZone,
      // Do NOT pass targetSlot - faster generation
      precomputedTrajectory,
    });

    const { trajectory, landedSlot, cache } = trajectoryResult;

    // Swap prizes so winning prize appears at landed slot
    const { swappedPrizes, winningPrizeVisualIndex } = swapPrizesForDisplay(
      prizes,
      winningIndex,
      landedSlot
    );

    // Get the prize at landed slot for state machine
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
}
