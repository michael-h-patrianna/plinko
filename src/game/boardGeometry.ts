/**
 * Board Geometry Constants and Utilities
 *
 * Centralized source of truth for all Plinko board dimensions, physics constants,
 * and geometric calculations. This module ensures consistency across trajectory
 * simulation, rendering, and collision detection.
 *
 * IMPORTANT: All board geometry must be cross-platform compatible (web + React Native)
 */

import { calculateBucketHeight, calculateBucketZoneY } from '../utils/slotDimensions';

// ============================================================================
// PHYSICS CONSTANTS
// ============================================================================

/**
 * Core physics simulation constants
 * These values are tuned for realistic ball behavior and must remain consistent
 * across trajectory generation and visual rendering
 */
export const PHYSICS = {
  /** Gravitational acceleration in px/s² (9.8 m/s² at 100px = 1m scale) */
  GRAVITY: 980,

  /** Energy retained on bounce (0-1 range, where 1 = perfect bounce) */
  RESTITUTION: 0.75,

  /** Ball radius in pixels */
  BALL_RADIUS: 9,

  /** Peg radius in pixels */
  PEG_RADIUS: 7,

  /** Combined collision detection radius (BALL_RADIUS + PEG_RADIUS) */
  COLLISION_RADIUS: 16,

  /** Physics simulation timestep (60 FPS) */
  DT: 1 / 60,

  /** Maximum downward velocity to prevent unrealistic speeds (px/s) */
  TERMINAL_VELOCITY: 600,

  /** Board border wall thickness in pixels */
  BORDER_WIDTH: 12,

  /** Minimum velocity magnitude after peg collision (prevents dead stops) */
  MIN_BOUNCE_VELOCITY: 30,

  /** Maximum total velocity after collision resolution (safety cap) */
  MAX_TOTAL_SPEED: 800,

  /** Maximum velocity component in any direction */
  MAX_VELOCITY: 750,

  /** Maximum post-collision speed after all effects applied */
  MAX_POST_COLLISION_SPEED: 800,

  /** Absolute maximum speed cap for all physics calculations */
  ABSOLUTE_MAX_SPEED: 795,

  /** Maximum distance ball can travel in a single frame (prevents tunneling) */
  MAX_DIST_PER_FRAME: 13.2, // At 795px/s and 60fps
} as const;

// ============================================================================
// BOARD LAYOUT CONSTANTS
// ============================================================================

/**
 * Board layout and visual constants
 * These define the fixed geometry of the plinko board
 */
export const BOARD = {
  /** Default board width in pixels */
  DEFAULT_WIDTH: 375,

  /** Default board height in pixels */
  DEFAULT_HEIGHT: 500,

  /** CSS border thickness (outside physics calculations) */
  CSS_BORDER: 2,

  /** Default number of peg rows */
  DEFAULT_PEG_ROWS: 10,

  /** Optimal number of peg columns (fixed for consistent spacing) */
  OPTIMAL_PEG_COLUMNS: 6,

  /** Percentage of board height used for playable peg area (0-1) */
  PLAYABLE_HEIGHT_RATIO: 0.65,

  /** Top offset for first peg row (accounts for border and spacing) */
  PEG_TOP_OFFSET: 20,

  /** Extra clearance between pegs and walls */
  PEG_WALL_CLEARANCE: 10,
} as const;

// ============================================================================
// RESPONSIVE SIZING
// ============================================================================

/**
 * Breakpoints for responsive peg/ball sizing
 */
export const RESPONSIVE = {
  /** Viewport width threshold for smaller sizing */
  SMALL_VIEWPORT_WIDTH: 360,

  /** Peg radius for small viewports */
  SMALL_PEG_RADIUS: 6,

  /** Ball radius for small viewports */
  SMALL_BALL_RADIUS: 6,

  /** Extra clearance for small viewports */
  SMALL_CLEARANCE: 8,

  /** Peg radius for normal viewports */
  NORMAL_PEG_RADIUS: 7,

  /** Ball radius for normal viewports */
  NORMAL_BALL_RADIUS: 7,

  /** Extra clearance for normal viewports */
  NORMAL_CLEARANCE: 10,
} as const;

// ============================================================================
// DROP ZONES
// ============================================================================

/**
 * Drop zone definitions for ball release positions
 */
export type DropZone = 'left' | 'left-center' | 'center' | 'right-center' | 'right';

/**
 * Drop zone position ranges (as percentage of board width)
 * Format: { min: percentage, max: percentage }
 */
export const DROP_ZONE_RANGES: Record<DropZone, { min: number; max: number }> = {
  left: { min: 0.05, max: 0.15 },
  'left-center': { min: 0.25, max: 0.35 },
  center: { min: 0.45, max: 0.55 },
  'right-center': { min: 0.65, max: 0.75 },
  right: { min: 0.85, max: 0.95 },
} as const;

