/**
 * Prize slot component at bottom of board
 * With collision impact animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { PrizeConfig } from '../../game/types';

interface SlotProps {
  index: number;
  prize: PrizeConfig;
  x: number;
  width: number;
  isWinning?: boolean;
  isApproaching?: boolean;
  wallImpact?: 'left' | 'right' | null;
  floorImpact?: boolean;
}

export function Slot({
  index,
  prize,
  x,
  width,
  isWinning = false,
  isApproaching = false,
  wallImpact = null,
  floorImpact = false
}: SlotProps) {
  return (
    <motion.div
      className="absolute bottom-0 flex flex-col items-center justify-end text-center"
      style={{
        left: `${x}px`,
        width: `${width}px`,
        height: '70px',
        background: `
          linear-gradient(180deg, transparent 0%, transparent 40%, ${prize.color}33 70%, ${prize.color}66 100%)
        `,
        borderLeft: `3px solid ${isWinning ? '#fbbf24' : isApproaching ? prize.color : 'rgba(148,163,184,0.8)'}`,
        borderRight: `3px solid ${isWinning ? '#fbbf24' : isApproaching ? prize.color : 'rgba(148,163,184,0.8)'}`,
        borderBottom: `3px solid ${isWinning ? '#fbbf24' : isApproaching ? prize.color : 'rgba(148,163,184,0.8)'}`,
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        boxShadow: isWinning
          ? `0 0 35px rgba(251,191,36,0.9),
             0 0 20px ${prize.color}cc,
             0 8px 20px rgba(0,0,0,0.6),
             inset 0 3px 10px rgba(255,255,255,0.25),
             inset 0 -3px 10px rgba(0,0,0,0.4),
             inset 0 0 30px ${prize.color}44`
          : isApproaching
          ? `0 0 25px ${prize.color}80,
             0 6px 16px rgba(0,0,0,0.5),
             0 3px 8px rgba(0,0,0,0.3),
             inset 0 3px 6px rgba(255,255,255,0.15),
             inset 0 -3px 6px rgba(0,0,0,0.25),
             inset 0 0 20px ${prize.color}33`
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
              background: `radial-gradient(ellipse at left, ${prize.color}ff 0%, ${prize.color}aa 40%, transparent 100%)`,
              boxShadow: `0 0 15px ${prize.color}`,
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
              background: `radial-gradient(ellipse at right, ${prize.color}ff 0%, ${prize.color}aa 40%, transparent 100%)`,
              boxShadow: `0 0 15px ${prize.color}`,
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
              background: `radial-gradient(ellipse at bottom, ${prize.color}ff 0%, ${prize.color}aa 40%, transparent 100%)`,
              boxShadow: `0 0 15px ${prize.color}`,
            }}
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <div className="text-white font-bold text-xs px-1 pb-2 leading-tight drop-shadow-lg relative z-10">
        {prize.label}
      </div>
    </motion.div>
  );
}
