/**
 * Utility functions for calculating responsive slot/bucket dimensions
 * Ensures buckets look good on all screen sizes with variable prize counts
 */

/**
 * Calculate bucket height based on slot width
 * Narrower slots (more prizes or smaller screens) need taller buckets
 */
export function calculateBucketHeight(slotWidth: number): number {
  if (slotWidth < 40) return 105;  // 8 prizes on 320px = very narrow
  if (slotWidth < 50) return 95;   // 7-8 prizes on 375px = narrow
  return 90;                       // 3-6 prizes = standard
}

/**
 * Calculate bucket zone Y position (top of buckets)
 * Must account for variable bucket heights
 */
export function calculateBucketZoneY(boardHeight: number, slotWidth: number): number {
  const bucketHeight = calculateBucketHeight(slotWidth);
  return boardHeight - bucketHeight;
}
