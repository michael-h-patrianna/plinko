/**
 * Prize slot component at bottom of board with bucket physics visualization
 * Shows prize information and animates when ball approaches or impacts walls/floor
 * Adapts display mode based on slot width (icon-only, text, or icon+text)
 *
 * PERFORMANCE OPTIMIZATION (IMPERATIVE UPDATE STRATEGY):
 * - No frameStore subscription (eliminates 300-480+ React re-renders per second)
 * - Static component that renders once during board setup
 * - Visual state controlled imperatively via BallAnimationDriver.updateSlotHighlight()
 * - Border colors driven by data-approaching attribute (CSS transitions handle animation)
 * - Collision effects managed by driver (no React state, only DOM manipulation)
 *
 * ARCHITECTURE:
 * - Component renders static DOM structure with data attributes
 * - Driver queries slots by data-testid and updates data-approaching imperatively
 * - CSS transitions provide smooth border color changes
 * - No React state, no re-renders, only DOM manipulation
 *
 * @param index - Slot index (0-based)
 * @param prize - Prize configuration with rewards and display settings
 * @param x - X position in pixels
 * @param width - Width of slot in pixels
 * @param isWinning - Whether this is the winning slot
 * @param prizeCount - Total number of prize slots (for responsive sizing)
 * @param boardWidth - Board width in pixels (for compact mode determination)
 * @param comboBadgeNumber - Badge number for combo rewards
 */

import { memo, useRef, useEffect, useState } from 'react';
import type { PrizeConfig, GameState } from '@game/types';
import { calculateBucketHeight } from '@utils/slotDimensions';
import { getSlotDisplayText } from '@game/prizeTypes';
import { abbreviateNumber } from '@utils/formatNumber';
import { useTheme } from '../../../theme';
import { getPrizeThemeColor } from '@theme/prizeColorMapper';
import { useAnimationDriver } from '@theme/animationDrivers';
import { hexToRgba } from '@utils/formatting/colorUtils';

interface SlotProps {
  index: number;
  prize: PrizeConfig;
  x: number;
  width: number;
  isWinning?: boolean;
  prizeCount?: number;
  boardWidth?: number;
  comboBadgeNumber?: number;
  ballState?: GameState;
}

/**
 * Memoized Slot component - static rendering, no re-renders during animation
 * Visual state controlled imperatively via BallAnimationDriver (data attributes)
 */
