/**
 * @component OptimizedBallRenderer
 *
 * Performance-optimized ball renderer that uses imperative DOM updates via BallAnimationDriver
 * to bypass React reconciliation during 60 FPS animation loops.
 *
 * PERFORMANCE STRATEGY (as per docs/optimize.md):
 * - Uses driver.schedule() instead of useSyncExternalStore
 * - Bypasses React reconciliation for ball/trail updates
 * - Direct DOM manipulation via refs (no 60 FPS React re-renders)
 * - Expected CPU reduction: 40-60%
 * - Maintains 60 FPS target frame rate with minimal main thread blocking
 *
 * This component replaces the useSyncExternalStore approach with imperative
 * updates via the ballAnimationDriver, eliminating 60 FPS React reconciliation.
 * The driver mutates DOM elements directly through refs while React only renders
 * the initial structure once.
 *
 * ARCHITECTURE:
 * - Renders static JSX structure with refs attached to ball/glow/trail elements
 * - Driver receives getter functions (not direct refs) to access current DOM nodes
 * - Animation loop runs outside React, updating transforms/opacity imperatively
 * - Maintains fixed pool of trail divs for recycling (no allocations per frame)
 *
 * @param {OptimizedBallRendererProps} props - Component props
 * @param {boolean} props.isSelectingPosition - Whether user is selecting drop position (hides ball)
 * @param {GameState} props.ballState - Current game state ('idle' | 'ready' | 'countdown' | 'dropping' | 'landed')
 * @param {boolean} props.showTrail - Whether to render motion trail behind ball
 * @param {FrameStore} [props.frameStore] - Store providing current animation frame number for synchronization
 * @param {() => BallPosition | null} [props.getBallPosition] - Function to get current ball position (x, y) and rotation
 * @param {TrajectoryCache | null} [props.trajectoryCache] - Pre-computed physics values (scaleX, scaleY, trailLength) indexed by frame
 *
 * @returns {JSX.Element | null} Ball visual elements with trail, or null if not rendering
 *
 * @example
 * ```tsx
 * // Typical usage with physics engine integration
 * const frameStore = useMemo(() => ({
 *   subscribe: (listener: () => void) => {
 *     // Subscribe to frame updates
 *     return unsubscribe;
 *   },
 *   getSnapshot: () => currentFrame,
 *   getCurrentFrame: () => currentFrame,
 * }), []);
 *
 * const getBallPosition = useCallback(() => {
 *   const trajectory = trajectoryRef.current;
 *   if (!trajectory) return null;
 *   const frame = Math.min(currentFrame, trajectory.points.length - 1);
 *   return trajectory.points[frame];
 * }, []);
 *
 * <OptimizedBallRenderer
 *   isSelectingPosition={false}
 *   ballState="dropping"
 *   showTrail={true}
 *   frameStore={frameStore}
 *   getBallPosition={getBallPosition}
 *   trajectoryCache={trajectoryCache}
 * />
 * ```
 *
 * @see {@link file://./docs/optimize.md} - Full optimization strategy and performance benchmarks
 */

import type { TrailFrame } from '@/animation/ballAnimationDriver';
import { getCachedTrailLookup } from '@/animation/trailOptimization';
import { useBallAnimationDriver } from '@/animation/useBallAnimationDriver';
import type { ValueRef } from '@/types/ref';
import { useAppConfig } from '@config/AppConfigContext';
import { getPerformanceSetting } from '@config/appConfig';
import { getCachedValues } from '@game/trajectoryCache';
import type { BallPosition, GameState, TrajectoryCache } from '@game/types';
import {
  animationTokens,
  borderWidthTokens,
  opacityTokens,
  sizeTokens,
  zIndexTokens,
} from '@theme/tokens';
import { calculateBucketHeight } from '@utils/slotDimensions';
import { memo, useEffect, useRef } from 'react';
import { useTheme } from '../../../../theme';
import { BallLauncher } from '../../BallLauncher';

/**
 * Frame store interface for animation frame synchronization.
 * Provides subscription mechanism, current frame access, and listener notification.
 */
interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  getCurrentFrame: () => number;
  notifyListeners: () => void;
}

/**
 * Calculate trail gradient intensity based on ball speed.
 * Low speed = desaturated/dim, high speed = saturated/bright
 * Uses linear gradients only (cross-platform compatible, no radial/conic)
 *
 * @param speed - Ball speed in pixels/second
 * @param baseColor - Base color (e.g., theme.colors.game.ball.primary - must be hex format)
 * @returns CSS linear gradient with speed-based intensity
 */
