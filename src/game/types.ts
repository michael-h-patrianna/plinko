/**
 * Core type definitions for the Plinko game
 */

import type { Prize } from './prizeTypes';

// Re-export Prize as PrizeConfig for backward compatibility
export type PrizeConfig = Prize & {
  // Legacy fields for backward compatibility
  label?: string;
  description?: string;
  color?: string;
};

export interface TrajectoryPoint {
  frame: number;
  x: number;
  y: number;
  rotation: number;
  pegHit?: boolean;
  pegHitRow?: number; // Which row peg was hit (primary hit)
  pegHitCol?: number; // Which column peg was hit (primary hit)
  pegsHit?: Array<{ row: number; col: number }>; // ALL pegs hit this frame
  vx?: number; // Horizontal velocity (for squash/stretch and dynamic trail)
  vy?: number; // Vertical velocity (for squash/stretch and dynamic trail)
  wallHit?: 'left' | 'right'; // Wall collision this frame
  bucketWallHit?: 'left' | 'right'; // Bucket wall collision this frame
  bucketFloorHit?: boolean; // Bucket floor collision this frame
}

export type GameState =
  | 'idle'
  | 'ready'
  | 'countdown'
  | 'dropping'
  | 'landed'
  | 'revealed'
  | 'claimed';

export interface GameContext {
  selectedIndex: number;
  trajectory: TrajectoryPoint[];
  currentFrame: number;
  prize: PrizeConfig | null;
  seed: number;
}

export interface BallPosition {
  x: number;
  y: number;
  rotation: number;
}

export interface PegPosition {
  row: number;
  col: number;
  x: number;
  y: number;
}

export interface SlotPosition {
  index: number;
  x: number;
  centerX: number;
  width: number;
}
