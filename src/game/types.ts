/**
 * Core type definitions for the Plinko game
 */

export interface PrizeConfig {
  id: string;
  label: string;
  description: string;
  probability: number; // 0-1, must sum to 1.0 across all prizes
  color: string;
}

export interface TrajectoryPoint {
  frame: number;
  x: number;
  y: number;
  rotation: number;
  pegHit?: boolean;
  pegHitRow?: number;      // Which row peg was hit (primary hit)
  pegHitCol?: number;      // Which column peg was hit (primary hit)
  pegsHit?: Array<{ row: number; col: number }>; // ALL pegs hit this frame
  vx?: number;             // Horizontal velocity (for squash/stretch and dynamic trail)
  vy?: number;             // Vertical velocity (for squash/stretch and dynamic trail)
}

export type GameState = 'idle' | 'ready' | 'dropping' | 'landed' | 'revealed';

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
