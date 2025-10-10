/**
 * Ball Animation Driver - Cross-Platform Contract
 *
 * This driver bypasses React reconciliation for ball animations, applying transforms
 * directly to the DOM (web) or via shared values (React Native). It sits above the
 * existing animationAdapter which only abstracts timing primitives.
 *
 * WHY: The existing animationAdapter in src/utils/platform/animation abstracts only
 * the timing primitive (requestFrame, cancelFrame, now). It keeps the physics loop
 * cross-platform but still leaves per-frame DOM/React work in the rendering layer.
 * This driver sits one layer above: it consumes the timing adapter, applies ball
 * transforms, manages the trail pool, and triggers peg flashes imperatively.
 *
 * PERFORMANCE BENEFITS:
 * - Eliminates 60 FPS React reconciliation (40-60% CPU reduction on web)
 * - Direct DOM manipulation via refs (web) or shared values (native)
 * - Pooled trail elements (no per-frame allocations)
 * - Batched peg flash effects
 * - Shared deterministic gameplay logic across platforms
 */

export interface BallTransform {
  position: { x: number; y: number; rotation: number };
  stretch: { scaleX: number; scaleY: number };
}

export interface TrailFrame {
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

/**
 * Animation timing configuration
 */
export interface AnimationTimingConfig {
  /** Total number of frames in the trajectory */
  totalFrames: number;
  /** Trajectory FPS (always 60) */
  trajectoryFps: number;
  /** Display FPS (may be throttled for battery savings) */
  displayFps: number;
  /** Callback when animation completes */
  onComplete: () => void;
}

/**
 * Ball animation driver interface
 * Platform-specific implementations: ballAnimationDriver.web.ts / ballAnimationDriver.native.ts
 */
export interface BallAnimationDriver {
  /**
   * Start the animation loop with timing configuration.
   * This is the SINGLE RAF loop that drives all animation (ball, trail, frame progression).
   * Returns a cancel function.
   *
   * @param update - Called each frame with current frame index (0 to totalFrames-1)
   * @param config - Timing configuration (FPS, total frames, completion callback)
   */
  schedule(update: (frame: number) => void, config: AnimationTimingConfig): () => void;

  /**
   * Apply ball transform + squash/stretch for the current frame.
   * Web: Mutates style.transform on ball element refs
   * Native: Updates shared values consumed by Animated.View
   */
  applyBallTransform(transform: BallTransform): void;

  /**
   * Update trail visuals using a pooled list of points.
   * Web: Direct DOM manipulation of pre-rendered trail divs
   * Native: Updates shared array for Moti AnimatePresence or Skia pool
   */
  updateTrail(points: TrailFrame[]): void;

  /**
   * Clear trail instantly (called on reset/idle).
   * Web: Sets display: 'none' on all trail elements
   * Native: Clears shared value array
   */
  clearTrail(): void;

  /**
   * Trigger a peg flash effect for the supplied peg id.
   * Web: Applies CSS animation or direct opacity pulse
   * Native: Toggles shared value with withTiming/withSequence
   */
  flashPeg(id: string): void;

  /**
   * Update peg flash state imperatively (bypasses React reconciliation).
   * Web: Directly manipulates data-peg-hit attribute on peg elements
   * Native: Updates shared value for peg flash animation
   *
   * @param pegId - Peg identifier in "row-col" format (e.g., "3-2")
   * @param isFlashing - Whether peg should be in flashing state
   */
  updatePegFlash(pegId: string, isFlashing: boolean): void;

  /**
   * Update slot highlight state imperatively (bypasses React reconciliation).
   * Web: Positions and colors overlay element to highlight the slot under the ball
   * Native: Updates shared values for overlay position and border color
   *
   * @param slotIndex - Zero-based slot index
   * @param isActive - Whether slot should be highlighted (ball is approaching)
   * @param slotX - X position of slot (optional, required when isActive is true)
   * @param slotWidth - Width of slot (optional, required when isActive is true)
   * @param slotColor - Color for slot highlight (optional, required when isActive is true)
   * @param slotHeight - Height of slot (optional, defaults to 100)
   */
  updateSlotHighlight(slotIndex: number, isActive: boolean, slotX?: number, slotWidth?: number, slotColor?: string, slotHeight?: number): void;

  /**
   * Update slot collision visuals imperatively (wall/floor impacts).
   * Web: Triggers impact key increments to force re-animation
   * Native: Updates shared values for impact animations
   *
   * @param slotIndex - Zero-based slot index
   * @param wallImpact - Wall collision type ('left' | 'right' | null)
   * @param floorImpact - Whether floor collision occurred
   */
  updateSlotCollision(slotIndex: number, wallImpact: 'left' | 'right' | null, floorImpact: boolean): void;

  /**
   * Clear all peg flashes (called on reset/idle).
   * Web: Sets data-peg-hit="false" on all peg elements
   * Native: Clears all peg shared values
   */
  clearAllPegFlashes(): void;

  /**
   * Clear all slot highlights and collisions (called on reset/idle).
   * Web: Resets data attributes on all slot elements
   * Native: Clears all slot shared values
   */
  clearAllSlotHighlights(): void;
}
