/**
 * Slot Win Reveal Animation
 * Disney Principles: STAGING (visual hierarchy), ANTICIPATION (build-up)
 * React Native compatible: transform (scale, rotate), opacity, linear gradients
 */

import { motion } from 'framer-motion';

interface SlotWinRevealProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  isActive: boolean;
}

export function SlotWinReveal({ x, y, width, height, color, label, isActive }: SlotWinRevealProps) {
  if (!isActive) return null;

  return (
    <div className="absolute pointer-events-none" style={{ left: 0, top: 0, zIndex: 25 }}>
      {/* Red circular badge at center bottom of slot */}
      <motion.div
        className="absolute"
        style={{
          left: `${x + width / 2}px`,
          top: `${y + height}px`,
          transform: 'translate(-50%, -50%)',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          boxShadow: `
            0 0 12px rgba(239,68,68,0.8),
            0 2px 6px rgba(0,0,0,0.5),
            0 0 0 2px rgba(255,255,255,0.3)
          `,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 0.4,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      />
    </div>
  );
}
