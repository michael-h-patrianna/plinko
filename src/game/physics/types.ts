/**
 * Branded Types for Physics Values
 *
 * Provides type-safe wrappers for physics values to prevent unit mixing errors.
 * Uses TypeScript's branded type pattern for zero runtime overhead.
 */

// ============================================================================
// BRAND DEFINITION
// ============================================================================

/**
 * Brand a primitive type to make it nominally typed
 * This prevents accidental mixing of incompatible values at compile time
 */
type Brand<K, T> = K & { __brand: T };

// ============================================================================
// SPATIAL TYPES
// ============================================================================

/**
 * Position in pixels (X or Y coordinate)
 */
export type Pixels = Brand<number, 'Pixels'>;

/**
 * Position along X axis
 */
export type PositionX = Brand<number, 'PositionX'>;

/**
 * Position along Y axis
 */
export type PositionY = Brand<number, 'PositionY'>;

/**
 * 2D Position
 */
export interface Position {
  x: PositionX;
  y: PositionY;
}

// ============================================================================
// VELOCITY TYPES
// ============================================================================

/**
 * Velocity in pixels per second
 */
export type PixelsPerSecond = Brand<number, 'PixelsPerSecond'>;

/**
 * Velocity along X axis
 */
export type VelocityX = Brand<number, 'VelocityX'>;

/**
 * Velocity along Y axis
 */
export type VelocityY = Brand<number, 'VelocityY'>;

/**
 * 2D Velocity
 */
export interface Velocity {
  vx: VelocityX;
  vy: VelocityY;
}

// ============================================================================
// TIME TYPES
// ============================================================================

/**
 * Time in milliseconds
 */
export type Milliseconds = Brand<number, 'Milliseconds'>;

/**
 * Time in seconds
 */
export type Seconds = Brand<number, 'Seconds'>;

/**
 * Frame number (integer)
 */
export type Frame = Brand<number, 'Frame'>;

// ============================================================================
// ROTATION TYPES
// ============================================================================

/**
 * Rotation angle in radians
 */
export type Radians = Brand<number, 'Radians'>;

/**
 * Rotation angle in degrees
 */
export type Degrees = Brand<number, 'Degrees'>;

// ============================================================================
// PHYSICS CONSTANTS TYPES
// ============================================================================

/**
 * Coefficient (0-1 range)
 */
export type Coefficient = Brand<number, 'Coefficient'>;

/**
 * Distance in pixels
 */
export type Distance = Brand<number, 'Distance'>;

/**
 * Acceleration in pixels per second squared
 */
export type Acceleration = Brand<number, 'Acceleration'>;

// ============================================================================
// CONSTRUCTOR FUNCTIONS (Type Guards)
// ============================================================================

/**
 * Create a Pixels value
 */
export const pixels = (value: number): Pixels => value as Pixels;

/**
 * Create a PositionX value
 */
export const positionX = (value: number): PositionX => value as PositionX;

/**
 * Create a PositionY value
 */
export const positionY = (value: number): PositionY => value as PositionY;

/**
 * Create a Position
 */
export const position = (x: number, y: number): Position => ({
  x: positionX(x),
  y: positionY(y),
});

/**
 * Create a PixelsPerSecond value
 */
export const pixelsPerSecond = (value: number): PixelsPerSecond =>
  value as PixelsPerSecond;

/**
 * Create a VelocityX value
 */
export const velocityX = (value: number): VelocityX => value as VelocityX;

/**
 * Create a VelocityY value
 */
export const velocityY = (value: number): VelocityY => value as VelocityY;

/**
 * Create a Velocity
 */
export const velocity = (vx: number, vy: number): Velocity => ({
  vx: velocityX(vx),
  vy: velocityY(vy),
});

/**
 * Create a Milliseconds value
 */
export const milliseconds = (value: number): Milliseconds => value as Milliseconds;

/**
 * Create a Seconds value
 */
export const seconds = (value: number): Seconds => value as Seconds;

/**
 * Create a Frame value
 */
export const frame = (value: number): Frame => value as Frame;

/**
 * Create a Radians value
 */
export const radians = (value: number): Radians => value as Radians;

/**
 * Create a Degrees value
 */
export const degrees = (value: number): Degrees => value as Degrees;

/**
 * Create a Coefficient value (validates 0-1 range)
 */
export const coefficient = (value: number): Coefficient => {
  if (value < 0 || value > 1) {
    throw new Error(`Coefficient must be between 0 and 1, got ${value}`);
  }
  return value as Coefficient;
};

/**
 * Create a Distance value
 */
export const distance = (value: number): Distance => value as Distance;

/**
 * Create an Acceleration value
 */
export const acceleration = (value: number): Acceleration => value as Acceleration;

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Convert Degrees to Radians
 */
export const degreesToRadians = (deg: Degrees): Radians =>
  radians((deg * Math.PI) / 180);

/**
 * Convert Radians to Degrees
 */
export const radiansToDegrees = (rad: Radians): Degrees =>
  degrees((rad * 180) / Math.PI);

/**
 * Convert Seconds to Milliseconds
 */
export const secondsToMilliseconds = (sec: Seconds): Milliseconds =>
  milliseconds(sec * 1000);

/**
 * Convert Milliseconds to Seconds
 */
export const millisecondsToSeconds = (ms: Milliseconds): Seconds =>
  seconds(ms / 1000);

// ============================================================================
// PHYSICS CALCULATIONS
// ============================================================================

/**
 * Calculate distance between two positions
 */
export const calculateDistance = (p1: Position, p2: Position): Distance => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return distance(Math.sqrt(dx * dx + dy * dy));
};

/**
 * Calculate velocity magnitude (speed)
 */
export const calculateSpeed = (vel: Velocity): PixelsPerSecond => {
  return pixelsPerSecond(Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy));
};

/**
 * Normalize velocity to unit vector
 */
export const normalizeVelocity = (vel: Velocity): Velocity => {
  const speed = calculateSpeed(vel);
  if (speed === 0) return velocity(0, 0);
  return velocity(vel.vx / speed, vel.vy / speed);
};

/**
 * Scale velocity by a factor
 */
export const scaleVelocity = (vel: Velocity, scale: number): Velocity => {
  return velocity(vel.vx * scale, vel.vy * scale);
};

/**
 * Add two velocities
 */
export const addVelocities = (v1: Velocity, v2: Velocity): Velocity => {
  return velocity(v1.vx + v2.vx, v1.vy + v2.vy);
};

/**
 * Subtract two velocities
 */
export const subtractVelocities = (v1: Velocity, v2: Velocity): Velocity => {
  return velocity(v1.vx - v2.vx, v1.vy - v2.vy);
};

// ============================================================================
// UNWRAP UTILITIES
// ============================================================================

/**
 * Unwrap branded type to raw number (use sparingly)
 */
export const unwrap = <T>(value: Brand<number, T>): number => value as number;

/**
 * Unwrap Position to raw coordinates
 */
export const unwrapPosition = (pos: Position): { x: number; y: number } => ({
  x: unwrap(pos.x),
  y: unwrap(pos.y),
});

/**
 * Unwrap Velocity to raw values
 */
export const unwrapVelocity = (vel: Velocity): { vx: number; vy: number } => ({
  vx: unwrap(vel.vx),
  vy: unwrap(vel.vy),
});