function calculateTrailGradient(speed: number, baseColor: string): string {
  // Speed thresholds (px/s)
  const LOW_SPEED = 200;
  const HIGH_SPEED = 400;

  // Calculate intensity based on speed
  let alphaMultiplier = 0.6; // Desaturated for low speed

  if (speed >= HIGH_SPEED) {
    alphaMultiplier = 1.0; // Fully saturated for high speed
  } else if (speed > LOW_SPEED) {
    // Linear interpolation between low and high speed
    const ratio = (speed - LOW_SPEED) / (HIGH_SPEED - LOW_SPEED);
    alphaMultiplier = 0.6 + ratio * 0.4; // 0.6 to 1.0
  }

  // Calculate alpha hex values for gradient stops
  // Full intensity at start, fading to transparent
  const alpha1 = Math.round(255 * alphaMultiplier).toString(16).padStart(2, '0');
  const alpha2 = Math.round(204 * alphaMultiplier).toString(16).padStart(2, '0'); // 80% of full
  const alpha3 = Math.round(102 * alphaMultiplier).toString(16).padStart(2, '0'); // 40% of full

  return `linear-gradient(135deg, ${baseColor}${alpha1} 0%, ${baseColor}${alpha2} 30%, ${baseColor}${alpha3} 70%, transparent 100%)`;
}

interface OptimizedBallRendererProps {
  isSelectingPosition: boolean;
  ballState: GameState;
  showTrail: boolean;
  frameStore?: FrameStore;
  getBallPosition?: () => BallPosition | null;
  trajectoryCache?: TrajectoryCache | null;
  trajectoryLength?: number;
  onLandingComplete?: () => void;
  pegHitFrames?: Map<string, number[]>;
  wallHitFrames?: { left: number[]; right: number[] };
  currentFrameRef?: ValueRef<number>;
  slots?: Array<{ x: number; width: number }>;
  slotHighlightColor?: string;
  bucketZoneY?: number;
  getCurrentTrajectoryPoint?: () => BallPosition | null;
}

