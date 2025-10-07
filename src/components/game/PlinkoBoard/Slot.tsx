/**
 * Prize slot component at bottom of board with bucket physics visualization
 * Shows prize information and animates when ball approaches or impacts walls/floor
 * Adapts display mode based on slot width (icon-only, text, or icon+text)
 * @param index - Slot index (0-based)
 * @param prize - Prize configuration with rewards and display settings
 * @param x - X position in pixels
 * @param width - Width of slot in pixels
 * @param isWinning - Whether this is the winning slot
 * @param isApproaching - Whether ball is approaching this slot
 * @param wallImpact - Which bucket wall was hit ('left', 'right', or null)
 * @param floorImpact - Whether ball hit the bucket floor
 * @param prizeCount - Total number of prize slots (for responsive sizing)
 * @param boardWidth - Board width in pixels (for compact mode determination)
 * @param comboBadgeNumber - Badge number for combo rewards
 */

import { useRef } from 'react';
import type { PrizeConfig } from '../../../game/types';
import { calculateBucketHeight } from '../../../utils/slotDimensions';
import { getSlotDisplayText } from '../../../game/prizeTypes';
import { abbreviateNumber } from '../../../utils/formatNumber';
import { useTheme } from '../../../theme';
import { getPrizeThemeColor } from '../../../theme/prizeColorMapper';
import { useAnimationDriver } from '../../../theme/animationDrivers';
import { hexToRgba } from '../../../utils/formatting/colorUtils';

interface SlotProps {
  index: number;
  prize: PrizeConfig;
  x: number;
  width: number;
  isWinning?: boolean;
  isApproaching?: boolean;
  wallImpact?: 'left' | 'right' | null;
  floorImpact?: boolean;
  prizeCount?: number;
  boardWidth?: number;
  comboBadgeNumber?: number;
}

export function Slot({
  index,
  prize,
  x,
  width,
  isWinning = false,
  isApproaching = false,
  wallImpact = null,
  floorImpact = false,
  prizeCount = 5,
  boardWidth = 375,
  comboBadgeNumber,
}: SlotProps) {
  const { theme } = useTheme();
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');
  const { AnimatePresence } = driver;

  // Stable keys for impact animations - increment counter when impact triggers
  const leftImpactKeyRef = useRef(0);
  const rightImpactKeyRef = useRef(0);
  const floorImpactKeyRef = useRef(0);

  // Track previous impact states to detect new impacts
  const prevWallImpactRef = useRef<'left' | 'right' | null>(null);
  const prevFloorImpactRef = useRef(false);

  // Increment keys when impacts change from null/false to active
  if (wallImpact === 'left' && prevWallImpactRef.current !== 'left') {
    leftImpactKeyRef.current += 1;
  }
  if (wallImpact === 'right' && prevWallImpactRef.current !== 'right') {
    rightImpactKeyRef.current += 1;
  }
  if (floorImpact && !prevFloorImpactRef.current) {
    floorImpactKeyRef.current += 1;
  }

  // Update previous states
  prevWallImpactRef.current = wallImpact;
  prevFloorImpactRef.current = floorImpact;

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

  // Use slotColor and title from new format, fallback to legacy fields
  const color = prize.slotColor || prize.color || '#64748B';
  const label = prize.title || prize.label || 'Prize';

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

  return (
    <AnimatedDiv
      className="absolute flex flex-col items-center justify-end text-center"
      style={{
        left: `${x}px`,
        bottom: '-10px',
        width: `${width}px`,
        height: `${bucketHeight}px`,
        background:
          slotStyle?.background ||
          theme.colors.game.slot.background ||
          `
          linear-gradient(180deg, transparent 0%, transparent 40%, ${color}33 70%, ${color}66 100%)
        `,
        // Use per-slot border if available, otherwise use theme default or approaching color
        ...(slotStyle?.border
          ? {
              borderLeft: slotStyle.border,
              borderRight: slotStyle.border,
              borderBottom: slotStyle.border,
              borderTop: 'none',
            }
          : {
              borderLeft: `${borderWidth} solid ${isApproaching ? color : theme.colors.game.slot.border || theme.colors.border.default}`,
              borderRight: `${borderWidth} solid ${isApproaching ? color : theme.colors.game.slot.border || theme.colors.border.default}`,
              borderBottom: `${borderWidth} solid ${isApproaching ? color : theme.colors.game.slot.border || theme.colors.border.default}`,
              borderTop: 'none',
            }),
        borderRadius: theme.colors.game.slot.borderRadius || '0 0 8px 8px',
        /* RN-compatible: removed boxShadow, depth created by gradient + border */
        transition: theme.effects.transitions.fast || 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      data-testid={`slot-${index}`}
      data-active={isWinning}
    >
      {/* Shine effect */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '40%',
          background: `linear-gradient(180deg, ${hexToRgba(theme.colors.text.inverse, 0.3)} 0%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Wall impact flash - left */}
      <AnimatePresence>
        {wallImpact === 'left' && (
          <AnimatedDiv
            key={`left-impact-${index}-${leftImpactKeyRef.current}`}
            className="absolute left-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: '6px',
              background: `linear-gradient(to right, ${color}ff 0%, ${color}aa 40%, transparent 100%)`,
            }}
            initial={{ opacity: 0, scaleY: 0.5 }}
            animate={{ opacity: [0, 1, 0], scaleY: [0.5, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Wall impact flash - right */}
      <AnimatePresence>
        {wallImpact === 'right' && (
          <AnimatedDiv
            key={`right-impact-${index}-${rightImpactKeyRef.current}`}
            className="absolute right-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: '6px',
              background: `linear-gradient(to left, ${color}ff 0%, ${color}aa 40%, transparent 100%)`,
            }}
            initial={{ opacity: 0, scaleY: 0.5 }}
            animate={{ opacity: [0, 1, 0], scaleY: [0.5, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Floor impact flash */}
      <AnimatePresence>
        {floorImpact && (
          <AnimatedDiv
            key={`floor-impact-${index}-${floorImpactKeyRef.current}`}
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: '6px',
              background: `linear-gradient(to top, ${color}ff 0%, ${color}aa 40%, transparent 100%)`,
            }}
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

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
    </AnimatedDiv>
  );
}
