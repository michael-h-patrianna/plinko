/**
 * Peg Ripple Chain Reaction Utilities
 *
 * Calculates which pegs are adjacent to a hit peg for ripple chain reactions.
 * Uses peg layout geometry to determine proximity based on distance threshold.
 *
 * PERFORMANCE:
 * - Pre-build adjacency map once per game start (not per frame)
 * - O(1) lookup during ball drop (Map-based retrieval)
 * - Avoid recalculating distances every frame
 *
 * CROSS-PLATFORM:
 * - Pure math, no DOM dependencies
 * - Works on web and React Native
 */

import type { Peg } from '@game/boardGeometry';
import { distance } from '@game/boardGeometry';

/**
 * Adjacency radius for ripple effects (in pixels)
 * Pegs within this distance will ripple when center peg is hit
 */
export const RIPPLE_RADIUS = 40;

/**
 * Build adjacency map for all pegs
 * Maps "row-col" -> array of adjacent "row-col" IDs
 *
 * @param pegs - Array of peg positions from generatePegLayout
 * @param radius - Distance threshold for adjacency (default: RIPPLE_RADIUS)
 * @returns Map of peg ID to array of adjacent peg IDs
 */
export function buildPegAdjacencyMap(
  pegs: Peg[],
  radius: number = RIPPLE_RADIUS
): Map<string, string[]> {
  const adjacencyMap = new Map<string, string[]>();

  pegs.forEach((peg) => {
    const pegId = `${peg.row}-${peg.col}`;
    const adjacentPegs: string[] = [];

    // Find all pegs within radius
    pegs.forEach((otherPeg) => {
      // Skip self
      if (peg.row === otherPeg.row && peg.col === otherPeg.col) {
        return;
      }

      // Check distance
      const dist = distance(peg.x, peg.y, otherPeg.x, otherPeg.y);
      if (dist <= radius) {
        adjacentPegs.push(`${otherPeg.row}-${otherPeg.col}`);
      }
    });

    adjacencyMap.set(pegId, adjacentPegs);
  });

  return adjacencyMap;
}

/**
 * Get adjacent peg IDs for a given peg (fast lookup)
 *
 * @param pegId - Peg identifier in "row-col" format
 * @param adjacencyMap - Pre-built adjacency map
 * @returns Array of adjacent peg IDs, or empty array if not found
 */
export function getAdjacentPegs(
  pegId: string,
  adjacencyMap: Map<string, string[]>
): string[] {
  return adjacencyMap.get(pegId) || [];
}