/**
 * Drop zone display positions (center point as percentage of board width)
 */
export const DROP_ZONE_POSITIONS: Record<DropZone, number> = {
  left: 0.1,
  'left-center': 0.3,
  center: 0.5,
  'right-center': 0.7,
  right: 0.9,
} as const;

// ============================================================================
// PEG LAYOUT GENERATION
// ============================================================================

export interface Peg {
  row: number;
  col: number;
  x: number;
  y: number;
}

export interface PegLayoutParams {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  /** Optional CSS border adjustment (default: BOARD.CSS_BORDER) */
  cssBorder?: number;
}

/**
 * Generate complete peg layout for the board
 * Uses fixed OPTIMAL_PEG_COLUMNS regardless of prize count for consistent spacing
 *
 * @param params Board dimensions and configuration
 * @returns Array of peg positions with row/col indices
 */
export function generatePegLayout(params: PegLayoutParams): Peg[] {
  const {
    boardWidth,
    boardHeight,
    pegRows,
    cssBorder = BOARD.CSS_BORDER,
  } = params;

  const pegs: Peg[] = [];

  // Calculate internal width (accounting for CSS border)
  const internalWidth = boardWidth - cssBorder * 2;

  // Determine responsive sizing
  const isSmallViewport = internalWidth <= RESPONSIVE.SMALL_VIEWPORT_WIDTH;
  const pegRadius = isSmallViewport ? RESPONSIVE.SMALL_PEG_RADIUS : RESPONSIVE.NORMAL_PEG_RADIUS;
  const ballRadius = isSmallViewport ? RESPONSIVE.SMALL_BALL_RADIUS : RESPONSIVE.NORMAL_BALL_RADIUS;
  const extraClearance = isSmallViewport ? RESPONSIVE.SMALL_CLEARANCE : RESPONSIVE.NORMAL_CLEARANCE;

  const minClearance = pegRadius + ballRadius + extraClearance;
  const playableHeight = boardHeight * BOARD.PLAYABLE_HEIGHT_RATIO;
  const verticalSpacing = playableHeight / (pegRows + 1);

  // Calculate horizontal spacing
  const leftEdge = PHYSICS.BORDER_WIDTH + minClearance;
  const rightEdge = internalWidth - PHYSICS.BORDER_WIDTH - minClearance;
  const pegSpanWidth = rightEdge - leftEdge;
  const horizontalSpacing = pegSpanWidth / BOARD.OPTIMAL_PEG_COLUMNS;

  for (let row = 0; row < pegRows; row++) {
    const y = verticalSpacing * (row + 1) + PHYSICS.BORDER_WIDTH + BOARD.PEG_TOP_OFFSET;

    // Staggered pattern: offset every other row
    const isOffsetRow = row % 2 === 1;
    const pegsInRow = isOffsetRow ? BOARD.OPTIMAL_PEG_COLUMNS : BOARD.OPTIMAL_PEG_COLUMNS + 1;

    for (let col = 0; col < pegsInRow; col++) {
      const x = isOffsetRow
        ? leftEdge + horizontalSpacing * (col + 0.5)
        : leftEdge + horizontalSpacing * col;

      pegs.push({ row, col, x, y });
    }
  }

  return pegs;
}

// ============================================================================
// SLOT CALCULATIONS
// ============================================================================

export interface SlotDimensions {
  /** Number of slots */
  slotCount: number;

  /** Width of each slot in pixels */
  slotWidth: number;

  /** Total playable width (excluding borders) */
  playableWidth: number;

  /** Bucket zone Y position (top of slots) */
  bucketZoneY: number;

  /** Bucket height in pixels */
  bucketHeight: number;

  /** Bucket floor Y position (bottom of slots) */
  bucketFloorY: number;
}

/**
 * Calculate comprehensive slot dimensions for a given board configuration
 *
 * @param boardWidth Total board width in pixels
 * @param boardHeight Total board height in pixels
 * @param slotCount Number of prize slots
 * @param cssBorder Optional CSS border thickness (default: BOARD.CSS_BORDER)
 * @returns Complete slot dimension calculations
 */
export function calculateSlotDimensions(
  boardWidth: number,
  boardHeight: number,
  slotCount: number,
  cssBorder: number = BOARD.CSS_BORDER
): SlotDimensions {
  const internalWidth = boardWidth - cssBorder * 2;
  const playableWidth = internalWidth - PHYSICS.BORDER_WIDTH * 2;
  const slotWidth = playableWidth / slotCount;

  const bucketHeight = calculateBucketHeight(slotWidth);
  const bucketZoneY = calculateBucketZoneY(boardHeight, slotWidth);
  const bucketFloorY = boardHeight - PHYSICS.BALL_RADIUS + 5;

  return {
    slotCount,
    slotWidth,
    playableWidth,
    bucketZoneY,
    bucketHeight,
    bucketFloorY,
  };
}