export const OptimizedBallRenderer = memo(function OptimizedBallRenderer({
  isSelectingPosition,
  ballState,
  showTrail,
  frameStore,
  getBallPosition,
  trajectoryCache,
  trajectoryLength,
  onLandingComplete,
  pegHitFrames,
  wallHitFrames,
  currentFrameRef,
  slots,
  slotHighlightColor,
  bucketZoneY,
  getCurrentTrajectoryPoint,
}: OptimizedBallRendererProps) {
  const { theme } = useTheme();
  const { performance } = useAppConfig();
  const maxTrailLength = getPerformanceSetting(performance, 'maxTrailLength') ?? sizeTokens.ball.maxTrailLength;

  // Refs for ball elements
  const ballMainRef = useRef<HTMLDivElement>(null);
  const ballGlowOuterRef = useRef<HTMLDivElement>(null);
  const ballGlowMidRef = useRef<HTMLDivElement>(null);

  // Trail refs pool
  const trailElementRefs = useRef<(HTMLDivElement | null)[]>(
    Array(sizeTokens.ball.maxTrailLength).fill(null)
  );

  // Trail state tracking
  const trailPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Peg flash tracking - keeps track of last checked frame for each peg
  const lastCheckedPegFrameRef = useRef<Map<string, number>>(new Map());

  // Wall flash tracking - keeps track of last checked frame for each wall
  const lastCheckedWallFrameRef = useRef<{ left: number; right: number }>({ left: -1, right: -1 });

  // Slot highlight tracking - keeps track of currently highlighted slot
  const activeSlotRef = useRef<number | null>(null);

  /**
   * GETTER PATTERN EXPLANATION (L74-88):
   * Create stable driverRefs object using useRef instead of useMemo.
   *
   * Why use getter functions instead of passing refs directly:
   * 1. The driver is created before refs are attached to DOM elements (refs.current is null initially)
   * 2. Getters defer access to .current until the driver actually needs the DOM node
   * 3. This ensures refs are populated after first render when driver.schedule() executes
   * 4. Alternative would be recreating driver in useEffect, but that's less efficient
   *
   * The driver stores these getters and calls them each time it needs DOM access,
   * guaranteeing refs.current points to live DOM nodes during animation updates.
   *
   * Why useRef instead of useMemo:
   * - useRef creates a stable object that persists across renders without recreating
   * - We can mutate driverRefsRef.current.maxTrailLength without triggering driver recreation
   * - Driver only needs to be created once, then maxTrailLength updates are picked up via the ref
   */
  const driverRefsRef = useRef({
    get ballMain() {
      return ballMainRef.current;
    },
    get ballGlowOuter() {
      return ballGlowOuterRef.current;
    },
    get ballGlowMid() {
      return ballGlowMidRef.current;
    },
    get trailElements() {
      return trailElementRefs.current;
    },
    maxTrailLength,
  });

  // Update maxTrailLength on the stable ref object (no driver recreation needed)
  driverRefsRef.current.maxTrailLength = maxTrailLength;

  const driver = useBallAnimationDriver(driverRefsRef.current);

  // Start animation loop when dropping
  useEffect(() => {
    if (ballState !== 'dropping' || !frameStore || !getBallPosition || !trajectoryLength || !onLandingComplete) {
      // Clear trail when not dropping
      if (ballState === 'idle' || ballState === 'ready') {
        driver.clearTrail();
        trailPointsRef.current = [];
      }
      return;
    }

    let currentFrame = 0;

    // PERFORMANCE: This is the SINGLE RAF loop that drives all animation
    // Previously there were 2 loops (useGameAnimation + driver.schedule)
    // Now the driver handles frame progression, timing, and completion
    const TRAJECTORY_FPS = 60;
    const DISPLAY_FPS = getPerformanceSetting(performance, 'fps') ?? 60;

    // Schedule animation loop using driver with timing config
    const cancel = driver.schedule(
      (frame) => {
        currentFrame = frame;

        // Update frame ref and notify subscribers (pegs, slots)
        if (currentFrameRef) {
          currentFrameRef.current = currentFrame;
        }
        if (frameStore) {
          frameStore.notifyListeners();
        }

      // Get ball position
      const position = getBallPosition();
      if (!position) return;

      // Get cached values for this frame
      const cached = getCachedValues(trajectoryCache, currentFrame);

      // Apply ball transform
      driver.applyBallTransform({
        position: { x: position.x, y: position.y, rotation: position.rotation },
        stretch: { scaleX: cached.scaleX, scaleY: cached.scaleY },
      });

      // Update trail
      if (showTrail) {
        // Add new trail point
        trailPointsRef.current.unshift({ x: position.x, y: position.y });

        // Trim to dynamic length based on speed (same as Ball.tsx)
        if (trailPointsRef.current.length > cached.trailLength) {
          trailPointsRef.current.length = cached.trailLength;
        }

        // Get pre-computed opacity/scale lookup for current trail length
        // This eliminates Math.pow() calls: was 20 × 60 FPS = 1,200 operations/sec
        const trailLookup = getCachedTrailLookup(trailPointsRef.current.length);

        // Calculate motion blur based on horizontal velocity (high-speed effect)
        // BallPosition includes optional vx/vy for motion blur effects
        const vx = position.vx ?? 0;
        const vy = position.vy ?? 0;
        const absVx = Math.abs(vx);
        const motionBlurScaleX = absVx > 400 ? Math.min(1.5 + (absVx - 400) / 400, 2.5) : 1;

        // Calculate trail gradient based on speed (speed-based color intensity)
        const speed = Math.sqrt(vx * vx + vy * vy);
        const trailGradient = calculateTrailGradient(speed, theme.colors.game.ball.primary);

        // Build trail frames using pre-computed values (O(1) array access)
        const trailSize = 12;
        const halfTrailSize = trailSize / 2;
        const trailFrames: TrailFrame[] = trailPointsRef.current.map((point, i) => ({
          x: point.x - halfTrailSize,
          y: point.y - halfTrailSize,
          opacity: trailLookup[i]?.opacity ?? 0,
          scale: trailLookup[i]?.scale ?? 0,
          scaleX: motionBlurScaleX, // Apply motion blur stretch
          gradient: trailGradient, // Apply speed-based color intensity
        }));

        driver.updateTrail(trailFrames);
      }

      // COLLISION DETECTION: Peg flashes (frame-drop-safe)
      // Check if any pegs were hit between last checked frame and current frame
      if (pegHitFrames) {
        pegHitFrames.forEach((hitFrames, pegId) => {
          const lastChecked = lastCheckedPegFrameRef.current.get(pegId) ?? -1;

          // Find hits that occurred since last check
          const newHits = hitFrames.filter(hitFrame => hitFrame > lastChecked && hitFrame <= currentFrame);

          if (newHits.length > 0) {
            // Peg was hit! Trigger flash imperatively via driver
            driver.updatePegFlash(pegId, true);

            // Update last checked frame for this peg
            lastCheckedPegFrameRef.current.set(pegId, currentFrame);
          }
        });
      }

      // COLLISION DETECTION: Wall flashes (frame-drop-safe)
      // Check if walls were hit between last checked frame and current frame
      if (wallHitFrames) {
        // Check left wall
        const lastCheckedLeft = lastCheckedWallFrameRef.current.left;
        const newLeftHits = wallHitFrames.left.filter(
          hitFrame => hitFrame > lastCheckedLeft && hitFrame <= currentFrame
        );

        if (newLeftHits.length > 0) {
          // Left wall was hit! Trigger directional wall bounce via driver with ball Y position
          driver.updateWallFlash('left', true, position.y);
          // NOTE: Screen shake removed - walls now use directional bounce animation
          // Update last checked frame
          lastCheckedWallFrameRef.current.left = currentFrame;
        }

        // Check right wall
        const lastCheckedRight = lastCheckedWallFrameRef.current.right;
        const newRightHits = wallHitFrames.right.filter(
          hitFrame => hitFrame > lastCheckedRight && hitFrame <= currentFrame
        );

        if (newRightHits.length > 0) {
          // Right wall was hit! Trigger directional wall bounce via driver with ball Y position
          driver.updateWallFlash('right', true, position.y);
          // NOTE: Screen shake removed - walls now use directional bounce animation
          // Update last checked frame
          lastCheckedWallFrameRef.current.right = currentFrame;
        }
      }

      // COLLISION DETECTION: Slot highlighting (show which slot ball is above during entire drop)
      if (slots && slots.length > 0) {
        let newActiveSlot: number | null = null;

        // Find which slot the ball is above based on X coordinate
        for (let i = 0; i < slots.length; i++) {
          const slot = slots[i]!;
          const slotCenterX = slot.x + slot.width / 2;
          const distance = Math.abs(position.x - slotCenterX);

          if (distance < slot.width / 2) {
            newActiveSlot = i;
            break;
          }
        }

        // Update highlighting if active slot changed
        if (newActiveSlot !== activeSlotRef.current) {
          // Clear previous slot highlight
          if (activeSlotRef.current !== null) {
            driver.updateSlotHighlight(activeSlotRef.current, false);
          }

          // Set new slot highlight with position, size, and color
          if (newActiveSlot !== null && slotHighlightColor) {
            const slot = slots[newActiveSlot]!;
            const slotHeight = calculateBucketHeight(slot.width);
            driver.updateSlotHighlight(newActiveSlot, true, slot.x, slot.width, slotHighlightColor, slotHeight);
          }

          activeSlotRef.current = newActiveSlot;
        }

        // Update collision effects ONLY when in bucket zone
        if (newActiveSlot !== null && bucketZoneY !== undefined && position.y >= bucketZoneY && getCurrentTrajectoryPoint) {
          const trajectoryPoint = getCurrentTrajectoryPoint();
          if (trajectoryPoint) {
            // Access bucketWallHit and bucketFloorHit from trajectory point
            const wallImpact = (trajectoryPoint as unknown as { bucketWallHit?: 'left' | 'right' }).bucketWallHit || null;
            const floorImpact = (trajectoryPoint as unknown as { bucketFloorHit?: boolean }).bucketFloorHit || false;

            // Calculate impact speed for realistic animation intensity
            const vx = trajectoryPoint.vx ?? 0;
            const vy = trajectoryPoint.vy ?? 0;
            const impactSpeed = Math.sqrt(vx * vx + vy * vy);

            driver.updateSlotCollision(newActiveSlot, wallImpact, floorImpact, impactSpeed);
          }
        }
      }
      },
      {
        totalFrames: trajectoryLength,
        trajectoryFps: TRAJECTORY_FPS,
        displayFps: DISPLAY_FPS,
        onComplete: onLandingComplete,
      }
    );

    // Cleanup
    return () => {
      cancel();
      driver.clearTrail();
      driver.clearAllPegFlashes();
      driver.clearAllWallFlashes();
      driver.clearAllSlotHighlights();
      lastCheckedPegFrameRef.current.clear();
      lastCheckedWallFrameRef.current = { left: -1, right: -1 };
      activeSlotRef.current = null;
    };
  }, [ballState, frameStore, getBallPosition, trajectoryCache, trajectoryLength, onLandingComplete, showTrail, driver, performance, pegHitFrames, wallHitFrames, currentFrameRef, slots, slotHighlightColor, bucketZoneY, getCurrentTrajectoryPoint]);

  // Don't render anything during position selection
  if (isSelectingPosition) {
    return null;
  }

  // Get current ball position for launcher rendering
  const ballPosition = getBallPosition?.() ?? null;

  // Don't render during position selection
  if (ballState === 'idle' || ballState === 'ready') {
    return null;
  }

  // Render launcher during countdown (even if no position yet - trajectory might not be ready)
  if (ballState === 'countdown') {
    if (!ballPosition) {
      // Trajectory not ready yet, don't render
      return null;
    }
    return (
      <BallLauncher
        x={ballPosition.x}
        y={ballPosition.y}
        isLaunching={false}
        isSelected={false}
        showCountdownPulses={true}
      />
    );
  }

  // Don't render if no position
  if (!ballPosition) {
    return null;
  }

  // Render ball elements (refs will be updated imperatively by driver)
  return (
    <>
      {/* Motion trail - pre-rendered pool updated imperatively */}
      {showTrail &&
        Array.from({ length: sizeTokens.ball.maxTrailLength }).map((_, i) => (
          <div
            key={`trail-${i}`}
            ref={(el) => {
              trailElementRefs.current[i] = el;
            }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '12px',
              height: '12px',
              background: `linear-gradient(135deg, ${theme.colors.game.ball.primary} 0%, ${theme.colors.game.ball.primary}CC 30%, ${theme.colors.game.ball.primary}66 70%, transparent 100%)`,
              willChange: 'transform, opacity',
              zIndex: zIndexTokens.ballTrail,
              transition: `transform ${animationTokens.duration.fastest}ms linear, opacity ${animationTokens.duration.fastest}ms linear`,
              display: 'none', // Initially hidden, updated imperatively
            }}
          />
        ))}

      {/* Outer glow */}
      <div
        ref={ballGlowOuterRef}
        className="absolute pointer-events-none"
        style={{
          width: `${sizeTokens.ball.glowOuter}px`,
          height: `${sizeTokens.ball.glowOuter}px`,
          background: theme.gradients.ballGlow,
          opacity: opacityTokens[30],
          willChange: 'transform',
          zIndex: zIndexTokens.ballGlow,
          borderRadius: '50%',
          transform: ballPosition ? `translate(${ballPosition.x - 20}px, ${ballPosition.y - 20}px)` : undefined,
        }}
      />

      {/* Middle glow */}
      <div
        ref={ballGlowMidRef}
        className="absolute pointer-events-none"
        style={{
          width: `${sizeTokens.ball.glowMid}px`,
          height: `${sizeTokens.ball.glowMid}px`,
          background: theme.gradients.ballGlow,
          opacity: opacityTokens[50],
          willChange: 'transform',
          zIndex: zIndexTokens.ballGlowMid,
          borderRadius: '50%',
          transform: ballPosition ? `translate(${ballPosition.x - 14}px, ${ballPosition.y - 14}px)` : undefined,
        }}
      />

      {/* Main ball */}
      <div
        ref={ballMainRef}
        className="absolute pointer-events-none"
        style={{
          width: `${sizeTokens.ball.diameter}px`,
          height: `${sizeTokens.ball.diameter}px`,
          background: theme.gradients.ballMain,
          border: `${borderWidthTokens[1]}px solid ${theme.colors.game.ball.secondary}`,
          willChange: 'transform',
          zIndex: zIndexTokens.ball,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '50%',
          transformOrigin: 'center center',
          transform: ballPosition ? `translate(${ballPosition.x - 7}px, ${ballPosition.y - 7}px) rotate(${ballPosition.rotation}deg)` : undefined,
        }}
        data-state={ballState}
        data-testid="plinko-ball"
      >
        {/* Glossy highlight */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '45%',
            height: '45%',
            background: theme.gradients.shine,
            borderRadius: '50%',
            opacity: opacityTokens[90],
          }}
        />

        {/* Texture pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, transparent 48%, ${theme.colors.shadows.default}03 50%, transparent 52%)`,
            borderRadius: '50%',
            opacity: opacityTokens[30],
          }}
        />
      </div>
    </>
  );
});
