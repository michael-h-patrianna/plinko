/**
 * Prize swapping utilities for visual display
 *
 * Handles the logic of swapping prizes in the array so that the winning prize
 * appears at the landed slot position, while keeping the actual winning prize immutable.
 */

import type { PrizeConfig } from './types';

export interface SwapPrizesResult {
  /** Swapped prizes array for visual display */
  swappedPrizes: PrizeConfig[];
  /** Visual position of the winning prize after swap */
  winningPrizeVisualIndex: number;
}

/**
 * Swap prizes array so winning prize appears at the landed slot
 *
 * This is for visual display only - the actual winning prize is stored separately
 * and remains immutable.
 *
 * @param prizes Original prizes array
 * @param winningIndex Index of the winning prize in the original array
 * @param landedSlot Index where the ball landed
 * @returns Swapped prizes and visual index of winning prize
 */
export function swapPrizesForDisplay(
  prizes: PrizeConfig[],
  winningIndex: number,
  landedSlot: number
): SwapPrizesResult {
  // Create a copy to avoid mutating the original
  const swappedPrizes = [...prizes];

  // Only swap if different positions and valid indices
  if (landedSlot !== winningIndex && landedSlot >= 0 && landedSlot < prizes.length) {
    const temp = swappedPrizes[landedSlot]!;
    swappedPrizes[landedSlot] = swappedPrizes[winningIndex]!;
    swappedPrizes[winningIndex] = temp;
  }

  return {
    swappedPrizes,
    winningPrizeVisualIndex: landedSlot,
  };
}