/**
 * Get the X coordinate range for a drop zone
 *
 * @param zone Drop zone identifier
 * @param boardWidth Total board width in pixels
 * @returns Object with min and max X coordinates for the zone
 */
export function getDropZoneRange(zone: DropZone, boardWidth: number): { min: number; max: number } {
  const range = DROP_ZONE_RANGES[zone];
  return {
    min: boardWidth * range.min,
    max: boardWidth * range.max,
  };
}

/**
 * Get the center X coordinate for a drop zone
 *
 * @param zone Drop zone identifier
 * @param boardWidth Total board width in pixels
 * @returns Center X coordinate of the drop zone
 */
export function getDropZoneCenter(zone: DropZone, boardWidth: number): number {
  return boardWidth * DROP_ZONE_POSITIONS[zone];
}

/**
 * Clamp slot index from X coordinate to ensure it's within valid range
 *
 * @param x X coordinate in pixels
 * @param boardWidth Total board width in pixels
 * @param slotCount Number of prize slots
 * @returns Valid slot index (0 to slotCount-1)
 */
export function clampSlotIndexFromX(x: number, boardWidth: number, slotCount: number): number {
  const playableWidth = boardWidth - PHYSICS.BORDER_WIDTH * 2;
  const slotWidth = playableWidth / slotCount;
  const clampedRelativeX = Math.min(
    Math.max(x - PHYSICS.BORDER_WIDTH, 0),
    playableWidth - 1e-6
  );
  return Math.min(Math.max(0, Math.floor(clampedRelativeX / slotWidth)), slotCount - 1);
}

/**
 * Get slot boundaries for collision detection
 *
 * @param slotIndex Slot index (0-based)
 * @param boardWidth Total board width in pixels
 * @param slotCount Number of prize slots
 * @param wallThickness Wall thickness in pixels (default: 3)
 * @returns Object with left and right edge X coordinates
 */
export function getSlotBoundaries(
  slotIndex: number,
  boardWidth: number,
  slotCount: number,
  wallThickness: number = 3
): { leftEdge: number; rightEdge: number } {
  const playableWidth = boardWidth - PHYSICS.BORDER_WIDTH * 2;
  const slotWidth = playableWidth / slotCount;

  const leftEdge = PHYSICS.BORDER_WIDTH + slotIndex * slotWidth + wallThickness;
  const rightEdge = PHYSICS.BORDER_WIDTH + (slotIndex + 1) * slotWidth - wallThickness;

  return { leftEdge, rightEdge };
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate that slot index is within bounds
 *
 * @param slotIndex Slot index to validate
 * @param slotCount Total number of slots
 * @throws Error if slot index is out of bounds
 */
export function validateSlotIndex(slotIndex: number, slotCount: number): void {
  if (slotIndex < 0 || slotIndex >= slotCount) {
    throw new Error(`Slot index ${slotIndex} is out of bounds for slot count ${slotCount}`);
  }
}

/**
 * Validate board dimensions
 *
 * @param boardWidth Board width in pixels
 * @param boardHeight Board height in pixels
 * @throws Error if dimensions are invalid
 */
export function validateBoardDimensions(boardWidth: number, boardHeight: number): void {
  if (boardWidth <= 0 || boardHeight <= 0) {
    throw new Error(`Invalid board dimensions: ${boardWidth}x${boardHeight}`);
  }

  if (boardWidth < 200 || boardHeight < 300) {
    throw new Error(`Board dimensions too small: ${boardWidth}x${boardHeight}. Minimum is 200x300.`);
  }
}

/**
 * Validate peg count
 *
 * @param pegRows Number of peg rows
 * @throws Error if peg count is invalid
 */
export function validatePegRows(pegRows: number): void {
  if (pegRows <= 0) {
    throw new Error(`Peg rows must be greater than zero, got ${pegRows}`);
  }

  if (pegRows < 5 || pegRows > 20) {
    throw new Error(`Peg rows ${pegRows} is out of recommended range (5-20)`);
  }
}

// ============================================================================
// GEOMETRY HELPERS
// ============================================================================

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is within a circular region
 */
export function isInCircle(
  pointX: number,
  pointY: number,
  circleX: number,
  circleY: number,
  radius: number
): boolean {
  return distance(pointX, pointY, circleX, circleY) <= radius;
}

/**
 * Check if a point is within a rectangular region
 */
export function isInRect(
  pointX: number,
  pointY: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): boolean {
  return (
    pointX >= rectX &&
    pointX <= rectX + rectWidth &&
    pointY >= rectY &&
    pointY <= rectY + rectHeight
  );
}
