/**
 * Core type definitions for the Plinko game
 */

import type { Prize } from './prizeTypes';

// Re-export Prize as PrizeConfig
export type PrizeConfig = Prize;

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

export interface DeterministicTrajectoryPayload {
  /** Complete trajectory points captured from a deterministic source (e.g., server authoritative). */
  points: TrajectoryPoint[];
  /** Optional landing slot supplied by upstream system; validated against computed slot. */
  landingSlot?: number;
  /** Optional RNG seed used to generate the precomputed path for auditing. */
  seed?: number;
  /** Optional provider identifier for telemetry/debugging. */
  provider?: string;
}

export type GameState =
  | 'idle'
  | 'ready'
  | 'selecting-position' // User selecting drop position
  | 'countdown'
  | 'dropping'
  | 'landed'
  | 'revealed'
  | 'claimed';

export type DropZone = 'left' | 'left-center' | 'center' | 'right-center' | 'right';

export interface GameContext {
  selectedIndex: number;
  trajectory: TrajectoryPoint[];
  currentFrame: number;
  prize: PrizeConfig | null;
  seed: number;
  dropZone?: DropZone; // Selected drop zone for choice mechanic
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
