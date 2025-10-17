/**
 * Utility functions for calculating responsive slot/bucket dimensions
 * Ensures buckets look good on all screen sizes with variable prize counts
 */

import { SLOT } from '../constants';

/**
 * Calculate bucket height based on slot width
 * Narrower slots (more prizes or smaller screens) need taller buckets
 */
export function calculateBucketHeight(slotWidth: number): number {
  if (slotWidth < SLOT.NARROW_THRESHOLD) return SLOT.NARROW_BUCKET_OFFSET; // 8 prizes on 320px = very narrow
  if (slotWidth < SLOT.SMALL_THRESHOLD) return SLOT.SMALL_BUCKET_OFFSET; // 7-8 prizes on 375px = narrow
  return 90; // 3-6 prizes = standard
}

/**
 * Calculate bucket zone Y position (top of buckets)
 * Must account for variable bucket heights
 */
export function calculateBucketZoneY(boardHeight: number, slotWidth: number): number {
  const bucketHeight = calculateBucketHeight(slotWidth);
  return boardHeight - bucketHeight;
}