const SlotComponent = memo(function Slot({
  index,
  prize,
  x,
  width,
  isWinning = false,
  prizeCount = 5,
  boardWidth = 375,
  comboBadgeNumber,
  ballState = 'idle',
}: SlotProps) {
  const { theme } = useTheme();
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  // Track floor impact state via data attribute (imperative updates from driver)
  const [hasFloorImpact, setHasFloorImpact] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);
  const impactKeyRef = useRef(0);

  // Track impact speed for realistic animation intensity
  const [impactSpeed, setImpactSpeed] = useState(0);

  // Watch for floor impact data attribute changes (set by driver)
  useEffect(() => {
    const slotEl = slotRef.current;
    if (!slotEl) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-floor-impact') {
          const impactValue = slotEl.getAttribute('data-floor-impact');
          const hasImpact = impactValue === 'true';

          if (hasImpact && !hasFloorImpact) {
            // Floor was just hit - read impact speed and increment key to trigger new animation
            const speedStr = slotEl.getAttribute('data-impact-speed');
            const speed = speedStr ? parseFloat(speedStr) : 0;
            setImpactSpeed(speed);
            impactKeyRef.current += 1;
            setHasFloorImpact(true);
          } else if (!hasImpact && hasFloorImpact) {
            setHasFloorImpact(false);
          }
        }
      });
    });

    observer.observe(slotEl, { attributes: true });

    return () => observer.disconnect();
  }, [hasFloorImpact]);

  // Calculate responsive bucket dimensions based on slot width
  // Narrower slots (8 prizes on small screens) need taller buckets to fit text
  const bucketHeight = calculateBucketHeight(width);
  const fontSize = width < 40 ? '9px' : width < 50 ? '10px' : '12px';

  // Check if theme has per-slot styles (for limited color palette themes like brutalist)
  const slotStyles = theme.colors.game.slot.slotStyles;
  const slotStyle = slotStyles && slotStyles[index] ? slotStyles[index] : null;

  const borderWidth = slotStyle?.borderWidth || theme.colors.game.slot.borderWidth || (width < 45 ? '2px' : '3px');
  const paddingBottom = width < 40 ? '6px' : '10px';

  // Determine display mode based on width
  const isVeryNarrow = width < 42;
  const isNarrow = width < 55;

  // Use slotColor and title from Prize type
  const color = prize.slotColor || '#64748B';
  const label = prize.title || 'Prize';

  // Check if this prize should always use icon mode
  const prizeType = prize.type;
  const freeReward = prize.freeReward;
  const isRandomRewardOnly =
    prizeType === 'free' &&
    freeReward?.randomReward &&
    !freeReward.sc &&
    !freeReward.gc &&
    !freeReward.spins &&
    !freeReward.xp;
  const forceIconMode = prizeType === 'no_win' || isRandomRewardOnly;

  // Compact mode: use "Spins" instead of "Free Spins" when:
  // - More than 5 prizes OR viewport width is under 375px
  const compactMode = prizeCount > 5 || boardWidth < 375;

  // Get display text (always show reward details, even for narrow slots)
  const displayText = forceIconMode
    ? ''
    : getSlotDisplayText(prize, abbreviateNumber, false, compactMode);

  // Determine if we should show idle animations (breathing, gradient sweep)
  const isIdle = ballState === 'idle' || ballState === 'ready';

  // Determine if slot should flip (non-winning slots flip when ball lands, before reveal)
  // Trigger on 'landed' state to give flip animation time before prize reveal
  const shouldFlip = (ballState === 'landed' || ballState === 'revealed') && !isWinning;

  // Calculate floor impact animation (downward compression with spring back)
  // Animation intensity scales with ball velocity for realistic physics
  const getFloorImpactAnimation = () => {
    if (!hasFloorImpact) return { y: 0 };

    // Scale compression based on impact speed (min 1px, max 6px)
    // Speed thresholds: <50px/s = minimal, 50-600px/s = scaled, >600px/s = maximum
    const MIN_COMPRESSION = 1;
    const MAX_COMPRESSION = 6;
    const MIN_SPEED = 50;  // Below this, minimal bounce
    const MAX_SPEED = 600; // Above this, maximum bounce

    const speedRatio = Math.max(0, Math.min(1, (impactSpeed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)));
    const compressionDistance = MIN_COMPRESSION + (MAX_COMPRESSION - MIN_COMPRESSION) * speedRatio;
    const overshootDistance = -compressionDistance * 0.25; // Overshoot is 25% of compression

    // First bounce: full compression based on speed
    // Subsequent bounces (low speed): minimal compression
    return {
      y: [0, compressionDistance, overshootDistance, 0], // Compress down, spring back with overshoot, settle
    };
  };

  return (
    <AnimatedDiv
      className="absolute"
      style={{
        left: `${x}px`,
        bottom: '-10px',
        width: `${width}px`,
        height: `${bucketHeight}px`,
        zIndex: 15,
        perspective: '1000px', // Enable 3D perspective for flip
      }}
      animate={getFloorImpactAnimation()}
      transition={{
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1], // Spring easing for bounce effect
        times: [0, 0.4, 0.7, 1], // Timing for each keyframe
      }}
    >
      {/* 3D Flip Container */}
      <AnimatedDiv
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateY: shouldFlip ? 180 : 0,
        }}
        transition={{
          duration: 0.6,
          ease: [0.43, 0.13, 0.23, 0.96], // Smooth flip easing
          delay: shouldFlip ? index * 0.08 : 0, // Stagger flip based on slot index
        }}
      >
        {/* Front side (normal slot) */}
        <div
          ref={slotRef}
          className="absolute inset-0 flex flex-col items-center justify-end text-center slot-container"
          style={{
            backfaceVisibility: 'hidden',
            background:
            slotStyle?.background ||
            theme.colors.game.slot.background ||
            `
            linear-gradient(180deg, transparent 0%, transparent 40%, ${color}33 70%, ${color}66 100%)
          `,
          // Use per-slot border if available, otherwise borders controlled by CSS via data-approaching
          ...(slotStyle?.border
            ? {
                borderLeft: slotStyle.border,
                borderRight: slotStyle.border,
                borderBottom: slotStyle.border,
                borderTop: 'none',
              }
            : {
                borderLeft: `${borderWidth} solid var(--slot-border-color)`,
                borderRight: `${borderWidth} solid var(--slot-border-color)`,
                borderBottom: `${borderWidth} solid var(--slot-border-color)`,
                borderTop: 'none',
              }),
          borderRadius: theme.colors.game.slot.borderRadius || '0 0 8px 8px',
          /* RN-compatible: removed boxShadow, depth created by gradient + border */
          transition: theme.effects.transitions.fast || 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          // CSS variables for border color (controlled by data-approaching)
          '--slot-border-color': theme.colors.game.slot.border || theme.colors.border.default,
          '--slot-border-color-active': color,
        } as React.CSSProperties}
        data-testid={`slot-${index}`}
        data-active={isWinning}
        data-approaching="false"
        data-wall-impact="none"
        data-floor-impact="false"
        data-slot-color={color}
        data-state={ballState}
      >
      <style>
        {`
          /* Border color transitions controlled by data-approaching attribute */
          .slot-container[data-approaching="false"] {
            --slot-border-color: ${theme.colors.game.slot.border || theme.colors.border.default};
          }
          .slot-container[data-approaching="true"] {
            --slot-border-color: ${color};
          }

          /* Wall impact flash animations - triggered by data-wall-impact attribute */
          [data-wall-impact="left"] .slot-wall-impact-left {
            animation: wallFlashLeft 200ms ease-out;
          }
          [data-wall-impact="right"] .slot-wall-impact-right {
            animation: wallFlashRight 200ms ease-out;
          }

          /* Floor impact flash animation - triggered by data-floor-impact attribute */
          [data-floor-impact="true"] .slot-floor-impact {
            animation: floorFlash 200ms ease-out;
          }

          /* BREATHING ANIMATION - Idle state gentle pulse */
          .slot-container[data-state="idle"] {
            animation: slotBreathe 2s ease-in-out infinite;
          }

          /* BORDER PULSE - Rhythmic pulse when ball is approaching */
          .slot-container[data-approaching="true"] {
            animation: borderPulse 500ms ease-in-out infinite;
          }

          /* GRADIENT SWEEP - Animated shimmer during idle/ready states */
          .slot-gradient-sweep {
            animation: gradientSweep 3s linear infinite;
          }

          /* Keyframe animations for impact effects */
          @keyframes wallFlashLeft {
            0% {
              opacity: 0;
              transform: scaleY(0.5);
            }
            50% {
              opacity: 1;
              transform: scaleY(1);
            }
            100% {
              opacity: 0;
              transform: scaleY(0.8);
            }
          }

          @keyframes wallFlashRight {
            0% {
              opacity: 0;
              transform: scaleY(0.5);
            }
            50% {
              opacity: 1;
              transform: scaleY(1);
            }
            100% {
              opacity: 0;
              transform: scaleY(0.8);
            }
          }

          @keyframes floorFlash {
            0% {
              opacity: 0;
              transform: scaleX(0.5);
            }
            50% {
              opacity: 1;
              transform: scaleX(1);
            }
            100% {
              opacity: 0;
              transform: scaleX(0.8);
            }
          }

          /* BREATHING ANIMATION - Gentle scale pulse (RN-compatible: scale only) */
          @keyframes slotBreathe {
            0%, 100% {
              transform: scale(1.0);
            }
            50% {
              transform: scale(1.02);
            }
          }

          /* BORDER PULSE - Rhythmic opacity and scale at 120 BPM (RN-compatible) */
          @keyframes borderPulse {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1.0);
            }
            50% {
              opacity: 1.0;
              transform: scale(1.03);
            }
          }

          /* GRADIENT SWEEP - Animated background position for shimmer effect (RN-compatible: linear gradient position) */
          @keyframes gradientSweep {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 200% 50%;
            }
          }
        `}
      </style>
      {/* Gradient sweep effect - animated shimmer during idle/ready states */}
      {isIdle && (
        <div
          className="absolute top-0 left-0 right-0 bottom-0 slot-gradient-sweep pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${hexToRgba(color, 0.2)} 30%, ${hexToRgba(color, 0.4)} 50%, ${hexToRgba(color, 0.2)} 70%, transparent 100%)`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
          }}
        />
      )}

      {/* Shine effect */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '40%',
          background: `linear-gradient(180deg, ${hexToRgba(theme.colors.text.inverse, 0.3)} 0%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Impact flash effects - controlled by data attributes */}
      {/* Wall impact flash - left */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none slot-wall-impact-left"
        style={{
          width: '6px',
          background: `linear-gradient(to right, ${color}ff 0%, ${color}aa 40%, transparent 100%)`,
          opacity: 0,
          transform: 'scaleY(0.5)',
        }}
      />

      {/* Wall impact flash - right */}
      <div
        className="absolute right-0 top-0 bottom-0 pointer-events-none slot-wall-impact-right"
        style={{
          width: '6px',
          background: `linear-gradient(to left, ${color}ff 0%, ${color}aa 40%, transparent 100%)`,
          opacity: 0,
          transform: 'scaleY(0.5)',
        }}
      />

      {/* Floor impact flash */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none slot-floor-impact"
        style={{
          height: '6px',
          background: `linear-gradient(to top, ${color}ff 0%, ${color}aa 40%, transparent 100%)`,
          opacity: 0,
          transform: 'scaleX(0.5)',
        }}
      />

      {/* Prize display - icon-based for narrow slots, text for wider slots */}
      <div
        className="relative z-10 flex flex-col items-center justify-end gap-0.5"
        style={{
          paddingBottom,
          width: '100%',
        }}
      >
        {/* Icon-only mode (very narrow slots, or forced for no-win/purchase/random-only) */}
        {(isVeryNarrow || forceIconMode) && prize.slotIcon && (
          <img
            src={prize.slotIcon}
            alt={label}
            style={{
              width: width < 38 ? '32px' : width < 50 ? '38px' : '42px',
              height: width < 38 ? '32px' : width < 50 ? '38px' : '42px',
              objectFit: 'contain',
            }}
          />
        )}

        {/* Fallback text if no icon available */}
        {(isVeryNarrow || forceIconMode) && !prize.slotIcon && (
          <div
            className="font-bold leading-tight text-center opacity-70"
            style={{
              fontSize: '10px',
              color: theme.colors.text.primary,
            }}
          >
            {label}
          </div>
        )}

        {/* Text display - show label for wider slots (only if not forcing icon mode) */}
        {!isVeryNarrow && !forceIconMode && (
          <div
            className="font-bold px-1 leading-tight text-center"
            style={{
              fontSize,
              wordBreak: width < 45 ? 'break-word' : 'normal',
              hyphens: width < 45 ? 'auto' : 'none',
              color: theme.colors.text.primary,
            }}
          >
            {displayText || label}
          </div>
        )}

        {/* Icon + text for narrow-but-not-very-narrow slots (only if not forcing icon mode) */}
        {isNarrow && !isVeryNarrow && !forceIconMode && prize.slotIcon && displayText && (
          <img
            src={prize.slotIcon}
            alt=""
            className="mt-0.5"
            style={{
              width: '24px',
              height: '24px',
              objectFit: 'contain',
            }}
          />
        )}

        {/* For wider slots with icons, show icon above text (only if not forcing icon mode) */}
        {!isNarrow && !forceIconMode && prize.slotIcon && (
          <img
            src={prize.slotIcon}
            alt=""
            className="mb-1"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
            }}
          />
        )}
      </div>

      {/* Combo badge - positioned in top-right corner */}
      {comboBadgeNumber !== undefined && (() => {
        const badgeColor = getPrizeThemeColor(prize, theme);
        return (
          <div
            className="absolute font-bold text-white text-xs leading-none"
            style={{
              top: '-6px',
              right: '-6px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${badgeColor} 0%, ${hexToRgba(badgeColor, 0.87)} 100%)`,
              /* RN-compatible: removed boxShadow, using border for definition */
              border: `2px solid ${hexToRgba(theme.colors.text.inverse, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            {comboBadgeNumber}
          </div>
        );
      })()}

      {/* Winning slot red badge - positioned at bottom center */}
      {isWinning && (
        <div
          className="absolute"
          style={{
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: theme.gradients.buttonDanger || `linear-gradient(135deg, ${theme.colors.status.error} 0%, ${theme.colors.status.error} 100%)`,
            /* RN-compatible: removed boxShadow glow, using border for definition */
            border: `2px solid ${hexToRgba(theme.colors.text.inverse, 0.3)}`,
            zIndex: 10,
          }}
        />
      )}
      </div>

        {/* Back side (flipped state) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(180deg, ${hexToRgba(theme.colors.surface.secondary, 0.3)} 0%, ${hexToRgba(theme.colors.surface.secondary, 0.6)} 100%)`,
            borderLeft: `${borderWidth} solid ${hexToRgba(theme.colors.border.default, 0.5)}`,
            borderRight: `${borderWidth} solid ${hexToRgba(theme.colors.border.default, 0.5)}`,
            borderBottom: `${borderWidth} solid ${hexToRgba(theme.colors.border.default, 0.5)}`,
            borderTop: 'none',
            borderRadius: theme.colors.game.slot.borderRadius || '0 0 8px 8px',
          }}
        >
          {/* Backside visual - simple pattern or text */}
          <div
            className="font-bold opacity-30"
            style={{
              fontSize: width < 45 ? '20px' : '28px',
              color: theme.colors.text.primary,
            }}
          >
            ✕
          </div>
        </div>
      </AnimatedDiv>
    </AnimatedDiv>
  );
});

// Display name for React DevTools
SlotComponent.displayName = 'Slot';

/**
 * Memoized Slot component - only re-renders when necessary
 * PERFORMANCE: Static component with no state, animations controlled via data attributes
 */
export const Slot = memo(SlotComponent, (prev, next) => {
  // Only re-render if core props changed
  return (
    prev.index === next.index &&
    prev.prize === next.prize &&
    prev.x === next.x &&
    prev.width === next.width &&
    prev.isWinning === next.isWinning &&
    prev.prizeCount === next.prizeCount &&
    prev.boardWidth === next.boardWidth &&
    prev.comboBadgeNumber === next.comboBadgeNumber &&
    prev.ballState === next.ballState
  );
});
