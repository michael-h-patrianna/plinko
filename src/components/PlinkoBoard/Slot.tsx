/**
 * Prize slot component at bottom of board
 * With collision impact animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { PrizeConfig } from '../../game/types';
import { calculateBucketHeight } from '../../utils/slotDimensions';
import { getSlotDisplayText } from '../../game/prizeTypes';
import { abbreviateNumber } from '../../utils/formatNumber';

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
  comboBadgeNumber
}: SlotProps) {
  // Calculate responsive bucket dimensions based on slot width
  // Narrower slots (8 prizes on small screens) need taller buckets to fit text
  const bucketHeight = calculateBucketHeight(width);
  const fontSize = width < 40 ? '9px' : width < 50 ? '10px' : '12px';
  const borderWidth = width < 45 ? '2px' : '3px';
  const paddingBottom = width < 40 ? '6px' : '10px';

  // Determine display mode based on width
  const isVeryNarrow = width < 42;
  const isNarrow = width < 55;

  // Use slotColor and title from new format, fallback to legacy fields
  const color = (prize as any).slotColor || prize.color || '#64748B';
  const label = (prize as any).title || prize.label || 'Prize';

  // Check if this prize should always use icon mode
  const prizeType = (prize as any).type;
  const freeReward = (prize as any).freeReward;
  const isRandomRewardOnly = prizeType === 'free' && freeReward?.randomReward &&
    !freeReward.sc && !freeReward.gc && !freeReward.spins && !freeReward.xp;
  const forceIconMode = prizeType === 'no_win' || isRandomRewardOnly;

  // Compact mode: use "Spins" instead of "Free Spins" when:
  // - More than 5 prizes OR viewport width is under 375px
  const compactMode = prizeCount > 5 || boardWidth < 375;

  // Get display text (always show reward details, even for narrow slots)
  const displayText = forceIconMode ? '' : getSlotDisplayText(prize as any, abbreviateNumber, false, compactMode);

  return (
    <motion.div
      className="absolute bottom-0 flex flex-col items-center justify-end text-center"
      style={{
        left: `${x}px`,
        width: `${width}px`,
        height: `${bucketHeight}px`,
        background: `
          linear-gradient(180deg, transparent 0%, transparent 40%, ${color}33 70%, ${color}66 100%)
        `,
        borderLeft: `${borderWidth} solid ${isApproaching ? color : 'rgba(148,163,184,0.8)'}`,
        borderRight: `${borderWidth} solid ${isApproaching ? color : 'rgba(148,163,184,0.8)'}`,
        borderBottom: `${borderWidth} solid ${isApproaching ? color : 'rgba(148,163,184,0.8)'}`,
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        boxShadow: isApproaching
          ? `0 0 25px ${color}80,
             0 6px 16px rgba(0,0,0,0.5),
             0 3px 8px rgba(0,0,0,0.3),
             inset 0 3px 6px rgba(255,255,255,0.15),
             inset 0 -3px 6px rgba(0,0,0,0.25),
             inset 0 0 20px ${color}33`
          : `0 6px 16px rgba(0,0,0,0.5),
             0 3px 8px rgba(0,0,0,0.3),
             inset 0 3px 6px rgba(255,255,255,0.12),
             inset 0 -3px 6px rgba(0,0,0,0.25)`,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      data-testid={`slot-${index}`}
      data-active={isWinning}
    >
      {/* Shine effect */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Wall impact flash - left */}
      <AnimatePresence>
        {wallImpact === 'left' && (
          <motion.div
            key={`left-impact-${Date.now()}`}
            className="absolute left-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: '6px',
              background: `radial-gradient(ellipse at left, ${color}ff 0%, ${color}aa 40%, transparent 100%)`,
              boxShadow: `0 0 15px ${color}`,
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
          <motion.div
            key={`right-impact-${Date.now()}`}
            className="absolute right-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: '6px',
              background: `radial-gradient(ellipse at right, ${color}ff 0%, ${color}aa 40%, transparent 100%)`,
              boxShadow: `0 0 15px ${color}`,
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
          <motion.div
            key={`floor-impact-${Date.now()}`}
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: '6px',
              background: `radial-gradient(ellipse at bottom, ${color}ff 0%, ${color}aa 40%, transparent 100%)`,
              boxShadow: `0 0 15px ${color}`,
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
        {(isVeryNarrow || forceIconMode) && (prize as any).slotIcon && (
          <img
            src={(prize as any).slotIcon}
            alt={label}
            className="drop-shadow-lg"
            style={{
              width: width < 38 ? '32px' : width < 50 ? '38px' : '42px',
              height: width < 38 ? '32px' : width < 50 ? '38px' : '42px',
              objectFit: 'contain',
            }}
          />
        )}

        {/* Fallback text if no icon available */}
        {(isVeryNarrow || forceIconMode) && !(prize as any).slotIcon && (
          <div
            className="text-white font-bold leading-tight drop-shadow-lg text-center opacity-70"
            style={{
              fontSize: '10px',
            }}
          >
            {label}
          </div>
        )}

        {/* Text display - show label for wider slots (only if not forcing icon mode) */}
        {!isVeryNarrow && !forceIconMode && (
          <div
            className="text-white font-bold px-1 leading-tight drop-shadow-lg text-center"
            style={{
              fontSize,
              wordBreak: width < 45 ? 'break-word' : 'normal',
              hyphens: width < 45 ? 'auto' : 'none',
            }}
          >
            {displayText || label}
          </div>
        )}

        {/* Icon + text for narrow-but-not-very-narrow slots (only if not forcing icon mode) */}
        {isNarrow && !isVeryNarrow && !forceIconMode && (prize as any).slotIcon && displayText && (
          <img
            src={(prize as any).slotIcon}
            alt=""
            className="drop-shadow-sm mt-0.5"
            style={{
              width: '24px',
              height: '24px',
              objectFit: 'contain',
            }}
          />
        )}

        {/* For wider slots with icons, show icon above text (only if not forcing icon mode) */}
        {!isNarrow && !forceIconMode && (prize as any).slotIcon && (
          <img
            src={(prize as any).slotIcon}
            alt=""
            className="drop-shadow-sm mb-1"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
            }}
          />
        )}
      </div>

      {/* Combo badge - positioned in top-right corner */}
      {comboBadgeNumber !== undefined && (
        <div
          className="absolute font-bold text-white text-xs leading-none"
          style={{
            top: '-6px',
            right: '-6px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            boxShadow: `0 2px 8px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.3)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {comboBadgeNumber}
        </div>
      )}

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
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: `
              0 0 12px rgba(239,68,68,0.8),
              0 2px 6px rgba(0,0,0,0.5),
              0 0 0 2px rgba(255,255,255,0.3)
            `,
            zIndex: 10,
          }}
        />
      )}
    </motion.div>
  );
}
